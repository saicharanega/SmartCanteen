const express = require('express');
const router = express.Router();
const { 
  getAnalytics, 
  getStaffUsers,
  searchUserForReset,
  resetUserPassword,
  getResetLogs,
  createStaffUser,
  updateStaffUser
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Mount GET /analytics with admin role gate protection
router.get('/analytics', verifyToken, requireRole(['admin']), getAnalytics);
router.get('/staff', verifyToken, requireRole(['admin']), getStaffUsers);
router.post('/staff/create', verifyToken, requireRole(['admin']), createStaffUser);
router.put('/staff/:id', verifyToken, requireRole(['admin']), updateStaffUser);

// Password resets endpoints
router.get('/password-reset/search', verifyToken, requireRole(['admin']), searchUserForReset);
router.post('/password-reset/reset', verifyToken, requireRole(['admin']), resetUserPassword);
router.get('/password-reset/logs', verifyToken, requireRole(['admin']), getResetLogs);

module.exports = router;
