import React, { useEffect, useState } from 'react';
import API from '../api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { FaSort } from 'react-icons/fa';

function Home() {
  const [posts, setPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest' or 'mostLiked'
  const isLoggedIn = !!localStorage.getItem('token');

  const fetchPosts = async () => {
    try {
      const res = await API.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOrder === 'mostLiked') {
      return b.likes.length - a.likes.length;
    }
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Sort dropdown */}
        <div style={sortContainerStyle}>
          <div style={sortWrapperStyle}>
            <FaSort style={sortIconStyle} />
            <select 
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={selectStyle}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostLiked">Most Likes</option>
            </select>
          </div>
        </div>

        <PostForm onPostCreated={fetchPosts} />
        {sortedPosts.map(post => (
          <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
        ))}
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  backgroundColor: '#f0f2f5',
  minHeight: '100vh',
  padding: '1rem 0',
  width: '100%'
};

const contentStyle = {
  maxWidth: '750px',
  margin: '0 auto',
  padding: '0 1rem',
  width: '100%',
  boxSizing: 'border-box'
};

const sortContainerStyle = {
  textAlign: 'right',
  marginBottom: '1rem',
  padding: '0 0.5rem'
};

const sortWrapperStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'white',
  padding: '6px 12px',
  borderRadius: '20px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  ':hover': {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
  }
};

const sortIconStyle = {
  color: '#666',
  fontSize: '14px'
};

const selectStyle = {
  padding: '4px 8px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'transparent',
  fontSize: '14px',
  color: '#1c1e21',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundImage: 'none'
};

export default Home;
