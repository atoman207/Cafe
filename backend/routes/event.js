const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public routes
router.get('/', eventController.getEvents);
router.get('/by-city-date', eventController.getEventsByCityAndDate);
router.get('/:id', eventController.getEvent);

// Protected routes (require authentication)
router.post('/apply', auth, eventController.applyForEvent);
router.get('/user/applications', auth, eventController.getUserApplications);
router.delete('/applications/:eventId', auth, eventController.cancelApplication);

// Admin routes
router.get('/:eventId/applications', auth, admin, eventController.getEventApplications);
router.put('/applications/:applicationId/status', auth, admin, eventController.updateApplicationStatus);

module.exports = router; 