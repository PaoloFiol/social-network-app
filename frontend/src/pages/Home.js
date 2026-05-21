import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { FaBell, FaCamera, FaCommentDots, FaHeart, FaPaperPlane, FaSort } from 'react-icons/fa';

const stories = [
  { name: 'Maya', label: 'Weekend hike' },
  { name: 'Leo', label: 'Coffee run' },
  { name: 'Nina', label: 'New playlist' },
  { name: 'Andre', label: 'Game night' }
];

const previewPosts = [
  {
    id: 'preview-1',
    initials: 'MC',
    name: 'Maya Chen',
    handle: 'maya',
    time: '12 min ago',
    text: 'Morning walk turned into a mini photo shoot. The sky was doing too much in the best way.',
    stats: { likes: 128, comments: 18 },
    comments: [
      { name: 'Leo', text: 'That light is unreal.' },
      { name: 'Nina', text: 'Save this route for Saturday?' }
    ]
  },
  {
    id: 'preview-2',
    initials: 'AR',
    name: 'Andre Rivera',
    handle: 'andre',
    time: '34 min ago',
    text: 'Hosting board games tonight. Bring snacks, strong opinions, and your best poker face.',
    stats: { likes: 74, comments: 9 },
    comments: [
      { name: 'Sam', text: 'I am absolutely bringing the rematch energy.' }
    ]
  }
];

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
            <p className="eyebrow">Welcome to Social Network</p>
            <h1 id="home-hero-title">Share moments, catch up, and keep conversations going.</h1>
            <p>
              Follow friends, post updates, react to what they share, and jump into private chats
              when a comment turns into a conversation.
            </p>
            <div className="hero-actions">
              <Link className="button-primary" to="/register">Join Social Network</Link>
              <Link className="button-secondary" to="/login">Log in</Link>
            </div>
          </div>

          <div className="feature-panel" aria-label="Social Network highlights">
            <div className="feature-item"><FaCamera /> Share photos and everyday updates</div>
            <div className="feature-item"><FaHeart /> React to friends' posts</div>
            <div className="feature-item"><FaCommentDots /> Keep threads alive with comments</div>
            <div className="feature-item"><FaPaperPlane /> Message friends privately</div>
          </div>
        </section>
      )}

      <section className="feed-grid" aria-label="Social feed">
        <div className="feed-column">
          {!isLoggedIn && (
            <div className="story-rail" aria-label="Stories">
              {stories.map((story) => (
                <div className="story-card" key={story.name}>
                  <span className="story-avatar">{story.name.slice(0, 1)}</span>
                  <strong>{story.name}<br />{story.label}</strong>
                </div>
              ))}
            </div>
          )}

          <div className="feed-toolbar">
            <div>
              <h2>{isLoggedIn ? 'Home' : 'Around Social Network'}</h2>
              {!isLoggedIn && <p className="demo-label">See what people are sharing right now.</p>}
            </div>

            <label className="sort-control">
              <FaSort aria-hidden="true" />
              <span className="sr-only">Sort posts</span>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                aria-label="Sort posts"
              >
                <option value="newest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="mostLiked">Most loved</option>
              </select>
            </label>
          </div>

          <PostForm onPostCreated={fetchPosts} />

          {sortedPosts.length > 0 ? (
            sortedPosts.map(post => (
              <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
            ))
          ) : isLoggedIn ? (
            <div className="empty-feed">
              <strong>Your feed is quiet.</strong>
              <p>Share a post or connect with friends to get things moving.</p>
            </div>
          ) : (
            <div className="demo-feed">
              {previewPosts.map(post => (
                <article className="post-card" key={post.id}>
                  <div className="post-card__header">
                    <div className="post-author-row">
                      <span className="demo-avatar">{post.initials}</span>
                      <div>
                        <strong className="post-author">{post.name}</strong>
                        <div>
                          <span className="post-username">@{post.handle}</span>
                          <span className="post-date"> · {post.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="post-text">{post.text}</p>
                  <div className="post-actions">
                    <button className="like-button" type="button"><FaHeart /> {post.stats.likes} Likes</button>
                    <button className="share-button" type="button"><FaCommentDots /> {post.stats.comments} Comments</button>
                    <Link className="share-button" to="/register">Join in</Link>
                  </div>
                  <div className="comments">
                    {post.comments.map(comment => (
                      <div className="demo-comment" key={`${post.id}-${comment.name}`}>
                        <strong>{comment.name}</strong>
                        <span className="comment-text">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="sidebar-card" aria-label="Get started">
          <h3>{isLoggedIn ? 'What is happening' : 'Make it yours'}</h3>
          {!isLoggedIn && (
            <>
              <p>Create an account to post updates, upload photos, comment, like, and message friends privately.</p>
              <Link className="button-secondary" to="/register">Create your account</Link>
            </>
          )}
          {isLoggedIn && (
            <>
              <p><FaBell /> New comments and friend requests will show up in your notifications.</p>
            </>
          )}
        </aside>
      </section>
    </div>
  );
}

export default Home;
