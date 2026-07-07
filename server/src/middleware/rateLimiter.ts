import rateLimit from 'express-rate-limit';

// General rate limit: 200 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, statusCode: 429, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limit: 20 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, statusCode: 429, message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limit: 30 requests per 15 minutes
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, statusCode: 429, message: 'Too many upload requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
