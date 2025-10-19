import mongoose from 'mongoose';

// Files import
import Task from '../models/Task.js';
import WorkUpdate from '../models/WorkUpdate.js';

// @desc    Get analytics data for the manager's team
// @route   GET /api/analytics/summary
export const getAnalyticsSummary = async (req, res) => {
  console.log("--- [getAnalyticsSummary] Received request ---");
  try {
    const managerId = new mongoose.Types.ObjectId(req.user.id);
    console.log(`Manager ID: ${managerId}`);

    // 1. Overall Task Status (Pie Chart)
    const statusSummary = await Task.aggregate([
      { $match: { user: managerId } }, // Only tasks created by this manager
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log("Starting tasksPerEmployee aggregation...");
    // 2. Tasks Per Employee (Bar Chart)
    const tasksPerEmployee = await Task.aggregate([
      { $match: { user: managerId, assignedTo: { $exists: true, $ne: null } } },
      { $group: { _id: '$assignedTo', totalTasks: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employeeDetails'
        }
      },
      { $unwind: '$employeeDetails' },
      {
        $project: {
          _id: 0,
          employeeId: '$employeeDetails._id', // This is correct
          employeeName: '$employeeDetails.name',
          totalTasks: 1
        }
      }
    ]);
    console.log("Aggregation Result for tasksPerEmployee:", JSON.stringify(tasksPerEmployee, null, 2));

    // 3. Overall Progress (Percentage)
    const totalTasks = await Task.countDocuments({ user: managerId });
    const doneTasks = await Task.countDocuments({ user: managerId, status: 'Done' });
    const completionPercentage = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

    const responseData = {
      statusSummary,
      tasksPerEmployee,
      completionPercentage: completionPercentage.toFixed(1),
      totalTasks,
      doneTasks
    };

    console.log("--- [getAnalyticsSummary] Sending successful response ---");
    res.status(200).json({ success: true, data: responseData });

  } catch (error) {
    console.error("--- [getAnalyticsSummary] CRASHED! ---", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get the progress history for a single task
// @route   GET /api/analytics/task/:taskId/progress
export const getTaskProgressHistory = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    // Security Check: Ensure the user is authorized to view this task
    if (task.user.toString() !== req.user.id && task.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const progressUpdates = await WorkUpdate.find({ task: taskId })
      .sort({ createdAt: 'asc' }) // Sort from oldest to newest for the chart
      .select('createdAt percentageComplete'); // Only select the data we need

    res.status(200).json({ success: true, data: progressUpdates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};


// @desc    Get an analytics summary for a single employee
// @route   GET /api/analytics/employee/:employeeId
export const getEmployeeSummary = async (req, res) => {
  console.log("--- [getEmployeeSummary] Received request ---");
  try {
    const { employeeId } = req.params;
    console.log(`Raw employeeId from params: ${employeeId}`);

    const managerId = new mongoose.mongo.ObjectId(req.user.id);
    console.log(`Manager ID: ${managerId}`);

    const employeeObjectId = new mongoose.mongo.ObjectId(employeeId);
    console.log(`Converted employeeObjectId: ${employeeObjectId}`);

    // This query is very similar to the main summary, but with an
    // extra $match stage to filter by the specific employee
    const statusSummary = await Task.aggregate([
      { $match: { user: managerId, assignedTo: employeeObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const prioritySummary = await Task.aggregate([
      { $match: { user: managerId, assignedTo: employeeObjectId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const totalTasks = await Task.countDocuments({ user: managerId, assignedTo: employeeObjectId });
    const doneTasks = await Task.countDocuments({ user: managerId, assignedTo: employeeObjectId, status: 'Done' });
    const completionPercentage = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

    console.log("--- [getEmployeeSummary] Sending successful response ---");
    res.status(200).json({
      success: true,
      data: {
        statusSummary,       // For a pie chart
        prioritySummary,     // For another pie chart
        completionPercentage: completionPercentage.toFixed(1),
        totalTasks,
        doneTasks
      }
    });
  } catch (error) {
    console.error("--- [getEmployeeSummary] CRASHED! ---", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};