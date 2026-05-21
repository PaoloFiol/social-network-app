const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.get('/chats', auth, messageController.getChatPartners);
router.get('/:userId', auth, messageController.getMessagesWithUser);
router.post('/', auth, messageController.sendMessage);
router.delete('/single/:messageId', auth, messageController.deleteMessageForMe);
router.delete('/:userId', auth, messageController.deleteMessagesWithUser);

module.exports = router;
