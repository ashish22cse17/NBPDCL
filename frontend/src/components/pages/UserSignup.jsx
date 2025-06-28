// src/components/UserSignup.jsx
import React, { useState, useEffect } from 'react';
import './UserSignup.css';
import axios from 'axios';

function UserSignup() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    captchaInput: '',
    captchaServer: '',
  });

  // Generate simple captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
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

    try {
      const res = await axios.post('http://localhost:5000/api/users/signup', formData);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <section className="signup-section">
      <h2>USER SIGNUP</h2>
      <div className="signup-box">
        <div className="boxes-header">SIGNUP FORM</div>
        <form onSubmit={handleSubmit}>
          <label>Enter Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            required
          />

          <label>Mobile Number :</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile Number"
            required
          />

          <label>Enter Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />

          <label>Enter Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
          />

          <label>Verification Code :</label>
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

          <button type="submit" className="register-btn">Register Now</button>
        </form>
      </div>
    </section>
  );
}

export default UserSignup;
