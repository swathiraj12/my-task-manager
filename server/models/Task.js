import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // This tells Mongoose the field refers to the User model
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for the task'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This creates a reference to a User document
  },
  dueDate: {
    type: Date,
  },
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

const Task = mongoose.model('Task', taskSchema);

export default Task;