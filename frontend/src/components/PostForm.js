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
  const [charCount, setCharCount] = useState(0);

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

  const handleTextChange = (e) => {
    setText(e.target.value);
    setCharCount(e.target.value.length);
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
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setImage(null);
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <textarea
        placeholder={isLoggedIn ? "What's on your mind?" : "Login to create a post"}
        value={text}
        onChange={handleTextChange}
        rows={3}
        style={{
          ...textareaStyle,
          cursor: isLoggedIn ? 'text' : 'pointer',
          opacity: isLoggedIn ? 1 : 0.7
        }}
        onClick={() => !isLoggedIn && navigate('/login')}
        readOnly={!isLoggedIn}
        maxLength={500}
      />
      <div style={charCountStyle}>
        {charCount}/500 characters
      </div>
      
      <div style={buttonContainerStyle}>
        <div style={imageUploadContainer}>
          <label 
            htmlFor="image-upload" 
            style={{
              ...imageUploadLabel,
              cursor: isLoggedIn ? 'pointer' : 'default',
              opacity: isLoggedIn ? 1 : 0.7
            }}
            onClick={(e) => !isLoggedIn && (e.preventDefault(), navigate('/login'))}
          >
            <FaImage style={uploadIcon} />
            Add Photo
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={fileInputStyle}
            disabled={!isLoggedIn}
          />
        </div>

        <button 
          type="submit" 
          style={{
            ...submitButtonStyle,
            cursor: isLoggedIn ? 'pointer' : 'default',
            opacity: isLoggedIn ? 1 : 0.7
          }}
          disabled={isSubmitting || (!isLoggedIn && !text.trim() && !image)}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>

      {imagePreview && (
        <div style={imagePreviewContainer}>
          <img 
            src={imagePreview} 
            alt="Preview" 
            style={{ maxWidth: '100px', maxHeight: '100px' }} 
          />
          <span style={imageNameStyle}>{image.name}</span>
          <button 
            type="button" 
            onClick={removeImage}
            style={removeImageButton}
          >
            ✕
          </button>
        </div>
      )}
    </form>
  );
}

// Styles
const formStyle = {
  maxWidth: '750px',
  margin: '0 auto 2rem auto',
  padding: '1.5rem',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  width: '100%',
  boxSizing: 'border-box'
};

const textareaStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  marginBottom: '0.5rem',
  fontSize: '15px',
  resize: 'vertical',
  boxSizing: 'border-box',
  minHeight: '100px',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
  ':focus': {
    borderColor: '#1877f2',
    outline: 'none'
  }
};

const charCountStyle = {
  textAlign: 'right',
  fontSize: '12px',
  color: '#65676b',
  marginBottom: '1rem'
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '1rem'
};

const imageUploadContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const imageUploadLabel = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  backgroundColor: '#f0f2f5',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#1877f2',
  transition: 'background-color 0.2s'
};

const uploadIcon = {
  fontSize: '16px'
};

const fileInputStyle = {
  display: 'none'
};

const submitButtonStyle = {
  padding: '0.5rem 1.5rem',
  backgroundColor: '#1877f2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background-color 0.2s'
};

const imagePreviewContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '0.5rem',
  padding: '0.5rem',
  backgroundColor: '#f0f2f5',
  borderRadius: '4px'
};

const imageNameStyle = {
  fontSize: '14px',
  color: '#1c1e21',
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const removeImageButton = {
  background: 'none',
  border: 'none',
  color: '#dc3545',
  cursor: 'pointer',
  fontSize: '16px',
  padding: '0.25rem',
  borderRadius: '4px',
  transition: 'background-color 0.2s'
};

export default PostForm;
