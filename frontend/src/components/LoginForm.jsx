// src/components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function LoginForm({ setUserType }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captchaInput: '',
    captchaServer: '',
  });

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, captchaServer: generateCaptcha() }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post('http://localhost:5000/api/users/login', {
      email: formData.email,
      password: formData.password,
      captchaInput: formData.captchaInput,
      captchaServer: formData.captchaServer, // 🔥 this was missing
    }, {
      withCredentials: true,
    });

    alert(res.data.message);

    // Get updated user info after login to set userType properly
    const me = await axios.get("http://localhost:5000/api/users/me", {
      withCredentials: true,
    });

    setUserType(me.data.userType); // 'user' or 'admin'

    navigate('/');
  } catch (err) {
    alert(err.response?.data?.message || 'Login failed');
  }
};


  return (
    <div className="login-section">
      <h2>USER LOGIN FORM</h2>
      <div className="login-box">
        <div className="box-header">LOGIN FORM</div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Enter Email id</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />

          <div className="forgot-link">
            <Link to="/user-forgot">Forgot Password</Link>
          </div>

          <label>Verification code:</label>
          <div className="captcha-row">
            <input type="text" name="captchaInput" value={formData.captchaInput} onChange={handleChange} required />
            <div className="captcha-image">{formData.captchaServer}</div>
          </div>

          <div className="form-buttons">
            <button type="submit">LOGIN</button>
            <span>|</span>
            <Link to="/user-signup">Not Register Yet</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
