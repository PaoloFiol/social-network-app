const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// 📃 Get all chat partners with their latest message
router.get('/chats', auth, messageController.getChatPartners);

// 📥 Get full message history with a specific user
router.get('/:userId', auth, messageController.getMessagesWithUser);

// 📩 Save a new encrypted message
router.post('/', auth, messageController.sendMessage);

// 🗑️ Soft-delete messages from current user's view (only hides from their side)
router.delete('/:userId', auth, messageController.deleteMessagesWithUser);

module.exports = router;
