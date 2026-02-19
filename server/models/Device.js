import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  macAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true,
  },
  deviceName: {
    type: String,
    default: 'Unknown Device',
  },
  ipAddress: {
    type: String,
  },
  lastConnected: {
    type: Date,
    default: Date.now,
  },
  totalDataUsedMB: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update lastConnected timestamp on each access
deviceSchema.methods.updateLastConnected = function() {
  this.lastConnected = Date.now();
  return this.save();
};

export default mongoose.model('Device', deviceSchema);
