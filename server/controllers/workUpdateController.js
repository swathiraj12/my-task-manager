import WorkUpdate from '../models/WorkUpdate.js';
import Task from '../models/Task.js';

// GET /api/tasks/:taskId/updates
export const getTaskUpdates = async (req, res) => {
    const task = await Task.findById(req.params.taskId);
    // Security Check: Ensure user is either the manager or the assigned employee
    if (task.user.toString() !== req.user.id && task.assignedTo.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    const updates = await WorkUpdate.find({ task: req.params.taskId }).populate('user', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: updates });
};

// POST /api/tasks/:taskId/updates
export const addWorkUpdate = async (req, res) => {
    const task = await Task.findById(req.params.taskId);
    // Security Check: Only the assigned employee can add an update
    if (task.assignedTo.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized to update this task' });
    }
    const { updateText, percentageComplete, intensity } = req.body;
    const update = await WorkUpdate.create({
        task: req.params.taskId,
        user: req.user.id,
        updateText, percentageComplete, intensity
    });
    res.status(201).json({ success: true, data: update });
};

// PUT /api/updates/:updateId/remark
export const addManagerRemark = async (req, res) => {
    const update = await WorkUpdate.findById(req.params.updateId).populate('task');
    // Security Check: Only the manager of the parent task can add a remark
    if (update.task.user.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    update.managerRemark = req.body.remark;
    await update.save();
    res.status(200).json({ success: true, data: update });
};

// PUT /api/updates/:updateId/acknowledge
export const acknowledgeRemark = async (req, res) => {
    const update = await WorkUpdate.findById(req.params.updateId);
    // Security Check: Only the employee who created the update can acknowledge
    if (update.user.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    update.isAcknowledged = true;
    await update.save();
    res.status(200).json({ success: true, data: update });
};