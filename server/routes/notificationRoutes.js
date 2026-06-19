const express = require('express');
const router = express.Router();
const { 
  getTodayNotificationStats,
  getInAppNotifications,
  markInAppNotificationAsRead,
  markAllInAppNotificationsAsRead
} = require('../controllers/notificationController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// ==========================================
// User In-App Notification routes
// ==========================================
router.get('/', verifyToken, getInAppNotifications);
router.patch('/:id/read', verifyToken, markInAppNotificationAsRead);
router.post('/mark-all-read', verifyToken, markAllInAppNotificationsAsRead);

// ==========================================
// Admin Notification stats route
// ==========================================
router.get('/admin/stats', verifyToken, requireRole(['admin']), getTodayNotificationStats);

module.exports = router;
