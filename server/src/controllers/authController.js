const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    // In a real app, verify `token` with google-auth-library
    // Here we'll just simulate an auth process structure
    
    // Fake decode for MVP
    const email = "user@example.com"; 
    const pseudonym = "Anonymous" + Math.floor(Math.random() * 1000);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        authProvider: 'google',
        pseudonym,
      });
    }

    const jwtToken = generateToken(user._id, user.role);

    // Set cookie or return in response (using response for simplicity here or add cookie-parser if we want httpOnly cookies)
    res.json({ success: true, token: jwtToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.localLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, authProvider: 'local' });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  // Clear cookie or just return success if using localStorage
  res.json({ success: true });
};
