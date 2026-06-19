const Menu = require('../models/Menu');

// 1. Get student menu (Only available items)
const getStudentMenu = async (req, res) => {
  try {
    const items = await Menu.find({ available: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: items.length, menu: items });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve menu catalog', error: error.message });
  }
};

// 2. Get admin menu (All items)
const getAdminMenu = async (req, res) => {
  try {
    const items = await Menu.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, count: items.length, menu: items });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve catalog list', error: error.message });
  }
};

// 3. Create menu item
const createMenuItem = async (req, res) => {
  try {
    const { name, price, category, image, available } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Item name is required' });
    }
    if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const allowedCategories = ['Beverages', 'Snacks', 'Fast Food'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category. Allowed categories: Beverages, Snacks, Fast Food' });
    }

    // Check unique name
    const existing = await Menu.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A menu item with this name already exists' });
    }

    const newItem = new Menu({
      name: name.trim(),
      price: Number(price),
      category,
      available: available !== undefined ? available : true,
      image: image && image.trim() !== '' ? image.trim() : undefined
    });

    await newItem.save();
    res.status(201).json({ success: true, message: 'Item created successfully', item: newItem });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create menu item', error: error.message });
  }
};

// 4. Update menu item (including toggling availability)
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, image, available } = req.body;

    const item = await Menu.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Validate if name changed and matches another item
    if (name && name.trim() !== item.name) {
      const existing = await Menu.findOne({ name: name.trim() });
      if (existing) {
        return res.status(400).json({ message: 'A menu item with this name already exists' });
      }
      item.name = name.trim();
    }

    if (price !== undefined && price !== null) {
      if (isNaN(price) || Number(price) < 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
      }
      item.price = Number(price);
    }

    if (category) {
      const allowedCategories = ['Beverages', 'Snacks', 'Fast Food'];
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid category. Allowed categories: Beverages, Snacks, Fast Food' });
      }
      item.category = category;
    }

    if (image !== undefined) {
      item.image = image.trim() !== '' ? image.trim() : undefined;
    }

    if (available !== undefined) {
      item.available = available;
    }

    await item.save();
    res.status(200).json({ success: true, message: 'Item updated successfully', item });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update menu item', error: error.message });
  }
};

// 5. Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Menu.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete menu item', error: error.message });
  }
};

module.exports = {
  getStudentMenu,
  getAdminMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
