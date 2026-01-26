#!/usr/bin/env node

/**
 * Deploy SQL Functions Script
 * 
 * This script deploys all date-sensitive SQL functions to the PostgreSQL database.
 * It reads all .sql files from the functions directory and executes them in order.
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../db/config/db');

const FUNCTIONS_DIR = path.join(__dirname, '../db/sql/functions');

// Function files in deployment order
const FUNCTION_FILES = [
  '01_basic_info_at_date.sql',
  '02_performance_at_date.sql',
  '03_rankings_at_date.sql',
  '04_ratings_at_date.sql',
  '05_fees_at_date.sql',
  '06_risk_at_date.sql',
  '07_flows_at_date.sql',
  '08_assets_at_date.sql'
];

const onlyIndex = process.argv.indexOf('--only');
const onlyFile = onlyIndex !== -1 ? process.argv[onlyIndex + 1] : null;

/**
 * Deploy a single SQL function file
 */
async function deployFunction(filename) {
  const filepath = path.join(FUNCTIONS_DIR, filename);
  
  console.log(`\n📄 Deploying: ${filename}`);
  
  try {
    if (filename === '05_fees_at_date.sql') {
      // Drop fee functions to allow return type changes
      const dropSql = `
        DROP FUNCTION IF EXISTS ms.fn_get_all_fees_at_date(TEXT[], DATE);
        DROP FUNCTION IF EXISTS ms.fn_get_fee_levels_at_date(TEXT[], DATE);
        DROP FUNCTION IF EXISTS ms.fn_get_prospectus_fees_at_date(TEXT[], DATE);
        DROP FUNCTION IF EXISTS ms.fn_get_annual_report_fees_at_date(TEXT[], DATE);
      `;
      await pool.query(dropSql);
    }
    // Read SQL file
    const sql = fs.readFileSync(filepath, 'utf8');
    
    // Execute SQL
    await pool.query(sql);
    
    console.log(`✅ Successfully deployed: ${filename}`);
    return { filename, success: true };
  } catch (error) {
    console.error(`❌ Failed to deploy: ${filename}`);
    console.error(`   Error: ${error.message}`);
    return { filename, success: false, error: error.message };
  }
}

/**
 * Deploy all functions
 */
async function deployAllFunctions() {
  console.log('🚀 Starting SQL Function Deployment');
  console.log('=' .repeat(60));
  
  const results = [];

  const filesToDeploy = onlyFile ? [onlyFile] : FUNCTION_FILES;

  for (const filename of filesToDeploy) {
    const result = await deployFunction(filename);
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Deployment Summary');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Functions:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.filename}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  return failed === 0;
}

/**
 * Verify functions were created
 */
async function verifyFunctions() {
  console.log('\n🔍 Verifying Functions...');
  
  const query = `
    SELECT 
      routine_name,
      routine_type,
      data_type as return_type
    FROM information_schema.routines
    WHERE routine_schema = 'ms'
      AND routine_name LIKE 'fn_get_%'
    ORDER BY routine_name;
  `;
  
  try {
    const result = await pool.query(query);
    
    console.log(`\n✅ Found ${result.rows.length} functions in 'ms' schema:`);
    result.rows.forEach(row => {
      console.log(`   - ${row.routine_name} (${row.routine_type})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to verify functions:', error.message);
    return false;
  }
}

/**
 * Create recommended indexes
 */
async function createIndexes() {
  console.log('\n📑 Creating Recommended Indexes...');
  
  const indexes = [
    {
      name: 'idx_basic_info_id_timestamp',
      table: 'fund_share_class_basic_info_ca_openend',
      columns: '_id, _timestampfrom, _timestampto'
    },
    {
      name: 'idx_performance_id_date_timestamp',
      table: 'month_end_trailing_total_returns_ca_openend',
      columns: '_id, monthenddate, _timestampfrom, _timestampto'
    },
    {
      name: 'idx_rankings_id_date_timestamp',
      table: 'month_end_trailing_total_return_percentile_and_absolute_ranks_c',
      columns: '_id, monthenddate, _timestampfrom, _timestampto'
    },
    {
      name: 'idx_ratings_id_date_timestamp',
      table: 'morningstar_rating_ca_openend',
      columns: '_id, ratingdate, _timestampfrom, _timestampto'
    },
    {
      name: 'idx_prospectus_fees_id_timestamp',
      table: 'prospectus_fees_ca_openend',
      columns: '_id, _timestampfrom, _timestampto'
    },
    {
      name: 'idx_risk_id_date_timestamp',
      table: 'risk_measure_ca_openend',
      columns: '_id, enddate, _timestampfrom, _timestampto'
    },
    {
      name: 'idx_flows_id_date_timestamp',
      table: 'fund_flow_details_ca_openend',
      columns: '_id, estfundlevelnetflowdatemoend, _timestampfrom, _timestampto'
    },
    {
      name: 'idx_assets_id_date_timestamp',
      table: 'fund_level_net_assets_ca_openend',
      columns: '_id, netassetsdate, _timestampfrom, _timestampto'
    }
  ];
  
  let created = 0;
  let skipped = 0;
  
  for (const index of indexes) {
    const sql = `
      CREATE INDEX IF NOT EXISTS ${index.name}
      ON ms.${index.table}(${index.columns});
    `;
    
    try {
      await pool.query(sql);
      console.log(`   ✅ ${index.name}`);
      created++;
    } catch (error) {
      console.log(`   ⚠️  ${index.name} (${error.message})`);
      skipped++;
    }
  }
  
  console.log(`\n📊 Index Summary: ${created} created, ${skipped} skipped`);
}

/**
 * Main execution
 */
async function main() {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
    
    // Deploy functions
    const success = await deployAllFunctions();
    
    if (!success) {
      console.error('\n❌ Deployment failed. Please fix errors and try again.');
      process.exit(1);
    }
    
    // Verify functions
    await verifyFunctions();
    
    // Create indexes
    await createIndexes();
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📚 Next Steps:');
    console.log('   1. Test functions with sample queries');
    console.log('   2. Update backend API controllers to use these functions');
    console.log('   3. Monitor query performance and adjust indexes as needed');
    console.log('\n📖 See server/db/sql/functions/README.md for usage examples');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { deployAllFunctions, verifyFunctions, createIndexes };
