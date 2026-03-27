const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/google
router.post('/google', authController.googleLogin);

// POST /api/auth/login
router.post('/login', authController.localLogin);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
