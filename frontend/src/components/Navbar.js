import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import API from '../api';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    const fetchUnseen = async () => {
      try {
        const res = await API.get('/notifications/unseen-count');
        setHasUnseen(res.data.count > 0);
      } catch (err) {
        console.error('Failed to fetch unseen notification count', err);
      }
    };

    if (isLoggedIn) {
      fetchUnseen();
    }
  }, [isLoggedIn]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav style={{
      padding: '0.75rem 1rem',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e4e6eb',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', gap: '1.2rem', fontSize: '15px' }}>
          <Link to="/" style={linkStyle}>Home</Link>
          {isLoggedIn ? (
            <>
              <Link to="/my-profile" style={linkStyle}>My Profile</Link>
              <Link to="/edit-profile" style={linkStyle}>Edit Profile</Link>
              <Link to="/friends" style={linkStyle}>Friends List</Link>
              <Link to="/notifications" style={{ ...linkStyle, position: 'relative' }}>
                Notifications
                {hasUnseen && (
                  <FaBell style={{
                    color: 'red',
                    marginLeft: '6px',
                    position: 'relative',
                    top: '2px'
                  }} />
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
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              background: '#e53935',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Log out
          </button>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  textDecoration: 'none',
  color: '#1d2129',
  fontWeight: 500,
  padding: '6px 10px',
  borderRadius: '4px',
  transition: 'background 0.2s',
};

export default Navbar;
