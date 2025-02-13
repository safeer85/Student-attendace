import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Login.css'; 
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !password) {
    setErrorMessage('Please fill out both fields.');
    return;
  }

  try {
    // Make the API call
    const response = await axios.post('http://localhost:5000/api/login', {
      email,
      password,
    });

    // Handle the response
    if (response.data.success) {
      console.log('Login Successful:', response.data);
      setErrorMessage(''); // Clear any previous error messages
      navigate('/home', { state: { user: response.data.user } });
      // Perform post-login actions (e.g., redirect to dashboard)
    } else {
      setErrorMessage(response.data.message || 'Login failed. Please try again.');
    }
  } catch (error) {
    // Handle errors (e.g., network errors, server errors)
    console.error('Error during login:', error);
    setErrorMessage('An error occurred. Please try again.');
  }
};


  return (
    <motion.div className="login-container">
      <motion.form
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
        className="login-form"
        onSubmit={handleLogin}
      >
        <h2>Login</h2>

        {/* Welcome message */}
        <p className="login-message">Welcome back! Please log in to continue.</p>

        {/* Instructions text */}
        <p className="login-instructions">
          To access your account, please enter your registered email and password.
        </p>

        {/* Optional security reminder */}
        <p className="security-note">
          For security reasons, make sure to use a strong password. Your password must be at least 6 characters long.
        </p>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
        <div className={`error-message ${errorMessage ? 'visible' : ''}`}>
          {errorMessage}
        </div>

        {/* Additional footer message */}
        <p className="footer-note">
          Don't have an account? <a href="/register">Sign up here</a>.
        </p>
      </motion.form>
    </motion.div>
  );
};

export default LoginPage;



