const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const {
  register,
  login,
  forgotPasswordEmail,
  resetPassword
} = require('../controllers/authController'); // ✅ make sure these are imported

// Routes
router.post('/register', upload.single('profilePic'), register);
router.post('/login', login);
router.post('/forgot-password', forgotPasswordEmail); // ✅ must be defined
router.post('/reset-password/:token', resetPassword); // ✅ must be defined

module.exports = router;
