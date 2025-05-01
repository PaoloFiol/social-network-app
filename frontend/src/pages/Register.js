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

  const navigate = useNavigate();

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
    try {
      const data = new FormData();
      for (let key in form) {
        if (form[key]) data.append(key, form[key]);
      }
      await API.post('/auth/register', data);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={wrapper}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={heading}>Create an Account</h2>

        <input name="username" value={form.username} placeholder="Username" onChange={handleChange} required style={input} />
        <input name="email" type="email" value={form.email} placeholder="Email" onChange={handleChange} required style={input} />
        <input name="password" type="password" value={form.password} placeholder="Password" onChange={handleChange} required style={input} />
        <input name="firstName" value={form.firstName} placeholder="First Name" onChange={handleChange} required style={input} />
        <input name="lastName" value={form.lastName} placeholder="Last Name" onChange={handleChange} required style={input} />
        <input name="city" value={form.city} placeholder="City" onChange={handleChange} style={input} />

        <select name="state" value={form.state} onChange={handleChange} style={input}>
          <option value="">Select State</option>
          {US_STATES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <textarea
          name="aboutMe"
          value={form.aboutMe}
          placeholder="About me (max 200 chars)"
          maxLength="200"
          onChange={handleChange}
          style={{ ...input, height: '80px' }}
        />

        <label style={{ marginBottom: '0.5rem' }}>Profile Picture:</label>
        <input
          name="profilePic"
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ marginBottom: '1rem' }}
        />

        <button type="submit" style={button}>Register</button>
        <p style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

// Styles
const wrapper = {
  display: 'flex',
  justifyContent: 'center',
  padding: '2rem',
  backgroundColor: '#f0f2f5',
  minHeight: '100vh'
};

const formStyle = {
  width: '100%',
  maxWidth: '500px',
  background: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column'
};

const input = {
  padding: '0.5rem',
  marginBottom: '1rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

const button = {
  padding: '0.6rem',
  backgroundColor: '#1877f2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const heading = {
  marginBottom: '1.5rem',
  textAlign: 'center',
  color: '#333'
};

export default Register;
