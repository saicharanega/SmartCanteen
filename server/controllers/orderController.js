const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Student = require('../models/Student');
const InAppNotification = require('../models/InAppNotification');
const { sendOrderReadyNotification } = require('../services/notificationService');

// helper: emit socket event if io exists
const emitSocket = (req, eventName, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, data);
  }
};

// helper: create In-App notification and emit to specific user room
const createAndSendNotification = async (req, userId, title, message) => {
  try {
    if (!userId) return;
    const notification = new InAppNotification({
      userId,
      title,
      message
    });
    await notification.save();
    
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('inapp_notification', notification);
    }
  } catch (err) {
    console.error('[Notification Trigger] Failed to create in-app alert:', err.message);
  }
};

// ==========================================
// 1. STUDENT APIs
// ==========================================

// GET /api/orders/student
const getStudentOrders = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(200).json({ success: true, count: 0, orders: [] });
    }

    const orders = await Order.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student orders', error: error.message });
  }
};

// POST /api/orders/student
const createStudentOrder = async (req, res) => {
  try {
    const { items, paymentMethod, paymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required to place order' });
    }
    if (!paymentMethod || !['online', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    if (paymentMethod === 'online') {
      if (!paymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({ message: 'Razorpay transaction details (paymentId, razorpayOrderId, razorpaySignature) are required for online payments' });
      }

      // Strict signature verification
      const crypto = require('crypto');
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return res.status(500).json({ message: 'Razorpay Secret Key is not configured on the server' });
      }
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(razorpayOrderId + '|' + paymentId);
      const generatedSignature = hmac.digest('hex');
      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Signature verification failed. Order placement blocked.' });
      }
    }

    // Load student profile
    const student = await Student.findOne({ userId: req.user.userId });

    // Build order items list with live DB prices
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of items) {
      const menuItem = await Menu.findById(cartItem.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item with ID ${cartItem.menuItemId} not found` });
      }
      if (!menuItem.available) {
        return res.status(400).json({ message: `Item "${menuItem.name}" is currently out of stock` });
      }

      const quantity = Number(cartItem.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be positive' });
      }

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity
      });

      totalAmount += menuItem.price * quantity;
    }

    // Set order status
    const status = paymentMethod === 'online' ? 'PAID' : 'PENDING_PAYMENT';
    const paymentStatus = paymentMethod === 'online' ? 'COMPLETED' : 'PENDING';

    const newOrder = new Order({
      studentId: student._id,
      studentRoll: student.rollNumber,
      studentName: student.name,
      items: orderItems,
      totalAmount,
      paymentMethod,
      status,
      paymentStatus,
      paymentId: paymentMethod === 'online' ? paymentId : null,
      razorpayOrderId: paymentMethod === 'online' ? razorpayOrderId : null,
      paymentTimestamp: paymentMethod === 'online' ? new Date() : null
    });
    await newOrder.save();

    // Trigger Socket.io real-time update
    emitSocket(req, 'order_created', newOrder);

    // Trigger In-App Notification
    const notifTitle = paymentMethod === 'online' ? 'Order Paid' : 'Order Placed';
    const notifMsg = paymentMethod === 'online'
      ? `Payment received for order #${newOrder.orderNumber}. It is now in the kitchen queue.`
      : `Your order #${newOrder.orderNumber} has been created and is awaiting cash payment at the counter.`;
    
    await createAndSendNotification(req, req.user.userId, notifTitle, notifMsg);

    res.status(201).json({ success: true, message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};

// ==========================================
// 2. CASHIER APIs
// ==========================================

// GET /api/orders/cashier/pending
const getPendingCashierOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'PENDING_PAYMENT' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending counter orders', error: error.message });
  }
};

// PATCH /api/orders/cashier/:id/mark-paid
const markOrderAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ message: 'Order is already paid or processed' });
    }

    order.status = 'PAID';
    order.paidAt = new Date();
    order.paymentStatus = 'COMPLETED';
    order.paymentTimestamp = new Date();
    await order.save();

    // Trigger Socket.io real-time update for kitchen and student dashboards
    emitSocket(req, 'order_paid', order);

    // Trigger In-App Notification if student associated
    if (order.studentId) {
      const studentObj = await Student.findById(order.studentId);
      if (studentObj && studentObj.userId) {
        await createAndSendNotification(
          req,
          studentObj.userId,
          'Order Paid',
          `Payment received for order #${order.orderNumber}. It is now in the kitchen queue.`
        );
      }
    }

    res.status(200).json({ success: true, message: 'Order marked as PAID successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update payment status', error: error.message });
  }
};

