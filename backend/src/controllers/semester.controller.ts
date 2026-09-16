import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Semester } from '../models/semester.model.js';
import { Course } from '../models/course.model.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * GET /api/semesters
 * List all semesters
 */
export const getSemesters = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { isActive } = req.query;
    const filter: Record<string, unknown> = {};

    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const semesters = await Semester.find(filter).sort({ startDate: -1 });

    ApiResponse.success(res, 'Semesters retrieved successfully', semesters);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/semesters/:id
 * Retrieve a specific semester
 */
export const getSemesterById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid semester ID format', 400);
      return;
    }

    const semester = await Semester.findById(id);

    if (!semester) {
      ApiResponse.error(res, 'Semester not found', 404);
      return;
    }

    ApiResponse.success(res, 'Semester retrieved successfully', semester);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/semesters
 * Admin creates a new semester
 */
export const createSemester = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, semesterNumber, academicYear, startDate, endDate, isActive } =
      req.body;

    if (!name || semesterNumber === undefined || !academicYear || !startDate || !endDate) {
      ApiResponse.error(
        res,
        'Name, semesterNumber, academicYear, startDate, and endDate are required',
        400
      );
      return;
    }

    const newSemester = await Semester.create({
      name: name.trim(),
      semesterNumber: Number(semesterNumber),
      academicYear: academicYear.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    ApiResponse.success(res, 'Semester created successfully', newSemester, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/semesters/:id
 * Admin updates a semester
 */
export const updateSemester = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid semester ID format', 400);
      return;
    }

    const { name, semesterNumber, academicYear, startDate, endDate, isActive } =
      req.body;

    const semester = await Semester.findById(id);

    if (!semester) {
      ApiResponse.error(res, 'Semester not found', 404);
      return;
    }

    if (name) semester.name = name.trim();
    if (semesterNumber !== undefined)
      semester.semesterNumber = Number(semesterNumber);
    if (academicYear) semester.academicYear = academicYear.trim();
    if (startDate) semester.startDate = new Date(startDate);
    if (endDate) semester.endDate = new Date(endDate);
    if (isActive !== undefined) semester.isActive = Boolean(isActive);

    await semester.save();

    ApiResponse.success(res, 'Semester updated successfully', semester);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/semesters/:id
 * Admin deletes a semester
 */
export const deleteSemester = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid semester ID format', 400);
      return;
    }

    // Check if courses reference this semester
    const linkedCourses = await Course.countDocuments({ semester: id });
    if (linkedCourses > 0) {
      ApiResponse.error(
        res,
        `Cannot delete semester: ${linkedCourses} courses are assigned to it. Unlink or delete courses first.`,
        400
      );
      return;
    }

    const deleted = await Semester.findByIdAndDelete(id);

    if (!deleted) {
      ApiResponse.error(res, 'Semester not found', 404);
      return;
    }

    ApiResponse.success(res, 'Semester deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};
