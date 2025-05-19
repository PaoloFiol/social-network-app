import React, { useEffect, useState } from 'react';
import API from '../api';
import PostCard from '../components/PostCard';

function MyProfile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const fetchData = async () => {
    const profile = await API.get('/users/me');
    setUser(profile.data);
    const postRes = await API.get(`/posts/user/${profile.data.username}`);
    setPosts(postRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={container}>
      <div style={profileCard}>
        <img src={user.profilePic} alt="Profile" style={profilePic} />
        <h2>{user.firstName} {user.lastName}</h2>
        <p style={{ color: '#555' }}>@{user.username}</p>
        <p>{user.location?.city}, {user.location?.state}</p>
        <p>{user.aboutMe}</p>
      </div>

      <div style={postSection}>
        <h3 style={{ marginBottom: '1rem' }}>My Posts</h3>
        {posts.map(post => (
          <PostCard key={post._id} post={post} onUpdate={fetchData} />
        ))}
      </div>
    </div>
  );
}

// ✅ Styles
const container = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  backgroundColor: '#f0f2f5',
  minHeight: '100vh',
};

const profileCard = {
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '600px',
  marginBottom: '2rem',
  textAlign: 'center',
};

const profilePic = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: '1rem',
};

const postSection = {
  width: '100%',
  maxWidth: '800px', // Match Home feed PostCard width
};

export default MyProfile;
