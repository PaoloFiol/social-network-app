const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

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
  