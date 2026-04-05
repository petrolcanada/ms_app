const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, generateToken } = require('../middleware/auth');
const userService = require('../services/userService');
const { sendWelcome } = require('../services/emailService');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: { message: 'Valid email is required', status: 400 } });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: { message: 'Password must be at least 8 characters', status: 400 } });
    }

    const existing = await userService.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: { message: 'Email already registered', status: 409 } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userService.create({ email, passwordHash, name });
    const token = generateToken(user);

    sendWelcome(user.email, user.name).catch(() => {});

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid email or password', status: 401 } });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: { message: 'Invalid email or password', status: 401 } });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
  }),
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await userService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found', status: 404 } });
    }
    res.json({ user: { id: user.id, email: user.email, name: user.name, plan: user.plan, created_at: user.created_at } });
  }),
);

module.exports = router;
