import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { submissionUpload } from '../services/storage.service.js';
import {
  submitAssignment,
  getMySubmission,
  getSubmissionsForAssignment,
  gradeSubmission,
  getAllSubmissions,
} from '../controllers/submission.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Student submits coursework
router.post('/', authorize('student'), submissionUpload.single('file'), submitAssignment);

// Student views own submission for an assignment
router.get('/assignment/:assignmentId/me', authorize('student'), getMySubmission);

// Teacher/Admin views all submissions for an assignment
router.get('/assignment/:assignmentId', authorize('teacher', 'admin'), getSubmissionsForAssignment);

// Teacher/Admin grades a submission
router.put('/:id/grade', authorize('teacher', 'admin'), gradeSubmission);

// Admin retrieves all submissions across the platform
router.get('/', authorize('admin'), getAllSubmissions);

export default router;
