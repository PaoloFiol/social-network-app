import React, { useEffect, useState } from 'react';
import API from '../api';

function EditProfile() {
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', city: '', state: '', aboutMe: '', profilePic: null
  });

  useEffect(() => {
    API.get('/users/me').then(res => {
      const { email, firstName, lastName, aboutMe, location } = res.data;
      setForm({
        email,
        firstName,
        lastName,
        aboutMe: aboutMe || '',
        city: location?.city || '',
        state: location?.state || '',
        profilePic: null
      });
    });
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'profilePic') {
      setForm({ ...form, profilePic: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    for (let key in form) {
      if (form[key]) data.append(key, form[key]);
    }
    await API.put('/users/edit', data);
    alert('Profile updated');
  };

  return (
    <div style={wrapperStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={headingStyle}>Edit Profile</h2>

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          style={inputStyle}
        />
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First Name"
          required
          style={inputStyle}
        />
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          required
          style={inputStyle}
        />
        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="City"
          style={inputStyle}
        />

        <select
          name="state"
          value={form.state}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">State</option>
          {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <textarea
          name="aboutMe"
          value={form.aboutMe}
          onChange={handleChange}
          placeholder="About Me (max 200 chars)"
          maxLength="200"
          style={{ ...inputStyle, height: '80px' }}
        />
        
        <label style={{ marginBottom: '0.5rem' }}>Change Profile Picture:</label>
        <input
          type="file"
          name="profilePic"
          accept="image/*"
          onChange={handleChange}
          style={{ marginBottom: '1rem' }}
        />

        <button type="submit" style={buttonStyle}>Save Changes</button>
      </form>
    </div>
  );
}

// Styles
const wrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '2rem',
  backgroundColor: '#f0f2f5',
};

const formStyle = {
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  maxWidth: '500px',
  width: '100%',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
};

const headingStyle = {
  marginBottom: '1.5rem',
  fontSize: '20px',
  color: '#333',
  textAlign: 'center'
};

const inputStyle = {
  marginBottom: '1rem',
  padding: '0.75rem',
  fontSize: '14px',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const buttonStyle = {
  padding: '0.75rem',
  backgroundColor: '#1877f2',
  color: 'white',
  fontSize: '15px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default EditProfile;
