import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    firstName: '', lastName: '',
    city: '', state: '', aboutMe: '', profilePic: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'profilePic' ? files[0] : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      for (let key in form) {
        if (form[key]) data.append(key, form[key]);
      }
      await API.post('/auth/register', data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card auth-card--wide form-grid">
        <div>
          <p className="eyebrow">Join the network</p>
          <h1 className="page-heading">Create your profile</h1>
          <p className="page-subtitle">Set up a profile, connect with friends, and start posting.</p>
        </div>

        <div className="form-grid form-grid--two">
          <div className="field-group">
            <label htmlFor="firstName">First name</label>
            <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} autoComplete="given-name" required />
          </div>
          <div className="field-group">
            <label htmlFor="lastName">Last name</label>
            <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} autoComplete="family-name" required />
          </div>
        </div>

        <div className="form-grid form-grid--two">
          <div className="field-group">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" value={form.username} onChange={handleChange} autoComplete="username" required />
          </div>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
        </div>

        <div className="form-grid form-grid--two">
          <div className="field-group">
            <label htmlFor="city">City</label>
            <input id="city" name="city" value={form.city} onChange={handleChange} autoComplete="address-level2" />
          </div>
          <div className="field-group">
            <label htmlFor="state">State</label>
            <select id="state" name="state" value={form.state} onChange={handleChange} autoComplete="address-level1">
              <option value="">Select state</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="aboutMe">About me</label>
          <textarea id="aboutMe" name="aboutMe" value={form.aboutMe} placeholder="A short intro (max 200 characters)" maxLength="200" onChange={handleChange} />
        </div>

        <div className="field-group">
          <label htmlFor="profilePic">Profile picture</label>
          <input id="profilePic" name="profilePic" type="file" accept="image/*" onChange={handleChange} />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        {error && <p className="status-message status-message--error">{error}</p>}

        <div className="form-footer">
          <span>Already have an account? <Link to="/login">Log in</Link></span>
        </div>
      </form>
    </div>
  );
}

export default Register;
