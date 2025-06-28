import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../DashboardCard";
import {
  getInventoryCount,
  getLowStockCount,
  getTotalStockValue,
} from "../DashboardPages/Inventory";
import "./Dashboard.css";

const formatCurrency = (value) => {
  if (!value && value !== 0) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const Dashboard = ({ userType }) => {
  const navigate = useNavigate();
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [stockValue, setStockValue] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getInventoryCount();
      const lowStock = await getLowStockCount();
      const totalValue = await getTotalStockValue();
      setTotalProducts(count);
      setLowStockCount(lowStock);
      setStockValue(totalValue);
    };
    fetchCount();
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-heading">Dashboard</h2>

      {/* KPI Cards */}
      <div className="dashboard-grid">
        <DashboardCard
          title="Welcome"
          description={`Logged in as: ${userType}`}
          icon="👤"
        />
        <DashboardCard
          title="Total Products"
          description={`${totalProducts} items in stock`}
          icon="📦"
          onClick={() => navigate("/inventory")}
        />
        <DashboardCard
          title="Low Stock Alerts"
          description={`${lowStockCount} items below 25`}
          icon="⚠️"
          onClick={() => navigate("/low-stock")}
        />
        <DashboardCard
          title="Stock Value"
          description={formatCurrency(stockValue)}
          icon="💰"
          onClick={() => navigate("/stock-value")}
        />
      </div>

      {/* Charts */}
      {(userType === "admin" || userType === "user") && (
        <div className="dashboard-grid">
          <DashboardCard
            title="Stock by Category"
            description="📊 Bar Chart will render here (e.g., Electronics, Stationery)"
            icon="📊"
            onClick={() => navigate("/charts/category")}
          />
          <DashboardCard
            title="Stock Status Breakdown"
            description="🥧 Pie Chart will render here (Available, Low, Out of Stock)"
            icon="🥧"
            onClick={() => navigate("/charts/status")}
          />
        </div>
      )}

      {/* Role Panels */}
      <div className="dashboard-grid">
        

        {userType === "admin" && (
          <>
            <DashboardCard
              title="Manage Users"
              description="Create, update, or delete users"
              icon="🛠️"
              onClick={() => navigate("/admin/users")}
            />
            <DashboardCard
              title="Recent Stock Activity"
              description="Latest logs of issued/received items"
              icon="🕒"
              onClick={() => navigate("/admin-activity")}
            />
            <DashboardCard
              title="New Complaints"
              description="5 unresolved & 📄 Check all complaints"
              icon="📨"
              onClick={() => navigate("/complaints")}
            />
          </>
        )}

        {userType === "user" && (
          <>
            <DashboardCard
              title="Request Order "
              description="Make your orders and requests"
              icon="📦"
              onClick={() => navigate("/user-makeorder")}
            />
            <DashboardCard
              title="My Orders"
              description="Track your orders and requests"
              icon="📦"
              onClick={() => navigate("/user-orders")}
            />
            <DashboardCard
              title="Support"
              description="Raise a complaint or contact support"
              icon="☎️"
              onClick={() => navigate("/support")}
            />
          </>
        )}

        {userType === "guest" && (
          <>
          <DashboardCard
            title="Guest Access"
            description="Please login or sign up to access full features"
            icon="🔒"
            onClick={() => navigate("/user-login")}
          />
           <DashboardCard
              title="Support"
              description="Raise a complaint or contact support"
              icon="☎️"
              onClick={() => navigate("/support")}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      {userType === "admin" && (
        <div className="dashboard-grid">
          <DashboardCard
            title="Add New Stock"
            description="➕ Add stock items "
            icon="➕"
            onClick={() => navigate("/stock/add")}
          />
          <DashboardCard
            title="Issue Item"
            description="📤 Mark stock as issued"
            icon="📤"
            onClick={() => navigate("/user-requests")}
          />
          <DashboardCard
            title="Receive Item"
            description="📥 Log received stock"
            icon="📥"
            onClick={() => navigate("/receive-stock")}
          />
          {/* <DashboardCard
            title="View Complaints"
            description="📄 Check all complaints"
            icon="📄"
            onClick={() => navigate("/complaints")}
          /> */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
