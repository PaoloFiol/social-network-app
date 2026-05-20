import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../api';
import { connectSocket, disconnectSocket } from '../utils/socket';

function Login({ setIsLoggedIn }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      localStorage.clear();
      disconnectSocket();

      const { data } = await API.post('/auth/login', form);
      const { token, user } = data;

      if (!token || !user?._id) {
        throw new Error('Invalid login response');
      }

      const userId = String(user._id);
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', user.username);
      localStorage.setItem('role', user.role || 'user');

      connectSocket(userId);
      setIsLoggedIn(true);
      window.dispatchEvent(new Event('auth-state-changed'));
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card form-grid">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="page-heading">Log in to your account</h1>
          <p className="page-subtitle">Continue to your feed, messages, friends, and notifications.</p>
        </div>

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        {error && <p className="status-message status-message--error">{error}</p>}

        <div className="form-footer">
          <span>Do not have an account? <Link to="/register">Create one</Link></span>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
