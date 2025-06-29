// src/components/LoadingScreen.js
import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="nbpdcl-loading">
      <div className="electric-pulse">
        <div className="bolt"></div>
        <div className="glow"></div>
        <h1 className="company-name">NBPDCL</h1>
        <p className="tagline">तमसो मा ज्योतिर्गमय...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
