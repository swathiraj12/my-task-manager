import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
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
    type: String, // For now, we'll just use a name. We can link to a User model later.
    trim: true,
  },
  dueDate: {
    type: Date,
  },
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

const Task = mongoose.model('Task', taskSchema);

export default Task;