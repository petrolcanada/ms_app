const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DATABASE || 'postgres',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err.message);
    throw err;
  }
};

module.exports = {
  pool,
  testConnection,
};
