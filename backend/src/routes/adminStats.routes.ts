import { Router } from 'express';
import { getAdminStats } from '../controllers/adminStats.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Admin-only stats endpoint
router.get('/stats', authenticate, requireRole('admin'), getAdminStats);

export default router;
