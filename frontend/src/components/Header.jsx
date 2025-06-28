import React, { useState, useEffect } from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Header({ userType, setUserType }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userType !== 'guest') {
        try {
          const res = await axios.get('http://localhost:5000/api/users/me', {
            withCredentials: true
          });
          setUserDetails(res.data);
          
        } catch (err) {
          console.error("Failed to fetch user info", err);
        }
      }
    };
    fetchUserDetails();
  }, [userType]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/users/logout",
        {},
        { withCredentials: true }
      );
      setUserType("guest");
      setUserDetails(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      alert("Logout failed");
    }
  };

  return (
    <header className="header-wrapper">
      <div className="header-top">
        <div className="header-left">
          <img src="logo.png" alt="Company Logo" className="logo" />
          <h1 className="header-title">
            <span>Stock</span><span> Management </span><span>System</span>
          </h1>
        </div>
        <div className="header-right">
          <img src="NBPDCL.png" alt="Partner Logo" className="logo" />
        </div>
      </div>

      <div className="header-bottom">
        <div className="left-section">
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>

          <div className="logged-in-label">
            {userType !== "guest" && userDetails && (
              <span>
                Logged in as: <strong>{userDetails.fullName}</strong> ({userDetails.email})
                
              </span>
            )}
          </div>
        </div>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {/* Conditional links */}
          {userType === 'guest' && (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/admin-login" onClick={() => setMenuOpen(false)}>Admin Login</Link>
              <Link to="/user-signup" onClick={() => setMenuOpen(false)}>User Signup</Link>
              <Link to="/user-login" onClick={() => setMenuOpen(false)}>User Login</Link>
              <Link to="/file-complaint" onClick={() => setMenuOpen(false)}>File Complaint</Link>
            </>
          )}

          {userType === 'admin' && (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/inventory" onClick={() => setMenuOpen(false)}>Inventory</Link>
              <Link to="/stock-value" onClick={() => setMenuOpen(false)}>Stock Value</Link>
              <Link to="/admin/users" onClick={() => setMenuOpen(false)}>Manage Users</Link>
              <Link to="/complaints" onClick={() => setMenuOpen(false)}>Complaints</Link>
              <Link to="/" className="logout" onClick={handleLogout}>Logout</Link>
            </>
          )}

          {userType === 'user' && (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/inventory" onClick={() => setMenuOpen(false)}>Inventory</Link>
              <Link to="/file-complaint" onClick={() => setMenuOpen(false)}>File Complaint</Link>
              <Link to="/" className="logout" onClick={handleLogout}>Logout</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
