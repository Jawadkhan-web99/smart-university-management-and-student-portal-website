import { Router } from 'express';
import {
  getSemesters,
  getSemesterById,
  createSemester,
  updateSemester,
  deleteSemester,
} from '../controllers/semester.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public / Authenticated read
router.get('/', getSemesters);
router.get('/:id', getSemesterById);

// Admin-only management
router.post('/', authenticate, requireRole('admin'), createSemester);
router.put('/:id', authenticate, requireRole('admin'), updateSemester);
router.delete('/:id', authenticate, requireRole('admin'), deleteSemester);

export default router;
