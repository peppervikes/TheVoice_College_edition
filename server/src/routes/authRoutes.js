const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// POST /api/auth/register — Create a new account
router.post('/register', authController.register);

// POST /api/auth/login — Email + password login
router.post('/login', authController.localLogin);

// POST /api/auth/google — Google OAuth login
router.post('/google', authController.googleLogin);

// GET /api/auth/me — Get current user info (protected)
router.get('/me', requireAuth, authController.getMe);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
