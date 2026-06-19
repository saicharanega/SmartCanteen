const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item Name is required'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Beverages', 'Snacks', 'Fast Food'],
      message: '{VALUE} is not a valid category'
    }
  },
  available: {
    type: Boolean,
    required: true,
    default: true
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'
  }
}, { timestamps: true });

module.exports = mongoose.model('Menu', MenuSchema);
