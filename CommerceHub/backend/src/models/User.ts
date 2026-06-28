import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  SELLER = 'seller',
  DELIVERY_PARTNER = 'delivery_partner',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  googleId?: string;
  githubId?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  comparePassword: (enteredPassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER
    },
    avatarUrl: {
      type: String
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    googleId: { type: String },
    githubId: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false }
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) {
    return;
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
