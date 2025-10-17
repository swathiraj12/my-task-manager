// server/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper function to generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token will be valid for 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: token,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email and explicitly include the password
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPasswords(password))) {
      const token = generateToken(user._id);
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: token,
        },
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};