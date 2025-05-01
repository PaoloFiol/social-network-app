const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { register, login } = require('../controllers/authController');

router.post('/register', upload.single('profilePic'), register);
router.post('/login', login);

module.exports = router;
