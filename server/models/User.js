// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true, // Each email must be unique
    match: [ // Regex to validate email format
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Prevents password from being sent back in queries by default
  },
  role: {
    type: String,
    enum: ['manager', 'employee'],
    default: 'employee' // All new users will be employees by default
  },
}, {
  timestamps: true
});

// Mongoose middleware to hash password before saving a new user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // If password isn't being changed, move on
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPasswords = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model('User', userSchema);

export default User;