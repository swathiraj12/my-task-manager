// server/routes/taskRoutes.js
import express from 'express';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllTasks)
  .post(protect, authorize('manager'), createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, authorize('manager'), deleteTask);

export default router;