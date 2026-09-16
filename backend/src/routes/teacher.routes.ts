import { Router } from 'express';
import {
  getMyTeacherProfile,
  updateMyTeacherProfile,
  getTeacherStats,
  getTeacherCourses,
  getTeacherCourseById,
  getTeacherStudents,
} from '../controllers/teacher.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All teacher routes require authentication and teacher/admin role
router.use(authenticate, requireRole('teacher', 'admin'));

router.get('/me', getMyTeacherProfile);
router.put('/me', updateMyTeacherProfile);
router.get('/stats', getTeacherStats);
router.get('/courses', getTeacherCourses);
router.get('/courses/:id', getTeacherCourseById);
router.get('/students', getTeacherStudents);

export default router;
