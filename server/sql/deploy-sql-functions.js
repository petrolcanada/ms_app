#!/usr/bin/env node

/*
  Deploy SQL functions to PostgreSQL using the shared pool in server/config/db.js.
  Usage:
    node server/sql/deploy-sql-functions.js
*/

const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('../config/db');

const FUNCTIONS_DIR = path.join(__dirname, 'functions');
const FUNCTION_FILES = [
  '01_basic_info_at_date.sql',
  '02_performance_at_date.sql',
  '03_rankings_at_date.sql',
  '04_ratings_at_date.sql',
  '05_fees_at_date.sql',
  '06_risk_at_date.sql',
  '07_flows_at_date.sql',
  '08_assets_at_date.sql',
];

async function deployFunction(fileName) {
  const filePath = path.join(FUNCTIONS_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing SQL file: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
}

async function deployAll() {
  console.log('Starting SQL function deployment');
  console.log('============================================================');

  for (const fileName of FUNCTION_FILES) {
    console.log(`Deploying: ${fileName}`);
    await deployFunction(fileName);
    console.log(`Deployed: ${fileName}`);
  }

  console.log('============================================================');
  console.log(`Deployment complete. Total functions: ${FUNCTION_FILES.length}`);
}

async function main() {
  try {
    await testConnection();
    await deployAll();
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
