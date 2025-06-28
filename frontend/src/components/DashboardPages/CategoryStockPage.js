import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"; // 🔄 added PieChart, Pie, Cell
import axios from "axios";
import "./CategoryStockPage.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c"];

const CategoryStockPage = () => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stocks/by-category");
        setCategories(res.data);
        setFiltered(res.data);
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filteredData = categories.filter((item) =>
      item.category.toLowerCase().includes(term)
    );
    setFiltered(filteredData);
  };

  const totalStock = filtered.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="category-container">
      <h2 className="category-title">📦 Stock by Category</h2>

      <div className="category-toolbar">
        <input
          type="text"
          placeholder="Search category..."
          value={searchTerm}
          onChange={handleSearch}
          className="category-search"
        />
        <div className="category-total">
          Total Stock: <strong>{totalStock}</strong>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="category-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Total Stock</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={i}>
                    <td>{item.category}</td>
                    <td>{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-section">
            <h3 className="chart-title">📊 Category-wise Stock Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section">
            <h3 className="chart-title">🥧 Stock Distribution (Pie Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={filtered}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {filtered.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryStockPage;
