import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Submission } from '../models/submission.model.js';
import { Assignment } from '../models/assignment.model.js';
import { Course } from '../models/course.model.js';
import { Notification } from '../models/notification.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * POST /api/submissions
 * Student submits their coursework (file upload + comment)
 */
export const submitAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { assignmentId, comment } = req.body;

    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      ApiResponse.error(res, 'Valid assignmentId is required', 400);
      return;
    }

    const assignment = await Assignment.findById(assignmentId).populate('course');
    if (!assignment) {
      ApiResponse.error(res, 'Assignment not found', 404);
      return;
    }

    if (!req.file) {
      ApiResponse.error(res, 'A submission file is required', 400);
      return;
    }

    const filePath = `/uploads/submissions/${req.file.filename}`;
    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);

    // Find existing or create new
    const existing = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    let submission;
    if (existing) {
      existing.file = filePath;
      existing.fileName = req.file.originalname;
      existing.fileSize = req.file.size;
      existing.comment = comment || existing.comment || '';
      existing.submittedAt = now;
      existing.status = isLate ? 'late' : 'submitted';
      await existing.save();
      submission = existing;
    } else {
      submission = await Submission.create({
        assignment: assignmentId,
        student: req.user._id,
        file: filePath,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        comment: comment || '',
        submittedAt: now,
        status: isLate ? 'late' : 'submitted',
      });
    }

    // Notify course teacher
    const courseDoc = assignment.course as unknown as { teacher?: mongoose.Types.ObjectId; title?: string };
    if (courseDoc && courseDoc.teacher) {
      await Notification.create({
        recipient: courseDoc.teacher,
        title: 'New Assignment Submission',
        message: `${req.user.firstName} ${req.user.lastName} submitted coursework for "${assignment.title}".`,
        type: 'assignment',
        link: `/dashboard/teacher/assignments/${assignment._id}/submissions`,
      });
    }

    // Audit Log
    await AuditLog.create({
      user: req.user._id,
      action: 'SUBMIT_ASSIGNMENT',
      entity: 'Submission',
      entityId: submission._id.toString(),
      description: `Submitted coursework for "${assignment.title}" with file ${req.file.originalname}${isLate ? ' (Late)' : ''}`,
    });

    const populated = await Submission.findById(submission._id)
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title totalMarks dueDate');

    ApiResponse.success(
      res,
      isLate ? 'Assignment submitted late successfully' : 'Assignment submitted successfully',
      populated,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/submissions/assignment/:assignmentId/me
 * Student views their submission for an assignment
 */
export const getMySubmission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      ApiResponse.error(res, 'Invalid assignment ID', 400);
      return;
    }

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    })
      .populate('assignment', 'title totalMarks dueDate course')
      .populate('gradedBy', 'firstName lastName');

    if (!submission) {
      ApiResponse.success(res, 'No submission found for this assignment', null);
      return;
    }

    ApiResponse.success(res, 'Submission retrieved successfully', submission);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/submissions/assignment/:assignmentId
 * Teacher/Admin gets all submissions for an assignment
 */
export const getSubmissionsForAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      ApiResponse.error(res, 'Invalid assignment ID', 400);
      return;
    }

    const assignment = await Assignment.findById(assignmentId).populate('course');
    if (!assignment) {
      ApiResponse.error(res, 'Assignment not found', 404);
      return;
    }

    // Role check
    if (req.user.role === 'teacher') {
      const courseDoc = assignment.course as unknown as { teacher?: mongoose.Types.ObjectId };
      if (!courseDoc.teacher || courseDoc.teacher.toString() !== req.user._id.toString()) {
        ApiResponse.error(res, 'Access denied to this assignment', 403);
        return;
      }
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'firstName lastName email studentId')
      .populate('gradedBy', 'firstName lastName')
      .sort({ submittedAt: -1 });

    ApiResponse.success(res, 'Submissions retrieved successfully', {
      assignment,
      totalSubmissions: submissions.length,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/submissions/:id/grade
 * Teacher/Admin grades a student submission
 */
export const gradeSubmission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role === 'student') {
      ApiResponse.error(res, 'Unauthorized to grade submissions', 403);
      return;
    }

    const { id } = req.params;
    const { marks, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid submission ID', 400);
      return;
    }

    const submission = await Submission.findById(id).populate('assignment');
    if (!submission) {
      ApiResponse.error(res, 'Submission not found', 404);
      return;
    }

    const assignmentDoc = submission.assignment as unknown as {
      _id: mongoose.Types.ObjectId;
      title: string;
      totalMarks: number;
      course: mongoose.Types.ObjectId;
    };

    if (marks === undefined || marks === null) {
      ApiResponse.error(res, 'Marks are required for grading', 400);
      return;
    }

    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > (assignmentDoc?.totalMarks || 100)) {
      ApiResponse.error(
        res,
        `Marks must be between 0 and ${assignmentDoc?.totalMarks || 100}`,
        400
      );
      return;
    }

    submission.marks = numMarks;
    submission.feedback = feedback ? String(feedback).trim() : '';
    submission.status = 'graded';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();

    await submission.save();

    // Notify student
    await Notification.create({
      recipient: submission.student,
      title: 'Assignment Graded',
      message: `Your submission for "${assignmentDoc.title}" has been graded: ${numMarks}/${assignmentDoc.totalMarks}.`,
      type: 'assignment',
      link: `/dashboard/student/assignments/${assignmentDoc._id}`,
    });

    // Audit Log
    await AuditLog.create({
      user: req.user._id,
      action: 'GRADE_ASSIGNMENT',
      entity: 'Submission',
      entityId: submission._id.toString(),
      description: `Graded submission for "${assignmentDoc.title}": ${numMarks}/${assignmentDoc.totalMarks}`,
    });

    const updated = await Submission.findById(submission._id)
      .populate('student', 'firstName lastName email')
      .populate('gradedBy', 'firstName lastName');

    ApiResponse.success(res, 'Submission graded successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/submissions
 * Admin lists all submissions with filtering & pagination
 */
export const getAllSubmissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      ApiResponse.error(res, 'Admin privileges required', 403);
      return;
    }

    const { status, assignmentId, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (assignmentId && mongoose.Types.ObjectId.isValid(assignmentId as string)) {
      filter.assignment = assignmentId;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .populate('student', 'firstName lastName email')
      .populate({
        path: 'assignment',
        select: 'title dueDate totalMarks course',
        populate: { path: 'course', select: 'courseCode title' },
      })
      .populate('gradedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    ApiResponse.success(res, 'Submissions retrieved successfully', {
      submissions,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};
