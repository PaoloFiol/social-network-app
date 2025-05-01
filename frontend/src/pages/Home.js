import React, { useEffect, useState } from 'react';
import API from '../api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';

function Home() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const res = await API.get('/posts');
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={{ background: '#f5f6f8', padding: '2rem', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Home Feed</h2>
      <PostForm onPost={fetchPosts} />
      <div style={{ marginTop: '2rem' }}>
        {posts.map(post => (
          <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
        ))}
      </div>
    </div>
  );
}

export default Home;
