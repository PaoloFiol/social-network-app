const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getMyProfile,
  getUserProfile,
  updateMyProfile
} = require('../controllers/userController');

router.get('/me', auth, getMyProfile);
router.get('/:username', getUserProfile); // public profile
router.put('/edit', auth, upload.single('profilePic'), updateMyProfile);

// ❌ Removed friend request actions — moved to friendController

module.exports = router;
