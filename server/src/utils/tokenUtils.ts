import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

export interface TokenPayload {
  userId: string;
  publicId: string;
  role: string;
  permissions: string[];
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES as any });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES as any });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};

export const generatePasswordResetToken = (): { resetToken: string; hashedToken: string; expires: Date } => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { resetToken, hashedToken, expires };
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
