// server/controllers/taskController.js
import Task from '../models/Task.js';

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
export const getAllTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'manager') {
      // Manager gets all tasks they have created, and we populate the employee's name
      tasks = await Task.find({ user: req.user.id }).populate('assignedTo', 'name');
    } else {
      // Employee gets tasks assigned to them, and we populate the manager's name
      tasks = await Task.find({ assignedTo: req.user.id }).populate('user', 'name');
    }
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get a single task by its ID
// @route   GET /api/tasks/:id
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Security Check: Make sure the user is either the manager who created it
    // or the employee it is assigned to.
    const isManager = req.user.role === 'manager' && task.user.toString() === req.user.id;
    const isAssignedEmployee = req.user.role === 'employee' && task.assignedTo.toString() === req.user.id;

    if (!isManager && !isAssignedEmployee) {
         return res.status(401).json({ success: false, error: 'User not authorized to view this task' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  try {
    // 'user' is the manager creating the task, from the 'protect' middleware
    // 'assignedTo' is the employee's ID, sent in the request body
    const taskData = { ...req.body, user: req.user.id };
    const task = await Task.create(taskData);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // --- NEW PERMISSION LOGIC ---
    const isManager = req.user.role === 'manager' && task.user.toString() === req.user.id;
    const isAssignedEmployee = req.user.role === 'employee' && task.assignedTo.toString() === req.user.id;

    if (!isManager && !isAssignedEmployee) {
      return res.status(401).json({ success: false, error: 'User not authorized' });
    }

    // Employee can ONLY update the status
    if (isAssignedEmployee && Object.keys(req.body).length !== 1 || !req.body.status) {
         return res.status(401).json({ success: false, error: 'Employees can only update the task status' });
    }
    // --- END OF NEW LOGIC ---

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // MODIFIED: Check if the task belongs to the user trying to delete it
    if (task.user.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'User not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};