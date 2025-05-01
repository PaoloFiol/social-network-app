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
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '0 1rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Home Feed</h2>

        {/* Sort dropdown */}
        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <label>
            Sort by:{' '}
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={{ padding: '0.3rem' }}
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

export default Home;
