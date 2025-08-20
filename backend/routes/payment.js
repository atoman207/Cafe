const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Payment routes
router.post('/create-payment-intent', auth, paymentController.createPaymentIntent);
router.post('/confirm-payment', auth, paymentController.confirmPayment);
router.get('/payment-methods', auth, paymentController.getPaymentMethods);
router.get('/pricing', paymentController.getPricing);

// Webhook route (no auth required as it's called by Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router; 