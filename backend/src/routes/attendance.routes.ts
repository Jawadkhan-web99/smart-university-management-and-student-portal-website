import { Router } from 'express';
import {
  getMyAttendance,
  getCourseRosterForAttendance,
  batchMarkAttendance,
  getAttendanceHistory,
} from '../controllers/attendance.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All attendance routes require authentication
router.use(authenticate);

// Student self-attendance metrics
router.get('/me', getMyAttendance);

// Faculty & Admin attendance marking and management
router.get('/course/:courseId', requireRole('teacher', 'admin'), getCourseRosterForAttendance);
router.post('/mark', requireRole('teacher', 'admin'), batchMarkAttendance);
router.get('/history', requireRole('teacher', 'admin'), getAttendanceHistory);

export default router;
