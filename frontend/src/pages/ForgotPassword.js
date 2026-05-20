import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card form-grid">
        <div>
          <p className="eyebrow">Account recovery</p>
          <h1 className="page-heading">Reset your password</h1>
          <p className="page-subtitle">Enter your email and we will send a reset link if the account exists.</p>
        </div>

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>

        {message && <p className="status-message status-message--success">{message}</p>}
        {error && <p className="status-message status-message--error">{error}</p>}

        <div className="form-footer">
          <Link to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
