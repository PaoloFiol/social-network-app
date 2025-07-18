import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

function PostCard({ post, onUpdate }) {
  const [showAllComments, setShowAllComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const currentUser = localStorage.getItem('username');
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    setComments(post.comments || []);
  }, [post.comments]);

  const handleLike = async () => {
    if (!isLoggedIn) return;
    await API.put(`/posts/${post._id}/like`);
    onUpdate();
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !comment.trim()) return;
    try {
      const res = await API.put(`/posts/${post._id}/comment`, { text: comment });
      setComments(res.data.comments);
      setComment('');
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!isLoggedIn) return;
    if (window.confirm('Delete this post?')) {
      await API.delete(`/posts/${post._id}`);
      onUpdate();
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isLoggedIn) return;
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
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <strong>
            <Link to={`/profile/${post.user?.username}`} style={linkStyle}>
              {post.user?.firstName} {post.user?.lastName}
            </Link>
          </strong>{' '}
          <span style={usernameStyle}>(@{post.user?.username})</span>
          <div style={dateStyle}>
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        {isLoggedIn && post.user?.username === currentUser && (
          <button
            onClick={handleDeletePost}
            title="Delete Post"
            style={deleteButtonStyle}
          >
            ✕
          </button>
        )}
      </div>

      {post.image && (
        <div style={imageContainerStyle}>
          <img
            src={post.image}
            alt="post"
            style={imageStyle}
          />
        </div>
      )}

      <p style={textStyle}>{post.text}</p>

      <div style={actionsStyle}>
        <button 
          onClick={handleLike} 
          style={{
            ...likeButtonStyle,
            cursor: isLoggedIn ? 'pointer' : 'default',
            opacity: isLoggedIn ? 1 : 0.7
          }}
        >
          ❤️ Like ({post.likes.length})
        </button>
      </div>

      {isLoggedIn && (
        <form onSubmit={handleComment} style={commentFormStyle}>
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Write a comment..."
            style={commentInputStyle}
          />
          <button type="submit" style={commentButtonStyle}>
            Comment
          </button>
        </form>
      )}

      <div style={commentsContainerStyle}>
        {visibleComments.map((c) => {
          const user = typeof c.user === 'object' ? c.user : null;
          const username = user?.username || 'unknown';
          const fullName = user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : username;

          return (
            <div key={c._id} style={commentItemStyle}>
              <div style={commentContentStyle}>
                <div style={commentHeaderStyle}>
                  <div style={commentUserStyle}>
                    <strong>
                      <Link to={`/profile/${username}`} style={commentLinkStyle}>
                        {fullName}
                      </Link>
                    </strong>
                    <span style={commentTextStyle}>: {c.text}</span>
                  </div>
                  <span style={commentDateStyle}>
                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              {isLoggedIn && username === currentUser && (
                <button
                  onClick={() => handleDeleteComment(c._id)}
                  title="Delete Comment"
                  style={deleteCommentButtonStyle}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
        {comments.length > 2 && (
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            style={{
              ...showMoreButtonStyle,
              cursor: isLoggedIn ? 'pointer' : 'default',
              opacity: isLoggedIn ? 1 : 0.7
            }}
          >
            {showAllComments ? 'Hide comments' : 'Show all comments'}
          </button>
        )}
      </div>
    </div>
  );
}

// Styles
const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '1.5rem',
  margin: '1rem auto',
  backgroundColor: '#fff',
  maxWidth: '800px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  width: '100%',
  boxSizing: 'border-box'
};

const headerStyle = {
  marginBottom: '1rem',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start'
};

const headerContentStyle = {
  flex: 1
};

const linkStyle = {
  color: '#1877f2',
  textDecoration: 'none',
  fontSize: '15px'
};

const usernameStyle = {
  color: '#65676b',
  fontSize: '14px'
};

const dateStyle = {
  fontSize: '13px',
  color: '#65676b',
  marginTop: '4px'
};

const imageContainerStyle = {
  width: '100%',
  maxHeight: '500px',
  margin: '1rem 0',
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px'
};

const imageStyle = {
  maxWidth: '100%',
  maxHeight: '500px',
  objectFit: 'contain',
  borderRadius: '8px'
};

const textStyle = {
  textAlign: 'left',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '1rem 0'
};

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '1rem'
};

const likeButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#1877f2',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '0.5rem',
  borderRadius: '4px',
  transition: 'background-color 0.2s'
};

const commentFormStyle = {
  display: 'flex',
  gap: '0.5rem',
  marginTop: '1rem',
  flexWrap: 'wrap'
};

const commentInputStyle = {
  flex: 1,
  minWidth: '200px',
  padding: '0.5rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px'
};

const commentButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#1877f2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  whiteSpace: 'nowrap',
  minWidth: 'fit-content'
};

const commentsContainerStyle = {
  marginTop: '1rem',
  textAlign: 'left'
};

const commentItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '0.75rem',
  padding: '0.5rem',
  borderRadius: '4px',
  backgroundColor: '#f0f2f5'
};

const commentContentStyle = {
  flex: 1,
  marginRight: '0.5rem'
};

const commentLinkStyle = {
  color: '#1877f2',
  textDecoration: 'none',
  fontSize: '14px'
};

const commentHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
  gap: '8px'
};

const commentUserStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '0px',
  flex: 1,
  minWidth: 0
};

const commentTextStyle = {
  fontSize: '14px',
  color: '#1c1e21',
  wordBreak: 'break-word',
  flex: 1,
  minWidth: 0
};

const commentDateStyle = {
  fontSize: '12px',
  color: '#65676b',
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const showMoreButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#1877f2',
  cursor: 'pointer',
  fontSize: '13px',
  padding: '0.5rem 0',
  marginTop: '0.5rem',
  transition: 'color 0.2s'
};

const deleteButtonStyle = {
  background: 'none',
  color: '#ff4444',
  border: 'none',
  cursor: 'pointer',
  fontSize: '20px',
  fontWeight: 'bold',
  padding: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.2s',
  marginLeft: '10px'
};

const deleteCommentButtonStyle = {
  background: 'none',
  color: '#ff4444',
  border: 'none',
  marginLeft: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.2s'
};

export default PostCard;
