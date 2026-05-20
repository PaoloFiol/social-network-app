import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import PostCard from '../components/PostCard';

function MyProfile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setError('');
      const profile = await API.get('/users/me');
      setUser(profile.data);
      const postRes = await API.get(`/posts/user/${profile.data.username}`);
      setPosts(postRes.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Could not load your profile right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="empty-state">Loading your profile...</div>;
  if (error) return <div className="empty-state">{error}</div>;
  if (!user) return <div className="empty-state">Profile not found.</div>;

  return (
    <div className="center-page">
      <section className="panel-card panel-card--wide">
        <div className="profile-header">
          <img src={user.profilePic || '/default-profile.png'} alt={`${user.firstName} ${user.lastName}`} className="profile-avatar" />
          <div>
            <p className="eyebrow">My Profile</p>
            <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
            <p className="profile-meta">@{user.username}</p>
            {(user.location?.city || user.location?.state) && (
              <p className="profile-meta">{[user.location?.city, user.location?.state].filter(Boolean).join(', ')}</p>
            )}
            {user.aboutMe && <p>{user.aboutMe}</p>}
            <div className="profile-actions">
              <Link className="button-primary" to="/edit-profile">Edit profile</Link>
              <Link className="button-secondary" to="/friends">View friends</Link>
            </div>
          </div>
        </div>

        <div className="section-title">
          <h2>My posts</h2>
          <span className="muted-text">{posts.length} total</span>
        </div>

        {posts.length > 0 ? (
          posts.map(post => <PostCard key={post._id} post={post} onUpdate={fetchData} />)
        ) : (
          <div className="empty-state">You have not posted yet.</div>
        )}
      </section>
    </div>
  );
}

export default MyProfile;
