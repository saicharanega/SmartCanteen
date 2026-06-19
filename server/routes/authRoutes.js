const express = require('express');
const router = express.Router();
const { studentRegister, login, getProfile } = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// 1. Student Registration (Public endpoint)
router.post('/student-register', studentRegister);

// 2. User Login (Public endpoint)
router.post('/login', login);

// 3. Get User Profile (Protected endpoint - Requires valid JWT)
router.get('/profile', verifyToken, getProfile);

// 4. Role Authorization Verification Test Route (Requires Admin role)
router.get('/admin-test', verifyToken, requireRole(['admin']), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Access granted. Welcome Administrator!',
    adminUser: req.user
  });
});

module.exports = router;
