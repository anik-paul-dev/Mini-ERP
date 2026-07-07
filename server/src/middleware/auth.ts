import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/tokenUtils';
import User from '../modules/auth/auth.model';
import ApiError from '../utils/ApiError';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { _id?: string };
    }
  }
}

const auth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Access token required');
    }

    const decoded = verifyAccessToken(token);

    // Check if user is still active
    const user = await User.findOne({ publicId: decoded.publicId }).select('isActive _id publicId').lean();
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }
    if (!user.isActive) {
      throw ApiError.forbidden('Account has been deactivated');
    }

    req.user = { ...decoded, _id: user._id.toString() };
    next();
  } catch (error: any) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid or expired token'));
    }
  }
};

export default auth;
