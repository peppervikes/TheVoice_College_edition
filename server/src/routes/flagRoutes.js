const express = require('express');
const router = express.Router();
const flagController = require('../controllers/flagController');

// Flag Routes
router.post('/', flagController.createFlag);
router.get('/', flagController.getFlags); // Admin

module.exports = router;
