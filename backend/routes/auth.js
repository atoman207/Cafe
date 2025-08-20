const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);
// Refresh token
router.post('/refresh', authController.refreshToken);
// Logout
router.post('/logout', auth, authController.logout);

module.exports = router; 