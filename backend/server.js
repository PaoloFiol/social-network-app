// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const friendRoutes = require('./routes/friend');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/message');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// WebSocket Events
io.on('connection', socket => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('joinChat', ({ userId }) => {
    if (!userId || typeof userId !== 'string') {
      console.warn('⚠️ joinChat received without a valid userId:', userId);
      return;
    }

    socket.join(userId);
    console.log(`🟢 User ${userId} joined their personal chat room`);
  });

  socket.on('privateMessage', msg => {
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

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`✅ Backend running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

module.exports = { app, server, io };
