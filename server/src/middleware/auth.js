const jwt = require('jsonwebtoken');

/**
 * authenticate middleware
 * Reads Bearer token from Authorization header, verifies it,
 * and attaches decoded payload { id, role } to req.user.
 * Returns 401 if the token is missing or invalid.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * authorize(...allowedRoles) middleware factory
 * Returns a middleware that checks req.user.role is in the allowedRoles list.
 * Returns 403 if the role is not permitted.
 *
 * Usage: router.get('/admin-only', authenticate, authorize('Admin'), handler)
 * Usage: router.get('/managers', authenticate, authorize('Admin', 'AssetManager'), handler)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
