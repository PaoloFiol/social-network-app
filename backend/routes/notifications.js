const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getNotifications,
  markAsSeen,
  markOneAsSeen,
  deleteNotification
} = require('../controllers/notificationController');

// ✅ Get all notifications for the logged-in user
router.get('/', auth, getNotifications);

// ✅ Mark all notifications as seen
router.put('/mark-seen', auth, markAsSeen);

// ✅ Mark a single notification as seen
router.put('/mark/:id', auth, markOneAsSeen);

// ✅ Delete a notification
router.delete('/:id', auth, deleteNotification);

module.exports = router;
