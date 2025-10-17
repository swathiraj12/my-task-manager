// client/src/components/TaskManager.jsx
import React, { useState, useEffect } from 'react';

// Files import
import './TaskManager.css';
import { getAllTasks, createTask, updateTask, deleteTask } from '../services/taskService';

function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    // useEffect hook to fetch tasks when the component mounts
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const fetchedTasks = await getAllTasks();
                setTasks(fetchedTasks);
            } catch (error) {
                console.error('There was an error fetching the tasks!', error);
            }
        };
        fetchTasks();
    }, []);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!title) return;

        try {
            const newTaskData = { title, assignedTo, status: 'To Do' };
            const newTask = await createTask(newTaskData);
            setTasks([...tasks, newTask]);
            setTitle('');
            setAssignedTo('');
        } catch (error) {
            console.error('Error adding task!', error);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await deleteTask(id);
            setTasks(tasks.filter(task => task._id !== id));
        } catch (error) {
            console.error('Error deleting task!', error);
        }
    };

    const handleStatusChange = async (task) => {
        const statusOptions = ['To Do', 'In Progress', 'Done'];
        const currentStatusIndex = statusOptions.indexOf(task.status);
        // Cycle to the next status, or back to the first if at the end
        const nextStatus = statusOptions[(currentStatusIndex + 1) % statusOptions.length];

        try {
            const updatedTask = await updateTask(task._id, { status: nextStatus });
            // Update the task in our local state
            setTasks(tasks.map(t => (t._id === task._id ? updatedTask : t)));
        } catch (error) {
            // Handle error (e.g., show a notification)
            console.error("Failed to update task status", error);
        }
    };

    return (
        <div>
            <form onSubmit={handleAddTask}>
                <input
                    type="text"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder="Assigned To"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="input-field"
                />
                <button type="submit" className="btn btn-primary">Add Task</button>
            </form>

            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task._id} className="task-item">

                        {/* NEW: A container for the task title and assignee */}
                        <div className="task-info">
                            <strong>{task.title}</strong>
                            <small>Assigned to: {task.assignedTo || 'N/A'}</small>
                        </div>

                        {/* NEW: A container for the action buttons */}
                        <div className="task-actions">
                            <span
                                className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`}
                                onClick={() => handleStatusChange(task)}
                            >
                                {task.status}
                            </span>
                            <button onClick={() => handleDeleteTask(task._id)} className="btn btn-danger">
                                Delete
                            </button>
                        </div>

                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TaskManager;