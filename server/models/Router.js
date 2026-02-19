import mongoose from 'mongoose';

const routerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Router name is required'],
      trim: true,
    },
    macAddress: {
      type: String,
      required: [true, 'MAC address is required'],
      unique: true,
      uppercase: true,
      match: /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    portalUrl: {
      type: String,
      trim: true,
    },
    bandwidth: {
      type: String,
      enum: ['1Mbps', '5Mbps', '10Mbps', '25Mbps', '50Mbps', '100Mbps'],
      default: '10Mbps',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
routerSchema.index({ status: 1 });

export default mongoose.model('Router', routerSchema);
