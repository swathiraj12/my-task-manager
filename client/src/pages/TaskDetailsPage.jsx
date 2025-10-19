import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';

// Files import
import './TaskDetailsPage.css';
import { getTaskById, getTaskUpdates, addWorkUpdate } from '../services/taskService.js';
import { getTaskProgress } from '../services/analyticsService.js';
import { addManagerRemark, acknowledgeRemark } from '../services/workUpdateService.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

function TaskDetailsPage() {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [progressData, setProgressData] = useState([]);
    const [remark, setRemark] = useState('');
    const [newUpdate, setNewUpdate] = useState({ updateText: '', percentageComplete: 0, intensity: 'Medium' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const user = JSON.parse(localStorage.getItem('user'));

    const fetchData = useCallback(async () => {
        try {
            const [taskData, updatesData, progressHistory] = await Promise.all([
                getTaskById(taskId),
                getTaskUpdates(taskId),
                getTaskProgress(taskId)
            ]);
            setTask(taskData);
            setUpdates(updatesData);
            setProgressData(progressHistory);
            if (updatesData.length > 0) {
                setNewUpdate(prev => ({ ...prev, percentageComplete: updatesData[0].percentageComplete }));
            }
        } catch (err) {
            setError('Failed to fetch task details. Please try again.');
            console.error('Failed to fetch task details.', err);
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- CLEAN EVENT HANDLERS ---
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await addWorkUpdate(taskId, newUpdate);
            setNewUpdate({ updateText: '', percentageComplete: newUpdate.percentageComplete, intensity: 'Medium' });
            fetchData(); // Refetch all data to show the new update
        } catch (err) {
            setError("Failed to submit update.");
        }
    };

    const handleRemarkSubmit = async (updateId, remarkText) => {
        if (!remarkText) return;
        try {
            await addManagerRemark(updateId, remarkText);
            fetchData();
        } catch (err) {
            setError("Failed to add remark.");
        }
    };

    const handleAcknowledge = async (updateId) => {
        try {
            await acknowledgeRemark(updateId);
            fetchData();
        } catch (err) {
            setError("Failed to acknowledge remark.");
        }
    };

    // --- CHART DATA CONFIGURATION ---
    const lineChartData = {
        labels: progressData.map(p => new Date(p.createdAt).toLocaleDateString()),
        datasets: [{
            label: 'Task Completion %',
            data: progressData.map(p => p.percentageComplete),
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            tension: 0.1
        }]
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-banner">{error}</div>;
    if (!task) return <div>Task not found.</div>;

    return (
        <div className="task-details-page">
            <div className="task-details-header">
                <div>
                    <Link to="/tasks" className="back-link">&larr; Back to Task List</Link>
                    <h1>{task.title}</h1>
                </div>
            </div>

            <div className="details-grid">
                <div className="main-content">
                    {/* Employee's "Add Update" Form */}
                    {user?.role === 'employee' && (
                        <div className="card">
                            <h3>Submit Daily Update</h3>
                            <form onSubmit={handleUpdateSubmit} className="update-form">
                                <textarea
                                    name="updateText"
                                    placeholder="Describe your progress today..."
                                    value={newUpdate.updateText}
                                    onChange={(e) => setNewUpdate({ ...newUpdate, updateText: e.target.value })}
                                    required
                                />
                                <div className="form-row">
                                    <label>Intensity:
                                        <select name="intensity" value={newUpdate.intensity} onChange={(e) => setNewUpdate({ ...newUpdate, intensity: e.target.value })}>
                                            <option>Low</option><option>Medium</option><option>High</option>
                                        </select>
                                    </label>
                                    <label className="range-label">Overall Completion: <strong>{newUpdate.percentageComplete}%</strong>
                                        <input type="range" min="0" max="100" name="percentageComplete" value={newUpdate.percentageComplete} onChange={(e) => setNewUpdate({ ...newUpdate, percentageComplete: e.target.value })} />
                                    </label>
                                </div>
                                <button type="submit" className="btn btn-primary">Submit Update</button>
                            </form>
                        </div>
                    )}

                    {/* History of Updates */}
                    <div className="card">
                        <h3>Update History</h3>
                        <div className="update-timeline">
                            {updates.length > 0 ? updates.map(update => (
                                <div key={update._id} className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-header">
                                            <strong>{update.user.name}</strong>
                                            <span className="timestamp">{new Date(update.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p>{update.updateText}</p>
                                        <div className="timeline-meta">
                                            <span>Progress: {update.percentageComplete}%</span>
                                            <span>Intensity: {update.intensity}</span>
                                        </div>

                                        {update.managerRemark ? (
                                            <div className="remark-box acknowledged">
                                                <p><strong>Manager's Remark:</strong> {update.managerRemark}</p>
                                                {user?.role === 'employee' && !update.isAcknowledged && (
                                                    <button onClick={() => handleAcknowledge(update._id)} className="btn btn-secondary">Acknowledge</button>
                                                )}
                                                {update.isAcknowledged && <small className="acknowledged-text">✓ Acknowledged</small>}
                                            </div>
                                        ) : (
                                            user?.role === 'manager' && (
                                                <form onSubmit={(e) => { e.preventDefault(); handleRemarkSubmit(update._id, remark); }} className="remark-form">
                                                    <input type="text" placeholder="Add a remark..." onChange={(e) => setRemark(e.target.value)} />
                                                    <button type="submit" className="btn btn-primary">Save</button>
                                                </form>
                                            )
                                        )}
                                    </div>
                                </div>
                            )) : <p>No updates have been submitted for this task yet.</p>}
                        </div>
                    </div>
                </div>

                <aside className="sidebar-details">
                    <div className="card">
                        <h3>Details</h3>
                        <div className="details-list">
                            <span>Status</span><strong>{task.status}</strong>
                            <span>Priority</span><strong>{task.priority}</strong>
                            <span>Assigned To</span><strong>{task.assignedTo?.name || 'N/A'}</strong>
                            <span>Manager</span><strong>{task.user?.name || 'N/A'}</strong>
                            <span>Due Date</span><strong>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</strong>
                        </div>
                    </div>

                    {progressData.length > 0 && (
                        <div className="card">
                            <h3>Progress Over Time</h3>
                            <Line data={lineChartData} />
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
export default TaskDetailsPage;