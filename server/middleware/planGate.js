const planLimits = {
  free: { screenerLimit: 25, watchlistLimit: 5, compareLimit: 2 },
  pro: { screenerLimit: Infinity, watchlistLimit: Infinity, compareLimit: Infinity },
};

const requirePro = (req, res, next) => {
  if (req.user.plan !== 'pro') {
    return res.status(403).json({
      error: { message: 'Pro plan required', status: 403, upgrade: true },
    });
  }
  next();
};

const attachLimits = (req, res, next) => {
  req.planLimits = planLimits[req.user?.plan || 'free'];
  next();
};

module.exports = { requirePro, planLimits, attachLimits };
