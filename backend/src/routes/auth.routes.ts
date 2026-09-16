import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  changePassword,
  updateProfile,
  uploadAvatarHandler,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { avatarUpload } from '../services/storage.service.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (requires valid JWT token)
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, avatarUpload.single('avatar'), uploadAvatarHandler);

export default router;
