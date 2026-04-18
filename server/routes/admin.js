const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Opinion = require('../models/Opinion');
const Vote = require('../models/Vote');
const Transaction = require('../models/Transaction');
const RedemptionRequest = require('../models/RedemptionRequest');
const { protect, authorize } = require('../middleware/auth');

const adminOnly = [protect, authorize('admin')];

// ── GET /api/admin/stats ──────────────────────────
router.get('/stats', ...adminOnly, async (req, res, next) => {
  try {
    const [totalUsers, totalOpinions, totalVotes, pendingRedemptions] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Opinion.countDocuments(),
      Vote.countDocuments(),
      RedemptionRequest.countDocuments({ status: 'pending' }),
    ]);

    const coinsInCirculation = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$opCoins' } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOpinions,
        totalVotes,
        pendingRedemptions,
        coinsInCirculation: coinsInCirculation[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/redemptions ────────────────────
router.get('/redemptions', ...adminOnly, async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const redemptions = await RedemptionRequest.find({ status })
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, redemptions });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/admin/redemptions/:id ────────────────
router.put('/redemptions/:id', ...adminOnly, async (req, res, next) => {
  try {
    const { status, adminNote, transactionRef } = req.body;
    const redemption = await RedemptionRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote,
        transactionRef,
        processedAt: status === 'completed' ? new Date() : null,
      },
      { new: true }
    );
    res.json({ success: true, redemption });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/admin/opinions/:id/approve ───────────
router.put('/opinions/:id/approve', ...adminOnly, async (req, res, next) => {
  try {
    const { approved } = req.body;
    const opinion = await Opinion.findByIdAndUpdate(
      req.params.id,
      { isApproved: approved, status: approved ? 'active' : 'rejected' },
      { new: true }
    );
    res.json({ success: true, opinion });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/users ──────────────────────────
router.get('/users', ...adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
