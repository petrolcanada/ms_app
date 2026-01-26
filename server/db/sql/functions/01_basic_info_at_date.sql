-- =====================================================
-- Function: Get Fund Basic Info at Specific Date
-- =====================================================
-- Table: fund_share_class_basic_info_ca_openend
-- Date Sensitivity: Temporal tracking only (_timestampfrom, _timestampto)
-- Pattern: last record _timestampfrom<=asofdate and asofdate<=data_inserted_at per _ID
-- =====================================================

CREATE OR REPLACE FUNCTION ms.fn_get_basic_info_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  -- Core Identifiers
  _id TEXT,
  _idtype TEXT,
  _name TEXT,
  mstarid TEXT,
  ticker TEXT,
  fundid TEXT,
  performanceid TEXT,
  
  -- Fund Names
  legalname TEXT,
  fundlegalname TEXT,
  fundname TEXT,
  fundstandardname TEXT,
  previousfundname TEXT,
  previousfundnameenddate TEXT,
  
  -- Category Information
  categorycode TEXT,
  categoryname TEXT,
  categorycurrencyid TEXT,
  globalcategoryid TEXT,
  globalcategoryname TEXT,
  broadassetclass TEXT,
  broadcategorygroup TEXT,
  broadcategorygroupid TEXT,
  morningstarcategorygroupid TEXT,
  morningstarcategorygroupname TEXT,
  aggregatedcategoryname TEXT,
  
  -- Company Information
  providercompanyid TEXT,
  providercompanyname TEXT,
  providercompanyphonenumber TEXT,
  providercompanywebsite TEXT,
  advisorycompanyid TEXT,
  advisorycompanyname TEXT,
  brandingid TEXT,
  brandingname TEXT,
  umbrellacompanyid TEXT,
  umbrellacompanyname TEXT,
  custodiancompanyid TEXT,
  custodiancompanyname TEXT,
  
  -- Fund Characteristics
  producttype TEXT,
  securitytype TEXT,
  shareclasstype TEXT,
  legalstructure TEXT,
  productfocus TEXT,
  
  -- Dates
  inceptiondate TEXT,
  terminationdate TEXT,
  restructuredate TEXT,
  
  -- Geographic & Regulatory
  domicile TEXT,
  domicileid TEXT,
  currency TEXT,
  currencyid TEXT,
  _currencyid TEXT,
  exchangeid TEXT,
  registeredunder1940act TEXT,
  
  -- Distribution
  distributionfrequency TEXT,
  distributionstatus TEXT,
  dividenddistributionfrequencydetails TEXT,
  fixeddistribution TEXT,
  
  -- Risk & Strategy
  canadarisklevelverbal TEXT,
  canadatimehorizon TEXT,
  indexstrategybox TEXT,
  indexstrategyboxverbal TEXT,
  morningstarindexid TEXT,
  morningstarindexname TEXT,
  
  -- Investment Details
  prospectusobjective TEXT,
  investmentphilsophy TEXT,
  invesmtentdecisionmakingprocess TEXT,
  
  -- Status & Flags
  restrictedfund TEXT,
  highnetworth TEXT,
  operationready TEXT,
  performanceready TEXT,
  ukreportingstatus TEXT,
  ukreportingstartdate TEXT,
  
  -- Codes & Identifiers
  ific TEXT,
  mexcode TEXT,
  valor TEXT,
  wkn TEXT,
  amfcategory TEXT,
  ausinvestmentvehicleregionareacode TEXT,
  ausinvestmentvehicleregionareacodeisoalpha2 TEXT,
  
  -- Contact
  localphone TEXT,
  tollfreephone TEXT,
  
  -- Complex Fields (JSONB)
  distributorcompanies JSONB,
  fundservs JSONB,
  fundservdetails JSONB,
  globalfundreports JSONB,
  multilingualnames JSONB
)
LANGUAGE sql
STABLE
AS $$
  -- Get the version of basic info that was valid at the asof date
  -- Pattern: last record _timestampfrom<=asofdate and asofdate<=data_inserted_at per _ID
  SELECT DISTINCT ON (b._id)
    -- Core Identifiers
    b._id,
    b._idtype,
    b._name,
    b.mstarid,
    b.ticker,
    b.fundid,
    b.performanceid,
    
    -- Fund Names
    b.legalname,
    b.fundlegalname,
    b.fundname,
    b.fundstandardname,
    b.previousfundname,
    b.previousfundnameenddate,
    
    -- Category Information
    b.categorycode,
    b.categoryname,
    b.categorycurrencyid,
    b.globalcategoryid,
    b.globalcategoryname,
    b.broadassetclass,
    b.broadcategorygroup,
    b.broadcategorygroupid,
    b.morningstarcategorygroupid,
    b.morningstarcategorygroupname,
    b.aggregatedcategoryname,
    
    -- Company Information
    b.providercompanyid,
    b.providercompanyname,
    b.providercompanyphonenumber,
    b.providercompanywebsite,
    b.advisorycompanyid,
    b.advisorycompanyname,
    b.brandingid,
    b.brandingname,
    b.umbrellacompanyid,
    b.umbrellacompanyname,
    b.custodiancompanyid,
    b.custodiancompanyname,
    
    -- Fund Characteristics
    b.producttype,
    b.securitytype,
    b.shareclasstype,
    b.legalstructure,
    b.productfocus,
    
    -- Dates
    b.inceptiondate,
    b.terminationdate,
    b.restructuredate,
    
    -- Geographic & Regulatory
    b.domicile,
    b.domicileid,
    b.currency,
    b.currencyid,
    b._currencyid,
    b.exchangeid,
    b.registeredunder1940act,
    
    -- Distribution
    b.distributionfrequency,
    b.distributionstatus,
    b.dividenddistributionfrequencydetails,
    b.fixeddistribution,
    
    -- Risk & Strategy
    b.canadarisklevelverbal,
    b.canadatimehorizon,
    b.indexstrategybox,
    b.indexstrategyboxverbal,
    b.morningstarindexid,
    b.morningstarindexname,
    
    -- Investment Details
    b.prospectusobjective,
    b.investmentphilsophy,
    b.invesmtentdecisionmakingprocess,
    
    -- Status & Flags
    b.restrictedfund,
    b.highnetworth,
    b.operationready,
    b.performanceready,
    b.ukreportingstatus,
    b.ukreportingstartdate,
    
    -- Codes & Identifiers
    b.ific,
    b.mexcode,
    b.valor,
    b.wkn,
    b.amfcategory,
    b.ausinvestmentvehicleregionareacode,
    b.ausinvestmentvehicleregionareacodeisoalpha2,
    
    -- Contact
    b.localphone,
    b.tollfreephone,
    
    -- Complex Fields (JSONB)
    b.distributorcompanies,
    b.fundservs,
    b.fundservdetails,
    b.globalfundreports,
    b.multilingualnames
  FROM ms.fund_share_class_basic_info_ca_openend b
  WHERE b._id = ANY(p_fund_ids)
    -- Temporal filtering: _timestampfrom <= asofdate AND asofdate <= data_inserted_at
    AND b._timestampfrom <= p_asof_date
    AND p_asof_date <= b.data_inserted_at
  ORDER BY b._id, b._timestampfrom DESC;
