import { Request, Response } from 'express';
import authService from './auth.service';
import User from './auth.model';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';

class AuthController {
  register = catchAsync(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    res.status(201).json(ApiResponse.created(user, 'User registered successfully'));
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json(ApiResponse.success({ user, accessToken, refreshToken }, 'Logged in successfully'));
  });

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json(new ApiResponse(401, 'Refresh token required'));
    }

    const { accessToken, refreshToken } = await authService.refreshAuthToken(token);

    // Set new cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json(ApiResponse.success({ accessToken }, 'Token refreshed'));
  });

  logout = catchAsync(async (req: Request, res: Response) => {
    if (req.user) {
      await authService.logout(req.user.userId);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
  });

  getCurrentUser = catchAsync(async (req: Request, res: Response) => {
    // Fetch full user data from DB instead of returning just the JWT payload
    const user = await User.findOne({ publicId: req.user?.publicId })
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
      .populate('role', 'permissions name')
      .lean();

    if (!user) {
      return res.status(401).json(new ApiResponse(401, 'User not found'));
    }

    const role = user.role as any;
    const userData = {
      ...user,
      roleName: user.roleName,
      permissions: role?.permissions || [],
    };

    res.status(200).json(ApiResponse.success(userData, 'Current user'));
  });

  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const resetToken = await authService.forgotPassword(email);
    // Return resetToken in development for testing purposes (since we don't have real email service here)
    res.status(200).json(ApiResponse.success({ resetToken }, 'Password reset link sent to email'));
  });

  resetPassword = catchAsync(async (req: Request<{ token: string }>, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;
    await authService.resetPassword(token, password);
    res.status(200).json(ApiResponse.success(null, 'Password has been reset successfully'));
  });

  changePassword = catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!._id!, currentPassword, newPassword);
    res.status(200).json(ApiResponse.success(null, 'Password changed successfully'));
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const { name } = req.body;
    const updatedUser = await authService.updateProfile(req.user!._id!, { name });
    res.status(200).json(ApiResponse.success(updatedUser, 'Profile updated successfully'));
  });
}

export default new AuthController();
