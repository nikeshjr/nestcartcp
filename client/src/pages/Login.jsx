import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../style/Auth.css';

const Login = () => {
  const location = useLocation();
  const redirectMessage = location.state?.message;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(identifier, password);
      navigate('/'); // Redirect to home after login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Log in to your NestMart account.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {redirectMessage && <div className="alert alert-info mb-4">{redirectMessage}</div>}
          {error && <div className="alert alert-error mb-4">{error}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">Username or Email</label>
            <input 
              type="text" 
              id="identifier" 
              className="form-input" 
              placeholder="Enter your username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-100 auth-submit-btn">
            Log In
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
