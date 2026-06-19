const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');
const Menu = require('../models/Menu');

// Load environment variables
dotenv.config();

const MOCK_MENU = [
  { name: 'Tea', price: 10, category: 'Beverages', available: true, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400' },
  { name: 'Coffee', price: 15, category: 'Beverages', available: true, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400' },
  { name: 'Veg Puff', price: 25, category: 'Snacks', available: true, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400' },
  { name: 'Samosa', price: 20, category: 'Snacks', available: true, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400' },
  { name: 'Noodles', price: 50, category: 'Fast Food', available: true, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400' }
];

const MOCK_ACCOUNTS = [
  // 1. Student Sai Charan Ega
  {
    username: '22bd1a0501',
    password: 'password123',
    role: 'student',
    profile: {
      name: 'Sai Charan Ega',
      phoneNumber: '9876543200',
      department: 'Computer Science',
      receiveWhatsAppNotifications: true
    }
  },
  // 2. Student Priya Sharma
  {
    username: '22bd1a0502',
    password: 'password123',
    role: 'student',
    profile: {
      name: 'Priya Sharma',
      phoneNumber: '9876543211',
      department: 'Electronics & Communication',
      receiveWhatsAppNotifications: true
    }
  },
  // 3. Cashier staff
  {
    username: 'cashier1',
    password: 'password123',
    role: 'cashier',
    name: 'Canteen Cashier 1',
    phoneNumber: '9876543222'
  },
  // 4. Kitchen worker
  {
    username: 'kitchen1',
    password: 'password123',
    role: 'kitchen',
    name: 'Canteen Kitchen 1',
    phoneNumber: '9876543233'
  },
  // 5. Admin administrator
  {
    username: 'admin1',
    password: 'password123',
    role: 'admin',
    name: 'Canteen Admin 1',
    phoneNumber: '9876543244'
  }
];

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartcanteen';
    await mongoose.connect(uri);
    console.log('Database connected for seeding...');

    // Clear existing collections
    console.log('Clearing existing collections User, Student, and Menu...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Menu.deleteMany({});

    // Hash passwords and seed accounts
    for (const account of MOCK_ACCOUNTS) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(account.password, salt);

      const user = new User({
        username: account.username,
        passwordHash,
        role: account.role,
        name: account.name || null,
        phoneNumber: account.phoneNumber || null
      });

      await user.save();
      console.log(`Saved User: ${account.username} (${account.role})`);

      // If student account, seed profile metadata
      if (account.role === 'student' && account.profile) {
        const student = new Student({
          userId: user._id,
          name: account.profile.name,
          rollNumber: account.username.toUpperCase(),
          phoneNumber: account.profile.phoneNumber,
          department: account.profile.department,
          receiveWhatsAppNotifications: account.profile.receiveWhatsAppNotifications !== undefined ? account.profile.receiveWhatsAppNotifications : true
        });
        await student.save();
        console.log(`Saved Student Profile for: ${account.profile.name}`);
      }
    }

    // Seed Canteen Menu Catalog
    console.log('Seeding Canteen Menu Catalog...');
    for (const item of MOCK_MENU) {
      const menuItem = new Menu(item);
      await menuItem.save();
      console.log(`Saved Menu Item: ${menuItem.name} (${menuItem.category})`);
    }

    console.log('Database seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
