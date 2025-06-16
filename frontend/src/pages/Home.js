import React, { useEffect, useState } from 'react';
import API from '../api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';

function Home() {
  const [posts, setPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  const fetchPosts = async () => {
    const res = await API.get('/posts');
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Sort dropdown */}
        <div style={sortContainerStyle}>
          <label style={labelStyle}>
            Sort by:{' '}
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={selectStyle}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </label>
        </div>

        <PostForm onPost={fetchPosts} />
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

const labelStyle = {
  fontSize: '14px',
  color: '#666'
};

const selectStyle = {
  padding: '0.3rem 0.5rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  backgroundColor: '#fff',
  fontSize: '14px',
  cursor: 'pointer'
};

export default Home;
