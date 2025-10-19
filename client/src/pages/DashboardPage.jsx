import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Link } from 'react-router-dom';

// Files import
import { getSummary } from '../services/analyticsService.js';

// Register the components you're using from Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getSummary();
        setSummary(data);
      } catch (error) {
        console.error("Could not fetch summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!summary) return <div>Could not load dashboard data.</div>;

  // --- Chart Data Configuration ---
  const pieChartData = {
    labels: summary.statusSummary.map(s => s._id),
    datasets: [{
      label: 'Task Status',
      data: summary.statusSummary.map(s => s.count),
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)', // To Do (Blue)
        'rgba(255, 206, 86, 0.7)', // In Progress (Yellow)
        'rgba(75, 192, 192, 0.7)'  // Done (Green)
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1,
    }],
  };

  const barChartData = {
    labels: summary.tasksPerEmployee.map(e => e.employeeName),
    datasets: [{
      label: 'Total Tasks Assigned',
      data: summary.tasksPerEmployee.map(e => e.totalTasks),
      backgroundColor: 'rgba(153, 102, 255, 0.7)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    }],
  };

  return (
    <div className="dashboard-grid">
      {/* Key Metrics */}
      <div className="metric-card">
        <h3>Total Tasks</h3>
        <p>{summary.totalTasks}</p>
      </div>
      <div className="metric-card">
        <h3>Tasks Completed</h3>
        <p>{summary.doneTasks}</p>
      </div>
      <div className="metric-card">
        <h3>Overall Progress</h3>
        <p>{summary.completionPercentage}%</p>
      </div>

      {/* Charts */}
      <div className="chart-card chart-pie">
        <h3>Task Status Overview</h3>
        <Pie data={pieChartData} />
      </div>
      <div className="chart-card chart-bar">
        <h3>Tasks per Employee</h3>
        <Bar data={barChartData} options={{ indexAxis: 'y' }} />
      </div>

      {summary && summary.tasksPerEmployee.length > 0 && (
        <div className="card">
          <h3>Team Members</h3>
          <div className="employee-list">
            {summary.tasksPerEmployee.map(emp => (
              <Link key={emp.employeeId} to={`/employee/${emp.employeeId}`} className="employee-link">
                {emp.employeeName} <span>({emp.totalTasks} tasks)</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;