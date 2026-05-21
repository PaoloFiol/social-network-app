import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
      if (res.data.some(notification => !notification.seen)) {
        await API.put('/notifications/mark-seen');
        window.dispatchEvent(new Event('notifications-seen'));
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Could not load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (userId, response, notificationId) => {
    try {
      const { data: requests } = await API.get('/friends/requests');
      const request = requests.find(r => r.sender._id === userId);

      if (!request) {
        throw new Error('Friend request not found');
      }

      await API.put('/friends/respond', {
        requestId: request._id,
        action: response
      });

      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Failed to respond to friend request:', err);
      setError('Failed to respond to friend request.');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setError('Failed to delete notification.');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderNotificationText = (n) => {
    if (!n.fromUser) return 'Notification';
    const actor = `${n.fromUser.firstName || ''} ${n.fromUser.lastName || ''}`.trim() || n.fromUser.username;

    if (n.type === 'friend_request') return `${actor} sent you a friend request.`;
    if (n.type === 'like') return `${actor} liked your post.`;
    if (n.type === 'comment') return `${actor} commented on your post.`;
    return `${actor} interacted with you.`;
  };

  return (
    <div className="center-page">
      <section className="panel-card panel-card--wide">
        <p className="eyebrow">Activity</p>
        <h1 className="page-heading">Notifications</h1>
        <p className="page-subtitle">Review friend requests, likes, and comments in one place.</p>

        {error && <p className="status-message status-message--error">{error}</p>}
        {loading && <div className="empty-state">Loading notifications...</div>}
        {!loading && notifications.length === 0 && <div className="empty-state">No notifications yet.</div>}

        {!loading && notifications.length > 0 && (
          <ul className="list-card">
            {notifications.map(n => (
              <li key={n._id} className="list-item">
                <div className="person-link">
                  {n.fromUser?.profilePic && <img src={n.fromUser.profilePic} alt="" className="avatar-sm" />}
                  <span className="person-copy">
                    {n.fromUser ? (
                      <Link to={`/profile/${n.fromUser.username}`}>{renderNotificationText(n)}</Link>
                    ) : renderNotificationText(n)}
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </span>
                </div>

                {n.type === 'friend_request' && n.fromUser ? (
                  <div className="profile-actions">
                    <button className="button-primary" type="button" onClick={() => handleRespond(n.fromUser._id, 'accept', n._id)}>Accept</button>
                    <button className="button-muted" type="button" onClick={() => handleRespond(n.fromUser._id, 'decline', n._id)}>Decline</button>
                  </div>
                ) : (
                  <button className="delete-button" type="button" onClick={() => handleDelete(n._id)} title="Delete notification">x</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Notifications;
