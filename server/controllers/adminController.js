const Order = require('../models/Order');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Student = require('../models/Student');
const InAppNotification = require('../models/InAppNotification');
const bcrypt = require('bcryptjs');

/**
 * GET /api/admin/analytics
 * Retrieve admin dashboard insights for today
 */
const getAnalytics = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayQuery = {
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    };

    const notificationsTodayQuery = {
      sentAt: { $gte: startOfToday, $lte: endOfToday }
    };

    // 1. Total Orders Today
    const totalOrders = await Order.countDocuments(todayQuery);

    // 2. Total Revenue (Paid, Ready, Delivered)
    const revenueResult = await Order.aggregate([
      {
        $match: {
          ...todayQuery,
          status: { $in: ['PAID', 'READY', 'DELIVERED'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 3. Online Revenue Today
    const onlineRevenueResult = await Order.aggregate([
      {
        $match: {
          ...todayQuery,
          paymentMethod: 'online',
          status: { $in: ['PAID', 'READY', 'DELIVERED'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    const onlineRevenue = onlineRevenueResult.length > 0 ? onlineRevenueResult[0].total : 0;

    // 4. Cash Revenue Today
    const cashRevenueResult = await Order.aggregate([
      {
        $match: {
          ...todayQuery,
          paymentMethod: 'cash',
          status: { $in: ['PAID', 'READY', 'DELIVERED'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    const cashRevenue = cashRevenueResult.length > 0 ? cashRevenueResult[0].total : 0;

    // 5. Pending Cash Payments Count
    const pendingPaymentsCount = await Order.countDocuments({
      ...todayQuery,
      status: 'PENDING_PAYMENT'
    });

    // 6. Kitchen Prep Queue Count (PAID)
    const paidCount = await Order.countDocuments({
      ...todayQuery,
      status: 'PAID'
    });

    // 7. Ready for Pickup Count (READY)
    const readyCount = await Order.countDocuments({
      ...todayQuery,
      status: 'READY'
    });

    // 8. Delivered Orders Count (DELIVERED)
    const deliveredCount = await Order.countDocuments({
      ...todayQuery,
      status: 'DELIVERED'
    });

    // 9. WhatsApp notification stats today
    const whatsappSent = await Notification.countDocuments({
      ...notificationsTodayQuery,
      status: 'sent'
    });
    const whatsappFailed = await Notification.countDocuments({
      ...notificationsTodayQuery,
      status: 'failed'
    });

    // 10. In-App website notifications today
    const inAppSentToday = await InAppNotification.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    // 11. Total system unread in-app alerts
    const totalUnreadInApp = await InAppNotification.countDocuments({
      isRead: false
    });

    // Top 5 most ordered items today
    const topItemsResult = await Order.aggregate([
      { $match: todayQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // Real MongoDB aggregation for Hourly sales trend today
    const hourlySalesResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday, $lte: endOfToday },
          status: { $in: ['PAID', 'READY', 'DELIVERED'] }
        }
      },
      {
        $group: {
          _id: { $hour: { date: '$createdAt', timezone: 'Asia/Kolkata' } },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const activeHours = [9, 10, 11, 12, 13, 14, 15, 16]; // 9 AM to 4 PM
    const salesMap = {};
    activeHours.forEach(h => {
      salesMap[h] = 0;
    });

    hourlySalesResult.forEach(item => {
      if (salesMap[item._id] !== undefined) {
        salesMap[item._id] = item.amount;
      }
    });

    const maxAmount = Math.max(...Object.values(salesMap));
    const hourlySales = activeHours.map(h => {
      const amount = salesMap[h];
      const hourLabel = h === 12 
        ? '12 PM' 
        : h > 12 
          ? `${String(h - 12).padStart(2, '0')} PM` 
          : `${String(h).padStart(2, '0')} AM`;
      const height = maxAmount > 0 ? Math.round((amount / maxAmount) * 100) : 0;
      return {
        hour: hourLabel,
        amount,
        height: height > 0 ? Math.max(5, height) : 0
      };
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue,
        onlineRevenue,
        cashRevenue,
        pendingPaymentsCount,
        paidCount,
        readyCount,
        deliveredCount,
        whatsappSent,
        whatsappFailed,
        inAppSentToday,
        totalUnreadInApp,
        hourlySales
      },
      topItems: topItemsResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin analytical details',
      error: error.message
    });
  }
};

const getStaffUsers = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['cashier', 'kitchen'] } }).select('-passwordHash');
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch staff list', error: error.message });
  }
};

const searchUserForReset = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    // First search in User collection by username
    let user = await User.findOne({ username: query.toLowerCase().trim() }).select('-passwordHash');
    
    // If not found, check if it matches a roll number in Student
    if (!user) {
      const student = await Student.findOne({ rollNumber: query.toUpperCase().trim() });
      if (student) {
        user = await User.findById(student.userId).select('-passwordHash');
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let details = {
      userId: user._id,
      username: user.username,
      role: user.role
    };

    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        details.name = student.name;
        details.rollNumber = student.rollNumber;
      }
    } else {
      details.name = user.name || 'Staff';
    }

    res.status(200).json({ success: true, user: details });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { userId, tempPassword } = req.body;
    if (!userId || !tempPassword) {
      return res.status(400).json({ success: false, message: 'User ID and temporary password are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hash new password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    user.passwordHash = passwordHash;
    await user.save();

    // Create secure log entry (omit plaintext temp password)
    const ResetLog = require('../models/PasswordResetLog');
    const log = new ResetLog({
      resetBy: req.user.userId,
      userId: user._id,
      createdAt: new Date()
    });
    await log.save();

    res.status(200).json({ 
      success: true, 
      message: `Password for ${user.username} successfully reset.`,
      tempPassword // Return plaintext once to admin UI
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password reset failed', error: error.message });
  }
};

const getResetLogs = async (req, res) => {
  try {
    const ResetLog = require('../models/PasswordResetLog');
    const logs = await ResetLog.find({})
      .populate('userId', 'username')
      .populate('resetBy', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    const mapped = logs.map(l => ({
      _id: l._id,
      resetBy: l.resetBy?._id,
      userId: l.userId?._id,
      targetUsername: l.userId?.username || 'unknown',
      resetAt: l.createdAt,
      createdAt: l.createdAt
    }));

    res.status(200).json({ success: true, logs: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch logs', error: error.message });
  }
};

const createStaffUser = async (req, res) => {
  try {
    const { username, password, role, name, phoneNumber } = req.body;

    if (!username || !password || !role || !name || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'All fields (username, password, role, name, phoneNumber) are required' });
    }

    if (!['cashier', 'kitchen'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either cashier or kitchen' });
    }

    // Phone Number digit validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    // Hash the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create staff credential account
    const user = new User({
      username: username.toLowerCase().trim(),
      passwordHash,
      role,
      name: name.trim(),
      phoneNumber: phoneNumber.trim()
    });
    await user.save();

    res.status(201).json({ 
      success: true, 
      message: 'Staff account registered successfully', 
      user: { id: user._id, username: user.username, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Staff registration failed', error: error.message });
  }
};

const updateStaffUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, username } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!phoneNumber || phoneNumber.trim() === '') {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    if (!username || username.trim() === '') {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    // Phone Number digit validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (!['cashier', 'kitchen'].includes(user.role)) {
      return res.status(400).json({ success: false, message: 'Only cashier and kitchen staff accounts can be edited' });
    }

    // Check if new username is taken
    if (username.toLowerCase().trim() !== user.username) {
      const existing = await User.findOne({ username: username.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      user.username = username.toLowerCase().trim();
    }

    user.name = name.trim();
    user.phoneNumber = phoneNumber.trim();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Staff account updated successfully',
      staff: {
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Staff account update failed', error: error.message });
  }
};

module.exports = {
  getAnalytics,
  getStaffUsers,
  searchUserForReset,
  resetUserPassword,
  getResetLogs,
  createStaffUser,
  updateStaffUser
};
