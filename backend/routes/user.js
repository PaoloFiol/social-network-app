const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getMyProfile,
  getUserProfile,
  getUserById,
  updateMyProfile
} = require('../controllers/userController');

router.get('/me', auth, getMyProfile);
router.get('/id/:id', auth, getUserById);        // ✅ new route for ChatView.js
router.get('/:username', getUserProfile);        // public profile by username
router.put('/edit', auth, upload.single('profilePic'), updateMyProfile);

module.exports = router;
