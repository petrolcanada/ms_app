-- =====================================================
-- Function: Get Fund Flow Data at Specific Date
-- =====================================================
-- Table: fund_flow_details_ca_openend
-- Date Sensitivity: estfundlevelnetflowdatemoend (time-series) + temporal tracking
-- Pattern: last record estfundlevelnetflowdatemoend<=asofdate per _ID
-- This is a TIME-SERIES table with monthly flow data
-- =====================================================

CREATE OR REPLACE FUNCTION ms.fn_get_flows_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  -- Core Identifiers
  _id TEXT,
  _idtype TEXT,
  _name TEXT,
  _currencyid TEXT,
  
  -- Fund Level Net Flows (Month-End)
  estfundlevelnetflowdatemoend TEXT,
  estfundlevelnetflow1momoend NUMERIC,
  estfundlevelnetflow3momoend NUMERIC,
  estfundlevelnetflow6momoend NUMERIC,
  estfundlevelnetflow1yrmoend NUMERIC,
  estfundlevelnetflow3yrmoend NUMERIC,
  estfundlevelnetflow5yrmoend NUMERIC,
  estfundlevelnetflow10yrmoend NUMERIC,
  estfundlevelnetflow15yrmoend NUMERIC,
  estfundlevelnetflowytdmoend NUMERIC,
  
  -- Share Class Net Flows (Month-End)
  estshareclassnetflowdatemoend TEXT,
  estshareclassnetflow1momoend NUMERIC,
  estshareclassnetflow3momoend NUMERIC,
  estshareclassnetflow6momoend NUMERIC,
  estshareclassnetflow1yrmoend NUMERIC,
  estshareclassnetflow3yrmoend NUMERIC,
  estshareclassnetflow5yrmoend NUMERIC,
  estshareclassnetflow10yrmoend NUMERIC,
  estshareclassnetflow15yrmoend NUMERIC,
  estshareclassnetflowytdmoend NUMERIC,
  
  -- Net Flows (Quarter-End)
  estnetflowdateqtrend TEXT,
  estnetflow1moqtrend NUMERIC,
  estnetflow3moqtrend NUMERIC,
  estnetflow6moqtrend NUMERIC,
  estnetflow1yrqtrend NUMERIC,
  estnetflow3yrqtrend NUMERIC,
  estnetflow5yrqtrend NUMERIC,
  estnetflow10yrqtrend NUMERIC,
  
  -- Metadata
  status_code NUMERIC,
  status_message TEXT,
  fault_faultstring TEXT,
  fault_detail_errorcode TEXT
)
LANGUAGE sql
STABLE
AS $$
  -- Get flow data where estfundlevelnetflowdatemoend <= asofdate
  -- Pattern: last record estfundlevelnetflowdatemoend<=asofdate per _ID
  SELECT DISTINCT ON (f._id)
    -- Core Identifiers
    f._id,
    f._idtype,
    f._name,
    f._currencyid,
    
    -- Fund Level Net Flows (Month-End)
    f.estfundlevelnetflowdatemoend,
    f.estfundlevelnetflow1momoend::NUMERIC,
    f.estfundlevelnetflow3momoend::NUMERIC,
    f.estfundlevelnetflow6momoend::NUMERIC,
    f.estfundlevelnetflow1yrmoend::NUMERIC,
    f.estfundlevelnetflow3yrmoend::NUMERIC,
    f.estfundlevelnetflow5yrmoend::NUMERIC,
    f.estfundlevelnetflow10yrmoend::NUMERIC,
    f.estfundlevelnetflow15yrmoend::NUMERIC,
    f.estfundlevelnetflowytdmoend::NUMERIC,
    
    -- Share Class Net Flows (Month-End)
    f.estshareclassnetflowdatemoend,
    f.estshareclassnetflow1momoend::NUMERIC,
    f.estshareclassnetflow3momoend::NUMERIC,
    f.estshareclassnetflow6momoend::NUMERIC,
    f.estshareclassnetflow1yrmoend::NUMERIC,
    f.estshareclassnetflow3yrmoend::NUMERIC,
    f.estshareclassnetflow5yrmoend::NUMERIC,
    f.estshareclassnetflow10yrmoend::NUMERIC,
    f.estshareclassnetflow15yrmoend::NUMERIC,
    f.estshareclassnetflowytdmoend::NUMERIC,
    
    -- Net Flows (Quarter-End)
    f.estnetflowdateqtrend,
    f.estnetflow1moqtrend::NUMERIC,
    f.estnetflow3moqtrend::NUMERIC,
    f.estnetflow6moqtrend::NUMERIC,
    f.estnetflow1yrqtrend::NUMERIC,
    f.estnetflow3yrqtrend::NUMERIC,
    f.estnetflow5yrqtrend::NUMERIC,
    f.estnetflow10yrqtrend::NUMERIC,
    
    -- Metadata
    f.status_code,
    f.status_message,
    f.fault_faultstring,
    f.fault_detail_errorcode
  FROM ms.fund_flow_details_ca_openend f
  WHERE f._id = ANY(p_fund_ids)
    -- Last record where estfundlevelnetflowdatemoend <= asofdate
    AND f.estfundlevelnetflowdatemoend <= p_asof_date::TEXT
  ORDER BY f._id, f.estfundlevelnetflowdatemoend DESC;
