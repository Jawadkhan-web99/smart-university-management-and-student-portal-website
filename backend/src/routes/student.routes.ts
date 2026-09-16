import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getStudentById,
} from '../controllers/student.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Student self-management
router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, updateMyProfile);

// Admin & Teacher lookup
router.get('/:id', authenticate, requireRole('admin', 'teacher'), getStudentById);

export default router;
