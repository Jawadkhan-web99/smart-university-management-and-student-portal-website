import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  createOrUpdateResult,
  batchSaveResults,
  getResults,
  getMyResults,
  getCourseResultsRoster,
  getResultById,
  updateResult,
  deleteResult,
} from '../controllers/result.controller.js';

const router = Router();

// All result routes require authentication
router.use(authenticate);

// Student views their own official published results
router.get('/student/me', authorize('student'), getMyResults);

// Teacher/Admin views roster for grading
router.get('/course/:courseId', authorize('teacher', 'admin'), getCourseResultsRoster);

// Batch save/publish
router.post('/batch', authorize('teacher', 'admin'), batchSaveResults);

// General CRUD & queries
router.route('/')
  .get(getResults)
  .post(authorize('teacher', 'admin'), createOrUpdateResult);

router.route('/:id')
  .get(getResultById)
  .put(authorize('teacher', 'admin'), updateResult)
  .delete(authorize('teacher', 'admin'), deleteResult);

export default router;
