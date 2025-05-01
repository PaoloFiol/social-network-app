const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

exports.getMyProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

exports.getUserProfile = async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

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
