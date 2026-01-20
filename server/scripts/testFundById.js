/**
 * Quick test script to fetch a fund by ID
 * Usage: node scripts/testFundById.js <fund_id>
 * Example: node scripts/testFundById.js F00001ST3B
 */

require('dotenv').config();
const { pool } = require('../config/db');

async function testFundById(fundId) {
  try {
    console.log(`\nFetching fund with _id = "${fundId}" from latest materialized view...\n`);
    
    const queryText = `
      SELECT 
        data_inserted_at,
        status_code,
        status_message,
        _id,
        _idtype,
        amfcategory,
        ausinvestmentvehicleregionareacode,
        ausinvestmentvehicleregionareacodeisoalpha2,
        advisorycompanyid,
        advisorycompanyname,
        aggregatedcategoryname,
        brandingid,
        brandingname,
        broadassetclass,
        broadcategorygroup,
        broadcategorygroupid,
        canadarisklevelverbal,
        canadatimehorizon,
        categorycode,
        categorycurrencyid,
        categoryname,
        currency,
        currencyid,
        custodiancompanyid,
        custodiancompanyname,
        distributionfrequency,
        distributionstatus,
        distributorcompanies,
        dividenddistributionfrequencydetails,
        domicile,
        domicileid,
        exchangeid,
        fixeddistribution,
        fundid,
        fundlegalname,
        fundname,
        fundservdetails,
        fundservs,
        fundstandardname,
        globalcategoryid,
        globalcategoryname,
        globalfundreports,
        highnetworth,
        ific,
        inceptiondate,
        indexstrategybox,
        indexstrategyboxverbal,
        invesmtentdecisionmakingprocess,
        investmentphilsophy,
        legalname,
        legalstructure,
        localphone,
        mexcode,
        mstarid,
        morningstarindexid,
        morningstarindexname,
        multilingualnames,
        operationready,
        performanceid,
        performanceready,
        previousfundname,
        previousfundnameenddate,
        productfocus,
        producttype,
        providercompanyid,
        providercompanyname,
        providercompanyphonenumber,
        providercompanywebsite,
        registeredunder1940act,
        restrictedfund,
        restructuredate,
        securitytype,
        shareclasstype,
        terminationdate,
        ticker,
        tollfreephone,
        ukreportingstartdate,
        ukreportingstatus,
        umbrellacompanyid,
        umbrellacompanyname,
        valor,
        wkn,
        _name,
        _hashkey,
        _runid,
        _timestampfrom,
        _timestampto,
        fault_faultstring,
        fault_detail_errorcode,
        morningstarcategorygroupid,
        morningstarcategorygroupname,
        _currencyid,
        prospectusobjective
      FROM ms.mv_fund_share_class_basic_info_ca_openend_latest
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
