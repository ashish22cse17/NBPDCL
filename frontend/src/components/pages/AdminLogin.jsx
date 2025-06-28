import React, { useState, useEffect } from "react";
import "./AdminLogin.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin({ setUserType }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    captchaInput: "",
    captchaServer: "",
  });

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  useEffect(() => {
    const newCaptcha = generateCaptcha();
    setFormData((prev) => ({ ...prev, captchaServer: newCaptcha }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.captchaInput !== formData.captchaServer) {
      alert("Invalid CAPTCHA");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/adminLogin",
        {
          username: formData.username,
          password: formData.password,
        }
      );

      alert(res.data.message);
      setUserType('admin');
      
      setTimeout(() => {
        navigate("/");
      }, 100);

    } catch (err) {
      alert(err.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <section className="admin-login-section">
      <h2>ADMIN LOGIN FORM</h2>
      <div className="admin-login-box">
        <div className="box-header">LOGIN FORM</div>
        <form onSubmit={handleSubmit}>
          <label>Enter Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />

          <label>Verification code :</label>
          <div className="captcha-row">
            <input
              type="text"
              name="captchaInput"
              value={formData.captchaInput}
              onChange={handleChange}
              placeholder="Enter code"
              required
            />
            <div className="captcha-image">{formData.captchaServer}</div>
          </div>

          <button type="submit" className="login-btn">
            LOGIN
          </button>
        </form>
      </div>
    </section>
  );
}

export default AdminLogin;
