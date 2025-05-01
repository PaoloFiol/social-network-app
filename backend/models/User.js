const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true }
  },
  aboutMe: {
    type: String,
    maxlength: 200,
    default: ''
  },
  profilePic: {
    type: String,
    default: '' // Cloudinary URL
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
