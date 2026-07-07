import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import ApiError from '../utils/ApiError';

const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return next(ApiError.badRequest('Validation failed', errors));
    }

    next();
  };
};

export default validate;
