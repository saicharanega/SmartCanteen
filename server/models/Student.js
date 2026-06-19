const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    index: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  receiveWhatsAppNotifications: {
    type: Boolean,
    required: true,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
