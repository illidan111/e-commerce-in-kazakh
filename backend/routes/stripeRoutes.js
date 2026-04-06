import express from 'express';
import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// @desc    Create payment intent
// @route   POST /api/stripe/create-payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'kzt',
    metadata: { orderId },
  });

  res.status(200).json({
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc    Stripe webhook handler
// @route   POST /api/stripe/webhook
// @access  Public
const webhookHandler = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// @desc    Get Stripe public key
// @route   GET /api/stripe/config
// @access  Public
const getStripeConfig = asyncHandler(async (req, res) => {
  res.status(200).json({
    publicKey: process.env.STRIPE_PUBLIC_KEY,
  });
});

router.post('/create-payment-intent', createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);
router.get('/config', getStripeConfig);

export default router;
