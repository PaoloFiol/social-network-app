import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { decryptMessage } from '../utils/encryption';

function Messages() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const res = await API.get('/messages/chats');
      setChats(res.data);
    } catch (err) {
      console.error('❌ Failed to load chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    try {
      await API.delete(`/messages/${userId}`);
      setChats(prev => prev.filter(chat => chat.user._id !== userId));
    } catch (err) {
      console.error('❌ Failed to delete messages:', err);
      alert('Failed to delete chat.');
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={heading}>Messages</h2>
        {loading ? (
          <p>Loading chats...</p>
        ) : chats.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {chats.map(chat => (
              <li key={chat.user._id} style={chatItem}>
                <div style={infoRow}>
                  <Link to={`/messages/${chat.user._id}`} style={{ ...link, flex: 1 }}>
                    <img
                      src={chat.user.profilePic || '/default-profile.png'}
                      alt="pfp"
                      style={pfp}
                    />
                    <div>
                      <strong>
                        {chat.user.firstName || 'Unknown'} {chat.user.lastName || ''}
                      </strong>
                      <br />
                      <small style={{ color: '#555' }}>
                        {chat.lastMessage?.content ? decryptMessage(chat.lastMessage.content) : 'No message yet'}
                      </small>
                    </div>
                  </Link>
                  <button
                    style={deleteBtn}
                    title="Delete Chat"
                    onClick={() => handleDelete(chat.user._id)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// 💅 Styles
const container = {
  display: 'flex',
  justifyContent: 'center',
  padding: '2rem',
  backgroundColor: '#f0f2f5',
  minHeight: '85vh'
};

const card = {
  width: '100%',
  maxWidth: '600px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '2rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const heading = {
  marginBottom: '1.5rem'
};

const chatItem = {
  borderBottom: '1px solid #eee',
  padding: '1rem 0'
};

const infoRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const pfp = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  objectFit: 'cover'
};

const link = {
  textDecoration: 'none',
  color: '#333',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const deleteBtn = {
  background: 'none',
  border: 'none',
  color: '#ff4444',
  cursor: 'pointer',
  fontSize: '16px',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  transition: 'color 0.2s',
  ':hover': {
    color: '#cc0000'
  }
};

export default Messages;
