const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, query, validationResult } = require('express-validator');
const Opinion = require('../models/Opinion');
const Vote = require('../models/Vote');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const CATEGORIES = require('../config/categories');
// ── GET /api/opinions ────────────────────────────
// Query params: category, subcategory, page, limit, sort, search
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      category,
      subcategory,
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      type,
    } = req.query;

    const filter = { status: 'active', isApproved: true };
    if (category && category !== 'all') filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (type) filter.opinionType = type;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const opinions = await Opinion.find(filter)
      .populate('createdBy', 'name avatar brandName brandLogo role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Opinion.countDocuments(filter);

    // If user is logged in, attach their vote status to each opinion
    let votedMap = {};
    if (req.user) {
      const votes = await Vote.find({
        user: req.user._id,
        opinion: { $in: opinions.map((o) => o._id) },
      }).lean();
      votes.forEach((v) => {
        votedMap[v.opinion.toString()] = v.optionIndex;
      });
    }

    const enriched = opinions.map((op) => ({
      ...op,
      userVote: votedMap[op._id.toString()] ?? null,
      hasVoted: votedMap[op._id.toString()] !== undefined,
    }));

    res.json({
      success: true,
      count: enriched.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      opinions: enriched,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/opinions/categories ─────────────────
router.get('/categories', (req, res) => {
  res.json({ success: true, categories: CATEGORIES });
});

// ── GET /api/opinions/featured ───────────────────
router.get('/featured', optionalAuth, async (req, res, next) => {
  try {
    const opinions = await Opinion.find({
      status: 'active',
      isApproved: true,
      isFeatured: true,
    })
      .populate('createdBy', 'name avatar brandName')
      .sort('-createdAt')
      .limit(5)
      .lean();
    res.json({ success: true, opinions });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/opinions/:id ────────────────────────
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const opinion = await Opinion.findById(req.params.id)
      .populate('createdBy', 'name avatar brandName brandLogo role')
      .lean();

    if (!opinion) {
      return res.status(404).json({ success: false, message: 'Opinion not found' });
    }

    let userVote = null;
    let hasVoted = false;
    if (req.user) {
      const vote = await Vote.findOne({ user: req.user._id, opinion: opinion._id });
      if (vote) {
        userVote = vote.optionIndex;
        hasVoted = true;
      }
    }

    res.json({ success: true, opinion: { ...opinion, userVote, hasVoted } });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/opinions ───────────────────────────
router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('subcategory').notEmpty().withMessage('Subcategory is required'),
    body('options').isArray({ min: 2, max: 8 }).withMessage('Provide 2–8 options'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const {
        title, description, category, subcategory,
        opinionType, options, rewardCoins,
        expiresAt, tags, icon,
      } = req.body;

      const isBrand = req.user.role === 'brand';

      // Brand must have enough wallet balance
      if (isBrand) {
        const estimatedCost = (rewardCoins || 5) * 1000; // rough cap
        if (req.user.brandWallet < (rewardCoins || 5) * 10) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient brand wallet balance. Please top up.',
          });
        }
      }

      const formattedOptions = options.map((opt) => ({
        text: typeof opt === 'string' ? opt : opt.text,
        votes: 0,
      }));

      const opinion = await Opinion.create({
        title,
        description,
        category,
        subcategory,
        opinionType: opinionType || 'poll',
        options: formattedOptions,
        rewardCoins: rewardCoins || 5,
        createdBy: req.user._id,
        isBrandOpinion: isBrand,
        brandName: isBrand ? req.user.brandName || req.user.name : '',
        brandLogo: isBrand ? req.user.brandLogo : '',
        source: 'manual',
        expiresAt: expiresAt || undefined,
        tags: tags || [],
        icon: icon || '💬',
        isApproved: !isBrand, // brand opinions go to pending for review
        status: isBrand ? 'pending' : 'active',
      });

      res.status(201).json({ success: true, opinion });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/opinions/:id/vote ──────────────────
router.post('/:id/vote', protect, async (req, res, next) => {
  try {
    const { optionIndex } = req.body;

    if (optionIndex === undefined || optionIndex === null) {
      return res.status(400).json({ success: false, message: 'optionIndex is required' });
    }

    const opinion = await Opinion.findById(req.params.id);
    if (!opinion) {
      return res.status(404).json({ success: false, message: 'Opinion not found' });
    }
    if (opinion.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This opinion is closed' });
    }
    if (!opinion.isOpen) {
      return res.status(400).json({ success: false, message: 'This opinion has expired' });
    }
    if (optionIndex < 0 || optionIndex >= opinion.options.length) {
      return res.status(400).json({ success: false, message: 'Invalid option selected' });
    }

    // Check duplicate vote
    const existing = await Vote.findOne({ user: req.user._id, opinion: opinion._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already voted on this opinion' });
    }

    const optionText = opinion.options[optionIndex].text;
    const reward = opinion.rewardCoins;

    // ── Atomic updates ────────────────────────────
    await Promise.all([
      // Increment option vote count
      Opinion.findByIdAndUpdate(opinion._id, {
        $inc: {
          [`options.${optionIndex}.votes`]: 1,
          totalVotes: 1,
          totalRewardPaid: reward,
        },
      }),

      // Create vote record
      Vote.create({
        user: req.user._id,
        opinion: opinion._id,
        optionIndex,
        optionText,
        coinsEarned: reward,
      }),

      // Credit user wallet
      User.findByIdAndUpdate(req.user._id, {
        $inc: {
          opCoins: reward,
          totalEarned: reward,
          totalOpinionsGiven: 1,
          opinionsThisMonth: 1,
        },
      }),
    ]);

    // Create transaction record
    const updatedUser = await User.findById(req.user._id);
    await Transaction.create({
      user: req.user._id,
      type: 'earn',
      amount: reward,
      balanceAfter: updatedUser.opCoins,
      description: `Opinion: ${opinion.title.substring(0, 50)}`,
      opinion: opinion._id,
      icon: opinion.icon || '🪙',
      category: opinion.category,
    });

    // ── Streak bonus ──────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Streak milestones: 7 days = +20 coins, 30 days = +100 coins
    let streakBonus = 0;
    if (updatedUser.currentStreak === 7) streakBonus = 20;
    if (updatedUser.currentStreak === 30) streakBonus = 100;

    if (streakBonus > 0) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { opCoins: streakBonus, totalEarned: streakBonus } });
      await Transaction.create({
        user: req.user._id,
        type: 'bonus',
        amount: streakBonus,
        balanceAfter: updatedUser.opCoins + streakBonus,
        description: `${updatedUser.currentStreak}-day streak bonus!`,
        icon: '🔥',
      });
    }

    const freshOpinion = await Opinion.findById(opinion._id).lean();
    const freshUser = await User.findById(req.user._id).select('opCoins totalEarned totalOpinionsGiven currentStreak');

    res.json({
      success: true,
      message: `+${reward} OP Coins earned!`,
      coinsEarned: reward,
      streakBonus,
      opinion: freshOpinion,
      wallet: {
        opCoins: freshUser.opCoins,
        totalEarned: freshUser.totalEarned,
        totalOpinionsGiven: freshUser.totalOpinionsGiven,
        currentStreak: freshUser.currentStreak,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already voted on this opinion' });
    }
    next(err);
  }
});

// ── GET /api/opinions/import/news ─────────────────
// Import opinions from NewsAPI and auto-create poll questions
router.post('/import/news', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { category = 'general', country = 'in', count = 5 } = req.body;

    const newsRes = await axios.get(`${process.env.NEWS_API_URL}/top-headlines`, {
      params: {
        apiKey: process.env.NEWS_API_KEY,
        country,
        category,
        pageSize: count,
      },
    });

    const articles = newsRes.data.articles || [];
    const created = [];

    for (const article of articles) {
      if (!article.title || article.title === '[Removed]') continue;

      // Map news category to our categories
      const catMap = {
        sports: 'sports',
        technology: 'tech',
        entertainment: 'entertainment',
        politics: 'polity',
        business: 'news',
        general: 'news',
        health: 'lifestyle',
        science: 'tech',
      };

      const op = await Opinion.create({
        title: `Your take: ${article.title.substring(0, 150)}`,
        description: article.description || '',
        category: catMap[category] || 'news',
        subcategory: category.charAt(0).toUpperCase() + category.slice(1),
        options: [
          { text: '👍 Positive / Support' },
          { text: '👎 Negative / Oppose' },
          { text: '🤔 Neutral / Need more info' },
          { text: '😐 No strong opinion' },
        ],
        rewardCoins: 5,
        createdBy: req.user._id,
        source: 'newsapi',
        sourceUrl: article.url || '',
        icon: '📰',
        isApproved: true,
        status: 'active',
      });
      created.push(op);
    }

    res.json({ success: true, created: created.length, opinions: created });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/opinions/:id ─────────────────────
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const opinion = await Opinion.findById(req.params.id);
    if (!opinion) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    if (
      opinion.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await opinion.deleteOne();
    res.json({ success: true, message: 'Opinion deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
