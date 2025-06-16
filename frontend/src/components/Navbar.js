import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaHome, FaUser, FaUserEdit, FaUsers, FaEnvelope, FaSignOutAlt, FaBars } from 'react-icons/fa';
import API from '../api';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav style={navStyle}>
      <div style={navContent}>
        <div style={logoContainer}>
          <Link to="/" style={logoStyle}>
            Social Network
          </Link>
        </div>

        {isLoggedIn && (
          <>
            <button style={mobileMenuButton} onClick={toggleMobileMenu}>
              <FaBars />
            </button>

            <div style={{ ...navLinks, ...(isMobileMenuOpen ? mobileMenuOpen : mobileMenuClosed) }}>
              <div style={centerNavLinks}>
                <Link to="/" style={linkStyle}>
                  <FaHome style={iconStyle} />
                  <span style={linkText}>Home</span>
                </Link>
                
                <Link to="/my-profile" style={linkStyle}>
                  <FaUser style={iconStyle} />
                  <span style={linkText}>My Profile</span>
                </Link>
                
                <Link to="/edit-profile" style={linkStyle}>
                  <FaUserEdit style={iconStyle} />
                  <span style={linkText}>Edit Profile</span>
                </Link>
                
                <Link to="/friends" style={linkStyle}>
                  <FaUsers style={iconStyle} />
                  <span style={linkText}>Friends</span>
                </Link>

                <Link to="/messages" style={linkStyle}>
                  <div style={iconContainer}>
                    <FaEnvelope style={iconStyle} />
                    {hasUnreadMessages && <span style={notificationBadge} />}
                  </div>
                  <span style={linkText}>Messages</span>
                </Link>

                <Link to="/notifications" style={linkStyle}>
                  <div style={iconContainer}>
                    <FaBell style={iconStyle} />
                    {hasUnseenNotifications && <span style={notificationBadge} />}
                  </div>
                  <span style={linkText}>Notifications</span>
                </Link>
              </div>

              <button onClick={logout} style={logoutButton}>
                <FaSignOutAlt style={iconStyle} />
                <span style={linkText}>Log out</span>
              </button>
            </div>
          </>
        )}

        {!isLoggedIn && (
          <div style={navLinks}>
            <div style={centerNavLinks}>
              <Link to="/login" style={linkStyle}>
                <span style={linkText}>Login</span>
              </Link>
              <Link to="/register" style={linkStyle}>
                <span style={linkText}>Register</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Styles
const navStyle = {
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  padding: '0.5rem 0'
};

const navContent = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative'
};

const logoContainer = {
  flex: '0 0 auto',
  zIndex: 2
};

const logoStyle = {
  color: '#1877f2',
  textDecoration: 'none',
  fontSize: '1.5rem',
  fontWeight: 'bold'
};

const navLinks = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: 1,
  marginLeft: '2rem'
};

const centerNavLinks = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.5rem',
  flex: 1
};

const linkStyle = {
  textDecoration: 'none',
  color: '#1c1e21',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  borderRadius: '4px',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#f0f2f5'
  }
};

const linkText = {
  fontSize: '0.9rem',
  fontWeight: '500'
};

const iconStyle = {
  fontSize: '1.2rem',
  color: '#65676b'
};

const iconContainer = {
  position: 'relative'
};

const notificationBadge = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  width: '8px',
  height: '8px',
  backgroundColor: '#e41e3f',
  borderRadius: '50%'
};

const logoutButton = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  borderRadius: '4px',
  transition: 'background-color 0.2s',
  color: '#1c1e21',
  marginLeft: '2rem',
  zIndex: 2,
  ':hover': {
    backgroundColor: '#f0f2f5'
  }
};

const mobileMenuButton = {
  display: 'none',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  color: '#1c1e21',
  cursor: 'pointer',
  padding: '0.5rem'
};

const mobileMenuOpen = {
  '@media (max-width: 768px)': {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: '1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    gap: '1rem',
    '.centerNavLinks': {
      flexDirection: 'column',
      width: '100%'
    }
  }
};

const mobileMenuClosed = {
  '@media (max-width: 768px)': {
    display: 'none'
  }
};

// Add media queries for responsive design
const mediaQueries = `
  @media (max-width: 768px) {
    .navLinks {
      display: none;
    }
    .mobileMenuButton {
      display: block;
    }
    .navContent {
      padding: 0 0.5rem;
    }
  }
`;

export default Navbar;
