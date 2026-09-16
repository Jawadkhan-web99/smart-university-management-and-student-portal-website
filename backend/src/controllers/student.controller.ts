import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { StudentProfile } from '../models/studentProfile.model.js';
import { User } from '../models/user.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * GET /api/students/me
 * Student retrieves their own profile
 */
export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    let profile = await StudentProfile.findOne({ user: req.user._id })
      .populate('department', 'name code')
      .populate('semester', 'name semesterNumber academicYear startDate endDate')
      .populate('user', 'firstName lastName email role isActive');

    // If profile does not exist yet (e.g. newly registered student), initialize one automatically
    if (!profile) {
      const generatedStudentId = `STU-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      profile = await StudentProfile.create({
        user: req.user._id,
        studentId: generatedStudentId,
        program: 'BS Computer Science',
        admissionYear: new Date().getFullYear(),
        phone: req.user.phone || '',
        enrollmentStatus: 'enrolled',
      });

      profile = await StudentProfile.findById(profile._id)
        .populate('department', 'name code')
        .populate('semester', 'name semesterNumber academicYear startDate endDate')
        .populate('user', 'firstName lastName email role isActive');
    }

    ApiResponse.success(res, 'Student profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/students/me
 * Student updates permitted profile information
 * Allowed: phone, address, dateOfBirth, gender, profileImage
 * Prohibited: studentId, role, department, program, enrollmentStatus
 */
export const updateMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { phone, address, dateOfBirth, gender, profileImage } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      const generatedStudentId = `STU-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      profile = new StudentProfile({
        user: req.user._id,
        studentId: generatedStudentId,
        program: 'BS Computer Science',
        admissionYear: new Date().getFullYear(),
        enrollmentStatus: 'enrolled',
      });
    }

    // Update only permitted fields
    if (phone !== undefined) {
      profile.phone = phone.trim();
      // Also sync with User document phone
      await User.findByIdAndUpdate(req.user._id, { phone: phone.trim() });
    }
    if (address !== undefined) profile.address = address.trim();
    if (dateOfBirth !== undefined)
      profile.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (gender !== undefined && ['male', 'female', 'other'].includes(gender)) {
      profile.gender = gender;
    }
    if (profileImage !== undefined) profile.profileImage = profileImage;

    await profile.save();

    const updatedProfile = await StudentProfile.findById(profile._id)
      .populate('department', 'name code')
      .populate('semester', 'name semesterNumber academicYear')
      .populate('user', 'firstName lastName email role');

    ApiResponse.success(
      res,
      'Student profile updated successfully',
      updatedProfile
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/:id
 * Admin or faculty retrieves student profile by studentId or user ID
 */
export const getStudentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    let profile = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      profile = await StudentProfile.findOne({
        $or: [{ _id: id }, { user: id }],
      })
        .populate('department', 'name code')
        .populate('semester', 'name semesterNumber academicYear')
        .populate('user', 'firstName lastName email role isActive');
    } else {
      // Lookup by studentId string
      profile = await StudentProfile.findOne({ studentId: id.toUpperCase().trim() })
        .populate('department', 'name code')
        .populate('semester', 'name semesterNumber academicYear')
        .populate('user', 'firstName lastName email role isActive');
    }

    if (!profile) {
      ApiResponse.error(res, 'Student profile not found', 404);
      return;
    }

    ApiResponse.success(res, 'Student profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};
