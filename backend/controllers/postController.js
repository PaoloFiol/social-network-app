const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length > 500) {
      return res.status(400).json({ message: 'Invalid post content' });
    }

    let image = '';
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path);
      image = upload.secure_url;
    }

    const post = new Post({ user: req.user.id, text, image });
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('user', 'username firstName lastName profilePic')
      .populate('comments.user', 'username firstName lastName profilePic');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username firstName lastName profilePic')
      .populate('comments.user', 'username firstName lastName profilePic')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ user: user._id })
      .populate('user', 'username firstName lastName profilePic')
      .populate('comments.user', 'username firstName lastName profilePic')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user.id);
    if (alreadyLiked) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.commentOnPost = async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: 'Comment cannot be empty' });
      }
  
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
  
      post.comments.push({ user: req.user.id, text });
      await post.save();
  
      const updated = await Post.findById(post._id)
        .populate('user', 'username firstName lastName profilePic')
        .populate('comments.user', 'username firstName lastName profilePic'); // ✅ key fix
  
      res.json(updated); // ✅ return entire post
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  
  
  

exports.editPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length > 500) return res.status(400).json({ message: 'Invalid post text' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    post.text = text;
    await post.save();

    const updated = await Post.findById(post._id)
      .populate('user', 'username firstName lastName profilePic')
      .populate('comments.user', 'username firstName lastName profilePic');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });
  
      const comment = post.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
  
      if (comment.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
  
      // ✅ Proper way to remove a subdocument from an array
      post.comments.pull(req.params.commentId);
      await post.save();
  
      const updated = await Post.findById(req.params.postId)
        .populate('comments.user', 'username firstName lastName profilePic');
  
      res.json({ comments: updated.comments });
    } catch (err) {
      console.error('🔥 Error deleting comment:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  
  
  
  
  
