import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
} from '../controllers/assignment.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All assignment routes require authentication
router.use(authenticate);

router.get('/', getAssignments);
router.post('/', requireRole('teacher', 'admin'), createAssignment);
router.get('/:id', getAssignmentById);
router.put('/:id', requireRole('teacher', 'admin'), updateAssignment);
router.delete('/:id', requireRole('teacher', 'admin'), deleteAssignment);
router.patch('/:id/status', requireRole('teacher', 'admin'), updateAssignmentStatus);

export default router;
