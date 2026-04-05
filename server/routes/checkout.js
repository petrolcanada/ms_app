const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const userService = require('../services/userService');
const { sendSubscriptionConfirm } = require('../services/emailService');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const stripe = STRIPE_SECRET_KEY ? require('stripe')(STRIPE_SECRET_KEY) : null;

router.post(
  '/create-session',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: { message: 'Payments not configured', status: 503 } });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: req.user.email,
      metadata: { userId: req.user.id },
      success_url: `${CLIENT_URL}?checkout=success`,
      cancel_url: `${CLIENT_URL}?checkout=cancel`,
    });

    res.json({ url: session.url });
  }),
);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: { message: 'Webhooks not configured', status: 503 } });
    }

    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).json({ error: { message: `Webhook signature verification failed: ${err.message}`, status: 400 } });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId) {
          await userService.updatePlan(userId, 'pro', session.customer);
          const updatedUser = await userService.findById(userId);
          if (updatedUser) {
            sendSubscriptionConfirm(updatedUser.email, updatedUser.name).catch(() => {});
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const { pool } = require('../config/db');
        const { rows } = await pool.query(
          'SELECT id FROM users WHERE stripe_customer_id = $1',
          [customerId],
        );
        if (rows.length > 0) {
          await userService.updatePlan(rows[0].id, 'free', customerId);
        }
        break;
      }
    }

    res.json({ received: true });
  }),
);

router.post(
  '/portal',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: { message: 'Payments not configured', status: 503 } });
    }

    const user = await userService.findById(req.user.id);
    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: { message: 'No billing account found', status: 400 } });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: CLIENT_URL,
    });

    res.json({ url: session.url });
  }),
);

router.get(
  '/subscription',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await userService.findById(req.user.id);
    res.json({
      plan: user.plan,
      stripe_customer_id: user.stripe_customer_id || null,
    });
  }),
);

module.exports = router;
