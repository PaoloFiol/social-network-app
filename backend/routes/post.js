const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createPost,
  getAllPosts,
  getUserPosts,
  likePost,
  commentOnPost,
  deletePost,
  editPost,
  deleteComment
} = require('../controllers/postController');

// Main routes
router.post('/', auth, upload.single('image'), createPost);
router.get('/', getAllPosts);
router.get('/user/:username', getUserPosts);
router.put('/:id/like', auth, likePost);
router.put('/:id/comment', auth, commentOnPost);
router.put('/:id/edit', auth, editPost);
router.delete('/:id', auth, deletePost);
router.delete('/:postId/comments/:commentId', auth, deleteComment);

// ✅ Debug route to test populated comment.user
router.get('/debug/:id', async (req, res) => {
  try {
    const post = await require('../models/Post')
      .findById(req.params.id)
      .populate('user', 'username')
      .populate('comments.user', 'username firstName lastName profilePic');

    res.json(post.comments); // Only return the populated comments
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch post for debug', error: err.message });
  }
});

module.exports = router;