$$;

-- =====================================================
-- Time-Series Query: Get Flow History
-- =====================================================

-- Get monthly flow data for a date range
CREATE OR REPLACE FUNCTION ms.fn_get_flow_history(
  p_fund_id TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  _id TEXT,
  _name TEXT,
  flowdate TEXT,
  estfundlevelnetflow1momoend NUMERIC,
  estshareclassnetflow1momoend NUMERIC,
  _currencyid TEXT
)
LANGUAGE sql
STABLE
AS $$
  -- Get ALL flow data points within the date range
  SELECT 
    f._id,
    f._name,
    f.estfundlevelnetflowdatemoend as flowdate,
    f.estfundlevelnetflow1momoend::NUMERIC,
    f.estshareclassnetflow1momoend::NUMERIC,
    f._currencyid
  FROM ms.fund_flow_details_ca_openend f
  WHERE f._id = p_fund_id
    -- Time-series filtering: get all data points in range
    AND f.estfundlevelnetflowdatemoend >= p_start_date::TEXT
    AND f.estfundlevelnetflowdatemoend <= p_end_date::TEXT
    -- Temporal filtering: use version valid at end date
    AND f._timestampfrom <= p_end_date
    AND p_end_date <= f.data_inserted_at
  ORDER BY f.estfundlevelnetflowdatemoend ASC;
$$;

-- =====================================================
-- Usage Examples
-- =====================================================

-- Example 1: Get current flows for single fund
/*
SELECT 
  _id,
  _name,
  estfundlevelnetflowdatemoend,
  estfundlevelnetflow1momoend,
  estfundlevelnetflow1yrmoend,
  estfundlevelnetflow3yrmoend,
  estfundlevelnetflow5yrmoend,
  _currencyid
FROM ms.fn_get_flows_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Example 2: Get flows as of specific historical date
/*
SELECT 
  _id,
  _name,
  estfundlevelnetflowdatemoend,
  estfundlevelnetflow1momoend,
  estfundlevelnetflow3momoend,
  estfundlevelnetflow1yrmoend,
  estshareclassnetflow1momoend,
  estshareclassnetflow1yrmoend
FROM ms.fn_get_flows_at_date(
  ARRAY['F00000ABCD'],
  '2024-06-30'::DATE
);
*/

-- Example 3: Compare flows across category
/*
WITH category_funds AS (
  SELECT ARRAY_AGG(DISTINCT _id) as fund_ids
  FROM ms.fund_share_class_basic_info_ca_openend
  WHERE categorycode = 'CAEQUITY'
    AND _timestampto IS NULL
)
SELECT 
  f._id,
  f._name,
  f.estfundlevelnetflowdatemoend,
  f.estfundlevelnetflow1yrmoend,
  f.estfundlevelnetflow3yrmoend,
  f._currencyid
FROM category_funds cf
CROSS JOIN LATERAL ms.fn_get_flows_at_date(cf.fund_ids, CURRENT_DATE) f
ORDER BY f.estfundlevelnetflow1yrmoend DESC NULLS LAST;
*/

-- Example 4: Get 12 months of flow history
/*
SELECT * FROM ms.fn_get_flow_history(
  'F00000ABCD',
  '2023-07-01'::DATE,
  '2024-06-30'::DATE
);
*/

-- Example 5: Get all flow metrics
/*
SELECT 
  _id,
  _name,
  estfundlevelnetflowdatemoend,
  estfundlevelnetflow1momoend,
  estfundlevelnetflow3momoend,
  estfundlevelnetflow6momoend,
  estfundlevelnetflow1yrmoend,
  estfundlevelnetflow3yrmoend,
  estfundlevelnetflow5yrmoend,
  estfundlevelnetflow10yrmoend,
  estfundlevelnetflow15yrmoend,
  estfundlevelnetflowytdmoend,
  _currencyid
FROM ms.fn_get_flows_at_date(
  ARRAY['F00000ABCD', 'F00000EFGH'],
  CURRENT_DATE
);
*/

-- =====================================================
-- Notes
-- =====================================================
-- 1. Positive flows = money coming into the fund (inflows)
-- 2. Negative flows = money leaving the fund (outflows)
-- 3. Fund level flows = total for all share classes combined
-- 4. Share class flows = specific to this share class only
-- 5. Flows are estimated values, not exact
-- 6. Currency ID shows the currency of flow amounts
-- 7. Flow data is typically updated monthly (month-end)
-- 8. Month-end flows (moend) are the primary flow metrics
-- 9. Quarter-end flows (qtrend) provide quarterly perspective
-- 10. YTD flows show year-to-date cumulative flows
-- 11. Returns 41 columns total including all time periods
-- 12. Use fund level flows for overall fund popularity analysis
-- 13. Use share class flows for specific share class analysis
