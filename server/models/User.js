const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'brand', 'admin'],
      default: 'user',
    },

    // ── OP Coin Wallet ──────────────────────────
    opCoins: {
      type: Number,
      default: 50, // welcome bonus
    },
    totalEarned: {
      type: Number,
      default: 50,
    },
    totalRedeemed: {
      type: Number,
      default: 0,
    },

    // ── Streak ──────────────────────────────────
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },

    // ── Stats ────────────────────────────────────
    totalOpinionsGiven: {
      type: Number,
      default: 0,
    },
    opinionsThisMonth: {
      type: Number,
      default: 0,
    },

    // ── Payment Details ──────────────────────────
    upiId: {
      type: String,
      default: '',
    },
    bankDetails: {
      accountNumber: { type: String, default: '' },
      ifsc: { type: String, default: '' },
      accountName: { type: String, default: '' },
    },

    // ── Preferences ──────────────────────────────
    interestedCategories: {
      type: [String],
      default: [],
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Brand-specific
    brandName: { type: String, default: '' },
    brandLogo: { type: String, default: '' },
    brandWallet: { type: Number, default: 0 }, // OP coins brand has purchased
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get initials for avatar
UserSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

module.exports = mongoose.model('User', UserSchema);
