import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (userId, response, notificationId) => {
    try {
      // First get the friend request ID
      const { data: requests } = await API.get('/friends/requests');
      const request = requests.find(r => r.sender._id === userId);
      
      if (!request) {
        throw new Error('Friend request not found');
      }

      // Then respond to the request using the request ID
      await API.put('/friends/respond', {
        requestId: request._id,
        action: response
      });

      // Remove the notification immediately
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Failed to respond to friend request:', err);
      alert('Failed to respond to friend request.');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      // Remove the notification immediately
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      alert('Failed to delete notification.');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div style={container}>
      <div style={card}>
        <h2>Notifications</h2>
        {notifications.length === 0 && <p>No notifications yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map(n => (
            <li key={n._id} style={notificationItem}>
              {n.type === 'friend_request' && n.fromUser && (
                <>
                  <div style={infoRow}>
                    {n.fromUser.profilePic && (
                      <img src={n.fromUser.profilePic} alt="pfp" style={pfp} />
                    )}
                    <Link to={`/profile/${n.fromUser.username}`} style={linkText}>
                      {n.fromUser.firstName} {n.fromUser.lastName}
                    </Link>
                    <span>&nbsp;sent you a friend request</span>
                  </div>
                  <div style={buttonRow}>
                    <button
                      onClick={() => handleRespond(n.fromUser._id, 'accept', n._id)}
                      style={btn}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(n.fromUser._id, 'decline', n._id)}
                      style={{ ...btn, background: '#ddd', color: '#333' }}
                    >
                      Decline
                    </button>
                  </div>
                </>
              )}
              {n.type === 'like' && n.fromUser && (
                <div style={infoRow}>
                  <div style={{ flex: 1 }}>
                    <Link to={`/profile/${n.fromUser.username}`} style={linkText}>
                      {n.fromUser.firstName} {n.fromUser.lastName}
                    </Link>{' '}
                    liked your post.
                  </div>
                  <button
                    onClick={() => handleDelete(n._id)}
                    style={deleteBtn}
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              )}
              {n.type === 'comment' && n.fromUser && (
                <div style={infoRow}>
                  <div style={{ flex: 1 }}>
                    <Link to={`/profile/${n.fromUser.username}`} style={linkText}>
                      {n.fromUser.firstName} {n.fromUser.lastName}
                    </Link>{' '}
                    commented on your post.
                  </div>
                  <button
                    onClick={() => handleDelete(n._id)}
                    style={deleteBtn}
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ✅ Styles
const container = {
  display: 'flex',
  justifyContent: 'center',
  padding: '2rem',
  backgroundColor: '#f0f2f5',
  minHeight: '85vh',
};

const card = {
  width: '100%',
  maxWidth: '600px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '2rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const notificationItem = {
  marginBottom: '1.5rem',
  borderBottom: '1px solid #eee',
  paddingBottom: '1rem',
};

const infoRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.5rem',
};

const buttonRow = {
  display: 'flex',
  gap: '0.5rem',
};

const pfp = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  objectFit: 'cover',
};

const btn = {
  padding: '0.4rem 0.8rem',
  borderRadius: '4px',
  border: 'none',
  background: '#007bff',
  color: '#fff',
  cursor: 'pointer',
};

const deleteBtn = {
  background: 'none',
  border: 'none',
  color: '#ff4444',
  cursor: 'pointer',
  fontSize: '16px',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  transition: 'color 0.2s',
  ':hover': {
    color: '#cc0000'
  }
};

const linkText = {
  color: '#007bff',
  textDecoration: 'none',
  fontWeight: 'bold',
};

export default Notifications;
