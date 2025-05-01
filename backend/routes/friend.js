const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendFriendRequest,
  getFriendRequests,
  respondToRequest,
  getFriendsList,
  removeFriend // ✅ Add this
} = require('../controllers/friendController');

// 📤 Send a friend request
router.post('/request', auth, sendFriendRequest);

// 📥 Get incoming friend requests
router.get('/requests', auth, getFriendRequests);

// ✅ Accept or Decline friend request
router.put('/respond', auth, respondToRequest);

// 🧑‍🤝‍🧑 Get list of current user's friends
router.get('/list', auth, getFriendsList);

// ❌ Remove a friend
router.put('/remove', auth, removeFriend); // ✅ Add this route

module.exports = router;
