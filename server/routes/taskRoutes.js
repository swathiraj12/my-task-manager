// server/routes/taskRoutes.js
import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { getTaskUpdates, addWorkUpdate } from '../controllers/workUpdateController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllTasks)
  .post(protect, authorize('manager'), createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, authorize('manager'), deleteTask);

router.route('/:taskId/updates')
  .get(protect, getTaskUpdates)
  .post(protect, authorize('employee'), addWorkUpdate);

export default router;