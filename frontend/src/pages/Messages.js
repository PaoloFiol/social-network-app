import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { decryptMessage } from '../utils/encryption';

function Messages() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChats = async () => {
    try {
      const res = await API.get('/messages/chats');
      setChats(res.data);
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError('Could not load conversations.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this conversation?')) return;

    try {
      await API.delete(`/messages/${userId}`);
      setChats(prev => prev.filter(chat => chat.user._id !== userId));
    } catch (err) {
      console.error('Failed to delete messages:', err);
      setError('Failed to delete chat.');
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="center-page">
      <section className="panel-card panel-card--wide">
        <p className="eyebrow">Inbox</p>
        <h1 className="page-heading">Messages</h1>
        <p className="page-subtitle">Pick up conversations with your friends.</p>

        {error && <p className="status-message status-message--error">{error}</p>}
        {loading && <div className="empty-state">Loading conversations...</div>}
        {!loading && chats.length === 0 && <div className="empty-state">No messages yet.</div>}

        {!loading && chats.length > 0 && (
          <ul className="list-card">
            {chats.map(chat => (
              <li key={chat.user._id} className="list-item">
                <Link to={`/messages/${chat.user._id}`} className="person-link">
                  <img src={chat.user.profilePic || '/default-profile.png'} alt="" className="avatar-sm" />
                  <span className="person-copy">
                    {chat.user.firstName || 'Unknown'} {chat.user.lastName || ''}
                    <span>
                      {chat.lastMessage?.content ? decryptMessage(chat.lastMessage.content) : 'No message yet'}
                    </span>
                  </span>
                </Link>
                <button className="delete-button" type="button" title="Delete chat" onClick={() => handleDelete(chat.user._id)}>
                  x
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Messages;
