const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'eventhub_super_secret_jwt_key_2026_auth_token_secure!';

// Verify JWT token and attach user to req
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing or invalid'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token'
      });
    }

    // Fetch latest user details from DB
    const [users] = await db.query(
      'SELECT id, name, email, role, student_id, department, phone, avatar_url FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
}

// Restrict route to specific roles
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role only. Current role: '${req.user.role}'`
      });
    }

    next();
  };
}

// Convenience alias for admin only
const requireAdmin = requireRole('admin');

// Optional auth: populate req.user if token exists, but don't reject if not
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const [users] = await db.query(
        'SELECT id, name, email, role, student_id, department, phone, avatar_url FROM users WHERE id = ?',
        [decoded.id]
      );
      if (users && users.length > 0) {
        req.user = users[0];
      }
    }
  } catch (err) {
    // Ignore invalid optional tokens
  }
  next();
}

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  optionalAuth
};
