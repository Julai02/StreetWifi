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

// Hash password before saving (only if password is modified and not already hashed)
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Check if password is already hashed (bcrypt hashes start with $2a, $2b, or $2y)
  if (this.password.startsWith('$2a') || this.password.startsWith('$2b') || this.password.startsWith('$2y')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Admin', adminSchema);
