const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Student endpoints
router.get('/my-registrations', requireAuth, registrationController.getMyRegistrations);
router.post('/:eventId', requireAuth, registrationController.registerForEvent);
router.put('/:eventId/cancel', requireAuth, registrationController.cancelRegistration);

// Admin endpoints
router.get('/admin/all-participants', requireAuth, requireAdmin, registrationController.getAllParticipants);
router.get('/events/:eventId/participants', requireAuth, requireAdmin, registrationController.getEventParticipants);
router.patch('/:id/status', requireAuth, requireAdmin, registrationController.updateRegistrationStatus);

module.exports = router;
