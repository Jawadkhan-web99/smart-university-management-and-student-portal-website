import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { config } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

/**
 * Generate a signed JWT token for a user
 */
const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    }
  );
};

/**
 * POST /api/auth/register
 * Public registration for students
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      ApiResponse.error(
        res,
        'Please provide firstName, lastName, email, and password.',
        400
      );
      return;
    }

    if (password.length < 6) {
      ApiResponse.error(res, 'Password must be at least 6 characters long.', 400);
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      ApiResponse.error(
        res,
        'An account with this email address already exists. Please login.',
        409
      );
      return;
    }

    // Public registration enforces the 'student' role
    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      role: 'student', // Enforce student role
      phone: phone ? phone.trim() : undefined,
      isActive: true,
    });

    // Automatically create initial StudentProfile
    const generatedStudentId = `STU-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    await StudentProfile.create({
      user: newUser._id,
      studentId: generatedStudentId,
      program: 'BS Computer Science',
      admissionYear: new Date().getFullYear(),
      phone: phone ? phone.trim() : '',
      enrollmentStatus: 'enrolled',
    });

    const token = generateToken(newUser);

    ApiResponse.success(
      res,
      'Student registration completed successfully.',
      {
        user: newUser.toSafeObject(),
        token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token and safe user profile
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      ApiResponse.error(res, 'Please provide both email and password.', 400);
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user and explicitly select password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      ApiResponse.error(res, 'Invalid email or password.', 401);
      return;
    }

    // Verify account active status
    if (!user.isActive) {
      ApiResponse.error(
        res,
        'Account has been deactivated. Please contact the university administration.',
        403
      );
      return;
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      ApiResponse.error(res, 'Invalid email or password.', 401);
      return;
    }

    const token = generateToken(user);

    ApiResponse.success(res, 'Login successful.', {
      user: user.toSafeObject(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Confirms logout on server
 */
export const logout = (
  _req: Request,
  res: Response
): void => {
  ApiResponse.success(res, 'Logged out successfully.');
};

/**
 * GET /api/auth/me
 * Returns current authenticated user's profile
 */
export const getMe = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  if (!req.user) {
    ApiResponse.error(res, 'User session not found.', 401);
    return;
  }

  ApiResponse.success(res, 'Profile retrieved successfully.', {
    user: req.user.toSafeObject(),
  });
};

/**
 * POST /api/auth/change-password
 * Allows an authenticated user to update their password
 */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required.', 401);
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      ApiResponse.error(
        res,
        'Please provide both currentPassword and newPassword.',
        400
      );
      return;
    }

    if (newPassword.length < 6) {
      ApiResponse.error(
        res,
        'New password must be at least 6 characters long.',
        400
      );
      return;
    }

    // Fetch user with password
    const userWithPassword = await User.findById(req.user._id).select('+password');
    if (!userWithPassword) {
      ApiResponse.error(res, 'User account not found.', 404);
      return;
    }

    const isMatch = await userWithPassword.comparePassword(currentPassword);
    if (!isMatch) {
      ApiResponse.error(res, 'Current password does not match.', 400);
      return;
    }

    // Update password (pre-save hook will hash it)
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    ApiResponse.success(res, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Allows user to update personal info (phone, address, avatar)
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required.', 401);
      return;
    }

    const { firstName, lastName, phone, address, profileImage } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      ApiResponse.error(res, 'User not found.', 404);
      return;
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    // Also update phone/address on role profile if present
    if (address !== undefined || phone !== undefined) {
      if (user.role === 'student') {
        await mongoose.model('StudentProfile').updateOne(
          { user: user._id },
          { $set: { ...(address !== undefined ? { address } : {}), ...(phone !== undefined ? { phone } : {}) } }
        );
      } else if (user.role === 'teacher') {
        await mongoose.model('TeacherProfile').updateOne(
          { user: user._id },
          { $set: { ...(address !== undefined ? { address } : {}), ...(phone !== undefined ? { phone } : {}) } }
        );
      }
    }

    ApiResponse.success(res, 'Profile updated successfully.', {
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/avatar
 * Uploads user profile photo
 */
export const uploadAvatarHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required.', 401);
      return;
    }

    if (!req.file) {
      ApiResponse.error(res, 'No image file uploaded.', 400);
      return;
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: avatarUrl },
      { new: true }
    );

    ApiResponse.success(res, 'Profile photo uploaded successfully.', {
      avatar: avatarUrl,
      user: user ? user.toSafeObject() : null,
    });
  } catch (error) {
    next(error);
  }
};

