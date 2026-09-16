import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Attendance } from '../models/attendance.model.js';
import { Course } from '../models/course.model.js';
import { getStudentProfilesForCourses } from './teacher.controller.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

interface CourseAttendanceAggregation {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

/**
 * Normalizes date to midnight UTC to ensure consistency across entries
 */
function normalizeDateToUTC(dateInput: string | Date): Date {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * GET /api/attendance/me
 * Student views their own attendance metrics & course-wise breakdown
 */
export const getMyAttendance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const records = await Attendance.find({ student: req.user._id })
      .populate('course', 'courseCode title creditHours department semester')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 });

    const totalSessions = records.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    const courseMap = new Map<string, CourseAttendanceAggregation>();

    for (const rec of records) {
      if (rec.status === 'present') presentCount++;
      else if (rec.status === 'absent') absentCount++;
      else if (rec.status === 'late') lateCount++;

      const courseObj = rec.course as unknown as {
        _id?: string;
        courseCode?: string;
        title?: string;
      };

      const cId = courseObj?._id ? courseObj._id.toString() : 'unknown';
      const cCode = courseObj?.courseCode || 'N/A';
      const cTitle = courseObj?.title || 'Unknown Course';

      if (!courseMap.has(cId)) {
        courseMap.set(cId, {
          courseId: cId,
          courseCode: cCode,
          courseTitle: cTitle,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          percentage: 0,
        });
      }

      const courseStat = courseMap.get(cId)!;
      courseStat.total++;
      if (rec.status === 'present') courseStat.present++;
      else if (rec.status === 'absent') courseStat.absent++;
      else if (rec.status === 'late') courseStat.late++;
    }

    // Calculate percentages
    const courseBreakdown = Array.from(courseMap.values()).map((c) => ({
      ...c,
      percentage: c.total > 0 ? Math.round((c.present / c.total) * 100) : 0,
    }));

    const overallPercentage =
      totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    ApiResponse.success(res, 'Attendance summary retrieved successfully', {
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      overallPercentage,
      courseBreakdown,
      records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance/course/:courseId
 * Teacher gets enrolled students and existing attendance status for a given course and date
 */
export const getCourseRosterForAttendance = async (
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
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      ApiResponse.error(res, 'Invalid course ID', 400);
      return;
    }

    const course = await Course.findById(courseId)
      .populate('department', 'name code')
      .populate('semester', 'name semesterNumber academicYear');

    if (!course) {
      ApiResponse.error(res, 'Course not found', 404);
      return;
    }

    // RBAC: Check teacher ownership
    if (
      req.user.role === 'teacher' &&
      (!course.teacher || course.teacher.toString() !== req.user._id.toString())
    ) {
      ApiResponse.error(res, 'Access denied. You are not the instructor for this course.', 403);
      return;
    }

    const targetDate = date ? normalizeDateToUTC(date as string) : normalizeDateToUTC(new Date());

    // 1. Get enrolled students
    const studentProfiles = await getStudentProfilesForCourses([course._id]);

    // 2. Fetch any existing attendance records for this course on targetDate
    const existingRecords = await Attendance.find({
      course: course._id,
      date: targetDate,
    });

    const attendanceMap = new Map<string, { status: string; _id: string }>();
    for (const r of existingRecords) {
      attendanceMap.set(r.student.toString(), {
        status: r.status,
        _id: r._id.toString(),
      });
    }

    // 3. Map students with status
    const roster = studentProfiles.map((p) => {
      const u = p.user as unknown as { _id: string; firstName: string; lastName: string; email: string };
      const studentUserId = u?._id ? u._id.toString() : p.user.toString();
      const existing = attendanceMap.get(studentUserId);

      return {
        studentUserId,
        profileId: p._id,
        studentId: p.studentId,
        firstName: u?.firstName || '',
        lastName: u?.lastName || '',
        email: u?.email || '',
        program: p.program,
        status: existing ? existing.status : null,
        recordId: existing ? existing._id : null,
      };
    });

    ApiResponse.success(res, 'Course attendance roster retrieved successfully', {
      course: {
        _id: course._id,
        courseCode: course.courseCode,
        title: course.title,
        department: course.department,
        semester: course.semester,
      },
      date: targetDate.toISOString().split('T')[0],
      isMarked: existingRecords.length > 0,
      totalStudents: roster.length,
      roster,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/attendance/mark
 * Teacher submits attendance records for a course session (Batch upsert)
 */
export const batchMarkAttendance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { courseId, date, records } = req.body;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      ApiResponse.error(res, 'Valid courseId is required', 400);
      return;
    }

    if (!date) {
      ApiResponse.error(res, 'Attendance date is required', 400);
      return;
    }

    if (!Array.isArray(records) || records.length === 0) {
      ApiResponse.error(res, 'Records array is required with at least one student', 400);
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
      ApiResponse.error(res, 'Access denied. You are not assigned to this course.', 403);
      return;
    }

    const normalizedDate = normalizeDateToUTC(date);

    let updatedCount = 0;

    // Idempotent upsert each record
    for (const item of records) {
      const { studentId, status } = item;
      if (!studentId || !['present', 'absent', 'late'].includes(status)) {
        continue;
      }

      await Attendance.findOneAndUpdate(
        {
          student: studentId,
          course: course._id,
          date: normalizedDate,
        },
        {
          status,
          markedBy: req.user._id,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
      updatedCount++;
    }

    ApiResponse.success(res, `Attendance marked successfully for ${updatedCount} students`, {
      courseId,
      date: normalizedDate.toISOString().split('T')[0],
      updatedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance/history
 * List distinct attendance sessions for teacher's courses
 */
export const getAttendanceHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { courseId, startDate, endDate, page = 1, limit = 10 } = req.query;

    let targetCourseIds: mongoose.Types.ObjectId[] = [];

    if (courseId && mongoose.Types.ObjectId.isValid(courseId as string)) {
      const course = await Course.findById(courseId);
      if (!course) {
        ApiResponse.error(res, 'Course not found', 404);
        return;
      }
      if (
        req.user.role === 'teacher' &&
        (!course.teacher || course.teacher.toString() !== req.user._id.toString())
      ) {
        ApiResponse.error(res, 'Access denied to this course history', 403);
        return;
      }
      targetCourseIds = [course._id as mongoose.Types.ObjectId];
    } else {
      const filter: Record<string, unknown> = { isActive: true };
      if (req.user.role === 'teacher') {
        filter.teacher = req.user._id;
      }
      const myCourses = await Course.find(filter).select('_id');
      targetCourseIds = myCourses.map((c) => c._id as mongoose.Types.ObjectId);
    }

    const matchQuery: Record<string, unknown> = {
      course: { $in: targetCourseIds },
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, unknown> = {};
      if (startDate) dateFilter.$gte = normalizeDateToUTC(startDate as string);
      if (endDate) {
        const endD = normalizeDateToUTC(endDate as string);
        endD.setUTCHours(23, 59, 59, 999);
        dateFilter.$lte = endD;
      }
      matchQuery.date = dateFilter;
    }

    // Group by course and date
    const aggregatedSessions = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            course: '$course',
            date: '$date',
          },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] },
          },
          markedBy: { $first: '$markedBy' },
        },
      },
      { $sort: { '_id.date': -1 } },
    ]);

    // Populate course details
    const populated = await Promise.all(
      aggregatedSessions.map(async (sess) => {
        const course = await Course.findById(sess._id.course).select(
          'courseCode title department semester'
        );
        return {
          courseId: sess._id.course,
          courseCode: course?.courseCode || 'N/A',
          courseTitle: course?.title || 'Unknown',
          date: sess._id.date ? new Date(sess._id.date).toISOString().split('T')[0] : '',
          totalStudents: sess.total,
          presentCount: sess.present,
          absentCount: sess.absent,
          lateCount: sess.late,
          percentage: sess.total > 0 ? Math.round((sess.present / sess.total) * 100) : 0,
        };
      })
    );

    // Pagination
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const total = populated.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginated = populated.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    ApiResponse.success(res, 'Attendance history retrieved successfully', {
      sessions: paginated,
      total,
      page: pageNum,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};
