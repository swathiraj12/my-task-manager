// client/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/'); // Navigate to the dashboard on successful registration
    } catch (error) {
      console.error('Registration failed', error);
      // Here you would typically show an error message to the user
    }
  };

  return (
    <div className="app-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required className="input-field" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="input-field" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="input-field" />
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default RegisterPage;