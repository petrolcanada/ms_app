-- =====================================================
-- Function: Get Performance Returns at Specific Date
-- =====================================================
-- Table: month_end_trailing_total_returns_ca_openend
-- Date Sensitivity: monthenddate (time-series) + temporal tracking
-- Pattern: exactly monthenddate=asofdate, last record per _ID based on _timestampfrom
-- This is a TIME-SERIES table with monthly data points
-- =====================================================

CREATE OR REPLACE FUNCTION ms.fn_get_performance_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  -- Core Identifiers
  _id TEXT,
  _idtype TEXT,
  _name TEXT,
  monthenddate TEXT,
  
  -- Trailing Returns (Annualized)
  return1mth NUMERIC,
  return2mth NUMERIC,
  return3mth NUMERIC,
  return6mth NUMERIC,
  return9mth NUMERIC,
  return1yr NUMERIC,
  return2yr NUMERIC,
  return3yr NUMERIC,
  return4yr NUMERIC,
  return5yr NUMERIC,
  return6yr NUMERIC,
  return7yr NUMERIC,
  return8yr NUMERIC,
  return9yr NUMERIC,
  return10yr NUMERIC,
  return15yr NUMERIC,
  return20yr NUMERIC,
  returnytd NUMERIC,
  returnsinceinception NUMERIC,
  
  -- Cumulative Returns (Total)
  cumulativereturn2yr NUMERIC,
  cumulativereturn3yr NUMERIC,
  cumulativereturn4yr NUMERIC,
  cumulativereturn5yr NUMERIC,
  cumulativereturn6yr NUMERIC,
  cumulativereturn7yr NUMERIC,
  cumulativereturn8yr NUMERIC,
  cumulativereturn9yr NUMERIC,
  cumulativereturn10yr NUMERIC,
  cumulativereturn15yr NUMERIC,
  cumulativereturn20yr NUMERIC,
  cumulativereturnsinceinception NUMERIC,
  
  -- Metadata
  status_code NUMERIC,
  status_message TEXT,
  fault_faultstring TEXT,
  fault_detail_errorcode TEXT
)
LANGUAGE sql
STABLE
AS $$
  -- Get performance data where monthenddate EXACTLY matches asofdate
  -- Pattern: exactly monthenddate=asofdate, last record per _ID based on _timestampfrom
  SELECT DISTINCT ON (p._id)
    -- Core Identifiers
    p._id,
    p._idtype,
    p._name,
    p.monthenddate,
    
    -- Trailing Returns (Annualized)
    p.return1mth::NUMERIC,
    p.return2mth::NUMERIC,
    p.return3mth::NUMERIC,
    p.return6mth::NUMERIC,
    p.return9mth::NUMERIC,
    p.return1yr::NUMERIC,
    p.return2yr::NUMERIC,
    p.return3yr::NUMERIC,
    p.return4yr::NUMERIC,
    p.return5yr::NUMERIC,
    p.return6yr::NUMERIC,
    p.return7yr::NUMERIC,
    p.return8yr::NUMERIC,
    p.return9yr::NUMERIC,
    p.return10yr::NUMERIC,
    p.return15yr::NUMERIC,
    p.return20yr::NUMERIC,
    p.returnytd::NUMERIC,
    p.returnsinceinception::NUMERIC,
    
    -- Cumulative Returns (Total)
    p.cumulativereturn2yr::NUMERIC,
    p.cumulativereturn3yr::NUMERIC,
    p.cumulativereturn4yr::NUMERIC,
    p.cumulativereturn5yr::NUMERIC,
    p.cumulativereturn6yr::NUMERIC,
    p.cumulativereturn7yr::NUMERIC,
    p.cumulativereturn8yr::NUMERIC,
    p.cumulativereturn9yr::NUMERIC,
    p.cumulativereturn10yr::NUMERIC,
    p.cumulativereturn15yr::NUMERIC,
    p.cumulativereturn20yr::NUMERIC,
    p.cumulativereturnsinceinception::NUMERIC,
    
    -- Metadata
    p.status_code,
    p.status_message,
    p.fault_faultstring,
    p.fault_detail_errorcode
  FROM ms.month_end_trailing_total_returns_ca_openend p
  WHERE p._id = ANY(p_fund_ids)
    -- Exact match on date portion: monthenddate (text) -> date
    AND to_date(p.monthenddate, 'YYYY-MM-DD') = p_asof_date
  -- Get the last record based on _timestampfrom
  ORDER BY p._id, p._timestampfrom DESC;
$$;

-- =====================================================
-- Usage Examples
-- =====================================================

-- Example 1: Get performance for single fund as of today
/*
SELECT 
  _id,
  _name,
  monthenddate,
  return1yr,
  return3yr,
  return5yr,
  cumulativereturn5yr
FROM ms.fn_get_performance_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Example 2: Get performance as of specific historical date
/*
SELECT 
  _id,
  monthenddate,
  return1yr,
  return3yr,
  returnytd,
  cumulativereturn3yr
FROM ms.fn_get_performance_at_date(
  ARRAY['F00000ABCD'],
  '2024-06-30'::DATE
);
*/

