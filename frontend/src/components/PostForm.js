import React, { useState } from 'react';
import API from '../api';

function PostForm({ onPost }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || text.length > 500) return alert('Post must be between 1–500 characters');

    const formData = new FormData();
    formData.append('text', text);
    if (image) formData.append('image', image);

    await API.post('/posts', formData);
    setText('');
    setImage(null);
    onPost();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: '750px',
        margin: '0 auto 2rem auto',
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
      }}
    >
      <textarea
        placeholder="What's on your mind?"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginBottom: '0.75rem',
          fontSize: '15px',
          resize: 'vertical',
          boxSizing: 'border-box'
        }}
        maxLength={500}
      />
      <input
        type="file"
        onChange={e => setImage(e.target.files[0])}
        accept="image/*"
        style={{ marginBottom: '0.75rem' }}
      />
      <br />
      <button
        type="submit"
        style={{
          padding: '0.5rem 1.2rem',
          backgroundColor: '#1877f2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Post
      </button>
    </form>
  );
}

export default PostForm;
