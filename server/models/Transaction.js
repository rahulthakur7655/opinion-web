const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['earn', 'redeem', 'bonus', 'referral', 'brand_purchase', 'penalty'],
      required: true,
    },
    amount: {
      type: Number,
      required: true, // positive = credit, negative = debit
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Reference to the opinion (for 'earn' transactions)
    opinion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opinion',
      default: null,
    },
    // Redemption details
    redemption: {
      method: { type: String, enum: ['upi', 'bank', ''], default: '' },
      upiId: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifsc: { type: String, default: '' },
      realAmountINR: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', ''],
        default: '',
      },
      processedAt: { type: Date, default: null },
      transactionRef: { type: String, default: '' },
    },
    icon: { type: String, default: '🪙' },
    category: { type: String, default: '' },
  },
  { timestamps: true }
);

TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
