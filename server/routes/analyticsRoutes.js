import express from 'express';

// Files import
import {
    getAnalyticsSummary,
    getTaskProgressHistory,
    getEmployeeSummary
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is protected and for managers only
router.get(
    '/summary',
    protect,
    authorize('manager'),
    getAnalyticsSummary
);

router.get('/task/:taskId/progress', protect, getTaskProgressHistory);

// Get a performance summary for a single employee (accessible by manager only)
router.get('/employee/:employeeId', protect, authorize('manager'), getEmployeeSummary);

export default router;