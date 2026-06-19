const Student = require('../models/Student');

/**
 * GET student profile details
 * Route: GET /api/student/profile
 */
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
};

/**
 * PUT update student profile details
 * Route: PUT /api/student/profile
 */
const updateStudentProfile = async (req, res) => {
  try {
    const { name, phoneNumber, department, receiveWhatsAppNotifications } = req.body;

    // 1. Mandatory fields checks
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!phoneNumber || phoneNumber.trim() === '') {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    if (!department || department.trim() === '') {
      return res.status(400).json({ success: false, message: 'Department is required' });
    }

    // 2. Phone Number digit validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
    }

    // 3. Find and update Student profile
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Update allowable fields
    student.name = name.trim();
    student.phoneNumber = phoneNumber.trim();
    student.department = department.trim();
    if (receiveWhatsAppNotifications !== undefined) {
      student.receiveWhatsAppNotifications = !!receiveWhatsAppNotifications;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile
};
