import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { FaImage } from 'react-icons/fa';

function PostForm({ onPostCreated }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!text.trim() && !image) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('text', text);
    if (image) {
      formData.append('image', image);
    }

    try {
      await API.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setText('');
      setImage(null);
      setImagePreview(null);
      onPostCreated();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <textarea
        placeholder={isLoggedIn ? "What's on your mind?" : 'Log in to create a post'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{
          cursor: isLoggedIn ? 'text' : 'pointer',
          opacity: isLoggedIn ? 1 : 0.78
        }}
        onClick={() => !isLoggedIn && navigate('/login')}
        readOnly={!isLoggedIn}
        maxLength={500}
        aria-label="Post text"
      />

      <div className="post-form__meta">{text.length}/500 characters</div>

      <div className="post-form__actions">
        <div>
          <label
            htmlFor="image-upload"
            className="photo-button"
            style={{
              cursor: isLoggedIn ? 'pointer' : 'default',
              opacity: isLoggedIn ? 1 : 0.7
            }}
            onClick={(e) => !isLoggedIn && (e.preventDefault(), navigate('/login'))}
          >
            <FaImage aria-hidden="true" />
            Add Photo
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            disabled={!isLoggedIn}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          style={{
            cursor: isLoggedIn ? 'pointer' : 'default',
            opacity: isLoggedIn ? 1 : 0.78
          }}
          disabled={isSubmitting || !isLoggedIn || (!text.trim() && !image)}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>

      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Selected upload preview" />
          <span>{image.name}</span>
          <button
            type="button"
            onClick={removeImage}
            className="delete-button"
            aria-label="Remove selected image"
          >
            x
          </button>
        </div>
      )}
    </form>
  );
}

export default PostForm;