$$;

-- =====================================================
-- Usage Examples
-- =====================================================

-- Example 1: Get basic info for single fund as of today
/*
SELECT 
  _id,
  _name,
  ticker,
  categoryname,
  providercompanyname,
  inceptiondate,
  producttype,
  securitytype
FROM ms.fn_get_basic_info_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Example 2: Get basic info for multiple funds as of specific date
/*
SELECT 
  _id,
  _name,
  categorycode,
  categoryname,
  broadassetclass,
  providercompanyname
FROM ms.fn_get_basic_info_at_date(
  ARRAY['F00000ABCD', 'F00000EFGH', 'F00000IJKL'],
  '2024-06-30'::DATE
);
*/

-- Example 3: Get all columns for a fund
/*
SELECT * FROM ms.fn_get_basic_info_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Example 4: Get basic info for all funds in a category as of specific date
/*
WITH category_funds AS (
  SELECT ARRAY_AGG(_id) as fund_ids
  FROM ms.fund_share_class_basic_info_ca_openend
  WHERE categorycode = 'CAEQUITY'
    AND _timestampto IS NULL
)
SELECT 
  b._id,
  b._name,
  b.ticker,
  b.providercompanyname,
  b.inceptiondate
FROM category_funds cf
CROSS JOIN LATERAL ms.fn_get_basic_info_at_date(cf.fund_ids, '2024-06-30'::DATE) b;
*/

-- =====================================================
-- Testing Queries
-- =====================================================

-- Test 1: Verify temporal filtering works
/*
-- This should return the version that was valid on 2023-01-01
SELECT 
  _id,
  _name,
  categorycode,
  providercompanyname,
  'As of 2023-01-01' as snapshot_date
FROM ms.fn_get_basic_info_at_date(
  ARRAY['F00000ABCD'],
  '2023-01-01'::DATE
);

-- Compare with current version
SELECT 
  _id,
  _name,
  categorycode,
  providercompanyname,
  'Current' as snapshot_date
FROM ms.fn_get_basic_info_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Test 2: Check performance with many funds
/*
EXPLAIN ANALYZE
SELECT * FROM ms.fn_get_basic_info_at_date(
  (SELECT ARRAY_AGG(_id) FROM ms.fund_share_class_basic_info_ca_openend WHERE _timestampto IS NULL LIMIT 100),
  CURRENT_DATE
);
*/

-- Test 3: Check JSONB fields
/*
SELECT 
  _id,
  _name,
  distributorcompanies,
  fundservs,
  multilingualnames
FROM ms.fn_get_basic_info_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- =====================================================
-- Notes
-- =====================================================
-- 1. This table has NO dedicated date column (like monthenddate)
-- 2. It uses temporal tracking: _timestampfrom <= asofdate <= data_inserted_at
-- 3. This represents "snapshot" data - fund characteristics at a point in time
-- 4. Use this to get fund metadata as it existed on a specific date
-- 5. Important for historical analysis when fund names/categories changed
-- 6. Returns 93 columns total including JSONB fields for complex data
-- 7. JSONB fields: distributorcompanies, fundservs, fundservdetails, globalfundreports, multilingualnames