// GET /api/orders/cashier/student/search
const searchStudent = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Search by rollNumber or phoneNumber
    const student = await Student.findOne({
      $or: [
        { rollNumber: query.trim().toUpperCase() },
        { phoneNumber: query.trim() }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search student', error: error.message });
  }
};

// POST /api/orders/cashier (POS Register checkout order creation)
const createCashierOrder = async (req, res) => {
  try {
    const { studentRoll, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required for billing' });
    }

    // Build order items list with live DB prices
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of items) {
      const menuItem = await Menu.findById(cartItem.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item with ID ${cartItem.menuItemId} not found` });
      }

      const quantity = Number(cartItem.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be positive' });
      }

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity
      });

      totalAmount += menuItem.price * quantity;
    }

    let studentId = null;
    let studentName = 'Walk-in Student';
    let studentRollSnap = 'WALKIN';

    if (studentRoll && studentRoll.trim() !== '' && studentRoll.toUpperCase() !== 'WALKIN') {
      const student = await Student.findOne({ rollNumber: studentRoll.trim().toUpperCase() });
      if (student) {
        studentId = student._id;
        studentName = student.name;
        studentRollSnap = student.rollNumber;
      }
    }

    const newOrder = new Order({
      studentId,
      studentRoll: studentRollSnap,
      studentName,
      items: orderItems,
      totalAmount,
      paymentMethod: 'cash',
      status: 'PAID', // marked PAID instantly at POS billing register
      paidAt: new Date(),
      paymentStatus: 'COMPLETED',
      paymentTimestamp: new Date()
    });

    await newOrder.save();

    // Trigger Socket.io real-time update
    emitSocket(req, 'order_created', newOrder);

    // Trigger In-App Notification if student associated
    if (studentId) {
      const studentObj = await Student.findById(studentId);
      if (studentObj && studentObj.userId) {
        await createAndSendNotification(
          req,
          studentObj.userId,
          'Order Placed & Paid',
          `Counter sale order #${newOrder.orderNumber} registered successfully.`
        );
      }
    }

    res.status(201).json({ success: true, message: 'Counter sale order registered successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create cashier counter order', error: error.message });
  }
};

// ==========================================
// 3. KITCHEN APIs
// ==========================================

// GET /api/orders/kitchen
const getKitchenOrders = async (req, res) => {
  try {
    // Kitchen only sees PAID and READY queues
    const orders = await Order.find({
      status: { $in: ['PAID', 'READY'] }
    }).sort({ createdAt: 1 }); // oldest first

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active kitchen queue', error: error.message });
  }
};

// PATCH /api/orders/kitchen/:id/ready
const markOrderAsReady = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status !== 'PAID') {
      return res.status(400).json({ message: 'Order is not in PAID state' });
    }

    order.status = 'READY';
    order.readyAt = new Date();
    await order.save();

    // Trigger Socket.io real-time updates for student dashboard
    emitSocket(req, 'order_ready', order);

    // Trigger In-App Notification if student associated
    if (order.studentId) {
      const studentObj = await Student.findById(order.studentId);
      if (studentObj && studentObj.userId) {
        await createAndSendNotification(
          req,
          studentObj.userId,
          'Order Ready for Pickup',
          `Your order #${order.orderNumber} is ready! Please collect it from the counter.`
        );
      }
    }

    // Trigger WhatsApp notification via Meta Cloud API asynchronously (does not block kitchen API execution)
    sendOrderReadyNotification(order).catch(err => {
      console.error('[Notification Trigger error]:', err);
    });

    res.status(200).json({ success: true, message: 'Order marked as READY FOR PICKUP', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// PATCH /api/orders/kitchen/:id/delivered
const markOrderAsDelivered = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status !== 'READY') {
      return res.status(400).json({ message: 'Order is not in READY state' });
    }

    order.status = 'DELIVERED';
    order.deliveredAt = new Date();
    await order.save();

    // Trigger Socket.io real-time updates
    emitSocket(req, 'order_delivered', order);

    // Trigger In-App Notification if student associated
    if (order.studentId) {
      const studentObj = await Student.findById(order.studentId);
      if (studentObj && studentObj.userId) {
        await createAndSendNotification(
          req,
          studentObj.userId,
          'Order Picked Up',
          `Your order #${order.orderNumber} has been marked as delivered. Enjoy your meal!`
        );
      }
    }

    res.status(200).json({ success: true, message: 'Order marked as DELIVERED successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update delivery status', error: error.message });
  }
};

// GET /api/orders/cashier/recent
const getRecentCashierOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent orders', error: error.message });
  }
};

module.exports = {
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
};
