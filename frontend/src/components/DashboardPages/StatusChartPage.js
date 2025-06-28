import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./StatusChartPage.css";

const COLORS = {
  Available: "#4CAF50",
  "Low Stock": "#FFC107",
  "Out of Stock": "#F44336",
};

const StatusChartPage = () => {
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("pie"); // pie or bar
  const [activeCategories, setActiveCategories] = useState({
    Available: true,
    "Low Stock": true,
    "Out of Stock": true,
  });

  const fetchStockStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/stocks");
      const stocks = res.data;

      let available = 0;
      let low = 0;
      let out = 0;

      stocks.forEach((item) => {
        if (item.quantity === 0) out++;
        else if (item.quantity <= 10) low++;
        else available++;
      });

      const formatted = [
        { name: "Available", value: available },
        { name: "Low Stock", value: low },
        { name: "Out of Stock", value: out },
      ];

      setStatusData(formatted);
    } catch (err) {
      console.error("Error fetching stock data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockStatus();
  }, []);

  const total = statusData.reduce((sum, item) => sum + item.value, 0);

  const filteredData = statusData.filter((item) => activeCategories[item.name]);

  const toggleCategory = (name) => {
    setActiveCategories((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="status-page-container">
      <div className="status-header">
        <h2>🥧 Stock Status Breakdown</h2>
        <div className="status-controls">
          <button onClick={fetchStockStatus}>🔄 Refresh</button>
          <button onClick={() => setViewType("pie")}>🥧 Pie View</button>
          <button onClick={() => setViewType("bar")}>📊 Bar View</button>
        </div>
      </div>

      {loading ? (
        <div className="status-loading">Loading...</div>
      ) : (
        <>
          <div className="status-summary">
            {statusData.map((item, i) => (
              <div
                key={i}
                className={`status-box ${activeCategories[item.name] ? "" : "inactive"}`}
                onClick={() => toggleCategory(item.name)}
                style={{ borderColor: COLORS[item.name] }}
              >
                <strong>{item.name}</strong>
                <p>{item.value} items</p>
                <small>{((item.value / total) * 100).toFixed(1)}%</small>
              </div>
            ))}
          </div>

          <div className="status-chart">
            <ResponsiveContainer width="100%" height={360}>
              {viewType === "pie" ? (
                <PieChart>
                  <Pie
                    data={filteredData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {filteredData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#2196f3" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default StatusChartPage;
