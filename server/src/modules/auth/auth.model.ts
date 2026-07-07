import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export interface IUser extends Document {
  publicId: string;
  name: string;
  email: string;
  password: string;
  role: mongoose.Types.ObjectId;
  roleName: string;
  isActive: boolean;
  avatar: string;
  refreshToken: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    publicId: {
      type: String,
      default: () => nanoid(12),
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role is required'],
    },
    roleName: {
      type: String,
      required: true,
      default: 'Employee',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
