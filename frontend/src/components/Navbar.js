import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaBell,
  FaEnvelope,
  FaHome,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUserEdit,
  FaUsers
} from 'react-icons/fa';
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

    window.addEventListener('notifications-seen', fetchStatus);
    return () => window.removeEventListener('notifications-seen', fetchStatus);
  }, [isLoggedIn]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [isLoggedIn]);

  const logout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('auth-state-changed'));
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const NotificationIcon = ({ type }) => {
    const hasBadge = type === 'messages' ? hasUnreadMessages : hasUnseenNotifications;
    const Icon = type === 'messages' ? FaEnvelope : FaBell;

    return (
      <span className="nav-link__icon">
        <Icon aria-hidden="true" />
        {hasBadge && <span className="nav-badge" />}
      </span>
    );
  };

  return (
    <nav className="site-nav">
      <div className="site-nav__inner">
        <Link className="site-nav__brand" to="/" onClick={closeMenu}>
          <span className="brand-mark">SN</span>
          <span>Social Network</span>
        </Link>

        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>

        <div className={`site-nav__links ${isMobileMenuOpen ? 'is-open' : ''}`}>
          <Link className="nav-link" to="/" onClick={closeMenu}>
            <FaHome aria-hidden="true" />
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <Link className="nav-link" to="/my-profile" onClick={closeMenu}>
                <FaUser aria-hidden="true" />
                Profile
              </Link>
              <Link className="nav-link" to="/edit-profile" onClick={closeMenu}>
                <FaUserEdit aria-hidden="true" />
                Edit
              </Link>
              <Link className="nav-link" to="/friends" onClick={closeMenu}>
                <FaUsers aria-hidden="true" />
                Friends
              </Link>
              <Link className="nav-link" to="/messages" onClick={closeMenu}>
                <NotificationIcon type="messages" />
                Messages
              </Link>
              <Link className="nav-link" to="/notifications" onClick={closeMenu}>
                <NotificationIcon type="notifications" />
                Alerts
              </Link>
              <button className="nav-button" type="button" onClick={logout}>
                <FaSignOutAlt aria-hidden="true" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login" onClick={closeMenu}>
                Login
              </Link>
              <Link className="nav-link" to="/register" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
