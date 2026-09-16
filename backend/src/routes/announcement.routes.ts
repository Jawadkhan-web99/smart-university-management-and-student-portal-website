import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getAnnouncements,
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement.controller.js';

const router = Router();

// Announcements can be viewed with or without auth (optional auth for scoping)
router.get('/', authenticate, getAnnouncements);
router.get('/:id', authenticate, getAnnouncementById);

// Creation & mutations require teacher or admin role
router.post('/', authenticate, authorize('admin', 'teacher'), createAnnouncement);
router.put('/:id', authenticate, authorize('admin', 'teacher'), updateAnnouncement);
router.delete('/:id', authenticate, authorize('admin', 'teacher'), deleteAnnouncement);

export default router;
