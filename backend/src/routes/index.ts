import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import departmentRoutes from './department.routes.js';
import semesterRoutes from './semester.routes.js';
import courseRoutes from './course.routes.js';
import studentRoutes from './student.routes.js';
import teacherRoutes from './teacher.routes.js';
import attendanceRoutes from './attendance.routes.js';
import assignmentRoutes from './assignment.routes.js';
import resultRoutes from './result.routes.js';
import submissionRoutes from './submission.routes.js';
import announcementRoutes from './announcement.routes.js';
import notificationRoutes from './notification.routes.js';
import feeRoutes from './fee.routes.js';
import adminManagementRoutes from './adminManagement.routes.js';

const router = Router();

// API sub-routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/departments', departmentRoutes);
router.use('/semesters', semesterRoutes);
router.use('/courses', courseRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/results', resultRoutes);
router.use('/submissions', submissionRoutes);
router.use('/announcements', announcementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/fees', feeRoutes);
router.use('/admin', adminManagementRoutes);

export default router;
