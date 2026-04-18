const mongoose = require('mongoose');

const RedemptionRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opCoinsUsed: {
      type: Number,
      required: true,
      min: [100, 'Minimum redemption is 100 OP Coins (₹10)'],
    },
    realAmountINR: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['upi', 'bank'],
      required: true,
    },
    upiId: {
      type: String,
      default: '',
    },
    bankDetails: {
      accountNumber: { type: String, default: '' },
      ifsc: { type: String, default: '' },
      accountName: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
    transactionRef: {
      type: String,
      default: '',
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

RedemptionRequestSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('RedemptionRequest', RedemptionRequestSchema);
