const express = require('express');
const router = express.Router();
const { 
  getStudentMenu, 
  getAdminMenu, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} = require('../controllers/menuController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// 1. Student Menu Endpoint (Requires verification - accessible by students, cashiers, admins to browse stock)
router.get('/student', verifyToken, getStudentMenu);

// 2. Admin Menu Endpoints (Requires verifyToken & requireRole('admin'))
router.get('/admin', verifyToken, requireRole(['admin']), getAdminMenu);
router.post('/admin', verifyToken, requireRole(['admin']), createMenuItem);
router.put('/admin/:id', verifyToken, requireRole(['admin']), updateMenuItem);
router.delete('/admin/:id', verifyToken, requireRole(['admin']), deleteMenuItem);

module.exports = router;
