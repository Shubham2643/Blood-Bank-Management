import Notification from "../models/NotificationModel.js";
import { emitToUser } from "../socket/index.js";
import User from "../models/UserModel.js";

/**
 * Create and send notification to a single user
 * @param {string|mongoose.Types.ObjectId} userId - Target User ID
 * @param {string} message - Notification message content
 * @param {string} type - Notification type: info, success, warning, danger
 */
export const notifyUser = async (userId, message, type = "info") => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      message,
      type,
    });

    // Emit to user's socket room
    emitToUser(userId.toString(), "notification", notification);
    return notification;
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
  }
};

/**
 * Create and send notification to all active users with a specific role
 * @param {string} role - Target role: donor, hospital, blood-lab, admin
 * @param {string} message - Notification message content
 * @param {string} type - Notification type: info, success, warning, danger
 */
export const notifyRole = async (role, message, type = "info") => {
  try {
    const users = await User.find({ role, isActive: true }).select("_id");
    if (users.length === 0) return;

    const notifications = users.map((u) => ({
      recipient: u._id,
      message,
      type,
    }));

    const savedNotifications = await Notification.insertMany(notifications);

    // Emit to each user's socket room
    savedNotifications.forEach((notif) => {
      emitToUser(notif.recipient.toString(), "notification", notif);
    });
  } catch (error) {
    console.error(`Error sending notifications to role ${role}:`, error);
  }
};
