import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Fee } from '../models/fee.model.js';
import { User } from '../models/user.model.js';
import { Semester } from '../models/semester.model.js';
import { Notification } from '../models/notification.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * GET /api/fees
 * List fee vouchers based on user role
 */
export const getFees = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { status, semesterId, studentId, search, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};

    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (req.user.role === 'admin') {
      if (studentId && mongoose.Types.ObjectId.isValid(studentId as string)) {
        filter.student = studentId;
      }
    } else {
      ApiResponse.error(res, 'Access denied', 403);
      return;
    }

    if (status && ['unpaid', 'partially_paid', 'paid', 'overdue'].includes(status as string)) {
      filter.status = status;
    }

    if (semesterId && mongoose.Types.ObjectId.isValid(semesterId as string)) {
      filter.semester = semesterId;
    }

    if (search) {
      filter.invoiceNumber = { $regex: search, $options: 'i' };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await Fee.countDocuments(filter);
    const fees = await Fee.find(filter)
      .populate('student', 'firstName lastName email studentId')
      .populate('semester', 'name academicYear')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    ApiResponse.success(res, 'Fee vouchers retrieved successfully', {
      fees,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/fees/student/me
 * Student retrieves their fee ledger and total financial balance
 */
export const getMyFees = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const vouchers = await Fee.find({ student: req.user._id })
      .populate('semester', 'name academicYear')
      .sort({ dueDate: 1, createdAt: -1 });

    let totalBilled = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    for (const v of vouchers) {
      totalBilled += v.amount;
      totalPaid += v.paidAmount;
      totalOutstanding += v.remainingAmount;
    }

    ApiResponse.success(res, 'Student fee ledger retrieved', {
      totalBilled,
      totalPaid,
      totalOutstanding,
      vouchersCount: vouchers.length,
      vouchers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/fees
 * Admin creates a new fee voucher
 */
export const createFeeVoucher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      ApiResponse.error(res, 'Admin privileges required', 403);
      return;
    }

    const { studentId, semesterId, amount, dueDate, description } = req.body;

    if (!studentId || !semesterId || !amount || !dueDate) {
      ApiResponse.error(res, 'studentId, semesterId, amount, and dueDate are required', 400);
      return;
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      ApiResponse.error(res, 'Target user is not a valid student', 400);
      return;
    }

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      ApiResponse.error(res, 'Semester not found', 404);
      return;
    }

    // Generate unique invoice number: INV-YEAR-RANDOM
    const prefix = `INV-${new Date().getFullYear()}`;
    const rand = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `${prefix}-${rand}`;

    const fee = new Fee({
      student: studentId,
      semester: semesterId,
      invoiceNumber,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      paidAmount: 0,
      description: description || 'Semester Tuition Fee & Facilities Voucher',
    });

    await fee.save();

    // Notify student
    await Notification.create({
      recipient: student._id,
      title: 'New Fee Voucher Issued',
      message: `A new fee voucher ${invoiceNumber} of $${amount} has been issued. Due date: ${new Date(dueDate).toLocaleDateString()}.`,
      type: 'fee',
      link: '/dashboard/student/fees',
    });

    // Audit Log
    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE_FEE_VOUCHER',
      entity: 'Fee',
      entityId: fee._id.toString(),
      description: `Generated fee voucher ${invoiceNumber} of $${amount} for student ${student.firstName} ${student.lastName}`,
    });

    const populated = await Fee.findById(fee._id)
      .populate('student', 'firstName lastName email studentId')
      .populate('semester', 'name academicYear');

    ApiResponse.success(res, 'Fee voucher generated successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/fees/:id/pay
 * Record fee payment (Mock Payment / Admin Confirmation)
 */
export const payFeeVoucher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { id } = req.params;
    const { amount, paymentMethod = 'Online Portal Mock' } = req.body;

    const fee = await Fee.findById(id).populate('student', 'firstName lastName email');
    if (!fee) {
      ApiResponse.error(res, 'Fee voucher not found', 404);
      return;
    }

    // If student, can only pay their own fee
    if (req.user.role === 'student' && fee.student._id.toString() !== req.user._id.toString()) {
      ApiResponse.error(res, 'Access denied', 403);
      return;
    }

    const payAmount = Number(amount || fee.remainingAmount);
    if (isNaN(payAmount) || payAmount <= 0) {
      ApiResponse.error(res, 'Payment amount must be greater than zero', 400);
      return;
    }

    if (payAmount > fee.remainingAmount) {
      ApiResponse.error(res, `Payment amount ($${payAmount}) exceeds remaining balance ($${fee.remainingAmount})`, 400);
      return;
    }

    fee.paidAmount = (fee.paidAmount || 0) + payAmount;
    await fee.save();

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'PAY_FEE',
      entity: 'Fee',
      entityId: fee._id.toString(),
      description: `Processed payment of $${payAmount} for voucher ${fee.invoiceNumber} via ${paymentMethod}`,
    });

    // Notify student
    await Notification.create({
      recipient: fee.student._id,
      title: 'Fee Payment Received',
      message: `Payment of $${payAmount} for voucher ${fee.invoiceNumber} has been verified successfully. Status: ${fee.status}.`,
      type: 'fee',
      link: '/dashboard/student/fees',
    });

    ApiResponse.success(res, 'Payment processed successfully', fee);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/fees/:id
 */
export const getFeeById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { id } = req.params;
    const fee = await Fee.findById(id)
      .populate('student', 'firstName lastName email studentId')
      .populate('semester', 'name academicYear');

    if (!fee) {
      ApiResponse.error(res, 'Fee voucher not found', 404);
      return;
    }

    if (req.user.role === 'student' && fee.student._id.toString() !== req.user._id.toString()) {
      ApiResponse.error(res, 'Access denied', 403);
      return;
    }

    ApiResponse.success(res, 'Fee voucher retrieved', fee);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/fees/:id
 */
export const deleteFee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      ApiResponse.error(res, 'Admin privileges required', 403);
      return;
    }

    const { id } = req.params;
    const fee = await Fee.findByIdAndDelete(id);
    if (!fee) {
      ApiResponse.error(res, 'Fee voucher not found', 404);
      return;
    }

    ApiResponse.success(res, 'Fee voucher deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};
