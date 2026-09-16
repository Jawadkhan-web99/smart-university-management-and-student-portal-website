import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { Department } from '../models/department.model.js';
import { Course } from '../models/course.model.js';
import { Semester } from '../models/semester.model.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * GET /api/admin/stats
 * Aggregates live system-wide statistics for the admin dashboard
 */
export const getAdminStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalStudents, totalTeachers, totalDepartments, totalCourses, totalSemesters] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher' }),
        Department.countDocuments(),
        Course.countDocuments(),
        Semester.countDocuments(),
      ]);

    ApiResponse.success(res, 'Admin overview statistics retrieved successfully', {
      totalStudents,
      totalTeachers,
      totalDepartments,
      totalCourses,
      totalSemesters,
    });
  } catch (error) {
    next(error);
  }
};
