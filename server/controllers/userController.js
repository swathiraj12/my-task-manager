// server/controllers/userController.js
import User from '../models/User.js';

// @desc    Get all users with the 'employee' role
// @route   GET /api/users/employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('name email');
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};