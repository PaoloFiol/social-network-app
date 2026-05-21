import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { decryptMessage, encryptMessage } from '../utils/encryption';
import { getSocket } from '../utils/socket';

const ChatView = () => {
  const { userId } = useParams();
  const currentUserId = useRef(localStorage.getItem('userId'));
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [input, setInput] = useState('');
  const [typingStatus, setTypingStatus] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const normalizeId = (id) => id?.toString?.() || id;
  const isMessageFromCurrentUser = (message) => normalizeId(message.sender) === normalizeId(currentUserId.current);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const socket = getSocket();
    const id = currentUserId.current;
    if (socket && id) {
      socket.emit('joinChat', { userId: id });
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlePrivateMessage = (msg) => {
      const normalized = {
        ...msg,
        sender: normalizeId(msg.sender?._id || msg.sender),
        receiver: normalizeId(msg.receiver?._id || msg.receiver)
      };

      if (
        (normalized.sender === userId && normalized.receiver === currentUserId.current) ||
        (normalized.sender === currentUserId.current && normalized.receiver === userId)
      ) {
        setMessages((prev) => [...prev, normalized]);
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleTypingEvent = ({ from }) => from === userId && setTypingStatus('Typing...');
    const handleStopTypingEvent = ({ from }) => from === userId && setTypingStatus('');

    socket.on('privateMessage', handlePrivateMessage);
    socket.on('typing', handleTypingEvent);
    socket.on('stopTyping', handleStopTypingEvent);

    return () => {
      socket.off('privateMessage', handlePrivateMessage);
      socket.off('typing', handleTypingEvent);
      socket.off('stopTyping', handleStopTypingEvent);
    };
  }, [userId]);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setError('');
        const res = await API.get(`/messages/${userId}`);
        const normalizedMessages = res.data.map(msg => ({
          ...msg,
          sender: normalizeId(msg.sender?._id || msg.sender),
          receiver: normalizeId(msg.receiver?._id || msg.receiver)
        }));
        setMessages(normalizedMessages);

        const userRes = await API.get(`/users/id/${userId}`);
        setChatUser(userRes.data);
      } catch (err) {
        console.error('Error loading chat:', err);
        setError('Could not load this conversation.');
      }
    };

    fetchChat();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const id = currentUserId.current;
    if (!input.trim() || !id) return;

    const encryptedText = encryptMessage(input);
    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      _id: tempId,
      sender: id,
      receiver: userId,
      content: encryptedText,
      timestamp: new Date(),
      read: false
    };

    const socket = getSocket();
    socket?.emit('privateMessage', newMsg);
    socket?.emit('stopTyping', { to: userId, from: id });

    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    try {
      const { data } = await API.post('/messages', {
        receiverId: userId,
        encryptedText
      });
      setMessages((prev) => prev.map((message) => message._id === tempId ? {
        ...data,
        sender: normalizeId(data.sender?._id || data.sender),
        receiver: normalizeId(data.receiver?._id || data.receiver)
      } : message));
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Message could not be saved.');
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    const id = currentUserId.current;
    if (!id) return;

    const socket = getSocket();
    socket?.emit('typing', { to: userId, from: id });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stopTyping', { to: userId, from: id });
    }, 1000);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const deleteMessage = async (messageId) => {
    if (!messageId || messageId.startsWith('temp-')) return;
    if (!window.confirm('Delete this message from your view?')) return;

    try {
      await API.delete(`/messages/single/${messageId}`);
      setMessages((prev) => prev.filter((message) => message._id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Could not delete that message.');
    }
  };

  return (
    <section className="chat-page" aria-label="Conversation">
      <header className="chat-header">
        {chatUser ? (
          <Link to={`/profile/${chatUser.username}`} className="person-link">
            <img src={chatUser.profilePic || '/default-profile.png'} alt="" className="avatar-sm" />
            <span className="person-copy">
              {chatUser.firstName} {chatUser.lastName}
              <span>@{chatUser.username}</span>
            </span>
          </Link>
        ) : (
          <span className="muted-text">Loading conversation...</span>
        )}
        <Link to="/messages" className="button-secondary">Inbox</Link>
      </header>

      <div className="chat-messages">
        {error && <p className="status-message status-message--error">{error}</p>}
        {messages.length === 0 && !error && <div className="empty-state">No messages yet. Say hello.</div>}

        {messages.map((msg, i) => {
          const isMe = isMessageFromCurrentUser(msg);
          const text = decryptMessage(msg.content || msg.encryptedText);

          return (
            <div key={`${msg._id || i}-${msg.timestamp || ''}`} className={`message-row ${isMe ? 'is-me' : 'is-them'}`}>
              <div className="message-line">
                <div className="message-bubble">{text}</div>
                {msg._id && (
                  <button
                    className="message-delete"
                    type="button"
                    onClick={() => deleteMessage(msg._id)}
                    title="Delete message"
                    aria-label="Delete message"
                  >
                    x
                  </button>
                )}
              </div>
              <div className="message-meta">{formatTimestamp(msg.timestamp)}</div>
            </div>
          );
        })}

        {typingStatus && <div className="typing-note">{typingStatus}</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-compose">
        <input
          value={input}
          onChange={handleTyping}
          placeholder="Type a message..."
          aria-label="Type a message"
        />
        <button type="submit" className="submit-button" disabled={!input.trim()}>
          Send
        </button>
      </form>
    </section>
  );
};

export default ChatView;
