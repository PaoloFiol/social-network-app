import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    const id = currentUserId.current;
    if (socket && id) {
      socket.emit('joinChat', { userId: id });
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.warn('❌ No active socket found in ChatView!');
      return;
    }

    const handlePrivateMessage = (msg) => {
      const normalized = {
        ...msg,
        sender: msg.sender?._id?.toString?.() || msg.sender?.toString?.(),
        receiver: msg.receiver?._id?.toString?.() || msg.receiver?.toString?.()
      };

      if (
        (normalized.sender === userId && normalized.receiver === currentUserId.current) ||
        (normalized.sender === currentUserId.current && normalized.receiver === userId)
      ) {
        setMessages((prev) => [...prev, normalized]);
      }
    };

    socket.on('privateMessage', handlePrivateMessage);
    socket.on('typing', ({ from }) => from === userId && setTypingStatus('Typing...'));
    socket.on('stopTyping', ({ from }) => from === userId && setTypingStatus(''));

    return () => {
      socket.off('privateMessage', handlePrivateMessage);
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [userId]);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await API.get(`/messages/${userId}`);
        setMessages(res.data);
        const userRes = await API.get(`/users/id/${userId}`);
        setChatUser(userRes.data);
      } catch (err) {
        console.error('❌ Error loading chat:', err);
      }
    };
    fetchChat();
  }, [userId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const id = currentUserId.current;
    if (!input.trim() || !id) return;

    const encryptedText = encryptMessage(input);
    const newMsg = {
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

    await API.post('/messages', {
      receiverId: userId,
      encryptedText
    });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    const id = currentUserId.current;
    if (!id) return;

    const socket = getSocket();
    socket?.emit('typing', { to: userId, from: id });

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket?.emit('stopTyping', { to: userId, from: id });
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const lastSentByMe = [...messages].reverse().find(msg => msg.sender === currentUserId.current);

  return (
    <div style={container}>
      <div style={chatBox}>
        <h3 style={header}>
          {chatUser
            ? `Chat with ${chatUser.firstName} ${chatUser.lastName}`
            : 'Loading chat...'}
        </h3>

        <div style={messageContainer}>
          {messages.map((msg, i) => {
            const isMe = msg.sender === currentUserId.current;
            const text = decryptMessage(msg.content || msg.encryptedText);
            const senderName =
              typeof msg.sender === 'object'
                ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`
                : isMe
                ? localStorage.getItem('username')
                : `${chatUser?.firstName || ''} ${chatUser?.lastName || ''}`;

            return (
              <div key={i} style={{ textAlign: isMe ? 'right' : 'left', marginBottom: '0.5rem' }}>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: isMe ? '#007bff' : '#f0f0f0',
                  color: isMe ? '#fff' : '#000',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '16px',
                  maxWidth: '60%',
                  fontSize: '14px'
                }}>
                  {text}
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                  {formatTimestamp(msg.timestamp)} – {senderName}
                  {isMe && msg === lastSentByMe && (
                    <span style={{ marginLeft: '8px', color: msg.read ? 'green' : '#aaa' }}>
                      {msg.read ? '✓✓ Read' : '✓ Sent'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {typingStatus && <p style={{ fontSize: '13px', color: '#888' }}>{typingStatus}</p>}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} style={formStyle}>
          <input
            value={input}
            onChange={handleTyping}
            placeholder="Type a message..."
            style={inputStyle}
          />
          <button type="submit" style={sendBtn}>Send</button>
        </form>
      </div>
    </div>
  );
};

// Styles
const container = {
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '#f0f2f5',
  minHeight: '80vh',
  padding: '1rem',
};

const chatBox = {
  width: '100%',
  maxWidth: '650px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '1rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(85vh - 4rem)',
};

const header = {
  textAlign: 'center',
  marginBottom: '0.5rem',
  fontSize: '18px',
};

const messageContainer = {
  flexGrow: 1,
  overflowY: 'auto',
  padding: '0.5rem 0',
  marginBottom: '0.5rem',
};

const formStyle = {
  display: 'flex',
  gap: '0.5rem',
};

const inputStyle = {
  flex: 1,
  padding: '0.5rem',
  fontSize: '14px',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

const sendBtn = {
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default ChatView;
