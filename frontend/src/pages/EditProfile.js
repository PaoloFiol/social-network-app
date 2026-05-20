import React, { useEffect, useState } from 'react';
import API from '../api';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

function EditProfile() {
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', city: '', state: '', aboutMe: '', profilePic: null
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await API.get('/users/me');
        const { email, firstName, lastName, aboutMe, location } = data;
        setForm({
          email,
          firstName,
          lastName,
          aboutMe: aboutMe || '',
          city: location?.city || '',
          state: location?.state || '',
          profilePic: null
        });
      } catch (err) {
        setError('Could not load your profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'profilePic' ? files[0] : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const data = new FormData();
      for (let key in form) {
        if (form[key]) data.append(key, form[key]);
      }
      await API.put('/users/edit', data);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="empty-state">Loading profile editor...</div>;

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card auth-card--wide form-grid">
        <div>
          <p className="eyebrow">Profile settings</p>
          <h1 className="page-heading">Edit profile</h1>
          <p className="page-subtitle">Keep your profile accurate so friends know who they are connecting with.</p>
        </div>

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
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
          <textarea id="aboutMe" name="aboutMe" value={form.aboutMe} onChange={handleChange} placeholder="A short intro (max 200 characters)" maxLength="200" />
        </div>

        <div className="field-group">
          <label htmlFor="profilePic">Change profile picture</label>
          <input id="profilePic" type="file" name="profilePic" accept="image/*" onChange={handleChange} />
        </div>

        <button type="submit" className="submit-button" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>

        {message && <p className="status-message status-message--success">{message}</p>}
        {error && <p className="status-message status-message--error">{error}</p>}
      </form>
    </div>
  );
}

export default EditProfile;
