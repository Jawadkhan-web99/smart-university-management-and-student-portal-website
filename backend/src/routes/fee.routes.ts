import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getFees,
  getMyFees,
  createFeeVoucher,
  payFeeVoucher,
  getFeeById,
  deleteFee,
} from '../controllers/fee.controller.js';

const router = Router();

router.use(authenticate);

// Student ledger
router.get('/student/me', authorize('student'), getMyFees);

// List fees (Student views own, Admin views all)
router.get('/', authorize('student', 'admin'), getFees);

// Admin creates fee voucher
router.post('/', authorize('admin'), createFeeVoucher);

// View specific voucher
router.get('/:id', authorize('student', 'admin'), getFeeById);

// Pay voucher (Student or Admin)
router.post('/:id/pay', authorize('student', 'admin'), payFeeVoucher);

// Admin deletes voucher
router.delete('/:id', authorize('admin'), deleteFee);

export default router;
