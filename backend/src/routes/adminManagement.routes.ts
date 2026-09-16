import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getComprehensiveAdminStats,
  getStudentsList,
  createStudent,
  updateStudent,
  deleteStudent,
  getTeachersList,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getActivityLogs,
  getReportsData,
  submitContactForm,
  getContactMessages,
  markContactMessageRead,
  globalSearch,
} from '../controllers/adminManagement.controller.js';

const router = Router();

// Public contact submission
router.post('/contact', submitContactForm);

// Search endpoint (authenticated users)
router.get('/search', authenticate, globalSearch);

// Admin-only protected routes
router.use(authenticate, authorize('admin'));

// Analytics & Stats
router.get('/stats', getComprehensiveAdminStats);
router.get('/analytics', getComprehensiveAdminStats);

// Student management
router.get('/students', getStudentsList);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Teacher management
router.get('/teachers', getTeachersList);
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Activity audit logs
router.get('/activity', getActivityLogs);

// Reports
router.get('/reports', getReportsData);

// Inquiries / Messages
router.get('/messages', getContactMessages);
router.put('/messages/:id/read', markContactMessageRead);

export default router;
