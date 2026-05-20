import React, { useCallback, useEffect, useState } from 'react';
import API from '../api';
import { useParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';

function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendStatus, setFriendStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUserId = localStorage.getItem('userId');

  const fetchData = useCallback(async () => {
    try {
      setError('');
      const userRes = await API.get(`/users/${username}`);
      setUser(userRes.data);

      const postsRes = await API.get(`/posts/user/${username}`);
      setPosts(postsRes.data);

      if (userRes.data._id === currentUserId) {
        setFriendStatus('self');
        return;
      }

      const friendsRes = await API.get('/friends/list');
      const isFriend = friendsRes.data.some(f => f._id === userRes.data._id);
      if (isFriend) {
        setFriendStatus('friends');
        return;
      }

      const requestsRes = await API.get('/friends/requests');
      const alreadySent = requestsRes.data.some(
        r => r.sender._id === currentUserId && r.receiver === userRes.data._id
      );
      setFriendStatus(alreadySent ? 'sent' : '');
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Could not load this profile.');
    } finally {
      setLoading(false);
    }
  }, [username, currentUserId]);

  const sendRequest = async () => {
    try {
      await API.post('/friends/request', { receiverId: user._id });
      setFriendStatus('sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send friend request.');
    }
  };

  const removeFriend = async () => {
    if (!window.confirm(`Remove ${user.firstName} from your friends?`)) return;

    try {
      await API.put('/friends/remove', { friendId: user._id });
      setFriendStatus('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing friend.');
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="empty-state">Loading profile...</div>;
  if (error && !user) return <div className="empty-state">{error}</div>;
  if (!user) return <div className="empty-state">Profile not found.</div>;

  return (
    <div className="center-page">
      <section className="panel-card panel-card--wide">
        <div className="profile-header">
          <img src={user.profilePic || '/default-profile.png'} alt={`${user.firstName} ${user.lastName}`} className="profile-avatar" />
          <div>
            <p className="eyebrow">Profile</p>
            <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
            <p className="profile-meta">@{user.username}</p>
            {(user.location?.city || user.location?.state) && (
              <p className="profile-meta">{[user.location?.city, user.location?.state].filter(Boolean).join(', ')}</p>
            )}
            {user.aboutMe && <p>{user.aboutMe}</p>}

            {user._id !== currentUserId && (
              <div className="profile-actions">
                {friendStatus === 'friends' ? (
                  <>
                    <button onClick={removeFriend} className="button-danger" type="button">Remove friend</button>
                    <Link to={`/messages/${user._id}`} className="button-primary">Message</Link>
                  </>
                ) : friendStatus === 'sent' ? (
                  <button className="button-muted" type="button" disabled>Friend request sent</button>
                ) : (
                  <button onClick={sendRequest} className="button-primary" type="button">Send friend request</button>
                )}
              </div>
            )}
          </div>
        </div>

        {error && <p className="status-message status-message--error">{error}</p>}

        <div className="section-title">
          <h2>{user.username}'s posts</h2>
          <span className="muted-text">{posts.length} total</span>
        </div>

        {posts.length > 0 ? (
          posts.map(post => <PostCard key={post._id} post={post} onUpdate={fetchData} />)
        ) : (
          <div className="empty-state">No posts yet.</div>
        )}
      </section>
    </div>
  );
}

export default Profile;
