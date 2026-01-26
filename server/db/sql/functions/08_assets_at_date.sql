-- =====================================================
-- Function: Get Net Assets at Specific Date
-- =====================================================
-- Table: fund_level_net_assets_ca_openend
-- Date Sensitivity: netassetsdate (time-series) + temporal tracking
-- Pattern: last record netassetsdate<=asofdate per _ID
-- This is a TIME-SERIES table with periodic asset data
-- =====================================================

CREATE OR REPLACE FUNCTION ms.fn_get_assets_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  -- Core Identifiers
  _id TEXT,
  _idtype TEXT,
  _name TEXT,
  
  -- Asset Dates
  netassetsdate TEXT,
  surveyedfundnetassetsdate TEXT,
  asoforiginalreporteddate TEXT,
  
  -- Net Assets
  fundnetassets NUMERIC,
  normalizedfundnetassets NUMERIC,
  surveyedfundnetassets NUMERIC,
  
  -- Original Reported Values
  asoforiginalreported NUMERIC,
  asoforiginalreportedcurrencyid TEXT,
  
  -- Metadata
  status_code NUMERIC,
  status_message TEXT
)
LANGUAGE sql
STABLE
AS $$
  -- Get net assets data where netassetsdate <= asofdate
  -- Pattern: last record netassetsdate<=asofdate per _ID
  SELECT DISTINCT ON (a._id)
    -- Core Identifiers
    a._id,
    a._idtype,
    a._name,
    
    -- Asset Dates
    a.netassetsdate,
    a.surveyedfundnetassetsdate,
    a.asoforiginalreporteddate,
    
    -- Net Assets
    a.fundnetassets::NUMERIC,
    a.normalizedfundnetassets::NUMERIC,
    a.surveyedfundnetassets::NUMERIC,
    
    -- Original Reported Values
    a.asoforiginalreported::NUMERIC,
    a.asoforiginalreportedcurrencyid,
    
    -- Metadata
    a.status_code,
    a.status_message
  FROM ms.fund_level_net_assets_ca_openend a
  WHERE a._id = ANY(p_fund_ids)
    -- Last record where netassetsdate <= asofdate
    AND a.netassetsdate <= p_asof_date::TEXT
  ORDER BY a._id, a.netassetsdate DESC;
$$;

-- =====================================================
-- Time-Series Query: Get Assets History
-- =====================================================

-- Get asset data for a date range
CREATE OR REPLACE FUNCTION ms.fn_get_assets_history(
  p_fund_id TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  _id TEXT,
  _name TEXT,
  netassetsdate TEXT,
  fundnetassets NUMERIC,
  normalizedfundnetassets NUMERIC,
  surveyedfundnetassets NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  -- Get ALL asset data points within the date range
  SELECT 
    a._id,
    a._name,
    a.netassetsdate,
    a.fundnetassets::NUMERIC,
    a.normalizedfundnetassets::NUMERIC,
    a.surveyedfundnetassets::NUMERIC
  FROM ms.fund_level_net_assets_ca_openend a
  WHERE a._id = p_fund_id
    -- Time-series filtering: get all data points in range
    AND a.netassetsdate >= p_start_date::TEXT
    AND a.netassetsdate <= p_end_date::TEXT
    -- Temporal filtering: use version valid at end date
    AND a._timestampfrom <= p_end_date
    AND p_end_date <= a.data_inserted_at
  ORDER BY a.netassetsdate ASC;
$$;

-- =====================================================
-- Usage Examples
-- =====================================================

-- Example 1: Get current assets for single fund
/*
SELECT 
  _id,
  _name,
  netassetsdate,
  fundnetassets,
  normalizedfundnetassets,
  surveyedfundnetassets,
  asoforiginalreported,
  asoforiginalreportedcurrencyid
FROM ms.fn_get_assets_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Example 2: Get assets as of specific historical date
/*
SELECT 
  _id,
  _name,
  netassetsdate,
  fundnetassets,
  normalizedfundnetassets
FROM ms.fn_get_assets_at_date(
  ARRAY['F00000ABCD'],
  '2024-06-30'::DATE
);
*/

-- Example 3: Compare assets across category
/*
WITH category_funds AS (
  SELECT ARRAY_AGG(DISTINCT _id) as fund_ids
  FROM ms.fund_share_class_basic_info_ca_openend
  WHERE categorycode = 'CAEQUITY'
    AND _timestampto IS NULL
)
SELECT 
  a._id,
  a._name,
  a.netassetsdate,
  a.fundnetassets,
  a.normalizedfundnetassets
FROM category_funds cf
CROSS JOIN LATERAL ms.fn_get_assets_at_date(cf.fund_ids, CURRENT_DATE) a
ORDER BY a.fundnetassets DESC NULLS LAST;
*/

-- Example 4: Get asset growth over time
/*
SELECT * FROM ms.fn_get_assets_history(
  'F00000ABCD',
  '2023-01-01'::DATE,
  '2024-12-31'::DATE
);
*/

-- Example 5: Get all asset metrics for multiple funds
/*
SELECT 
  _id,
  _name,
  netassetsdate,
  fundnetassets,
  normalizedfundnetassets,
  surveyedfundnetassets,
  surveyedfundnetassetsdate,
  asoforiginalreported,
  asoforiginalreporteddate,
  asoforiginalreportedcurrencyid
FROM ms.fn_get_assets_at_date(
  ARRAY['F00000ABCD', 'F00000EFGH', 'F00000IJKL'],
  CURRENT_DATE
);
*/

-- Example 6: Calculate asset growth
/*
WITH current_assets AS (
  SELECT 
    _id,
    _name,
    netassetsdate as current_date,
    fundnetassets as current_assets
  FROM ms.fn_get_assets_at_date(ARRAY['F00000ABCD'], CURRENT_DATE)
),
past_assets AS (
  SELECT 
    _id,
    netassetsdate as past_date,
    fundnetassets as past_assets
  FROM ms.fn_get_assets_at_date(ARRAY['F00000ABCD'], '2023-12-31'::DATE)
)
SELECT 
  c._id,
  c._name,
  c.current_date,
  c.current_assets,
  p.past_date,
  p.past_assets,
  (c.current_assets - p.past_assets) as asset_change,
  CASE 
    WHEN p.past_assets > 0 THEN 
      ((c.current_assets - p.past_assets) / p.past_assets * 100)
    ELSE NULL 
  END as pct_change
FROM current_assets c
JOIN past_assets p ON c._id = p._id;
*/

-- =====================================================
-- Notes
-- =====================================================
-- 1. fundnetassets: Total value of fund holdings (primary metric)
-- 2. normalizedfundnetassets: Assets normalized to common currency for comparison
-- 3. surveyedfundnetassets: Assets from fund surveys (may differ from reported)
-- 4. asoforiginalreported: Original reported value before currency conversion
-- 5. asoforiginalreportedcurrencyid: Currency of original reported value
-- 6. Asset data is typically updated monthly or quarterly
-- 7. Use normalized values for cross-fund comparisons
-- 8. Use fundnetassets for single-fund analysis
-- 9. Surveyed assets may be more current than reported assets
-- 10. Returns 18 columns total including all asset metrics and dates
-- 11. Asset size is a key indicator of fund popularity and liquidity
-- 12. Larger funds may have lower expense ratios due to economies of scale
