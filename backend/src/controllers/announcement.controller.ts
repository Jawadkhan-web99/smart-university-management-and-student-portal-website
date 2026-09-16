import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Announcement } from '../models/announcement.model.js';
import { User } from '../models/user.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { TeacherProfile } from '../models/teacherProfile.model.js';
import { Notification } from '../models/notification.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * GET /api/announcements
 * Retrieve role-scoped announcements
 */
export const getAnnouncements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, audience, search, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};

    if (req.user) {
      if (req.user.role === 'student') {
        filter.isPublished = true;
        // Find student's department if applicable
        const studentProfile = await StudentProfile.findOne({ user: req.user._id });
        const audienceConditions: unknown[] = [{ audience: 'all' }, { audience: 'students' }];
        if (studentProfile?.department) {
          audienceConditions.push({
            audience: 'department',
            department: studentProfile.department,
          });
        }
        filter.$or = audienceConditions;
      } else if (req.user.role === 'teacher') {
        filter.isPublished = true;
        const teacherProfile = await TeacherProfile.findOne({ user: req.user._id });
        const audienceConditions: unknown[] = [{ audience: 'all' }, { audience: 'teachers' }];
        if (teacherProfile?.department) {
          audienceConditions.push({
            audience: 'department',
            department: teacherProfile.department,
          });
        }
        filter.$or = audienceConditions;
      } else if (req.user.role === 'admin') {
        if (audience) filter.audience = audience;
      }
    } else {
      // Public view: only general all-audience
      filter.isPublished = true;
      filter.audience = 'all';
    }

    if (category) filter.category = category;
    if (search) {
      filter.$and = [
        ...(Array.isArray(filter.$and) ? filter.$and : []),
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await Announcement.countDocuments(filter);
    const announcements = await Announcement.find(filter)
      .populate('author', 'firstName lastName role')
      .populate('department', 'name code')
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    ApiResponse.success(res, 'Announcements retrieved successfully', {
      announcements,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/announcements
 * Create an announcement (Admin / Teacher)
 */
export const createAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
      ApiResponse.error(res, 'Unauthorized to publish announcements', 403);
      return;
    }

    const { title, description, category = 'General', audience = 'all', department, isPublished = true } =
      req.body;

    if (!title || !description) {
      ApiResponse.error(res, 'Title and description are required', 400);
      return;
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      author: req.user._id,
      audience,
      department: department || null,
      isPublished: Boolean(isPublished),
      publishDate: new Date(),
    });

    // Send notifications to target recipients
    try {
      const userFilter: Record<string, unknown> = { _id: { $ne: req.user._id } };
      if (audience === 'students') {
        userFilter.role = 'student';
      } else if (audience === 'teachers') {
        userFilter.role = 'teacher';
      }

      const recipients = await User.find(userFilter).select('_id');
      if (recipients.length > 0) {
        const notifications = recipients.map((u) => ({
          recipient: u._id,
          title: `Announcement: ${announcement.title}`,
          message: announcement.description.substring(0, 120) + '...',
          type: 'announcement',
          link: '/dashboard/announcements',
        }));
        await Notification.insertMany(notifications, { ordered: false });
      }
    } catch (notifErr) {
      // Non-blocking notification failure
      console.warn('Failed to bulk notify users about announcement:', notifErr);
    }

    // Audit Log
    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE_ANNOUNCEMENT',
      entity: 'Announcement',
      entityId: announcement._id.toString(),
      description: `Created announcement "${announcement.title}" for audience "${audience}"`,
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'firstName lastName')
      .populate('department', 'name code');

    ApiResponse.success(res, 'Announcement created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/announcements/:id
 */
export const getAnnouncementById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid announcement ID', 400);
      return;
    }

    const announcement = await Announcement.findById(id)
      .populate('author', 'firstName lastName role')
      .populate('department', 'name code');

    if (!announcement) {
      ApiResponse.error(res, 'Announcement not found', 404);
      return;
    }

    ApiResponse.success(res, 'Announcement retrieved successfully', announcement);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/announcements/:id
 */
export const updateAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
      ApiResponse.error(res, 'Unauthorized to update announcements', 403);
      return;
    }

    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      ApiResponse.error(res, 'Announcement not found', 404);
      return;
    }

    // RBAC: Teachers can only edit their own announcements
    if (req.user.role === 'teacher' && announcement.author.toString() !== req.user._id.toString()) {
      ApiResponse.error(res, 'Access denied', 403);
      return;
    }

    const { title, description, category, audience, department, isPublished } = req.body;
    if (title) announcement.title = title.trim();
    if (description) announcement.description = description.trim();
    if (category) announcement.category = category.trim();
    if (audience) announcement.audience = audience;
    if (department !== undefined) announcement.department = department || null;
    if (isPublished !== undefined) announcement.isPublished = Boolean(isPublished);

    await announcement.save();

    ApiResponse.success(res, 'Announcement updated successfully', announcement);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/announcements/:id
 */
export const deleteAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
      ApiResponse.error(res, 'Unauthorized to delete announcements', 403);
      return;
    }

    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      ApiResponse.error(res, 'Announcement not found', 404);
      return;
    }

    if (req.user.role === 'teacher' && announcement.author.toString() !== req.user._id.toString()) {
      ApiResponse.error(res, 'Access denied', 403);
      return;
    }

    await Announcement.findByIdAndDelete(id);
    ApiResponse.success(res, 'Announcement deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};
