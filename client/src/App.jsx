import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import TaskDetailsPage from './pages/TaskDetailsPage.jsx';
import EmployeeDetailsPage from './pages/EmployeeDetailsPage.jsx';

// --- PROTECTED ROUTE COMPONENTS ---
const AuthRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? <MainLayout /> : <Navigate to="/login" />;
};

const ManagerRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.role === 'manager' ? <Outlet /> : <Navigate to="/tasks" />;
};


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main Application Routes (Protected) */}
        <Route element={<AuthRoute />}>
            {/* Manager-only routes */}
            <Route element={<ManagerRoute />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/employee/:employeeId" element={<EmployeeDetailsPage />} />
            </Route>
            {/* Routes for everyone */}
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/task/:taskId" element={<TaskDetailsPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;