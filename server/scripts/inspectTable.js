/**
 * CLI script to inspect table metadata
 * Usage: node scripts/inspectTable.js <schema> <table>
 * Example: node scripts/inspectTable.js ms fund_share_class_basic_info_ca_openend
 */

require('dotenv').config();
const { displayTableMetadata } = require('../utils/tableMetadata');
const { pool } = require('../config/db');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/inspectTable.js <schema> <table>');
    console.error('Example: node scripts/inspectTable.js ms fund_share_class_basic_info_ca_openend');
    process.exit(1);
  }
  
  const [schema, table] = args;
  
  try {
    await displayTableMetadata(schema, table);
    process.exit(0);
  } catch (err) {
    console.error('Failed to inspect table:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
