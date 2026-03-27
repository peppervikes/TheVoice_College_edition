const express = require('express');
const router = express.Router();
const objectController = require('../controllers/objectController');

// GET /api/search
router.get('/search', objectController.searchObjects);

// GET /api/object/:type/:id
router.get('/object/:type/:id', objectController.getObjectDetails);

// Admin Routes (Would normally be protected)
router.post('/admin/object', objectController.createObject);

module.exports = router;
