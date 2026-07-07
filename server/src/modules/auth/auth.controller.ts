import { Request, Response } from 'express';
import authService from './auth.service';
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
    // User is attached to req by auth middleware
    res.status(200).json(ApiResponse.success(req.user, 'Current user'));
  });
}

export default new AuthController();
