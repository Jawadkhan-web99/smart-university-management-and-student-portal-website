import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Department } from '../models/department.model.js';
import { Course } from '../models/course.model.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * GET /api/departments
 * Search & list departments
 */
export const getDepartments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, isActive } = req.query;

    const filter: Record<string, unknown> = {};

    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { code: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const departments = await Department.find(filter).sort({ name: 1 });

    ApiResponse.success(res, 'Departments retrieved successfully', departments);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/departments/:id
 * Retrieve a specific department
 */
export const getDepartmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid department ID format', 400);
      return;
    }

    const department = await Department.findById(id);

    if (!department) {
      ApiResponse.error(res, 'Department not found', 404);
      return;
    }

    ApiResponse.success(res, 'Department retrieved successfully', department);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/departments
 * Admin creates a new department
 */
export const createDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, code, description, headOfDepartment, isActive } = req.body;

    if (!name || !code) {
      ApiResponse.error(res, 'Department name and code are required', 400);
      return;
    }

    const upperCode = code.toUpperCase().trim();

    // Check duplicate code
    const existing = await Department.findOne({ code: upperCode });
    if (existing) {
      ApiResponse.error(
        res,
        `A department with code '${upperCode}' already exists`,
        409
      );
      return;
    }

    const department = await Department.create({
      name: name.trim(),
      code: upperCode,
      description: description ? description.trim() : '',
      headOfDepartment: headOfDepartment ? headOfDepartment.trim() : '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    ApiResponse.success(res, 'Department created successfully', department, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/departments/:id
 * Admin updates a department
 */
export const updateDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid department ID format', 400);
      return;
    }

    const { name, code, description, headOfDepartment, isActive } = req.body;

    const department = await Department.findById(id);

    if (!department) {
      ApiResponse.error(res, 'Department not found', 404);
      return;
    }

    if (code) {
      const upperCode = code.toUpperCase().trim();
      if (upperCode !== department.code) {
        const duplicate = await Department.findOne({
          code: upperCode,
          _id: { $ne: id },
        });
        if (duplicate) {
          ApiResponse.error(
            res,
            `Department with code '${upperCode}' already exists`,
            409
          );
          return;
        }
        department.code = upperCode;
      }
    }

    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description.trim();
    if (headOfDepartment !== undefined)
      department.headOfDepartment = headOfDepartment.trim();
    if (isActive !== undefined) department.isActive = Boolean(isActive);

    await department.save();

    ApiResponse.success(res, 'Department updated successfully', department);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/departments/:id
 * Admin deletes a department
 */
export const deleteDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid department ID format', 400);
      return;
    }

    // Check if courses are linked to this department
    const linkedCourses = await Course.countDocuments({ department: id });
    if (linkedCourses > 0) {
      ApiResponse.error(
        res,
        `Cannot delete department: ${linkedCourses} active courses are linked to it. Reassign or delete the courses first.`,
        400
      );
      return;
    }

    const deleted = await Department.findByIdAndDelete(id);

    if (!deleted) {
      ApiResponse.error(res, 'Department not found', 404);
      return;
    }

    ApiResponse.success(res, 'Department deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};
