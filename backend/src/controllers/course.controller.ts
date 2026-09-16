import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Course } from '../models/course.model.js';
import { Department } from '../models/department.model.js';
import { Semester } from '../models/semester.model.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * GET /api/courses
 * List courses with search & filter support
 */
export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, department, semester, isActive } = req.query;

    const filter: Record<string, unknown> = {};

    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    if (department && mongoose.Types.ObjectId.isValid(department as string)) {
      filter.department = department;
    }

    if (semester && mongoose.Types.ObjectId.isValid(semester as string)) {
      filter.semester = semester;
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { courseCode: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter)
      .populate('department', 'name code')
      .populate('semester', 'name semesterNumber academicYear')
      .populate('teacher', 'firstName lastName email role')
      .sort({ courseCode: 1 });

    ApiResponse.success(res, 'Courses retrieved successfully', courses);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/courses/:id
 * Retrieve a specific course
 */
export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid course ID format', 400);
      return;
    }

    const course = await Course.findById(id)
      .populate('department', 'name code')
      .populate('semester', 'name semesterNumber academicYear')
      .populate('teacher', 'firstName lastName email role');

    if (!course) {
      ApiResponse.error(res, 'Course not found', 404);
      return;
    }

    ApiResponse.success(res, 'Course retrieved successfully', course);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/courses
 * Admin creates a new course
 */
export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      courseCode,
      title,
      description,
      creditHours,
      department,
      semester,
      teacher,
      isActive,
    } = req.body;

    if (!courseCode || !title || creditHours === undefined || !department) {
      ApiResponse.error(
        res,
        'Course code, title, credit hours, and department are required',
        400
      );
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      ApiResponse.error(res, 'Invalid department ID provided', 400);
      return;
    }

    const deptExists = await Department.findById(department);
    if (!deptExists) {
      ApiResponse.error(res, 'Specified department does not exist', 404);
      return;
    }

    if (semester && !mongoose.Types.ObjectId.isValid(semester)) {
      ApiResponse.error(res, 'Invalid semester ID provided', 400);
      return;
    }

    const upperCode = courseCode.toUpperCase().trim();

    // Check duplicate code
    const existing = await Course.findOne({ courseCode: upperCode });
    if (existing) {
      ApiResponse.error(
        res,
        `Course with code '${upperCode}' already exists`,
        409
      );
      return;
    }

    const newCourse = await Course.create({
      courseCode: upperCode,
      title: title.trim(),
      description: description ? description.trim() : '',
      creditHours: Number(creditHours),
      department,
      semester: semester || null,
      teacher: teacher || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    const populated = await Course.findById(newCourse._id)
      .populate('department', 'name code')
      .populate('semester', 'name semesterNumber academicYear')
      .populate('teacher', 'firstName lastName email');

    ApiResponse.success(res, 'Course created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/courses/:id
 * Admin updates a course
 */
export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid course ID format', 400);
      return;
    }

    const {
      courseCode,
      title,
      description,
      creditHours,
      department,
      semester,
      teacher,
      isActive,
    } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      ApiResponse.error(res, 'Course not found', 404);
      return;
    }

    if (courseCode) {
      const upperCode = courseCode.toUpperCase().trim();
      if (upperCode !== course.courseCode) {
        const duplicate = await Course.findOne({
          courseCode: upperCode,
          _id: { $ne: id },
        });
        if (duplicate) {
          ApiResponse.error(
            res,
            `Course with code '${upperCode}' already exists`,
            409
          );
          return;
        }
        course.courseCode = upperCode;
      }
    }

    if (title) course.title = title.trim();
    if (description !== undefined) course.description = description.trim();
    if (creditHours !== undefined) course.creditHours = Number(creditHours);
    if (department && mongoose.Types.ObjectId.isValid(department)) {
      course.department = department;
    }
    if (semester !== undefined) {
      course.semester =
        semester && mongoose.Types.ObjectId.isValid(semester) ? semester : undefined;
    }
    if (teacher !== undefined) {
      course.teacher =
        teacher && mongoose.Types.ObjectId.isValid(teacher) ? teacher : undefined;
    }
    if (isActive !== undefined) course.isActive = Boolean(isActive);

    await course.save();

    const populated = await Course.findById(course._id)
      .populate('department', 'name code')
      .populate('semester', 'name semesterNumber academicYear')
      .populate('teacher', 'firstName lastName email');

    ApiResponse.success(res, 'Course updated successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/courses/:id
 * Admin deletes a course
 */
export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid course ID format', 400);
      return;
    }

    const deleted = await Course.findByIdAndDelete(id);

    if (!deleted) {
      ApiResponse.error(res, 'Course not found', 404);
      return;
    }

    ApiResponse.success(res, 'Course deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};
