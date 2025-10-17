// client/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/'); // Navigate to dashboard on successful login
    } catch (error) {
      console.error('Login failed', error);
      // Show error message to user
    }
  };

  return (
    <div className="app-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="input-field" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="input-field" />
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}

export default LoginPage;