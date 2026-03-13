import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceMac: {
    type: String,
    required: true,
    index: true,
    uppercase: true,
  },
  amount: {
    type: Number,
    required: true, // in KES
  },
  hoursAllowed: {
    type: Number,
    required: true, // number of hours purchased
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 24],
  },
  pricePerHour: {
    type: Number,
    default: 10, // KES
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending',
    index: true,
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  payHeroResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  payHeroCallbackData: {
    type: mongoose.Schema.Types.Mixed,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

export default mongoose.model('Payment', paymentSchema);
