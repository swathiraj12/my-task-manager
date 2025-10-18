import express from 'express';
import { addManagerRemark, acknowledgeRemark } from '../controllers/workUpdateController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Manager adds remark to a specific update
router.put('/:updateId/remark', protect, authorize('manager'), addManagerRemark);
// Employee acknowledges a remark
router.put('/:updateId/acknowledge', protect, authorize('employee'), acknowledgeRemark);

export default router;