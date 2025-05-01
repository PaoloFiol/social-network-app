const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({ message: 'receiverId is required.' });
  }

  if (receiverId === req.user.id) {
    return res.status(400).json({ message: 'You cannot send a request to yourself.' });
  }

  // Check if already friends
  const currentUser = await User.findById(req.user.id);
  if (currentUser.friends.includes(receiverId)) {
    return res.status(400).json({ message: 'You are already friends.' });
  }

  // Check for existing friend request (same direction)
  const existing = await FriendRequest.findOne({
    sender: req.user.id,
    receiver: receiverId,
    status: 'pending'
  });
  if (existing) {
    return res.status(400).json({ message: 'Friend request already sent.' });
  }

  // Check for reverse pending friend request
  const reverse = await FriendRequest.findOne({
    sender: receiverId,
    receiver: req.user.id,
    status: 'pending'
  });
  if (reverse) {
    return res.status(400).json({ message: 'This user already sent you a request.' });
  }

  // Create new request
  const request = new FriendRequest({ sender: req.user.id, receiver: receiverId });
  await request.save();

  const notification = new Notification({
    user: receiverId,
    fromUser: req.user.id,
    type: 'friend_request'
  });
  await notification.save();

  res.json({ message: 'Friend request sent.' });
};

exports.getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ receiver: req.user.id, status: 'pending' })
      .populate('sender', 'username firstName lastName profilePic');

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch friend requests', error: err.message });
  }
};

exports.respondToRequest = async (req, res) => {
    try {
      const { requestId, action } = req.body;
      if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
      }
  
      const request = await FriendRequest.findById(requestId);
      if (!request || request.receiver.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized or request not found' });
      }
  
      if (action === 'accept') {
        request.status = 'accepted';
        await request.save();
  
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { friends: request.sender } });
        await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: req.user.id } });
  
        // ✅ Delete associated notification
        await Notification.deleteOne({
          user: req.user.id,
          fromUser: request.sender,
          type: 'friend_request'
        });
  
        res.json({ message: 'Friend request accepted' });
      } else {
        request.status = 'declined';
        await request.save();
  
        // ✅ Delete associated notification
        await Notification.deleteOne({
          user: req.user.id,
          fromUser: request.sender,
          type: 'friend_request'
        });
  
        res.json({ message: 'Friend request declined' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error responding to request', error: err.message });
    }
  };
  

exports.getFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username firstName lastName profilePic');

    const sorted = user.friends.sort((a, b) =>
      a.username.localeCompare(b.username)
    );

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching friends list', error: err.message });
  }
};
