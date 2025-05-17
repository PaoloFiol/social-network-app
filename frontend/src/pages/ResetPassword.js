import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      setLoading(true);
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setSuccess(res.data.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrapperStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={titleStyle}>Set New Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}
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

export default ResetPassword;
