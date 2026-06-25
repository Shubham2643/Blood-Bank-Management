import Notification from "../models/NotificationModel.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Fetch latest 50 notifications for the authenticated user
 * GET /api/user/notifications
 */
export const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 * PUT /api/user/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    if (notification.recipient.toString() !== req.user.id.toString()) {
      return next(new AppError("Not authorized to modify this notification", 403));
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications for the authenticated user as read
 * PUT /api/user/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};
