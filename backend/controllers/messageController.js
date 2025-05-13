const Message = require('../models/Message');
const User = require('../models/User');

// 📩 Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, encryptedText } = req.body;

    if (!receiverId || !encryptedText) {
      return res.status(400).json({ message: 'receiverId and encryptedText are required.' });
    }

    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content: encryptedText
    });

    await message.save();

    // Populate sender and receiver for client consistency
    const populated = await message.populate('sender receiver', 'firstName lastName username');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// 📥 Get chat history with a specific user (excluding deleted)
exports.getMessagesWithUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ],
      deletedFor: { $ne: req.user.id } // Exclude messages deleted for current user
    })
      .sort({ timestamp: 1 })
      .populate('sender', 'firstName lastName username')
      .populate('receiver', 'firstName lastName username');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

// 📃 List users you've chatted with (with latest message)
exports.getChatPartners = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
      deletedFor: { $ne: req.user.id }
    }).populate('sender receiver', 'username firstName lastName profilePic');

    const chatMap = {};

    for (let msg of messages) {
      const user = msg.sender._id.toString() === req.user.id ? msg.receiver : msg.sender;
      const userId = user._id.toString();

      if (!chatMap[userId] || chatMap[userId].lastMessage.timestamp < msg.timestamp) {
        chatMap[userId] = { user, lastMessage: msg };
      }
    }

    res.json(Object.values(chatMap));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat partners', error: err.message });
  }
};

// 🗑️ Soft-delete messages from current user's view
exports.deleteMessagesWithUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    const result = await Message.updateMany(
      {
        $or: [
          { sender: currentUserId, receiver: userId },
          { sender: userId, receiver: currentUserId }
        ]
      },
      {
        $addToSet: { deletedFor: currentUserId }
      }
    );

    res.json({ message: 'Messages hidden from your view.', result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete messages', error: err.message });
  }
};
