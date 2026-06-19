const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null // Null represents walk-in customer
  },
  studentRoll: {
    type: String,
    default: 'WALKIN'
  },
  studentName: {
    type: String,
    default: 'Walk-in Student'
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'online']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  paymentId: {
    type: String,
    default: null
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  paymentTimestamp: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING_PAYMENT', 'PAID', 'READY', 'DELIVERED'],
    default: 'PENDING_PAYMENT'
  },
  paidAt: {
    type: Date
  },
  readyAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-increment orderNumber pre-save hook
OrderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  try {
    const OrderModel = mongoose.model('Order', OrderSchema);
    const lastOrder = await OrderModel.findOne({}, {}, { sort: { 'orderNumber': -1 } });
    
    if (lastOrder && lastOrder.orderNumber) {
      this.orderNumber = lastOrder.orderNumber + 1;
    } else {
      this.orderNumber = 1001; // Sequence starts at 1001
    }
    
    // Set paidAt time if online paid instantly
    if (this.status === 'PAID' && !this.paidAt) {
      this.paidAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Order', OrderSchema);
