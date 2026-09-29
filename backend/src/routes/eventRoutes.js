const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

// Admin Stats
router.get('/admin/stats', requireAuth, requireAdmin, eventController.getAdminStats);

// Public / Authenticated Event Discovery
router.get('/', optionalAuth, eventController.getAllEvents);
router.get('/:id', optionalAuth, eventController.getEventById);

// Admin CRUD Routes
router.post('/', requireAuth, requireAdmin, eventController.createEvent);
router.put('/:id', requireAuth, requireAdmin, eventController.updateEvent);
router.delete('/:id', requireAuth, requireAdmin, eventController.deleteEvent);

module.exports = router;
