import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Result, IResult } from '../models/result.model.js';
import { Course } from '../models/course.model.js';
import { Semester } from '../models/semester.model.js';
import { User } from '../models/user.model.js';
import { calculateGrade, calculateGPA, calculateCGPA } from '../utils/grading.js';
import { getStudentProfilesForCourses } from './teacher.controller.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * POST /api/results
 * Teacher or Admin saves/updates a result or batch results
 */
export const createOrUpdateResult = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { studentId, courseId, semesterId, marks, totalMarks = 100, remarks, status = 'draft' } =
      req.body;

    if (!studentId || !courseId || !semesterId || marks === undefined) {
      ApiResponse.error(res, 'studentId, courseId, semesterId, and marks are required', 400);
      return;
    }

    const numMarks = Number(marks);
    const numTotal = Number(totalMarks);

    if (isNaN(numMarks) || numMarks < 0) {
      ApiResponse.error(res, 'Marks must be a non-negative numeric value', 400);
      return;
    }

    if (numMarks > numTotal) {
      ApiResponse.error(res, `Obtained marks (${numMarks}) cannot exceed total marks (${numTotal})`, 400);
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      ApiResponse.error(res, 'Course not found', 404);
      return;
    }

    // RBAC: If teacher, must be the assigned instructor
    if (
      req.user.role === 'teacher' &&
      (!course.teacher || course.teacher.toString() !== req.user._id.toString())
    ) {
      ApiResponse.error(res, 'Access denied. You are not assigned to this course offering.', 403);
      return;
    }

    // Auto calculate grade & gradePoint
    const { grade, gradePoint } = calculateGrade(numMarks, numTotal);

    const result = await Result.findOneAndUpdate(
      {
        student: studentId,
        course: courseId,
        semester: semesterId,
      },
      {
        student: studentId,
        course: courseId,
        semester: semesterId,
        teacher: course.teacher || req.user._id,
        marks: numMarks,
        totalMarks: numTotal,
        grade,
        gradePoint,
        remarks: remarks || '',
        status: status === 'published' ? 'published' : 'draft',
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const populated = await Result.findById(result._id)
      .populate('student', 'firstName lastName email')
      .populate('course', 'courseCode title creditHours')
      .populate('semester', 'name academicYear');

    ApiResponse.success(res, 'Academic result recorded successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/results/batch
 * Batch saves or publishes results for a course section
 */
export const batchSaveResults = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { courseId, semesterId, results, status = 'draft' } = req.body;

    if (!courseId || !semesterId || !Array.isArray(results) || results.length === 0) {
      ApiResponse.error(res, 'courseId, semesterId, and results array are required', 400);
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      ApiResponse.error(res, 'Course not found', 404);
      return;
    }

    if (
      req.user.role === 'teacher' &&
      (!course.teacher || course.teacher.toString() !== req.user._id.toString())
    ) {
      ApiResponse.error(res, 'Access denied to this course roster', 403);
      return;
    }

    let savedCount = 0;

    for (const item of results) {
      const { studentUserId, marks, totalMarks = 100, remarks } = item;
      if (!studentUserId || marks === undefined) continue;

      const numMarks = Number(marks);
      const numTotal = Number(totalMarks);
      if (isNaN(numMarks) || numMarks < 0 || numMarks > numTotal) continue;

      const { grade, gradePoint } = calculateGrade(numMarks, numTotal);

      await Result.findOneAndUpdate(
        {
          student: studentUserId,
          course: courseId,
          semester: semesterId,
        },
        {
          student: studentUserId,
          course: courseId,
          semester: semesterId,
          teacher: course.teacher || req.user._id,
          marks: numMarks,
          totalMarks: numTotal,
          grade,
          gradePoint,
          remarks: remarks || '',
          status: status === 'published' ? 'published' : 'draft',
        },
        {
          upsert: true,
          new: true,
        }
      );
      savedCount++;
    }

    ApiResponse.success(res, `Successfully saved results for ${savedCount} students as ${status}`, {
      savedCount,
      status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/results
 * Lists results scoped to role
 */
export const getResults = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { courseId, semesterId, studentId, status, search, page = 1, limit = 20 } = req.query;

    const filter: Record<string, unknown> = {};

    // Role-based constraints
    if (req.user.role === 'student') {
      filter.student = req.user._id;
      filter.status = 'published'; // Students can NEVER view drafts
    } else if (req.user.role === 'teacher') {
      // Teacher can only see results for courses assigned to them
      const myCourses = await Course.find({ teacher: req.user._id }).select('_id');
      const courseIds = myCourses.map((c) => c._id);
      filter.course = { $in: courseIds };
    }

    if (courseId && mongoose.Types.ObjectId.isValid(courseId as string)) {
      filter.course = courseId;
    }
    if (semesterId && mongoose.Types.ObjectId.isValid(semesterId as string)) {
      filter.semester = semesterId;
    }
    if (studentId && mongoose.Types.ObjectId.isValid(studentId as string)) {
      filter.student = studentId;
    }
    if (status && ['draft', 'published'].includes(status as string)) {
      if (req.user.role !== 'student') {
        filter.status = status;
      }
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await Result.countDocuments(filter);
    const results = await Result.find(filter)
      .populate('student', 'firstName lastName email studentId')
      .populate('course', 'courseCode title creditHours department')
      .populate('semester', 'name academicYear')
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    ApiResponse.success(res, 'Results retrieved successfully', {
      results,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/results/student/me
 * Student views their own official published results with semester GPA and CGPA
 */
export const getMyResults = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    // Only published results
    const rawResults = await Result.find({
      student: req.user._id,
      status: 'published',
    })
      .populate('course', 'courseCode title creditHours department')
      .populate('semester', 'name semesterNumber academicYear startDate endDate')
      .sort({ 'semester.semesterNumber': 1, 'course.courseCode': 1 });

    // Group results by semester
    const semesterMap = new Map<
      string,
      {
        semester: unknown;
        courses: Array<{
          resultId: string;
          courseCode: string;
          title: string;
          creditHours: number;
          marks: number;
          totalMarks: number;
          grade: string;
          gradePoint: number;
          remarks: string;
        }>;
      }
    >();

    for (const r of rawResults) {
      const semObj = r.semester as unknown as { _id?: string; name?: string };
      const semId = semObj?._id ? semObj._id.toString() : 'unknown';

      if (!semesterMap.has(semId)) {
        semesterMap.set(semId, {
          semester: r.semester,
          courses: [],
        });
      }

      const cObj = r.course as unknown as {
        courseCode?: string;
        title?: string;
        creditHours?: number;
      };

      semesterMap.get(semId)!.courses.push({
        resultId: r._id.toString(),
        courseCode: cObj?.courseCode || 'N/A',
        title: cObj?.title || 'Unknown Course',
        creditHours: cObj?.creditHours || 3,
        marks: r.marks,
        totalMarks: r.totalMarks,
        grade: r.grade,
        gradePoint: r.gradePoint,
        remarks: r.remarks || '',
      });
    }

    // Calculate GPA per semester
    const semesterBreakdown = Array.from(semesterMap.values()).map((item) => {
      const gpaStats = calculateGPA(
        item.courses.map((c) => ({
          creditHours: c.creditHours,
          gradePoint: c.gradePoint,
        }))
      );

      return {
        semester: item.semester,
        courses: item.courses,
        ...gpaStats,
      };
    });

    // Calculate cumulative CGPA
    const cgpaStats = calculateCGPA(
      semesterBreakdown.map((s) => ({
        courses: s.courses.map((c) => ({
          creditHours: c.creditHours,
          gradePoint: c.gradePoint,
        })),
      }))
    );

    ApiResponse.success(res, 'Student official results transcript retrieved', {
      cgpa: cgpaStats.cgpa,
      totalCompletedCourses: cgpaStats.totalCompletedCourses,
      totalCredits: cgpaStats.totalCredits,
      semesters: semesterBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/results/course/:courseId
 * Teacher/Admin retrieves course roster and grading status
 */
export const getCourseResultsRoster = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { courseId } = req.params;
    const { semesterId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      ApiResponse.error(res, 'Invalid course ID', 400);
      return;
    }

    const course = await Course.findById(courseId)
      .populate('department', 'name code')
      .populate('semester', 'name academicYear');

    if (!course) {
      ApiResponse.error(res, 'Course not found', 404);
      return;
    }

    if (
      req.user.role === 'teacher' &&
      (!course.teacher || course.teacher.toString() !== req.user._id.toString())
    ) {
      ApiResponse.error(res, 'Access denied. You are not assigned to this course.', 403);
      return;
    }

    // Get enrolled students
    const studentProfiles = await getStudentProfilesForCourses([course._id]);

    // Existing results
    const targetSemesterId =
      (semesterId && mongoose.Types.ObjectId.isValid(semesterId as string))
        ? (semesterId as string)
        : (course.semester?.toString() || '');

    const existingResults: IResult[] = await Result.find({
      course: course._id,
      semester: targetSemesterId as unknown as mongoose.Types.ObjectId,
    });

    const resultMap = new Map<string, IResult>();
    for (const r of existingResults) {
      resultMap.set(r.student.toString(), r);
    }

    const roster = studentProfiles.map((p) => {
      const u = p.user as unknown as { _id: string; firstName: string; lastName: string; email: string };
      const studentUserId = u?._id ? u._id.toString() : p.user.toString();
      const existing = resultMap.get(studentUserId);

      return {
        studentUserId,
        profileId: p._id,
        studentId: p.studentId,
        firstName: u?.firstName || '',
        lastName: u?.lastName || '',
        email: u?.email || '',
        program: p.program,
        marks: existing ? existing.marks : null,
        totalMarks: existing ? existing.totalMarks : 100,
        grade: existing ? existing.grade : null,
        gradePoint: existing ? existing.gradePoint : null,
        status: existing ? existing.status : null,
        remarks: existing ? existing.remarks : '',
        resultId: existing ? existing._id : null,
      };
    });

    ApiResponse.success(res, 'Course results roster retrieved', {
      course,
      semesterId: targetSemesterId,
      totalStudents: roster.length,
      roster,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/results/:id
 */
export const getResultById = async (
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
      ApiResponse.error(res, 'Invalid result ID', 400);
      return;
    }

    const result = await Result.findById(id)
      .populate('student', 'firstName lastName email')
      .populate('course', 'courseCode title creditHours')
      .populate('semester', 'name academicYear')
      .populate('teacher', 'firstName lastName email');

    if (!result) {
      ApiResponse.error(res, 'Result not found', 404);
      return;
    }

    if (req.user.role === 'student') {
      if (result.student._id.toString() !== req.user._id.toString() || result.status !== 'published') {
        ApiResponse.error(res, 'Access denied', 403);
        return;
      }
    }

    ApiResponse.success(res, 'Result retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/results/:id
 */
export const updateResult = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role === 'student') {
      ApiResponse.error(res, 'Unauthorized to modify academic results', 403);
      return;
    }

    const { id } = req.params;
    const { marks, totalMarks = 100, remarks, status } = req.body;

    const result = await Result.findById(id);
    if (!result) {
      ApiResponse.error(res, 'Result not found', 404);
      return;
    }

    if (req.user.role === 'teacher' && result.teacher.toString() !== req.user._id.toString()) {
      ApiResponse.error(res, 'Access denied to this result record', 403);
      return;
    }

    if (marks !== undefined) {
      const numMarks = Number(marks);
      const numTotal = Number(totalMarks || result.totalMarks);
      if (isNaN(numMarks) || numMarks < 0 || numMarks > numTotal) {
        ApiResponse.error(res, 'Invalid marks range', 400);
        return;
      }
      result.marks = numMarks;
      result.totalMarks = numTotal;
      const { grade, gradePoint } = calculateGrade(numMarks, numTotal);
      result.grade = grade;
      result.gradePoint = gradePoint;
    }

    if (remarks !== undefined) result.remarks = remarks.trim();
    if (status && ['draft', 'published'].includes(status)) result.status = status;

    await result.save();

    const updated = await Result.findById(result._id)
      .populate('student', 'firstName lastName email')
      .populate('course', 'courseCode title');

    ApiResponse.success(res, 'Result updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/results/:id
 */
export const deleteResult = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role === 'student') {
      ApiResponse.error(res, 'Unauthorized to delete results', 403);
      return;
    }

    const { id } = req.params;
    const result = await Result.findById(id);
    if (!result) {
      ApiResponse.error(res, 'Result not found', 404);
      return;
    }

    if (req.user.role === 'teacher' && result.teacher.toString() !== req.user._id.toString()) {
      ApiResponse.error(res, 'Access denied', 403);
      return;
    }

    await Result.findByIdAndDelete(id);
    ApiResponse.success(res, 'Result deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};
