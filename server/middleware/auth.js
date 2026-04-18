const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect route: requires valid JWT ────────────
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

// ── Role-based access ────────────────────────────
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action.`,
      });
    }
    next();
  };
};

// ── Optional auth (attach user if token present) ─
exports.optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      req.user = null;
    }
  }
  next();
};
