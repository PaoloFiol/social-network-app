// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// ✅ Global Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://social-network-app-pi.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/posts', require('./routes/post'));
app.use('/api/friends', require('./routes/friend'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/message'));

// ✅ Serve React frontend in production
/*if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}*/

// ✅ WebSocket Events
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('joinChat', ({ userId }) => {
    if (!userId || typeof userId !== 'string') {
      console.warn('⚠️ joinChat received without a valid userId:', userId);
      return;
    }
    socket.join(userId);
    console.log(`🟢 User ${userId} joined their personal chat room`);
  });

  socket.on('privateMessage', (msg) => {
    const to = msg.receiver || msg.to;
    const from = msg.sender || msg.from;

    if (!to || !from) {
      console.warn('⚠️ privateMessage missing "to" or "from":', msg);
      return;
    }

    console.log(`📤 Message from ${from} to ${to}`);
    io.to(to.toString()).emit('privateMessage', msg);
  });

  socket.on('typing', ({ to, from }) => {
    if (to && from) {
      io.to(to.toString()).emit('typing', { from });
    }
  });

  socket.on('stopTyping', ({ to, from }) => {
    if (to && from) {
      io.to(to.toString()).emit('stopTyping', { from });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ✅ MongoDB connection and server launch
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Backend running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

module.exports = { app, server, io };
