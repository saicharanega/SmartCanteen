const User = require('../models/User');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 1. Register Student User (Public endpoint)
const studentRegister = async (req, res) => {
  try {
    const { username, password, name, phoneNumber, department } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username, password are required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    if (!name || !phoneNumber || !department) {
      return res.status(400).json({ 
        message: 'Student profiles require name, rollNumber (which matches username), phone, and department' 
      });
    }

    // Phone Number digit validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    // Hash the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create credential account
    const user = new User({
      username: username.toLowerCase(),
      passwordHash,
      role: 'student',
      name: null,
      phoneNumber: null
    });
    await user.save();

    const student = new Student({
      userId: user._id,
      name,
      rollNumber: username.toUpperCase(), // roll number matches username
      phoneNumber,
      department
    });
    await student.save();

    res.status(201).json({ 
      success: true, 
      message: 'Student registered successfully', 
      user: { id: user._id, username: user.username, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// 2. Login User
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find User credentials
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Prepare token payload
    const payload = {
      userId: user._id,
      role: user.role,
      username: user.username
    };

    let studentProfile = null;

    // If student, attach roll number and load profile details
    if (user.role === 'student') {
      studentProfile = await Student.findOne({ userId: user._id });
      if (studentProfile) {
        payload.rollNumber = studentProfile.rollNumber;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        profile: studentProfile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// 3. Get User Profile details
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileData = { user };

    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      profileData.student = student;
    }

    res.status(200).json({
      success: true,
      profile: profileData
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile retrieval failed', error: error.message });
  }
};

module.exports = { studentRegister, login, getProfile };
