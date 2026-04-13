const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches req.user = { id, role, email } on success.
 * Rejects with 401 if token is missing or invalid.
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Middleware factory: Restrict access to specific roles.
 * Usage: requireRole('admin') or requireRole('admin', 'moderator')
 * Must be used AFTER requireAuth.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires role: ${roles.join(' or ')}` });
    }

    next();
  };
};

/**
 * Middleware: Optional auth — if token exists, decode it, but don't block.
 * Useful for endpoints that behave differently for logged-in vs public users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.userId,
        role: decoded.role
      };
    }
  } catch (error) {
    // Token invalid — just proceed as unauthenticated
    req.user = null;
  }

  next();
};

module.exports = { requireAuth, requireRole, optionalAuth };
