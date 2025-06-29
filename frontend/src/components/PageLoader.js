// src/components/PageLoader.js
import React, { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

const PageLoader = ({ children, delay = 5000 }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return showContent ? children : <LoadingScreen />;
};

export default PageLoader;
