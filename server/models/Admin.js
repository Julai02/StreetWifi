import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'operator'],
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      canViewUsers: { type: Boolean, default: true },
      canViewPayments: { type: Boolean, default: true },
      canViewSessions: { type: Boolean, default: false },
      canManageRates: { type: Boolean, default: false },
      canManageAdmins: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Password hashing handled in application logic

// Method to compare passwords
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Admin', adminSchema);
