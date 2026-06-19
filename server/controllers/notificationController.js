const Notification = require('../models/Notification');
const InAppNotification = require('../models/InAppNotification');

/**
 * GET today's WhatsApp & In-App notification stats (sent, failed, unread counts)
 * Route: GET /api/notifications/admin/stats
 */
const getTodayNotificationStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [sentCount, failedCount, inAppSentToday, totalUnreadInApp] = await Promise.all([
      Notification.countDocuments({
        status: 'sent',
        sentAt: { $gte: startOfToday, $lte: endOfToday }
      }),
      Notification.countDocuments({
        status: 'failed',
        sentAt: { $gte: startOfToday, $lte: endOfToday }
      }),
      InAppNotification.countDocuments({
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      }),
      InAppNotification.countDocuments({
        isRead: false
      })
    ]);

    res.status(200).json({
      success: true,
      sentCount,      // WhatsApp Sent Success count
      failedCount,    // WhatsApp Sent Failed count
      inAppSentToday, // In-App notifications sent today count
      totalUnreadInApp // Total unread in-app alerts count in system
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notification statistics', 
      error: error.message 
    });
  }
};

/**
 * GET /api/notifications
 * Retrieve in-app notifications for the logged-in user
 */
const getInAppNotifications = async (req, res) => {
  try {
    const notifications = await InAppNotification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch in-app notifications', error: error.message });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single in-app notification as read
 */
const markInAppNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await InAppNotification.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification status', error: error.message });
  }
};

/**
 * POST /api/notifications/mark-all-read
 * Mark all unread in-app notifications as read for active user
 */
const markAllInAppNotificationsAsRead = async (req, res) => {
  try {
    await InAppNotification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications', error: error.message });
  }
};

module.exports = {
  getTodayNotificationStats,
  getInAppNotifications,
  markInAppNotificationAsRead,
  markAllInAppNotificationsAsRead
};
