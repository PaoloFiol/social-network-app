import React, { useState } from 'react';
import API from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
      setMessage('');
    }
  };

  return (
    <div style={wrapperStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={titleStyle}>Reset Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Send Reset Link</button>
        {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </form>
    </div>
  );
}

const wrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: '3rem',
  backgroundColor: '#f0f2f5',
  height: '100vh',
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
  alignItems: 'center',
};

const titleStyle = {
  marginBottom: '1.5rem',
  fontSize: '22px',
  color: '#333',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px',
};

const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#1877f2',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default ForgotPassword;
