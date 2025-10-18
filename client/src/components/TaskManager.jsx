// client/src/components/TaskManager.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';

// Files import
import './TaskManager.css';
import { getAllTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { getEmployees } from '../services/userService';

// A small helper component for displaying priority with colors
const PriorityTag = ({ priority }) => {
    const priorityClass = `priority-${priority?.toLowerCase()}`;
    return <span className={`priority-tag ${priorityClass}`}>{priority}</span>;
};

function TaskManager() {
    // --- STATE MANAGEMENT ---
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newTask, setNewTask] = useState({
        title: '',
        assignedTo: '',
        priority: 'Medium',
        dueDate: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedTasks = await getAllTasks();
                setTasks(fetchedTasks);

                if (user?.role === 'manager') {
                    const fetchedEmployees = await getEmployees();
                    setEmployees(fetchedEmployees);
                }
            } catch (err) {
                setError("Failed to fetch data. Please try refreshing the page.");
                console.error("Failed to fetch data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.role]);

    // --- EVENT HANDLERS ---
    const handleFormChange = (e) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value });
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.title || !newTask.assignedTo) {
            alert("Please provide a title and assign the task.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await createTask(newTask);
            // Refetch all tasks to get the latest, fully populated list
            const updatedTasks = await getAllTasks();
            setTasks(updatedTasks);
            setNewTask({ title: '', assignedTo: '', priority: 'Medium', dueDate: '' }); // Reset form
        } catch (err) {
            setError("Failed to add task. Please check the details and try again.");
            console.error("Error adding task!", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTask(taskId);
            setTasks(currentTasks => currentTasks.filter(task => task._id !== taskId));
        } catch (err) {
            setError("Failed to delete task.");
            console.error("Failed to delete task", err);
        }
    };

    const handleStatusChange = async (task) => {
        const statusOptions = ['To Do', 'In Progress', 'Done'];
        const currentStatusIndex = statusOptions.indexOf(task.status);
        const nextStatus = statusOptions[(currentStatusIndex + 1) % statusOptions.length];
        try {
            const updatedTask = await updateTask(task._id, { status: nextStatus });
            setTasks(tasks.map(t => (t._id === task._id ? { ...t, status: updatedTask.status } : t)));
        } catch (err) {
            setError("Failed to update task status.");
            console.error("Failed to update task status", err);
        }
    };

    // --- RENDER LOGIC ---
    if (isLoading) return <div>Loading tasks...</div>;

    // Prepare data for CSV export
    const csvData = tasks.map(t => ({
        Title: t.title,
        AssignedTo: t.assignedTo?.name,
        AssignedBy: t.user?.name,
        Status: t.status,
        Priority: t.priority,
        DueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A',
        CreatedAt: new Date(t.createdAt).toLocaleString(),
    }));

    return (
        <div>
            {/* Display a general error message at the top */}
            {error && <div className="error-banner">{error}</div>}

            {/* Manager's View: "Add Task" Form */}
            {user?.role === 'manager' && (
                <form onSubmit={handleAddTask} className="add-task-form">
                    <h3>Assign New Task</h3>
                    <div className="form-grid">
                        <input
                            type="text" name="title" placeholder="Task Title"
                            value={newTask.title} onChange={handleFormChange}
                            className="input-field" required
                        />
                        <select
                            name="assignedTo" value={newTask.assignedTo}
                            onChange={handleFormChange} className="input-field" required
                        >
                            <option value="">-- Assign to Employee --</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                            ))}
                        </select>
                        <select
                            name="priority" value={newTask.priority}
                            onChange={handleFormChange} className="input-field"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                        <input
                            type="date" name="dueDate"
                            value={newTask.dueDate} onChange={handleFormChange}
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Assigning...' : 'Assign Task'}
                    </button>
                </form>
            )}

            <hr />

            {/* Header for the task list with Export button */}
            <div className="task-list-header">
                <h3>{user?.role === 'manager' ? 'Tasks You Assigned' : 'Your Assigned Tasks'}</h3>
                {user?.role === 'manager' && tasks.length > 0 && (
                    <CSVLink data={csvData} filename={"task-report.csv"} className="btn btn-secondary">
                        Export to CSV
                    </CSVLink>
                )}
            </div>

            {/* Task List */}
            <ul className="task-list">
                {tasks.length > 0 ? tasks.map(task => (
                    <li key={task._id} className="task-item">
                        <Link to={`/task/${task._id}`} className="task-info-link">
                            <div className="task-info">
                                <strong>{task.title}</strong>
                                <small>
                                    {user?.role === 'manager' ? `To: ${task.assignedTo?.name || 'N/A'}` : `From: ${task.user?.name || 'N/A'}`}
                                </small>
                                <small className="task-meta">
                                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                                </small>
                            </div>
                        </Link>
                        <div className="task-tags">
                            <PriorityTag priority={task.priority} />
                        </div>
                        <div className="task-actions">
                            <span className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`} onClick={() => handleStatusChange(task)}>
                                {task.status}
                            </span>
                            {user?.role === 'manager' && (
                                <button onClick={() => handleDeleteTask(task._id)} className="btn btn-danger">Delete</button>
                            )}
                        </div>
                    </li>
                )) : <p>No tasks found.</p>}
            </ul>
        </div>
    );
}

export default TaskManager;