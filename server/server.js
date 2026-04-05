const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testConnection, pool } = require('./config/db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Stripe webhook needs raw body — mount BEFORE json parser
const checkoutRouter = require('./routes/checkout');
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please try again later', status: 429 } },
});
app.use('/api', globalLimiter);

// Stricter limiter for expensive endpoints
const heavyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Rate limit exceeded for this endpoint', status: 429 } },
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many auth attempts, please try again later', status: 429 } },
});

// ---------------------------------------------------------------------------
// Health / readiness
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', message: 'Database is reachable' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database is unreachable' });
  }
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
const fundsRouter = require('./routes/funds');
const categoriesRouter = require('./routes/categories');
const dashboardRouter = require('./routes/dashboard');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const watchlistRouter = require('./routes/watchlist');

app.use('/api/funds/screener', heavyLimiter);
app.use('/api/funds/domains', heavyLimiter);
app.use('/api/auth', authLimiter);

app.use('/api/funds', fundsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/checkout', checkoutRouter);

// ---------------------------------------------------------------------------
// Static files (production: serve built React app)
// ---------------------------------------------------------------------------
const publicDir = path.join(__dirname, 'public');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

// Import centralized error handlers
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 404 handler - must come after all valid routes
app.use(notFoundHandler);

// Centralized error handler - must be last middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await testConnection();
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully`);
      server.close(async () => {
        console.log('HTTP server closed');
        try {
          await pool.end();
          console.log('Database pool closed');
        } catch (err) {
          console.error('Error closing database pool:', err.message);
        }
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Forceful shutdown — could not close connections in time');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
