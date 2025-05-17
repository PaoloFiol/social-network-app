const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, aboutMe, city, state } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'Username or email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePic = '';
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path);
      profilePic = upload.secure_url;
    }

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      aboutMe,
      location: { city, state },
      profilePic
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || 'user',
        profilePic: user.profilePic || ''
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 🔑 Request password reset
exports.forgotPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const resetToken = crypto.createHash('sha256').update(token).digest('hex');
    const expireTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expireTime;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail(user.email, 'Password Reset', `Click to reset: ${resetLink}`);

    res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset link', error: err.message });
  }
};

// 🔁 Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required in the URL' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'A new password of at least 8 characters is required' });
    }

    // Hash the token to compare against DB
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and check expiry
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token fields
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('❌ Error resetting password:', err);
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
};