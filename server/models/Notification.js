const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order reference is required']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message content is required']
  },
  sentAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['sent', 'failed'],
    default: 'sent',
    index: true
  },
  error: {
    type: String,
    default: null
  },
  apiResponse: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
