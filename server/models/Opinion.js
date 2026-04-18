const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  votes: { type: Number, default: 0 },
});

const OpinionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Opinion title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['sports', 'news', 'polity', 'tech', 'entertainment', 'brand', 'lifestyle'],
    },
    subcategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      trim: true,
    },

    // Opinion type
    opinionType: {
      type: String,
      enum: ['poll', 'rating', 'feedback', 'survey'],
      default: 'poll',
    },

    options: {
      type: [OptionSchema],
      validate: {
        validator: function (v) {
          return v.length >= 2 && v.length <= 8;
        },
        message: 'Opinion must have between 2 and 8 options',
      },
    },

    // Reward per response
    rewardCoins: {
      type: Number,
      default: 5,
      min: [1, 'Minimum reward is 1 OP Coin'],
      max: [100, 'Maximum reward is 100 OP Coins'],
    },

    // Creator info
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isBrandOpinion: {
      type: Boolean,
      default: false,
    },
    brandName: {
      type: String,
      default: '',
    },
    brandLogo: {
      type: String,
      default: '',
    },

    // Source (manual / api-imported)
    source: {
      type: String,
      enum: ['manual', 'newsapi', 'opinion_api', 'admin'],
      default: 'manual',
    },
    sourceUrl: {
      type: String,
      default: '',
    },

    // Stats
    totalVotes: {
      type: Number,
      default: 0,
    },
    totalRewardPaid: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'closed', 'pending', 'rejected'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    },

    // Moderation
    isApproved: {
      type: Boolean,
      default: true, // auto-approve for now; brand opinions may need review
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    tags: [{ type: String, trim: true }],
    icon: { type: String, default: '💬' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast category/subcategory queries
OpinionSchema.index({ category: 1, subcategory: 1 });
OpinionSchema.index({ status: 1, isApproved: 1 });
OpinionSchema.index({ createdAt: -1 });
OpinionSchema.index({ isFeatured: -1, createdAt: -1 });

// Virtual: is this opinion still open?
OpinionSchema.virtual('isOpen').get(function () {
  return this.status === 'active' && new Date() < this.expiresAt;
});

module.exports = mongoose.model('Opinion', OpinionSchema);
