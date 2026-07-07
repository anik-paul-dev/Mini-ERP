import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = ApiError.badRequest('Invalid ID format');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = ApiError.conflict(`Duplicate value for field: ${field}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    error = ApiError.badRequest('Validation failed', messages);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = ApiError.badRequest('File too large. Maximum size is 5MB');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal server error',
    errors: error.errors || undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
