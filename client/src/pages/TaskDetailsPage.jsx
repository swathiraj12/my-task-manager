// client/src/pages/TaskDetailsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios'; // We'll use axios directly here for simplicity
import './TaskDetailsPage.css';

// Helper function to create a configured axios instance
const createApi = () => {
    const api = axios.create();
    api.interceptors.request.use((config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    });
    return api;
};

function TaskDetailsPage() {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));

    // Form states
    const [newUpdate, setNewUpdate] = useState({ updateText: '', percentageComplete: 0, intensity: 'Medium' });
    const [remark, setRemark] = useState('');

    const fetchData = useCallback(async () => {
        const api = createApi();
        try {
            const taskRes = await api.get(`http://localhost:5000/api/tasks/${taskId}`);
            const updatesRes = await api.get(`http://localhost:5000/api/tasks/${taskId}/updates`);
            setTask(taskRes.data.data);
            setUpdates(updatesRes.data.data);
            // Set initial percentage from the latest update if available
            if (updatesRes.data.data.length > 0) {
                setNewUpdate(prev => ({ ...prev, percentageComplete: updatesRes.data.data[0].percentageComplete }));
            }
        } catch (err) {
            setError('Failed to fetch task details.');
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Event Handlers ---
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const api = createApi();
        try {
            await api.post(`http://localhost:5000/api/tasks/${taskId}/updates`, newUpdate);
            setNewUpdate({ updateText: '', percentageComplete: 0, intensity: 'Medium' }); // Reset form
            fetchData(); // Refetch all data to show the new update
        } catch (err) { console.error(err); }
    };

    const handleRemarkSubmit = async (updateId, remarkText) => {
        const api = createApi();
        try {
            await api.put(`http://localhost:5000/api/updates/${updateId}/remark`, { remark: remarkText });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleAcknowledge = async (updateId) => {
        const api = createApi();
        try {
            await api.put(`http://localhost:5000/api/updates/${updateId}/acknowledge`);
            fetchData();
        } catch (err) { console.error(err); }
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
                </aside>
            </div>
        </div>
    );
}
export default TaskDetailsPage;