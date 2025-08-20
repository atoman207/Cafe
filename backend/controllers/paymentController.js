const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models').User;
const Joi = require('joi');

// Validation schema for payment intent creation
const createPaymentIntentSchema = Joi.object({
  amount: Joi.number().integer().min(100).required(), // Amount in cents
  currency: Joi.string().default('jpy')
});

// Validation schema for payment confirmation
const confirmPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
  paymentMethodId: Joi.string().optional()
});

// Create payment intent for membership upgrade
exports.createPaymentIntent = async (req, res) => {
  try {
    const { error } = createPaymentIntentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id: userId } = req.user;
    const { amount, currency = 'jpy' } = req.body;

    // Check if user exists and is not already paid
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.membershipStatus === 'paid') {
      return res.status(400).json({ message: 'User is already a paid member' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      metadata: {
        userId: userId,
        userEmail: user.email,
        membershipType: 'premium'
      },
      description: 'Runmap Premium Membership Upgrade'
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
};

// Confirm payment and upgrade membership
exports.confirmPayment = async (req, res) => {
  try {
    const { error } = confirmPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id: userId } = req.user;
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent) {
      return res.status(404).json({ message: 'Payment intent not found' });
    }

    // Verify payment intent belongs to this user
    if (paymentIntent.metadata.userId !== userId.toString()) {
      return res.status(403).json({ message: 'Payment intent does not belong to this user' });
    }

    // Check payment status
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        message: 'Payment not completed',
        status: paymentIntent.status 
      });
    }

    // Update user membership status
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ 
      membershipStatus: 'paid',
      notificationEnabled: true // Enable notifications for paid members
    });

    res.json({
      message: 'Membership upgraded successfully',
      membershipStatus: 'paid',
      paymentStatus: paymentIntent.status
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      message: 'Failed to confirm payment',
      error: error.message 
    });
  }
};

// Get payment methods for user
exports.getPaymentMethods = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get customer from Stripe or create one
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId
        }
      });
    }

    // Get payment methods for this customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card'
    });

    res.json({
      customerId: customer.id,
      paymentMethods: paymentMethods.data
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ 
      message: 'Failed to get payment methods',
      error: error.message 
    });
  }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update user membership if not already updated
      if (paymentIntent.metadata.userId) {
        try {
          const user = await User.findByPk(paymentIntent.metadata.userId);
          if (user && user.membershipStatus !== 'paid') {
            await user.update({ 
              membershipStatus: 'paid',
              notificationEnabled: true
            });
            console.log('User membership upgraded via webhook:', user.id);
          }
        } catch (error) {
          console.error('Error updating user membership via webhook:', error);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Get membership pricing information
exports.getPricing = async (req, res) => {
  try {
    const pricing = {
      premium: {
        name: 'Premium Membership',
        price: 330, // 330 JPY
        currency: 'jpy',
        features: [
          'イベントリマインダーのメール通知',
          '優先サポート',
          '高度なイベント絞り込み機能',
          'お気に入り登録数無制限'
        ],
        duration:'yearly'
      }
    };

    res.json(pricing);
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ 
      message: 'Failed to get pricing information',
      error: error.message 
    });
  }
}; 