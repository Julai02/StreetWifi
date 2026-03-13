import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceMac: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  hoursAllowed: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 24],
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  expiryTime: {
    type: Date,
    required: true,
    index: true,
  },
  gracePeriodEnd: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'grace_period', 'expired'],
    default: 'active',
    index: true,
  },
  isDisconnected: {
    type: Boolean,
    default: false,
  },
  dataUsedMB: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate remaining time in seconds
sessionSchema.methods.getTimeRemaining = function() {
  const now = new Date();
  const remaining = Math.floor((this.expiryTime - now) / 1000);
  return remaining > 0 ? remaining : 0;
};

// Check if session is active (including grace period)
sessionSchema.methods.isActiveOrGrace = function() {
  const now = new Date();
  if (this.status === 'active') return true;
  if (this.status === 'grace_period' && now < this.gracePeriodEnd) return true;
  return false;
};

export default mongoose.model('Session', sessionSchema);
