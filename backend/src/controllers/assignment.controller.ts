import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Assignment, AssignmentStatus } from '../models/assignment.model.js';
import { Course } from '../models/course.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Computes dynamic time-based status for an assignment
 */
export function computeDynamicStatus(
  status: AssignmentStatus,
  dueDate: Date
): 'draft' | 'published' | 'due_soon' | 'overdue' | 'closed' {
  if (status === 'draft') return 'draft';
  if (status === 'closed') return 'closed';

  const now = new Date();
  const due = new Date(dueDate);

  if (now > due) return 'overdue';

  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffHours <= 48) return 'due_soon';

  return 'published';
}

/**
 * POST /api/assignments
 * Teacher creates a new assignment
 */
export const createAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { title, description, course: courseId, dueDate, totalMarks, attachment, status } =
      req.body;

    if (!title || !description || !courseId || !dueDate) {
      ApiResponse.error(res, 'Title, description, course, and due date are required', 400);
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      ApiResponse.error(res, 'Invalid course ID format', 400);
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      ApiResponse.error(res, 'Course not found', 404);
      return;
    }

    // RBAC: Check teacher ownership
    if (
      req.user.role === 'teacher' &&
      (!course.teacher || course.teacher.toString() !== req.user._id.toString())
    ) {
      ApiResponse.error(
        res,
        'Access denied. You can only create assignments for courses assigned to you.',
        403
      );
      return;
    }

    const marks = totalMarks !== undefined ? Math.max(1, Number(totalMarks)) : 100;
    const initialStatus: AssignmentStatus = ['draft', 'published', 'closed'].includes(status)
      ? status
      : 'draft';

    const newAssignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      course: course._id,
      teacher: req.user._id,
      dueDate: new Date(dueDate),
      totalMarks: marks,
      attachment: attachment ? attachment.trim() : '',
      status: initialStatus,
    });

    const populated = await Assignment.findById(newAssignment._id)
      .populate('course', 'courseCode title creditHours')
      .populate('teacher', 'firstName lastName email');

    ApiResponse.success(res, 'Assignment created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/assignments
 * List assignments with role scoping, search, and status filter
 */
export const getAssignments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { courseId, status, search, page = 1, limit = 20 } = req.query;

    const filter: Record<string, unknown> = {};

    // 1. Role-based scoping
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    } else if (req.user.role === 'student') {
      // Find courses student is enrolled in
      const studentProfile = await StudentProfile.findOne({ user: req.user._id });
      let enrolledCourseIds: mongoose.Types.ObjectId[] = [];

      if (studentProfile) {
        const matchingCourses = await Course.find({
          $or: [
            {
              semester: studentProfile.semester,
              department: studentProfile.department,
              isActive: true,
            },
            {
              enrolledStudents: req.user._id,
              isActive: true,
            },
          ],
        }).select('_id');
        enrolledCourseIds = matchingCourses.map((c) => c._id as mongoose.Types.ObjectId);
      }

      filter.course = { $in: enrolledCourseIds };
      // Students can only see published or closed assignments, never drafts
      filter.status = { $in: ['published', 'closed'] };
    }

    // 2. Query filters
    if (courseId && mongoose.Types.ObjectId.isValid(courseId as string)) {
      filter.course = courseId;
    }

    if (status && typeof status === 'string' && status !== 'all') {
      if (req.user.role !== 'student' || status !== 'draft') {
        filter.status = status;
      }
    }

    if (search && typeof search === 'string') {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await Assignment.countDocuments(filter);
    const rawAssignments = await Assignment.find(filter)
      .populate('course', 'courseCode title creditHours department semester')
      .populate('teacher', 'firstName lastName email')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limitNum);

    // Compute dynamic status
    const assignments = rawAssignments.map((a) => {
      const dynamicStatus = computeDynamicStatus(a.status, a.dueDate);
      return {
        ...a.toObject(),
        dynamicStatus,
      };
    });

    ApiResponse.success(res, 'Assignments retrieved successfully', {
      assignments,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/assignments/:id
 * Retrieve single assignment details
 */
export const getAssignmentById = async (
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid assignment ID format', 400);
      return;
    }

    const assignment = await Assignment.findById(id)
      .populate('course', 'courseCode title creditHours department semester teacher')
      .populate('teacher', 'firstName lastName email phone');

    if (!assignment) {
      ApiResponse.error(res, 'Assignment not found', 404);
      return;
    }

    // Role check:
    if (req.user.role === 'teacher') {
      if (assignment.teacher && assignment.teacher._id.toString() !== req.user._id.toString()) {
        ApiResponse.error(res, 'Access denied. You can only view your own assignments.', 403);
        return;
      }
    } else if (req.user.role === 'student') {
      if (assignment.status === 'draft') {
        ApiResponse.error(res, 'Assignment is not published yet.', 404);
        return;
      }
      // Check if student belongs to course
      const studentProfile = await StudentProfile.findOne({ user: req.user._id });
      const course = assignment.course as unknown as {
        _id?: mongoose.Types.ObjectId;
        semester?: mongoose.Types.ObjectId;
        department?: mongoose.Types.ObjectId;
        enrolledStudents?: mongoose.Types.ObjectId[];
      };

      const isEnrolled =
        (studentProfile &&
          course.semester &&
          studentProfile.semester &&
          course.semester.toString() === studentProfile.semester.toString()) ||
        (course.enrolledStudents &&
          course.enrolledStudents.some((s) => s.toString() === req.user?._id.toString()));

      if (!isEnrolled) {
        ApiResponse.error(res, 'You are not enrolled in this course.', 403);
        return;
      }
    }

    const dynamicStatus = computeDynamicStatus(assignment.status, assignment.dueDate);

    ApiResponse.success(res, 'Assignment details retrieved successfully', {
      ...assignment.toObject(),
      dynamicStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/assignments/:id
 * Teacher updates an assignment
 */
export const updateAssignment = async (
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid assignment ID format', 400);
      return;
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      ApiResponse.error(res, 'Assignment not found', 404);
      return;
    }

    if (
      req.user.role === 'teacher' &&
      assignment.teacher.toString() !== req.user._id.toString()
    ) {
      ApiResponse.error(res, 'Access denied. You can only update your own assignments.', 403);
      return;
    }

    const { title, description, dueDate, totalMarks, attachment, status } = req.body;

    if (title) assignment.title = title.trim();
    if (description) assignment.description = description.trim();
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (totalMarks !== undefined) assignment.totalMarks = Math.max(1, Number(totalMarks));
    if (attachment !== undefined) assignment.attachment = attachment.trim();
    if (status && ['draft', 'published', 'closed'].includes(status)) {
      assignment.status = status;
    }

    await assignment.save();

    const updated = await Assignment.findById(assignment._id)
      .populate('course', 'courseCode title creditHours')
      .populate('teacher', 'firstName lastName email');

    ApiResponse.success(res, 'Assignment updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/assignments/:id
 * Teacher deletes an assignment
 */
export const deleteAssignment = async (
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid assignment ID format', 400);
      return;
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      ApiResponse.error(res, 'Assignment not found', 404);
      return;
    }

    if (
      req.user.role === 'teacher' &&
      assignment.teacher.toString() !== req.user._id.toString()
    ) {
      ApiResponse.error(res, 'Access denied. You can only delete your own assignments.', 403);
      return;
    }

    await Assignment.findByIdAndDelete(id);

    ApiResponse.success(res, 'Assignment deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/assignments/:id/status
 * Quick update of assignment status
 */
export const updateAssignmentStatus = async (
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
    const { status } = req.body;

    if (!['draft', 'published', 'closed'].includes(status)) {
      ApiResponse.error(res, 'Status must be one of: draft, published, closed', 400);
      return;
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      ApiResponse.error(res, 'Assignment not found', 404);
      return;
    }

    if (
      req.user.role === 'teacher' &&
      assignment.teacher.toString() !== req.user._id.toString()
    ) {
      ApiResponse.error(res, 'Access denied. You can only modify your own assignments.', 403);
      return;
    }

    assignment.status = status as AssignmentStatus;
    await assignment.save();

    ApiResponse.success(res, `Assignment status updated to ${status}`, assignment);
  } catch (error) {
    next(error);
  }
};
