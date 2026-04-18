const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// ── Helper: generate JWT ─────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// ── Helper: send token response ──────────────────
const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      opCoins: user.opCoins,
      totalEarned: user.totalEarned,
      currentStreak: user.currentStreak,
      totalOpinionsGiven: user.totalOpinionsGiven,
      avatar: user.avatar,
      interestedCategories: user.interestedCategories,
      upiId: user.upiId,
      bankDetails: user.bankDetails,
      brandName: user.brandName,
      brandLogo: user.brandLogo,
      brandWallet: user.brandWallet,
      createdAt: user.createdAt,
    },
  });
};

// ── POST /api/auth/register ──────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const { name, email, password, role, brandName } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role === 'brand' ? 'brand' : 'user',
        brandName: brandName || '',
        opCoins: 50,       // Welcome bonus
        totalEarned: 50,
      });

      // Record welcome bonus transaction
      await Transaction.create({
        user: user._id,
        type: 'bonus',
        amount: 50,
        balanceAfter: 50,
        description: 'Welcome bonus – 50 OP Coins',
        icon: '🎁',
      });

      sendToken(user, 201, res);
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/login ─────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // ── Update streak ────────────────────────────
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

      if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
        const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          user.currentStreak += 1;
        } else if (diffDays > 1) {
          user.currentStreak = 1;
        }
        // diffDays === 0 means same day login, no change
      } else {
        user.currentStreak = 1;
      }

      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
      user.lastActiveDate = new Date();
      await user.save({ validateBeforeSave: false });

      sendToken(user, 200, res);
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/auth/me ─────────────────────────────
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// ── PUT /api/auth/profile ────────────────────────
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, upiId, bankDetails, interestedCategories, brandName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, upiId, bankDetails, interestedCategories, brandName },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/auth/change-password ────────────────
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
