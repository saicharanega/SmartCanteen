const mongoose = require('mongoose');

const PasswordResetLogSchema = new mongoose.Schema({
  resetBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin user reference is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Target user reference is required']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('PasswordResetLog', PasswordResetLogSchema);
