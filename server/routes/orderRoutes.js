const express = require('express');
const router = express.Router();
const {
  getStudentOrders,
  createStudentOrder,
  getPendingCashierOrders,
  markOrderAsPaid,
  searchStudent,
  createCashierOrder,
  getKitchenOrders,
  markOrderAsReady,
  markOrderAsDelivered,
  getRecentCashierOrders
} = require('../controllers/orderController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// ==========================================
// 1. Student Order Routes
// ==========================================
router.get('/student', verifyToken, requireRole(['student']), getStudentOrders);
router.post('/student', verifyToken, requireRole(['student']), createStudentOrder);

// ==========================================
// 2. Cashier Order Routes
// ==========================================
router.get('/cashier/pending', verifyToken, requireRole(['cashier']), getPendingCashierOrders);
router.patch('/cashier/:id/mark-paid', verifyToken, requireRole(['cashier']), markOrderAsPaid);
router.get('/cashier/student/search', verifyToken, requireRole(['cashier']), searchStudent);
router.post('/cashier', verifyToken, requireRole(['cashier']), createCashierOrder);
router.get('/cashier/recent', verifyToken, requireRole(['cashier']), getRecentCashierOrders);

// ==========================================
// 3. Kitchen Order Routes
// ==========================================
router.get('/kitchen', verifyToken, requireRole(['kitchen']), getKitchenOrders);
router.patch('/kitchen/:id/ready', verifyToken, requireRole(['kitchen']), markOrderAsReady);
router.patch('/kitchen/:id/delivered', verifyToken, requireRole(['kitchen']), markOrderAsDelivered);

module.exports = router;
