import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegCommentDots, FaRegHeart, FaShare } from 'react-icons/fa';
import API from '../api';

function PostCard({ post, onUpdate }) {
  const [showAllComments, setShowAllComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const currentUser = localStorage.getItem('username');
  const currentUserId = localStorage.getItem('userId');
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
  const authorName = [post.user?.firstName, post.user?.lastName].filter(Boolean).join(' ') || post.user?.username || 'Unknown user';
  const authorUsername = post.user?.username || 'unknown';
  const authorInitial = authorName.slice(0, 1).toUpperCase();
  const isLiked = post.likes?.some((like) => {
    if (typeof like === 'object') return like._id === currentUserId;
    return like === currentUserId;
  });

  const sharePost = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <article className="post-card">
      <div className="post-card__header">
        <div className="post-author-row">
          <span className="demo-avatar">{authorInitial}</span>
          <div>
            <Link to={`/profile/${authorUsername}`} className="post-author">
              {authorName}
            </Link>
            <div>
              <span className="post-username">@{authorUsername}</span>
              <span className="post-date">
                {' '}·{' '}
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {isLoggedIn && authorUsername === currentUser && (
          <button
            onClick={handleDeletePost}
            title="Delete post"
            className="delete-button"
            type="button"
          >
            x
          </button>
        )}
      </div>

      {post.text && <p className="post-text">{post.text}</p>}

      {post.image && (
        <div className="post-image-wrap">
          <button className="post-image-button" type="button" onClick={() => setIsImageOpen(true)} aria-label="Enlarge post image">
            <img src={post.image} alt="Post" />
          </button>
        </div>
      )}

      <div className="post-actions">
        <button
          onClick={handleLike}
          className="like-button"
          type="button"
          style={{
            cursor: isLoggedIn ? 'pointer' : 'default',
            opacity: isLoggedIn ? 1 : 0.72
          }}
        >
          {isLiked ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
          {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
        </button>
        <button className="share-button" type="button">
          <FaRegCommentDots aria-hidden="true" />
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </button>
        <button className="share-button" type="button" onClick={sharePost}>
          <FaShare aria-hidden="true" />
          Share
        </button>
      </div>

      {isLoggedIn && (
        <form onSubmit={handleComment} className="comment-form">
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment..."
            aria-label="Add a comment"
          />
          <button type="submit" className="comment-button">
            Send
          </button>
        </form>
      )}

      <div className="comments">
        {visibleComments.map((c) => {
          const user = typeof c.user === 'object' ? c.user : null;
          const username = user?.username || 'unknown';
          const fullName = user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : username;

          return (
            <div key={c._id} className="comment-item">
              <div className="comment-body">
                <Link to={`/profile/${username}`} className="comment-author">
                  {fullName}
                </Link>
                <span className="comment-text">{c.text}</span>
                <div className="comment-date">
                  {new Date(c.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {isLoggedIn && username === currentUser && (
                <button
                  onClick={() => handleDeleteComment(c._id)}
                  title="Delete comment"
                  className="delete-button"
                  type="button"
                >
                  x
                </button>
              )}
            </div>
          );
        })}

        {comments.length > 2 && (
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            className="ghost-button"
            type="button"
          >
            {showAllComments ? 'Hide comments' : 'Show all comments'}
          </button>
        )}
      </div>

      {isImageOpen && (
        <div className="image-modal" role="dialog" aria-modal="true" aria-label="Post image preview" onClick={() => setIsImageOpen(false)}>
          <button className="image-modal__close" type="button" onClick={() => setIsImageOpen(false)} aria-label="Close image preview">
            x
          </button>
          <img src={post.image} alt="Post enlarged" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </article>
  );
}

export default PostCard;
