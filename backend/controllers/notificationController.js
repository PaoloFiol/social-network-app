const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('fromUser', 'username firstName lastName profilePic')
      .sort({ createdAt: -1 });

    res.json(notifications.map(n => ({
      _id: n._id,
      type: n.type,
      seen: n.seen,
      createdAt: n.createdAt,
      fromUser: n.fromUser ? {
        _id: n.fromUser._id,
        username: n.fromUser.username,
        firstName: n.fromUser.firstName,
        lastName: n.fromUser.lastName,
        profilePic: n.fromUser.profilePic
      } : null
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, seen: false }, { seen: true });
    res.json({ message: 'Notifications marked as seen' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as seen', error: err.message });
  }
};

exports.markOneAsSeen = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { seen: true },
      { new: true }
    );

    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification marked as seen', notification: notif });
  } catch (err) {
    res.status(500).json({ message: 'Error marking notification as seen', error: err.message });
  }
};

exports.getUnseenCount = async (req, res) => {
    try {
      const count = await Notification.countDocuments({ user: req.user.id, seen: false });
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch unseen count', error: err.message });
    }
  };
  

exports.deleteNotification = async (req, res) => {
  try {
    const result = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!result) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting notification', error: err.message });
  }
};
