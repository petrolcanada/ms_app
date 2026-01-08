/**
 * Quick test script to fetch a fund by ID
 * Usage: node scripts/testFundById.js <fund_id>
 * Example: node scripts/testFundById.js F00001ST3B
 */

require('dotenv').config();
const { pool } = require('../config/db');

async function testFundById(fundId) {
  try {
    console.log(`\nFetching fund with _id = "${fundId}"...\n`);
    
    const queryText = `
      SELECT *
      FROM ms.fund_share_class_basic_info_ca_openend
      WHERE _id = $1
    `;
    
    const result = await pool.query(queryText, [fundId]);
    
    if (result.rows.length === 0) {
      console.log('❌ Fund not found');
    } else {
      console.log('✅ Fund found!');
      console.log('\n' + '='.repeat(80));
      console.log('FUND DETAILS:');
      console.log('='.repeat(80));
      
      const fund = result.rows[0];
      
      // Display key fields
      console.log(`\nID: ${fund._id}`);
      console.log(`Name: ${fund.fundname || fund._name || 'N/A'}`);
      console.log(`Legal Name: ${fund.legalname || 'N/A'}`);
      console.log(`Ticker: ${fund.ticker || 'N/A'}`);
      console.log(`Category: ${fund.categoryname || 'N/A'}`);
      console.log(`Global Category: ${fund.globalcategoryname || 'N/A'}`);
      console.log(`Currency: ${fund.currency || 'N/A'}`);
      console.log(`Domicile: ${fund.domicile || 'N/A'}`);
      console.log(`Inception Date: ${fund.inceptiondate || 'N/A'}`);
      console.log(`Provider: ${fund.providercompanyname || 'N/A'}`);
      console.log(`Legal Structure: ${fund.legalstructure || 'N/A'}`);
      console.log(`Security Type: ${fund.securitytype || 'N/A'}`);
      
      console.log('\n' + '='.repeat(80));
      console.log(`\nTotal fields returned: ${Object.keys(fund).length}`);
      console.log('\nFull JSON response:');
      console.log(JSON.stringify(fund, null, 2));
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

// Get fund ID from command line
const fundId = process.argv[2];

if (!fundId) {
  console.error('Usage: node scripts/testFundById.js <fund_id>');
  console.error('Example: node scripts/testFundById.js F00001ST3B');
  process.exit(1);
}

testFundById(fundId)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
