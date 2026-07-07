import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

/**
 * Authorization middleware - checks if user has required permissions
 * @param requiredPermissions - Array of permission strings e.g. ['products:create', 'products:read']
 */
const authorize = (...requiredPermissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // Admin with full access bypasses permission checks
    if (req.user.role === 'Admin') {
      return next();
    }

    if (requiredPermissions.length === 0) {
      return next();
    }

    const hasPermission = requiredPermissions.every((perm) =>
      req.user!.permissions.includes(perm)
    );

    if (!hasPermission) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};

/**
 * Role-based authorization middleware
 * @param roles - Array of allowed role names
 */
const authorizeRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Your role does not have access to this resource'));
    }

    next();
  };
};

export { authorize, authorizeRoles };
