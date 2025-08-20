const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// router.post('/', contactController.sendContactMessage);
router.post('/send-mail', contactController.sendMail);

module.exports = router; 