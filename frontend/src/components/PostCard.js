import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import API from '../api';

function PostCard({ post, onUpdate }) {
  const [showAllComments, setShowAllComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const currentUser = localStorage.getItem('username');

  useEffect(() => {
    setComments(post.comments || []);
  }, [post.comments]);

  const handleLike = async () => {
    await API.put(`/posts/${post._id}/like`);
    onUpdate();
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await API.put(`/posts/${post._id}/comment`, { text: comment });
      setComments(res.data.comments);
      setComment('');
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Delete this post?')) {
      await API.delete(`/posts/${post._id}`);
      onUpdate();
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        const res = await API.delete(`/posts/${post._id}/comments/${commentId}`);
        setComments(res.data.comments);
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

  const visibleComments = showAllComments ? comments : comments.slice(-2);

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        margin: '1rem auto',
        backgroundColor: '#fff',
        maxWidth: '750px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ marginBottom: '0.5rem', textAlign: 'left' }}>
        <strong>
          <Link to={`/profile/${post.user?.username}`}>
            {post.user?.firstName} {post.user?.lastName}
          </Link>
        </strong>{' '}
        (@{post.user?.username})
        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '2px' }}>
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {post.image && (
        <div style={{ width: '100%', aspectRatio: '1 / 1', margin: '1rem 0', position: 'relative' }}>
          <img
            src={post.image}
            alt="post"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </div>
      )}

      <p style={{ textAlign: 'left', fontSize: '15px' }}>{post.text}</p>

      <div style={{ marginTop: '0.5rem', textAlign: 'left' }}>
        <button onClick={handleLike}>❤️ Like ({post.likes.length})</button>
        {post.user?.username === currentUser && (
          <button onClick={handleDeletePost} title="Delete Post" style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
          🗑️
        </button>
        )}
      </div>

      <form onSubmit={handleComment} style={{ marginTop: '1rem', textAlign: 'left' }}>
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Write a comment..."
          style={{
            width: '75%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        />
        <button type="submit" style={{ marginLeft: '0.5rem' }}>
          Comment
        </button>
      </form>

      <div style={{ marginTop: '1rem', textAlign: 'left' }}>
        {visibleComments.map((c) => {
          const user = typeof c.user === 'object' ? c.user : null;
          const username = user?.username || 'unknown';
          const fullName = user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : username;

          return (
            <div key={c._id} style={{ marginBottom: '0.5rem' }}>
              <strong>
                <Link to={`/profile/${username}`}>
                  {fullName}
                </Link>
              </strong>: {c.text}
              {username === currentUser && (
                <button onClick={() => handleDeleteComment(c._id)} title="Delete Comment" style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                    🗑️
                </button>
              
              )}
            </div>
          );
        })}
        {comments.length > 2 && (
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            style={{ marginTop: '0.5rem', fontSize: '13px' }}
          >
            {showAllComments ? 'Hide comments' : 'Show all comments'}
          </button>
        )}
      </div>
    </div>
  );
}

export default PostCard;
