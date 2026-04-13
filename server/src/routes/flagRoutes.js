const express = require('express');
const router = express.Router();
const flagController = require('../controllers/flagController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Protected — requires login to flag
router.post('/', requireAuth, flagController.createFlag);

// Admin/Moderator — view and manage flags
router.get('/', requireAuth, requireRole('admin', 'moderator'), flagController.getFlags);
router.put('/:id', requireAuth, requireRole('admin', 'moderator'), flagController.updateFlagStatus);

module.exports = router;
