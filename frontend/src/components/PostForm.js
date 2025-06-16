import React, { useState } from 'react';
import API from '../api';

function PostForm({ onPost }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || text.length > 500) return alert('Post must be between 1–500 characters');

    const formData = new FormData();
    formData.append('text', text);
    if (image) formData.append('image', image);

    await API.post('/posts', formData);
    setText('');
    setImage(null);
    setCharCount(0);
    onPost();
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    setCharCount(e.target.value.length);
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <textarea
        placeholder="What's on your mind?"
        value={text}
        onChange={handleTextChange}
        rows={3}
        style={textareaStyle}
        maxLength={500}
      />
      <div style={charCountStyle}>
        {charCount}/500 characters
      </div>
      
      <div style={buttonContainerStyle}>
        <div style={imageUploadContainer}>
          <label htmlFor="image-upload" style={imageUploadLabel}>
            <span style={uploadIcon}>📷</span>
            {image ? 'Change Image' : 'Add Photo'}
          </label>
          <input
            id="image-upload"
            type="file"
            onChange={e => setImage(e.target.files[0])}
            accept="image/*"
            style={fileInputStyle}
          />
          {image && (
            <div style={imagePreviewContainer}>
              <span style={imageNameStyle}>{image.name}</span>
              <button
                type="button"
                onClick={() => setImage(null)}
                style={removeImageButton}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          style={submitButton}
          disabled={!text.trim()}
        >
          Post
        </button>
      </div>
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

const submitButton = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#1877f2',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'background-color 0.2s',
  opacity: 1,
  ':disabled': {
    opacity: 0.7,
    cursor: 'not-allowed'
  }
};

export default PostForm;
