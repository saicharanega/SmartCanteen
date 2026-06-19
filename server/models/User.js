const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  role: {
    type: String,
    enum: {
      values: ['student', 'cashier', 'kitchen', 'admin'],
      message: '{VALUE} is not a valid canteen role'
    },
    required: [true, 'Role is required']
  },
  name: {
    type: String,
    trim: true,
    default: null
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
