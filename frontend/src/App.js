import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import Header from "./components/Header";
import Footer from "./components/Footer";

import LoginForm from "./components/LoginForm";
import AdminLogin from "./components/pages/AdminLogin";
import UserSignup from "./components/pages/UserSignup";
import Dashboard from "./components/pages/Dashboard";

import Inventory from "./components/DashboardPages/Inventory";
import LowStock from "./components/DashboardPages/LowStock";
import StockValue from "./components/DashboardPages/StockValue";
import StockValueComplaints from "./components/DashboardPages/StockValueComplaints";
import CategoryStockPage from "./components/DashboardPages/CategoryStockPage";
import AddStockPage from "./components/DashboardPages/AddStockPage";
import ManageUsersPage from "./components/DashboardPages/ManageUsersPage";
import Complaint from "./components/DashboardPages/Complaint";
import StatusChartPage from "./components/DashboardPages/StatusChartPage";
import MakeOrder from "./components/DashboardPages/MakeOrder";
import AllocateOrder from "./components/DashboardPages/AllocateOrder";
import MyOrders from "./components/DashboardPages/MyOrders";
import AdminActivity from "./components/DashboardPages/AdminActivity"

function App() {
  const [userType, setUserType] = useState("guest");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          withCredentials: true,
        });
        setUserType(res.data.userType);
      } catch {
        setUserType("guest");
      }
    };
    checkSession();
  }, []);

  return (
    <div className="app-wrapper">
      <Router>
        <Header userType={userType} setUserType={setUserType} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard userType={userType} />} />
            <Route
              path="/user-login"
              element={<LoginForm setUserType={setUserType} />}
            />
            <Route
              path="/admin-login"
              element={<AdminLogin setUserType={setUserType} />}
            />
            <Route path="/user-signup" element={<UserSignup />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/low-stock" element={<LowStock />} />
            <Route
              path="/file-complaint"
              element={<Complaint userType={userType} />}
            />
            <Route path="/stock-value" element={<StockValue />} />
            <Route path="/complaints" element={<StockValueComplaints />} />
            <Route path="/charts/category" element={<CategoryStockPage />} />
            <Route path="/user-makeorder" element={<MakeOrder />} />
            <Route
              path="/user-orders"
              element={
                <MyOrders userType={userType}  />
              }
            />
            <Route path="/user-requests" element={<AllocateOrder />} />
            <Route path="/stock/add" element={<AddStockPage />} />
            <Route path="/admin/users" element={<ManageUsersPage />} />
            <Route path="/charts/status" element={<StatusChartPage />} />
            <Route path="/admin-activity" element={<AdminActivity />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
