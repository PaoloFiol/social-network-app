import React, { useEffect, useState, useRef } from 'react';
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
  const messagesEndRef = useRef(null);
  const isInitialLoad = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Helper function to normalize user IDs for comparison
  const normalizeId = (id) => {
    return id?.toString?.() || id;
  };

  // Helper function to check if message is from current user
  const isMessageFromCurrentUser = (message) => {
    const senderId = normalizeId(message.sender);
    const currentId = normalizeId(currentUserId.current);
    return senderId === currentId;
  };

  // Helper function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        sender: normalizeId(msg.sender?._id || msg.sender),
        receiver: normalizeId(msg.receiver?._id || msg.receiver)
      };

      if (
        (normalized.sender === userId && normalized.receiver === currentUserId.current) ||
        (normalized.sender === currentUserId.current && normalized.receiver === userId)
      ) {
        setMessages((prev) => [...prev, normalized]);
        // Scroll to bottom when new message is received
        setTimeout(scrollToBottom, 100);
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
        const normalizedMessages = res.data.map(msg => ({
          ...msg,
          sender: normalizeId(msg.sender?._id || msg.sender),
          receiver: normalizeId(msg.receiver?._id || msg.receiver)
        }));
        setMessages(normalizedMessages);
        const userRes = await API.get(`/users/id/${userId}`);
        setChatUser(userRes.data);
      } catch (err) {
        console.error('❌ Error loading chat:', err);
      }
    };
    fetchChat();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll when messages change

  useEffect(() => {
    // Initial scroll when component mounts
    scrollToBottom();
  }, []); // Empty dependency array means this runs once on mount

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
    // Scroll to bottom when sending a new message
    setTimeout(scrollToBottom, 100);

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

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const lastSentByMe = [...messages].reverse().find(msg => msg.sender === currentUserId.current);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  return (
    <div style={container}>
      <div style={header}>
        <div style={headerContent}>
          {chatUser ? (
            <Link to={`/profile/${chatUser.username}`} style={profileLink}>
              <div style={headerContent}>
                {chatUser.profilePic && (
                  <img 
                    src={chatUser.profilePic} 
                    alt="profile" 
                    style={profilePic}
                  />
                )}
                <div style={headerText}>
                  <div style={userName}>
                    {chatUser.firstName} {chatUser.lastName}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div style={userName}>Loading...</div>
          )}
        </div>
      </div>

      <div style={chatBox}>
        <div style={messageContainer} onScroll={handleScroll}>
          {messages.map((msg, i) => {
            const isMe = isMessageFromCurrentUser(msg);
            const text = decryptMessage(msg.content || msg.encryptedText);
            const senderName =
              typeof msg.sender === 'object'
                ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`
                : isMe
                ? localStorage.getItem('username')
                : `${chatUser?.firstName || ''} ${chatUser?.lastName || ''}`;

            return (
              <div key={i} style={messageWrapper(isMe)}>
                <div style={messageBubble(isMe)}>
                  {text}
                </div>
                <div style={messageMeta(isMe)}>
                  {formatTimestamp(msg.timestamp)}
                  {isMe && msg === lastSentByMe && (
                    <span style={readStatus(msg.read)}>
                      {msg.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {typingStatus && (
            <div style={typingIndicator}>
              <div style={typingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} style={formStyle}>
          <input
            value={input}
            onChange={handleTyping}
            placeholder="Type a message..."
            style={inputStyle}
          />
          <button type="submit" style={sendBtn}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

// Styles
const container = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#f0f2f5',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const header = {
  position: 'fixed',
  top: '60px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: '650px',
  height: '60px',
  backgroundColor: '#fff',
  borderBottom: '1px solid #e4e6eb',
  padding: '0 1rem',
  display: 'flex',
  alignItems: 'center',
  zIndex: 1000
};

const headerContent = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%'
};

const headerText = {
  display: 'flex',
  flexDirection: 'column'
};

const userName = {
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#1c1e21'
};

const profilePic = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  objectFit: 'cover'
};

const chatBox = {
  flex: 1,
  marginTop: '120px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  maxWidth: '650px',
  width: '100%',
  margin: '120px auto 0',
  height: 'calc(100vh - 120px)',
  '@media (max-width: 768px)': {
    maxWidth: '100%',
    margin: '120px 0 0'
  }
};

const messageContainer = {
  flex: 1,
  overflowY: 'auto',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  backgroundColor: '#f0f2f5'
};

const messageWrapper = (isMe) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: isMe ? 'flex-end' : 'flex-start',
  maxWidth: '70%',
  alignSelf: isMe ? 'flex-end' : 'flex-start'
});

const messageBubble = (isMe) => ({
  backgroundColor: isMe ? '#0084ff' : '#fff',
  color: isMe ? '#fff' : '#1c1e21',
  padding: '0.75rem 1rem',
  borderRadius: '18px',
  fontSize: '0.95rem',
  lineHeight: '1.4',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  wordBreak: 'break-word'
});

const messageMeta = (isMe) => ({
  fontSize: '0.75rem',
  color: '#65676b',
  marginTop: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0 0.5rem'
});

const readStatus = (read) => ({
  color: read ? '#0084ff' : '#65676b',
  fontSize: '0.8rem',
  marginLeft: '0.25rem'
});

const typingIndicator = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.5rem 1rem',
  backgroundColor: '#fff',
  borderRadius: '18px',
  alignSelf: 'flex-start',
  marginTop: '0.5rem'
};

const typingDots = {
  display: 'flex',
  gap: '0.25rem',
  '& span': {
    width: '8px',
    height: '8px',
    backgroundColor: '#65676b',
    borderRadius: '50%',
    animation: 'typing 1s infinite ease-in-out',
    '&:nth-child(2)': {
      animationDelay: '0.2s'
    },
    '&:nth-child(3)': {
      animationDelay: '0.4s'
    }
  }
};

const formStyle = {
  display: 'flex',
  gap: '0.5rem',
  padding: '1rem',
  backgroundColor: '#fff',
  borderTop: '1px solid #e4e6eb'
};

const inputStyle = {
  flex: 1,
  padding: '0.75rem 1rem',
  fontSize: '0.95rem',
  borderRadius: '20px',
  border: '1px solid #e4e6eb',
  backgroundColor: '#f0f2f5',
  outline: 'none',
  transition: 'border-color 0.2s',
  '&:focus': {
    borderColor: '#0084ff'
  }
};

const sendBtn = {
  backgroundColor: '#0084ff',
  color: '#fff',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  fontWeight: '600',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#0073e6'
  },
  '&:disabled': {
    backgroundColor: '#e4e6eb',
    cursor: 'not-allowed'
  }
};

// Add keyframes for typing animation
const keyframes = `
  @keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
`;

const profileLink = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%'
};

export default ChatView;
