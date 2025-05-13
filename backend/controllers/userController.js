const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// 👤 Get the currently logged-in user's full profile (excluding password)
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

// 🔍 Get public profile by username
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

// 🧾 Get user by ID (used in ChatView)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('firstName lastName username');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user by ID', error: err.message });
  }
};

// ✏️ Update current user's profile
exports.updateMyProfile = async (req, res) => {
  try {
    const fields = ['email', 'firstName', 'lastName', 'aboutMe'];
    const updates = {};

    for (let key of fields) {
      if (req.body[key]) updates[key] = req.body[key];
    }

    if (req.body.city || req.body.state) {
      updates.location = {
        city: req.body.city || '',
        state: req.body.state || ''
      };
    }

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path);
      updates.profilePic = uploadRes.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
