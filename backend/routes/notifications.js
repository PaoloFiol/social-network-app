const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getNotifications,
  markAsSeen,
  markOneAsSeen,
  deleteNotification // ✅ Add this import
} = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.put('/mark-seen', auth, markAsSeen);
router.put('/mark/:id', auth, markOneAsSeen);
router.delete('/:id', auth, deleteNotification); // ✅ DELETE route to remove notification

module.exports = router;
