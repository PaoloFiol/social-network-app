import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [handledIds, setHandledIds] = useState(new Set());

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
      await API.put('/notifications/mark-seen');
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleRespond = async (fromUserId, action, notificationId) => {
    try {
      const { data: requests } = await API.get('/friends/requests');
      const match = requests.find(r => r.sender._id === fromUserId);
      if (!match) return alert('Request not found or already handled');

      await API.put('/friends/respond', {
        requestId: match._id,
        action
      });

      await API.delete(`/notifications/${notificationId}`);

      // ✅ Mark it as handled immediately
      setHandledIds(prev => new Set(prev).add(notificationId));
    } catch (err) {
      console.error('❌ Error responding to friend request:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const visibleNotifications = notifications.filter(n => !handledIds.has(n._id));

  return (
    <div style={container}>
      <div style={card}>
        <h2>Notifications</h2>
        {visibleNotifications.length === 0 && <p>No notifications yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {visibleNotifications.map(n => (
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
                <span>
                  <Link to={`/profile/${n.fromUser.username}`} style={linkText}>
                    {n.fromUser.username}
                  </Link>{' '}
                  liked your post.
                </span>
              )}
              {n.type === 'comment' && n.fromUser && (
                <span>
                  <Link to={`/profile/${n.fromUser.username}`} style={linkText}>
                    {n.fromUser.username}
                  </Link>{' '}
                  commented on your post.
                </span>
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

const linkText = {
  color: '#007bff',
  textDecoration: 'none',
  fontWeight: 'bold',
};

export default Notifications;
