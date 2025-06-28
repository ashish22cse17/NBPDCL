import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminActivity.css";

const AdminActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders/logs");
        const sortedLogs = response.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setLogs(sortedLogs);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const renderStatusBadge = (status) => {
    const statusClass = status === "Accepted" ? "badge-accepted" : "badge-rejected";
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  if (loading) return <p className="loading">Loading activity...</p>;

  return (
    <div className="activity-container">
      <h2>📊 Recent Stock Activity</h2>
      {logs.length === 0 ? (
        <p>No recent activity</p>
      ) : (
        <div className="table-wrapper">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>User</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.itemName || "Unknown Item"}</td>
                  <td>{renderStatusBadge(log.action)}</td>
                  <td>{log.quantity}</td>
                  <td>{log.performedBy || "N/A"}</td>
                  <td>{new Date(log.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminActivity;
