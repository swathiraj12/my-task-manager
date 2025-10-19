// client/src/pages/EmployeeDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEmployeeSummary } from '../services/analyticsService.js';
import { Pie } from 'react-chartjs-2';

function EmployeeDetailsPage() {
    const { employeeId } = useParams();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const data = await getEmployeeSummary(employeeId);
                setSummary(data);
            } catch (error) {
                console.error("Failed to load employee data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployeeData();
    }, [employeeId]);

    if (loading) return <div>Loading employee dashboard...</div>;
    if (!summary) return <div>Could not load data for this employee.</div>;

    // Chart data configuration (similar to main dashboard)
    const statusPieData = {
        labels: summary.statusSummary.map(s => s._id),
        datasets: [{
            data: summary.statusSummary.map(s => s.count),
            backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)'],
        }],
    };
    const priorityPieData = { /* ... configure for priority ... */ };


    return (
        <div>
            <Link to="/" className="back-link">&larr; Back to Main Dashboard</Link>
            <h1>Employee Performance</h1>
            
            <div className="dashboard-grid">
                 {/* ... Render the same metric cards and charts as the main dashboard ... */}
                 {/* But use the 'summary' state from this page. */}
                 <div className="metric-card">
                    <h3>Completion</h3>
                    <p>{summary.completionPercentage}%</p>
                </div>
                <div className="chart-card">
                    <h3>Status Breakdown</h3>
                    <Pie data={statusPieData} />
                </div>
                {/* Add more charts and data as needed */}
            </div>
        </div>
    );
}
export default EmployeeDetailsPage;