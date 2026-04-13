const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * POST /api/auth/register
 * Register a new user with email + password.
 */
exports.register = async (req, res) => {
  try {
    const { email, password, pseudonym } = req.body;

    // Validate input
    if (!email || !password || !pseudonym) {
      return res.status(400).json({ error: 'Email, password, and pseudonym are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      passwordHash,
      authProvider: 'local',
      pseudonym,
      role: 'user'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        pseudonym: user.pseudonym,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/auth/login
 * Login with email + password (local auth).
 */
exports.localLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email, authProvider: 'local' });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        pseudonym: user.pseudonym,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/auth/google
 * Login/register via Google OAuth.
 * Expects { credential: "google_id_token" } from Google Sign-In button.
 * 
 * If GOOGLE_CLIENT_ID is not set, falls back to a development stub
 * that accepts any token for testing.
 */
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required.' });
    }

    let email, name, googleId;

    if (process.env.GOOGLE_CLIENT_ID) {
      // --- PRODUCTION: Verify real Google token ---
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name || payload.email.split('@')[0];
      googleId = payload.sub;
    } else {
      // --- DEVELOPMENT STUB: Accept any token for testing ---
      // In dev, send { credential: "test" } to create a test user
      email = `testuser_${Date.now()}@dev.local`;
      name = 'DevUser';
      googleId = `dev-${Date.now()}`;
      console.warn('⚠️  GOOGLE_CLIENT_ID not set — using dev stub for Google login.');
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        authProvider: 'google',
        providerId: googleId,
        pseudonym: name + Math.floor(Math.random() * 100),
        role: 'user'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        pseudonym: user.pseudonym,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google authentication failed.' });
  }
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user's info.
 * Requires: requireAuth middleware.
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      id: user._id,
      email: user.email,
      pseudonym: user.pseudonym,
      role: user.role,
      authProvider: user.authProvider,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/auth/logout
 * Logout (client-side token removal; server-side is a no-op for stateless JWT).
 */
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
