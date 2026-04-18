const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opinion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opinion',
      required: true,
    },
    optionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    optionText: {
      type: String,
      required: true,
    },
    coinsEarned: {
      type: Number,
      required: true,
    },
    // For brand surveys - store extra info
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// A user can only vote once per opinion
VoteSchema.index({ user: 1, opinion: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
