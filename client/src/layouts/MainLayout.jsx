import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { BsGrid1X2Fill, BsListTask } from 'react-icons/bs';

// Files import
import './MainLayout.css';
import { logout } from '../services/authService.js';

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
            <Link to="/" data-tooltip="Dashboard">
              <BsGrid1X2Fill />
              <span>Dashboard</span>
            </Link>
          )}
          <Link to="/tasks" data-tooltip="Tasks">
            <BsListTask />
            <span>Tasks</span>
          </Link>
        </nav>
        {/* This footer can be used for a collapse button or user info later */}
        <div className="sidebar-footer"></div>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h2>Welcome, {user?.name || 'Guest'}!</h2>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;