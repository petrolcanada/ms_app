const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { planLimits } = require('../middleware/planGate');
const userService = require('../services/userService');

router.use(authenticate);

router.patch(
  '/profile',
  asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const user = await userService.updateProfile(req.user.id, { name, email });
    res.json({ user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
  }),
);

router.patch(
  '/password',
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: { message: 'New password must be at least 8 characters', status: 400 } });
    }

    const user = await userService.findById(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: { message: 'Current password is incorrect', status: 401 } });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userService.updatePassword(req.user.id, passwordHash);
    res.json({ message: 'Password updated' });
  }),
);

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    await userService.deleteUser(req.user.id);
    res.json({ message: 'Account deleted' });
  }),
);

router.get(
  '/subscription',
  asyncHandler(async (req, res) => {
    res.json({ plan: req.user.plan, limits: planLimits[req.user.plan] });
  }),
);

module.exports = router;
