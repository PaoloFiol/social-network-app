const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1].trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: String(decoded.id), // ✅ ensure consistent string format
      username: decoded.username,
      role: decoded.role || 'user'
    };

    // Optional: for debugging auth issues
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 Authenticated user:', req.user);
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
