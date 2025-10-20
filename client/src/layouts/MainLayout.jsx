import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { BsGrid1X2Fill, BsListTask } from 'react-icons/bs';
import { FaBars, FaTimes } from 'react-icons/fa';

// Files import
import './MainLayout.css';
import { logout } from '../services/authService.js';

function MainLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // State Management
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isMobileNavOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Task Panel</h1>
          <button className="mobile-nav-close" onClick={toggleMobileNav}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Manager-specific link */}
          {user?.role === 'manager' && (
            <Link to="/" data-tooltip="Dashboard" onClick={() => setIsMobileNavOpen(false)}>
              <BsGrid1X2Fill />
              <span>Dashboard</span>
            </Link>
          )}
          <Link to="/tasks" data-tooltip="Tasks" onClick={() => setIsMobileNavOpen(false)}>
            <BsListTask />
            <span>Tasks</span>
          </Link>
        </nav>
        {/* This footer can be used for a collapse button or user info later */}
        <div className="sidebar-footer"></div>
      </aside>
      
      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            {/* The "Hamburger" button, visible only on mobile */}
            <button className="mobile-nav-toggle" onClick={toggleMobileNav}>
              <FaBars />
            </button>
            <h2>Welcome, {user?.name || 'Guest'}!</h2>
          </div>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {/* The overlay that appears behind the sidebar on mobile, closing it when clicked */}
      {isMobileNavOpen && <div className="mobile-nav-overlay" onClick={toggleMobileNav}></div>}
    </div>
  );
}

export default MainLayout;