import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface LoginHistoryEntry {
  timestamp: Date;
  ip: string;
  userAgent: string;
  success: boolean;
}

interface ConnectedDevice {
  deviceId: string;
  name: string;
  lastSeen: Date;
  userAgent: string;
  trusted: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatar: string;
  currency: string;
  language: string;
  timezone: string;
  theme: 'dark' | 'light' | 'system';
  monthlyIncome: number;
  savingsGoal: number;
  financialHealthScore: number;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  loginHistory: LoginHistoryEntry[];
  connectedDevices: ConnectedDevice[];
  isVerified: boolean;
  verificationToken: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  accountLocked: boolean;
  failedLoginAttempts: number;
  comparePassword(password: string): Promise<boolean>;
}

const loginHistorySchema = new Schema<LoginHistoryEntry>({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
  success: Boolean,
});

const connectedDeviceSchema = new Schema<ConnectedDevice>({
  deviceId: String,
  name: String,
  lastSeen: { type: Date, default: Date.now },
  userAgent: String,
  trusted: { type: Boolean, default: false },
});

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, unique: true },
    avatar: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    monthlyIncome: { type: Number, default: 5000 },
    savingsGoal: { type: Number, default: 1000 },
    financialHealthScore: { type: Number, default: 75, min: 0, max: 100 },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: '' },
    loginHistory: [loginHistorySchema],
    connectedDevices: [connectedDeviceSchema],
    isVerified: { type: Boolean, default: true },
    verificationToken: { type: String, default: '' },
    resetPasswordToken: { type: String, default: '' },
    resetPasswordExpires: { type: Date },
    accountLocked: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') || !this.passwordHash) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
