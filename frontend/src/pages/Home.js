import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { FaBolt, FaComments, FaImage, FaSort, FaUserFriends } from 'react-icons/fa';

function Home() {
  const [posts, setPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
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
    <div className="home-shell">
      {!isLoggedIn && (
        <section className="home-hero" aria-labelledby="home-hero-title">
          <div>
            <p className="eyebrow">Community Feed</p>
            <h1 id="home-hero-title">A full-stack social app with real-time features.</h1>
            <p>
              Create profiles, share photo posts, like and comment, manage friends,
              and chat through a polished MERN-style application.
            </p>
            <div className="hero-actions">
              <Link className="button-primary" to="/register">Create account</Link>
              <Link className="button-secondary" to="/login">Log in</Link>
            </div>
          </div>

          <div className="feature-panel" aria-label="App highlights">
            <div className="feature-item"><FaComments /> Real-time private messaging</div>
            <div className="feature-item"><FaUserFriends /> Friend requests and profile discovery</div>
            <div className="feature-item"><FaImage /> Photo posts with likes and comments</div>
            <div className="feature-item"><FaBolt /> Notifications for social activity</div>
          </div>
        </section>
      )}

      <section className="feed-grid" aria-label="Social feed">
        <div className="feed-column">
          <div className="feed-toolbar">
            <div>
              <h2>{isLoggedIn ? 'Your feed' : 'Public feed preview'}</h2>
            </div>

            <label className="sort-control">
              <FaSort aria-hidden="true" />
              <span className="sr-only">Sort posts</span>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                aria-label="Sort posts"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="mostLiked">Most liked</option>
              </select>
            </label>
          </div>

          <PostForm onPostCreated={fetchPosts} />

          {sortedPosts.length > 0 ? (
            sortedPosts.map(post => (
              <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
            ))
          ) : (
            <div className="empty-feed">
              <strong>No posts yet.</strong>
              <p>Be the first to start the conversation.</p>
            </div>
          )}
        </div>

        <aside className="sidebar-card" aria-label="Project summary">
          <h3>Project snapshot</h3>
          <p>
            Built with React, Express, MongoDB, JWT auth, image uploads, and Socket.IO
            messaging. Designed to show full-stack product flow beyond a static demo.
          </p>
          {!isLoggedIn && <Link className="button-secondary" to="/register">Try the app</Link>}
        </aside>
      </section>
    </div>
  );
}

export default Home;
