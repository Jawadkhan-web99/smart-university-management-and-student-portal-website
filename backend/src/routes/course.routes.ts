import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/course.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public / Authenticated read
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Admin-only management
router.post('/', authenticate, requireRole('admin'), createCourse);
router.put('/:id', authenticate, requireRole('admin'), updateCourse);
router.delete('/:id', authenticate, requireRole('admin'), deleteCourse);

export default router;
