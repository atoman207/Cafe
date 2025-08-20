const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Favorites
router.get('/favorites', auth, userController.getFavorites);
router.post('/favorites', auth, userController.addFavorite);
router.delete('/favorites/:eventId', auth, userController.removeFavorite);

// Profile
router.get('/profile', auth, userController.getProfile);
router.put('/profile/update', auth, userController.updateProfile);

// Notifications
router.get('/notifications', auth, userController.getNotifications);
router.get('/notifications/unread', auth, userController.getUnreadNotifications);
router.put('/notifications/update', auth, userController.updateNotifications);
router.put('/notifications/toggle', auth, userController.toggleNotificationEnabled);

router.post('/upgrade', auth, userController.upgradeMembership);

module.exports = router; 