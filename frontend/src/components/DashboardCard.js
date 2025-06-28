// src/components/DashboardCard.js
import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ title, description, icon, onClick }) => {
  return (
    <div className="dashboard-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {icon && <div className="dashboard-card-icon">{icon}</div>}
      <h3 className="dashboard-card-title">{title}</h3>
      <p className="dashboard-card-description">{description}</p>
    </div>
  );
};

export default DashboardCard;
