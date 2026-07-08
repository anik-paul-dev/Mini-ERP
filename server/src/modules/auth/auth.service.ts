import mongoose from 'mongoose';
import User from './auth.model';
import Role from '../role/role.model';
import ApiError from '../../utils/ApiError';
import {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  hashToken,
} from '../../utils/tokenUtils';

class AuthService {
  async register(data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Find role
      let roleName = data.roleName || 'Employee';
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = await Role.findOne({ name: 'Employee' }); // Default fallback
      }
      if (!role) {
         throw ApiError.internal('Default role not found. Please run seed script.');
      }

      // Check if email exists
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        throw ApiError.conflict('Email already in use');
      }

      // Create user
      const user = new User({
        name: data.name,
        email: data.email,
        password: data.password,
        role: role._id,
        roleName: role.name,
      });

      await user.save({ session });
      await session.commitTransaction();

      // Return user without password
      const userObj = user.toJSON();
      return userObj;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async login(email: string, password: string) {
    // Check if user exists
    const user = await User.findOne({ email }).select('+password').populate('role', 'permissions name');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Contact admin.');
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const role = user.role as any;
    const permissions = role?.permissions || [];

    // Generate tokens
    const payload = {
      userId: user._id.toString(),
      publicId: user.publicId,
      role: user.roleName,
      permissions,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const userObj = user.toJSON();
    (userObj as any).permissions = permissions;

    return { user: userObj, accessToken, refreshToken };
  }

  async refreshAuthToken(refreshToken: string) {
    // Find user by refresh token
    const user = await User.findOne({ refreshToken }).populate('role', 'permissions name');
    if (!user) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    
    if (!user.isActive) {
      throw ApiError.forbidden('Account deactivated');
    }

    const role = user.role as any;
    const permissions = role?.permissions || [];

    // Generate new tokens
    const payload = {
      userId: user._id.toString(),
      publicId: user.publicId,
      role: user.roleName,
      permissions,
    };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Save new refresh token
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshToken: '' }, { new: true, runValidators: false });
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.notFound('User not found with this email');
    }

    const { resetToken, hashedToken, expires } = generatePasswordResetToken();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expires;
    await user.save({ validateBeforeSave: false });

    // In a real app, send email here with the raw resetToken.
    // For this assessment, we'll return the raw token.
    return resetToken;
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) {
      throw ApiError.badRequest('Token is invalid or has expired');
    }

    user.password = newPassword;
    user.passwordResetToken = '';
    user.passwordResetExpires = new Date(0); // clear expiry
    await user.save();

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  }

  async updateProfile(userId: string, data: { name: string }) {
    const user = await User.findByIdAndUpdate(
      userId,
      { name: data.name },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }
}

export default new AuthService();
