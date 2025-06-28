// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#1f2937', 
        color: '#fff',
        padding: '10px 20px',
        textAlign: 'right',
        fontSize: '0.875rem',
        boxShadow: 'inset 0 1px 0 #333',
      }}
    >
      &copy; {new Date().getFullYear()} All rights reserved to NBPDCL
    </footer>
  );
};

export default Footer;
