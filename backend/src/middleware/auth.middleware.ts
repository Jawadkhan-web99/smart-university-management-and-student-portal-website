import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User, IUser, UserRole } from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponse.js';

// Extend Express Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

/**
 * Authentication Middleware
 * Reads Bearer token, verifies JWT, finds active user, and attaches user to req.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponse.error(
        res,
        'Authentication required. No Bearer token provided.',
        401
      );
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      ApiResponse.error(res, 'Authentication token is empty.', 401);
      return;
    }

    // Verify JWT
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch (err) {
      const jwtError = err as Error;
      if (jwtError.name === 'TokenExpiredError') {
        ApiResponse.error(res, 'Token has expired. Please log in again.', 401);
        return;
      }
      ApiResponse.error(res, 'Invalid authentication token.', 401);
      return;
    }

    // Find active user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      ApiResponse.error(res, 'User session invalid. Account not found.', 401);
      return;
    }

    if (!user.isActive) {
      ApiResponse.error(
        res,
        'Account has been deactivated. Please contact the administrator.',
        403
      );
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces that authenticated user possesses one of the allowed roles.
 *
 * Usage: requireRole('admin'), requireRole('teacher', 'admin')
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required before role check.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      ApiResponse.error(
        res,
        `Forbidden: Access denied. Required role: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}.`,
        403
      );
      return;
    }

    next();
  };
};

export const authorize = requireRole;