-- Example 3: Compare performance at two different dates
/*
WITH current_perf AS (
  SELECT 
    _id,
    monthenddate as current_date,
    return1yr as current_1yr
  FROM ms.fn_get_performance_at_date(ARRAY['F00000ABCD'], CURRENT_DATE)
),
past_perf AS (
  SELECT 
    _id,
    monthenddate as past_date,
    return1yr as past_1yr
  FROM ms.fn_get_performance_at_date(ARRAY['F00000ABCD'], '2023-12-31'::DATE)
)
SELECT 
  c._id,
  c.current_date,
  c.current_1yr,
  p.past_date,
  p.past_1yr,
  (c.current_1yr - p.past_1yr) as change_in_1yr_return
FROM current_perf c
JOIN past_perf p ON c._id = p._id;
*/

-- Example 4: Get performance for all funds in category
/*
WITH category_funds AS (
  SELECT ARRAY_AGG(DISTINCT _id) as fund_ids
  FROM ms.fund_share_class_basic_info_ca_openend
  WHERE categorycode = 'CAEQUITY'
    AND _timestampto IS NULL
)
SELECT 
  p._id,
  p._name,
  p.monthenddate,
  p.return1yr,
  p.return3yr,
  p.return5yr
FROM category_funds cf
CROSS JOIN LATERAL ms.fn_get_performance_at_date(cf.fund_ids, '2024-06-30'::DATE) p
ORDER BY p.return1yr DESC NULLS LAST;
*/

-- =====================================================
-- Time-Series Query: Get Performance History
-- =====================================================

-- Get monthly performance data for a date range
CREATE OR REPLACE FUNCTION ms.fn_get_performance_history(
  p_fund_id TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  _id TEXT,
  _name TEXT,
  monthenddate TEXT,
  return1mth NUMERIC,
  return1yr NUMERIC,
  return3yr NUMERIC,
  returnytd NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  -- Get ALL data points within the date range
  -- Use the version that was valid at the END date
  SELECT 
    p._id,
    p._name,
    p.monthenddate,
    p.return1mth::NUMERIC,
    p.return1yr::NUMERIC,
    p.return3yr::NUMERIC,
    p.returnytd::NUMERIC
  FROM ms.month_end_trailing_total_returns_ca_openend p
  WHERE p._id = p_fund_id
    -- Time-series filtering: get all data points in range
    AND p.monthenddate >= p_start_date::TEXT
    AND p.monthenddate <= p_end_date::TEXT
    -- Temporal filtering: use version valid at end date
    AND p._timestampfrom <= p_end_date
    AND p_end_date <= p.data_inserted_at
  ORDER BY p.monthenddate ASC;
$$;

-- Example: Get 12 months of performance history
/*
SELECT * FROM ms.fn_get_performance_history(
  'F00000ABCD',
  '2023-07-01'::DATE,
  '2024-06-30'::DATE
);
*/

-- =====================================================
-- Testing Queries
-- =====================================================

-- Test 1: Verify we get the correct month-end date
/*
SELECT 
  _id,
  _name,
  monthenddate,
  return1yr,
  'Should match 2024-06-30' as note
FROM ms.fn_get_performance_at_date(
  ARRAY['F00000ABCD'],
  '2024-06-30'::DATE
);
*/

-- Test 2: Check what happens with future date
/*
-- This should return no data (exact match only)
SELECT 
  _id,
  monthenddate,
  return1yr,
  'Should be empty for future dates' as note
FROM ms.fn_get_performance_at_date(
  ARRAY['F00000ABCD'],
  '2030-12-31'::DATE
);
*/

-- Test 3: Performance with multiple funds
/*
EXPLAIN ANALYZE
SELECT * FROM ms.fn_get_performance_at_date(
  (SELECT ARRAY_AGG(_id) FROM ms.fund_share_class_basic_info_ca_openend WHERE _timestampto IS NULL LIMIT 50),
  CURRENT_DATE
);
*/

-- =====================================================
-- Notes
-- =====================================================
-- 1. This table has BOTH monthenddate (time-series) AND temporal tracking
-- 2. monthenddate: The date the performance data represents (e.g., "2024-06-30")
-- 3. _timestampfrom/data_inserted_at: When this version of the data was loaded
-- 4. IMPORTANT: monthenddate is TEXT, not DATE type - comparison works with YYYY-MM-DD format
-- 5. Returns data ONLY for exact monthenddate match (not "on or before")
-- 6. For time-series analysis, use fn_get_performance_history instead
-- 7. Performance data is typically updated monthly (month-end)
-- 8. Returns 44 columns total including all trailing and cumulative returns
-- 9. Trailing returns are annualized, cumulative returns are total percentage gains
