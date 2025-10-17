import React from 'react';
import { useNavigate } from 'react-router-dom';
import TaskManager from '../components/TaskManager'; // Assuming TaskManager is still in components
import { logout } from '../services/authService';

function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {user ? user.name : 'Guest'}!</h2>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </header>
      <hr/>
      <TaskManager />
    </div>
  );
}

export default DashboardPage;