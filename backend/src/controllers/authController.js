const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'eventhub_super_secret_jwt_key_2026_auth_token_secure!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, student_id, department, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default avatar based on name initials
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true`;

    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role, student_id, department, phone, avatar_url)
       VALUES (?, ?, ?, 'student', ?, ?, ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        student_id ? student_id.trim() : null,
        department ? department.trim() : null,
        phone ? phone.trim() : null,
        defaultAvatar
      ]
    );

    const newUserId = result.insertId;

    const [newUsers] = await db.query(
      'SELECT id, name, email, role, student_id, department, phone, avatar_url, created_at FROM users WHERE id = ?',
      [newUserId]
    );

    const user = newUsers[0];
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to EventHub.',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user account: ' + error.message
    });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const [users] = await db.query(
      'SELECT id, name, email, password, role, student_id, department, phone, avatar_url, created_at FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Don't send password hash in response
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        token,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
}

// GET /api/auth/profile
async function getProfile(req, res) {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, student_id, department, phone, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Also get stats for user
    const [regCounts] = await db.query(
      'SELECT COUNT(*) as total_registrations FROM registrations WHERE user_id = ? AND status != "Cancelled"',
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        user: users[0],
        totalRegistrations: regCounts[0] ? regCounts[0].total_registrations : 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res) {
  try {
    const { name, student_id, department, phone, avatar_url } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    await db.query(
      `UPDATE users
       SET name = ?, student_id = ?, department = ?, phone = ?, avatar_url = COALESCE(?, avatar_url), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name.trim(),
        student_id ? student_id.trim() : null,
        department ? department.trim() : null,
        phone ? phone.trim() : null,
        avatar_url || null,
        req.user.id
      ]
    );

    const [updatedUsers] = await db.query(
      'SELECT id, name, email, role, student_id, department, phone, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUsers[0]
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
