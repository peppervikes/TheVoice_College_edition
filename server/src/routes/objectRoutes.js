const express = require('express');
const router = express.Router();
const objectController = require('../controllers/objectController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/search', objectController.searchObjects);
router.get('/universities', objectController.getUniversities);
router.get('/stats', objectController.getStats);
router.get('/object/:type/:id', objectController.getObjectDetails);

// Admin-only routes
router.post('/admin/object', requireAuth, requireRole('admin'), objectController.createObject);

module.exports = router;
