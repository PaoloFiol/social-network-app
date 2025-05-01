const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendFriendRequest,
  getFriendRequests,
  respondToRequest,
  getFriendsList
} = require('../controllers/friendController');

// 📤 Send a friend request
router.post('/request', auth, sendFriendRequest);

// 📥 Get incoming friend requests for logged-in user
router.get('/requests', auth, getFriendRequests);

// ✅ Accept / ❌ Decline friend request (use { requestId, action } in body)
router.put('/respond', auth, respondToRequest);

// 🧑‍🤝‍🧑 Get current user's friends
router.get('/list', auth, getFriendsList);

module.exports = router;
