import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/notification.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * GET /api/notifications
 * Retrieve logged-in user's notifications and unread badge count
 */
export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { page = 1, limit = 20, unreadOnly } = req.query;

    const filter: Record<string, unknown> = {
      recipient: req.user._id,
    };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    ApiResponse.success(res, 'Notifications retrieved successfully', {
      notifications,
      total,
      unreadCount,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
export const markAsRead = async (
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
      ApiResponse.error(res, 'Invalid notification ID', 400);
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      ApiResponse.error(res, 'Notification not found', 404);
      return;
    }

    ApiResponse.success(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/read-all
 * Mark all notifications for current user as read
 */
export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    ApiResponse.success(res, 'All notifications marked as read', {
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (
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
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id,
    });

    if (!notification) {
      ApiResponse.error(res, 'Notification not found', 404);
      return;
    }

    ApiResponse.success(res, 'Notification deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};
