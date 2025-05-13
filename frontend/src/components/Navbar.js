import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import API from '../api';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const notifRes = await API.get('/notifications/unseen-count');
        setHasUnseenNotifications(notifRes.data.count > 0);

        const msgRes = await API.get('/messages/unread');
        setHasUnreadMessages(msgRes.data.unread);
      } catch (err) {
        console.error('Error fetching notification or message status', err);
      }
    };

    if (isLoggedIn) {
      fetchStatus();
    }
  }, [isLoggedIn]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={navContent}>
        <div style={navLinks}>
          <Link to="/" style={linkStyle}>Home</Link>
          {isLoggedIn ? (
            <>
              <Link to="/my-profile" style={linkStyle}>My Profile</Link>
              <Link to="/edit-profile" style={linkStyle}>Edit Profile</Link>
              <Link to="/friends" style={linkStyle}>Friends List</Link>

              <Link to="/messages" style={{ ...linkStyle, position: 'relative' }}>
                Messages
                {hasUnreadMessages && (
                  <FaBell style={bellStyle} />
                )}
              </Link>

              <Link to="/notifications" style={{ ...linkStyle, position: 'relative' }}>
                Notifications
                {hasUnseenNotifications && (
                  <FaBell style={bellStyle} />
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>Login</Link>
              <Link to="/register" style={linkStyle}>Register</Link>
            </>
          )}
        </div>

        {isLoggedIn && (
          <button onClick={logout} style={logoutButton}>
            Log out
          </button>
        )}
      </div>
    </nav>
  );
}

// Styles
const navStyle = {
  padding: '0.75rem 1rem',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e4e6eb',
  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  position: 'sticky',
  top: 0,
  zIndex: 100
};

const navContent = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  maxWidth: '1000px',
  margin: '0 auto'
};

const navLinks = {
  display: 'flex',
  gap: '1.2rem',
  fontSize: '15px'
};

const linkStyle = {
  textDecoration: 'none',
  color: '#1d2129',
  fontWeight: 500,
  padding: '6px 10px',
  borderRadius: '4px',
  transition: 'background 0.2s'
};

const bellStyle = {
  color: 'red',
  marginLeft: '6px',
  position: 'relative',
  top: '2px'
};

const logoutButton = {
  padding: '0.5rem 1rem',
  background: '#e53935',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

export default Navbar;
