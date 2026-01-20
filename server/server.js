const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { testConnection } = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API Routes
const fundsRouter = require('./routes/funds');
const categoriesRouter = require('./routes/categories');
app.use('/api/funds', fundsRouter);
app.use('/api/categories', categoriesRouter);

// Import centralized error handlers
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 404 handler - must come after all valid routes
app.use(notFoundHandler);

// Centralized error handler - must be last middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection before starting server
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
