import React, { useEffect, useState } from 'react';
import API from '../api';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';

function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendStatus, setFriendStatus] = useState('');
  const currentUserId = localStorage.getItem('userId');

  const fetchData = async () => {
    try {
      const userRes = await API.get(`/users/${username}`);
      setUser(userRes.data);

      const postsRes = await API.get(`/posts/user/${username}`);
      setPosts(postsRes.data);

      if (userRes.data._id === currentUserId) return;

      const friendsRes = await API.get('/friends/list');
      const isFriend = friendsRes.data.some(f => f._id === userRes.data._id);
      if (isFriend) return setFriendStatus('friends');

      const requestsRes = await API.get('/friends/requests');
      const alreadySent = requestsRes.data.some(
        r => r.sender._id === currentUserId && r.receiver === userRes.data._id
      );
      if (alreadySent) return setFriendStatus('sent');

      setFriendStatus('');
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const sendRequest = async () => {
    try {
      await API.post('/friends/request', { receiverId: user._id });
      setFriendStatus('sent');
    } catch (err) {
      console.error('Friend request failed:', err);
      alert(err.response?.data?.message || 'Failed to send friend request');
    }
  };

  const removeFriend = async () => {
    if (!window.confirm(`Remove ${user.firstName} from your friends?`)) return;
    try {
      await API.put('/friends/remove', { friendId: user._id });
      setFriendStatus('');
    } catch (err) {
      console.error('Failed to remove friend:', err);
      alert(err.response?.data?.message || 'Error removing friend');
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={container}>
      <div style={card}>
        <div style={header}>
          <img src={user.profilePic} alt="pfp" style={avatar} />
          <div>
            <h2>{user.firstName} {user.lastName}</h2>
            <p style={{ margin: '4px 0' }}>@{user.username}</p>
            <p style={{ margin: '4px 0', color: '#555' }}>
              {user.location?.city}, {user.location?.state}
            </p>
            <p>{user.aboutMe}</p>

            {user._id !== currentUserId && (
              <div style={{ marginTop: '1rem' }}>
                {friendStatus === 'friends' ? (
                  <button onClick={removeFriend} style={removeBtn}>Remove Friend</button>
                ) : friendStatus === 'sent' ? (
                  <button style={disabledBtn} disabled>Friend Request Sent</button>
                ) : (
                  <button onClick={sendRequest} style={requestBtn}>Send Friend Request</button>
                )}
              </div>
            )}
          </div>
        </div>

        <h3 style={{ marginTop: '2rem' }}>{user.username}'s Posts</h3>
        {posts.map(post => (
          <PostCard key={post._id} post={post} onUpdate={fetchData} />
        ))}
      </div>
    </div>
  );
}

// Styles
const container = {
  display: 'flex',
  justifyContent: 'center',
  padding: '2rem',
  backgroundColor: '#f0f2f5',
  minHeight: '100vh'
};

const card = {
  width: '100%',
  maxWidth: '700px',
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const header = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem'
};

const avatar = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid #ccc'
};

const requestBtn = {
  padding: '0.5rem 1rem',
  border: 'none',
  backgroundColor: '#007bff',
  color: '#fff',
  borderRadius: '4px',
  cursor: 'pointer'
};

const removeBtn = {
  ...requestBtn,
  backgroundColor: '#dc3545'
};

const disabledBtn = {
  padding: '0.5rem 1rem',
  backgroundColor: '#ccc',
  border: 'none',
  color: '#333',
  borderRadius: '4px',
  cursor: 'not-allowed'
};

export default Profile;
