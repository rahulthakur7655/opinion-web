const express = require('express');
const router = express.Router();
const Opinion = require('../models/Opinion');
const Vote = require('../models/Vote');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, authorize } = require('../middleware/auth');

// ── GET /api/brands/my-surveys ───────────────────
router.get('/my-surveys', protect, authorize('brand', 'admin'), async (req, res, next) => {
  try {
    const surveys = await Opinion.find({ createdBy: req.user._id })
      .sort('-createdAt')
      .lean();

    const enriched = await Promise.all(
      surveys.map(async (s) => {
        const totalVotes = s.options.reduce((acc, o) => acc + o.votes, 0);
        const totalRewardPaid = totalVotes * s.rewardCoins;
        return { ...s, totalVotes, totalRewardPaid };
      })
    );

    res.json({ success: true, surveys: enriched });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/brands/survey/:id/analytics ─────────
router.get('/survey/:id/analytics', protect, authorize('brand', 'admin'), async (req, res, next) => {
  try {
    const survey = await Opinion.findById(req.params.id).lean();

    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    if (
      survey.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const votes = await Vote.find({ opinion: survey._id })
      .populate('user', 'name createdAt')
      .lean();

    const totalVotes = votes.length;
    const optionBreakdown = survey.options.map((opt, i) => ({
      text: opt.text,
      votes: opt.votes,
      percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
    }));

    // Daily vote trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTrend = await Vote.aggregate([
      { $match: { opinion: survey._id, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      analytics: {
        survey,
        totalVotes,
        totalRewardPaid: totalVotes * survey.rewardCoins,
        optionBreakdown,
        dailyTrend,
        winningOption: optionBreakdown.sort((a, b) => b.votes - a.votes)[0],
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/brands/topup ────────────────────────
// Brand purchases OP coins to fund surveys
router.post('/topup', protect, authorize('brand', 'admin'), async (req, res, next) => {
  try {
    const { amount, paymentRef } = req.body; // amount in ₹

    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum top-up is ₹100' });
    }

    const opCoins = amount * 10; // ₹1 = 10 OP coins for brands

    await User.findByIdAndUpdate(req.user._id, { $inc: { brandWallet: opCoins } });

    await Transaction.create({
      user: req.user._id,
      type: 'brand_purchase',
      amount: opCoins,
      balanceAfter: req.user.brandWallet + opCoins,
      description: `Brand wallet top-up – ₹${amount} = ${opCoins} OP Coins`,
      icon: '🏷️',
    });

    res.json({
      success: true,
      message: `${opCoins} OP Coins added to brand wallet`,
      newBalance: req.user.brandWallet + opCoins,
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/brands/survey/:id/status ─────────────
router.put('/survey/:id/status', protect, authorize('brand', 'admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const survey = await Opinion.findById(req.params.id);
    if (!survey) return res.status(404).json({ success: false, message: 'Not found' });
    if (survey.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    survey.status = status;
    await survey.save();

    res.json({ success: true, survey });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
