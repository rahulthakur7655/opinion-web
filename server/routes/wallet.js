const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const RedemptionRequest = require('../models/RedemptionRequest');
const { protect } = require('../middleware/auth');

const OP_TO_INR = 10; // 10 OP coins = ₹1
const MIN_REDEEM_COINS = 100; // minimum 100 OP = ₹10
const MAX_DAILY_REDEEM_INR = 500;

// ── GET /api/wallet ───────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      'opCoins totalEarned totalRedeemed totalOpinionsGiven currentStreak longestStreak upiId bankDetails'
    );

    // Monthly earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: { $in: ['earn', 'bonus', 'referral'] },
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      wallet: {
        opCoins: user.opCoins,
        realValueINR: Math.floor(user.opCoins / OP_TO_INR),
        totalEarned: user.totalEarned,
        totalRedeemed: user.totalRedeemed,
        totalOpinionsGiven: user.totalOpinionsGiven,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        monthlyEarnings: monthlyEarnings[0]?.total || 0,
        upiId: user.upiId,
        bankDetails: user.bankDetails,
        minRedeemCoins: MIN_REDEEM_COINS,
        maxDailyRedeemINR: MAX_DAILY_REDEEM_INR,
        opToInrRate: OP_TO_INR,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/wallet/transactions ──────────────────
router.get('/transactions', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('opinion', 'title category icon')
      .lean();

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/wallet/redeem ───────────────────────
router.post('/redeem', protect, async (req, res, next) => {
  try {
    const { opCoins, method, upiId, accountNumber, ifsc, accountName } = req.body;

    // Validate amount
    if (!opCoins || opCoins < MIN_REDEEM_COINS) {
      return res.status(400).json({
        success: false,
        message: `Minimum redemption is ${MIN_REDEEM_COINS} OP Coins (₹${MIN_REDEEM_COINS / OP_TO_INR})`,
      });
    }

    const user = await User.findById(req.user._id);
    if (user.opCoins < opCoins) {
      return res.status(400).json({ success: false, message: 'Insufficient OP Coins balance' });
    }

    const realAmountINR = opCoins / OP_TO_INR;

    // Daily limit check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRedeems = await RedemptionRequest.aggregate([
      {
        $match: {
          user: req.user._id,
          status: { $in: ['pending', 'processing', 'completed'] },
          createdAt: { $gte: today },
        },
      },
      { $group: { _id: null, total: { $sum: '$realAmountINR' } } },
    ]);
    const todayTotal = todayRedeems[0]?.total || 0;
    if (todayTotal + realAmountINR > MAX_DAILY_REDEEM_INR) {
      return res.status(400).json({
        success: false,
        message: `Daily redemption limit of ₹${MAX_DAILY_REDEEM_INR} exceeded`,
      });
    }

    // Method validation
    if (!['upi', 'bank'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Invalid redemption method' });
    }
    if (method === 'upi' && !upiId) {
      return res.status(400).json({ success: false, message: 'UPI ID is required' });
    }
    if (method === 'bank' && (!accountNumber || !ifsc)) {
      return res.status(400).json({ success: false, message: 'Account number and IFSC are required' });
    }

    // Deduct coins
    user.opCoins -= opCoins;
    user.totalRedeemed += opCoins;
    await user.save({ validateBeforeSave: false });

    // Create redemption request
    const redemption = await RedemptionRequest.create({
      user: req.user._id,
      opCoinsUsed: opCoins,
      realAmountINR,
      method,
      upiId: upiId || '',
      bankDetails: { accountNumber: accountNumber || '', ifsc: ifsc || '', accountName: accountName || '' },
      status: 'pending',
    });

    // Transaction record
    await Transaction.create({
      user: req.user._id,
      type: 'redeem',
      amount: -opCoins,
      balanceAfter: user.opCoins,
      description: `Redemption via ${method.toUpperCase()} – ₹${realAmountINR}`,
      icon: method === 'upi' ? '💳' : '🏦',
      redemption: {
        method,
        upiId: upiId || '',
        accountNumber: accountNumber || '',
        ifsc: ifsc || '',
        realAmountINR,
        status: 'pending',
      },
    });

    res.json({
      success: true,
      message: `Redemption request of ₹${realAmountINR} submitted successfully`,
      redemption,
      newBalance: user.opCoins,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/wallet/redemptions ───────────────────
router.get('/redemptions', protect, async (req, res, next) => {
  try {
    const redemptions = await RedemptionRequest.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(20)
      .lean();
    res.json({ success: true, redemptions });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/wallet/leaderboard ───────────────────
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter = {};
    if (period === 'month') {
      const start = new Date();
      start.setDate(1); start.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === 'week') {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      dateFilter = { createdAt: { $gte: start } };
    }

    const leaders = await Transaction.aggregate([
      { $match: { type: { $in: ['earn', 'bonus'] }, ...dateFilter } },
      { $group: { _id: '$user', totalCoins: { $sum: '$amount' } } },
      { $sort: { totalCoins: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          avatar: '$user.avatar',
          totalCoins: 1,
          totalOpinionsGiven: '$user.totalOpinionsGiven',
        },
      },
    ]);

    res.json({ success: true, leaders, period });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
