// client/src/layouts/MainLayout.jsx
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService.js';
import './MainLayout.css'; // We will create this CSS file next

function MainLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="sidebar-title">TaskPanel</h1>
        <nav className="sidebar-nav">
          {/* Manager-specific link */}
          {user?.role === 'manager' && (
            <Link to="/">Dashboard</Link>
          )}
          <Link to="/tasks">Tasks</Link>
        </nav>
        <div className="sidebar-footer">
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">
            <h2>Welcome, {user?.name || 'Guest'}!</h2>
        </header>
        <div className="page-content">
          <Outlet /> {/* This is where our pages (Dashboard, Tasks) will be rendered */}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;