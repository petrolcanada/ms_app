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
app.use('/api/funds', fundsRouter);

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
    },
  });
});

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
