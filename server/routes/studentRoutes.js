const express = require('express');
const router = express.Router();
const { getStudentProfile, updateStudentProfile } = require('../controllers/studentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// ==========================================
// Student profile routing
// ==========================================
router.get('/profile', verifyToken, requireRole(['student']), getStudentProfile);
router.put('/profile', verifyToken, requireRole(['student']), updateStudentProfile);

module.exports = router;
