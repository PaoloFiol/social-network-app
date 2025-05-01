import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/friends/list').then(res => setFriends(res.data));
  }, []);

  const filtered = friends.filter(f =>
    f.firstName.toLowerCase().includes(search.toLowerCase()) ||
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        <h2 style={headingStyle}>Friends List</h2>
        <input
          placeholder="Search friends"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={inputStyle}
        />

        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#555' }}>No friends found.</p>
        ) : (
          <ul style={listStyle}>
            {filtered.map(friend => (
              <li key={friend._id} style={listItemStyle}>
                <img
                  src={friend.profilePic}
                  width="40"
                  alt="pfp"
                  style={avatarStyle}
                />
                <Link to={`/profile/${friend.username}`} style={nameStyle}>
                  {friend.firstName} <span style={usernameStyle}>(@{friend.username})</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
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

const containerStyle = {
  background: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '600px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const headingStyle = {
  marginBottom: '1rem',
  textAlign: 'center',
  fontSize: '22px',
  color: '#333',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  fontSize: '14px',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const listStyle = {
  listStyle: 'none',
  padding: 0,
};

const listItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.5rem 0',
  borderBottom: '1px solid #eee',
};

const avatarStyle = {
  borderRadius: '50%',
  marginRight: '12px',
};

const nameStyle = {
  fontSize: '15px',
  color: '#1877f2',
  textDecoration: 'none',
};

const usernameStyle = {
  color: '#555',
  fontWeight: 'normal',
};

export default FriendsList;
