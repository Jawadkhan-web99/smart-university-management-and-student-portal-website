import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public / Authenticated read routes
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

// Admin-only management routes
router.post('/', authenticate, requireRole('admin'), createDepartment);
router.put('/:id', authenticate, requireRole('admin'), updateDepartment);
router.delete('/:id', authenticate, requireRole('admin'), deleteDepartment);

export default router;
