import { Router } from 'express';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Student-only route
router.get(
  '/student',
  authenticate,
  requireRole('student'),
  (req: AuthenticatedRequest, res) => {
    ApiResponse.success(res, 'Student dashboard access granted.', {
      user: req.user?.toSafeObject(),
      module: 'student-portal-preview',
    });
  }
);

// Teacher-only route
router.get(
  '/teacher',
  authenticate,
  requireRole('teacher'),
  (req: AuthenticatedRequest, res) => {
    ApiResponse.success(res, 'Teacher dashboard access granted.', {
      user: req.user?.toSafeObject(),
      module: 'teacher-portal-preview',
    });
  }
);

// Admin-only route
router.get(
  '/admin',
  authenticate,
  requireRole('admin'),
  (req: AuthenticatedRequest, res) => {
    ApiResponse.success(res, 'Admin dashboard access granted.', {
      user: req.user?.toSafeObject(),
      module: 'admin-portal-preview',
    });
  }
);

export default router;
