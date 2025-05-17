// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { connectSocket, disconnectSocket } from '../utils/socket';

function Login({ setIsLoggedIn }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🧹 Clear any previous session
      localStorage.clear();
      disconnectSocket();

      // 🔐 Perform login request
      const { data } = await API.post('/auth/login', form);
      const { token, user } = data;

      if (!token || !user?._id) {
        throw new Error('Invalid login response');
      }

      const userId = String(user._id);

      // 💾 Store session data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', user.username);
      localStorage.setItem('role', user.role || 'user');

      console.log('✅ Logged in as:', userId);

      // 🔌 Connect to WebSocket
      connectSocket(userId);

      setIsLoggedIn(true);
      navigate('/');
    } catch (err) {
      console.error('❌ Login error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={wrapperStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={titleStyle}>Login</h2>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Login</button>
        <div style={{ marginTop: '1rem', fontSize: '14px' }}>
          <p>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
          <p>
            <Link to="/forgot-password" style={linkStyle}>Forgot Password?</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

// Styles
const wrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: '3rem',
  backgroundColor: '#f0f2f5',
  height: '100vh'
};

const formStyle = {
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const titleStyle = {
  marginBottom: '1.5rem',
  fontSize: '22px',
  color: '#333'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px'
};

const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#1877f2',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const linkStyle = {
  color: '#1877f2',
  textDecoration: 'none'
};

export default Login;
