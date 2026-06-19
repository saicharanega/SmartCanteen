const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Only students are allowed to initialize/verify payments online
router.post('/create-order', verifyToken, requireRole(['student']), createOrder);
router.post('/verify', verifyToken, requireRole(['student']), verifyPayment);

module.exports = router;
