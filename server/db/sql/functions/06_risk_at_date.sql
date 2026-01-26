-- =====================================================
-- Function: Get Risk Metrics at Specific Date
-- =====================================================
-- Tables: risk_measure_ca_openend, relative_risk_measure_prospectus_ca_openend
-- Date Sensitivity: enddate (time-series) + temporal tracking
-- This function combines absolute and relative risk measures
-- =====================================================

-- Absolute Risk Measures
CREATE OR REPLACE FUNCTION ms.fn_get_risk_measures_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  _id TEXT,
  enddate TEXT,
  -- Standard Deviation (volatility)
  stddev1yr NUMERIC,
  stddev3yr NUMERIC,
  stddev5yr NUMERIC,
  stddev10yr NUMERIC,
  stddev15yr NUMERIC,
  stddev20yr NUMERIC,
  -- Max Drawdown
  maxdrawdown1yr NUMERIC,
  maxdrawdown3yr NUMERIC,
  maxdrawdown5yr NUMERIC,
  maxdrawdown10yr NUMERIC,
  -- Skewness and Kurtosis
  skewness1yr NUMERIC,
  skewness3yr NUMERIC,
  skewness5yr NUMERIC,
  kurtosis1yr NUMERIC,
  kurtosis3yr NUMERIC,
  kurtosis5yr NUMERIC,
  -- Sharpe Ratio
  sharperatio1yr NUMERIC,
  sharperatio3yr NUMERIC,
  sharperatio5yr NUMERIC,
  sharperatio10yr NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  -- Get risk measures where enddate EXACTLY matches asofdate
  -- Pattern: exactly enddate=asofdate, last record per _ID based on _timestampfrom
  SELECT DISTINCT ON (r._id)
    r._id,
    r.enddate,
    -- Standard Deviation
    r.stddev1yr::NUMERIC,
    r.stddev3yr::NUMERIC,
    r.stddev5yr::NUMERIC,
    r.stddev10yr::NUMERIC,
    r.stddev15yr::NUMERIC,
    r.stddev20yr::NUMERIC,
    -- Max Drawdown
    r.maxdrawdown1yr::NUMERIC,
    r.maxdrawdown3yr::NUMERIC,
    r.maxdrawdown5yr::NUMERIC,
    r.maxdrawdown10yr::NUMERIC,
    -- Skewness and Kurtosis
    r.skewness1yr::NUMERIC,
    r.skewness3yr::NUMERIC,
    r.skewness5yr::NUMERIC,
    r.kurtosis1yr::NUMERIC,
    r.kurtosis3yr::NUMERIC,
    r.kurtosis5yr::NUMERIC,
    -- Sharpe Ratio
    r.sharperatio1yr::NUMERIC,
    r.sharperatio3yr::NUMERIC,
    r.sharperatio5yr::NUMERIC,
    r.sharperatio10yr::NUMERIC
  FROM ms.risk_measure_ca_openend r
  WHERE r._id = ANY(p_fund_ids)
    -- Exact match: enddate = asofdate
    AND r.enddate = p_asof_date::TEXT
  -- Get the last record based on _timestampfrom
  ORDER BY r._id, r._timestampfrom DESC;
$$;

-- Relative Risk Measures (vs Benchmark)
CREATE OR REPLACE FUNCTION ms.fn_get_relative_risk_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  _id TEXT,
  enddate TEXT,
  indexname TEXT,
  -- Alpha (excess return vs benchmark)
  alpha1yr NUMERIC,
  alpha3yr NUMERIC,
  alpha5yr NUMERIC,
  alpha10yr NUMERIC,
  alpha15yr NUMERIC,
  alpha20yr NUMERIC,
  -- Beta (sensitivity to benchmark)
  beta1yr NUMERIC,
  beta3yr NUMERIC,
  beta5yr NUMERIC,
  beta10yr NUMERIC,
  beta15yr NUMERIC,
  beta20yr NUMERIC,
  -- R-Squared (correlation to benchmark)
  rsquared1yr NUMERIC,
  rsquared3yr NUMERIC,
  rsquared5yr NUMERIC,
  rsquared10yr NUMERIC,
  -- Capture Ratios
  captureratioupside1yr NUMERIC,
  captureratioupside3yr NUMERIC,
  captureratioupside5yr NUMERIC,
  captureratioupside10yr NUMERIC,
  captureratiodownside1yr NUMERIC,
  captureratiodownside3yr NUMERIC,
  captureratiodownside5yr NUMERIC,
  captureratiodownside10yr NUMERIC,
  -- Information Ratio
  informationratio1yr NUMERIC,
  informationratio3yr NUMERIC,
  informationratio5yr NUMERIC,
  informationratio10yr NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  -- Get relative risk measures where enddate EXACTLY matches asofdate
  -- Pattern: exactly enddate=asofdate, last record per _ID based on _timestampfrom
  SELECT DISTINCT ON (rr._id)
    rr._id,
    rr.enddate,
    rr.indexname,
    -- Alpha
    rr.alpha1yr::NUMERIC,
    rr.alpha3yr::NUMERIC,
    rr.alpha5yr::NUMERIC,
    rr.alpha10yr::NUMERIC,
    rr.alpha15yr::NUMERIC,
    rr.alpha20yr::NUMERIC,
    -- Beta
    rr.beta1yr::NUMERIC,
    rr.beta3yr::NUMERIC,
    rr.beta5yr::NUMERIC,
    rr.beta10yr::NUMERIC,
    rr.beta15yr::NUMERIC,
    rr.beta20yr::NUMERIC,
    -- R-Squared
    rr.rsquared1yr::NUMERIC,
    rr.rsquared3yr::NUMERIC,
    rr.rsquared5yr::NUMERIC,
    rr.rsquared10yr::NUMERIC,
    -- Capture Ratios
    rr.captureratioupside1yr::NUMERIC,
    rr.captureratioupside3yr::NUMERIC,
    rr.captureratioupside5yr::NUMERIC,
    rr.captureratioupside10yr::NUMERIC,
    rr.captureratiodownside1yr::NUMERIC,
    rr.captureratiodownside3yr::NUMERIC,
    rr.captureratiodownside5yr::NUMERIC,
    rr.captureratiodownside10yr::NUMERIC,
    -- Information Ratio
    rr.informationratio1yr::NUMERIC,
    rr.informationratio3yr::NUMERIC,
    rr.informationratio5yr::NUMERIC,
    rr.informationratio10yr::NUMERIC
  FROM ms.relative_risk_measure_prospectus_ca_openend rr
  WHERE rr._id = ANY(p_fund_ids)
    -- Exact match: enddate = asofdate
    AND rr.enddate = p_asof_date::TEXT
  -- Get the last record based on _timestampfrom
  ORDER BY rr._id, rr._timestampfrom DESC;
$$;

-- Combined Risk Function (all risk data in one call)
CREATE OR REPLACE FUNCTION ms.fn_get_all_risk_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  _id TEXT,
  -- Absolute Risk
  risk_enddate TEXT,
  stddev3yr NUMERIC,
  stddev5yr NUMERIC,
  maxdrawdown3yr NUMERIC,
  sharperatio3yr NUMERIC,
  -- Relative Risk
  relative_enddate TEXT,
  indexname TEXT,
  alpha3yr NUMERIC,
  beta3yr NUMERIC,
  rsquared3yr NUMERIC,
  captureratioupside3yr NUMERIC,
  captureratiodownside3yr NUMERIC,
  informationratio3yr NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  -- Combine absolute and relative risk data (focusing on 3yr metrics)
  SELECT 
    COALESCE(r._id, rr._id) as _id,
    -- Absolute Risk
    r.enddate as risk_enddate,
    r.stddev3yr,
    r.stddev5yr,
    r.maxdrawdown3yr,
    r.sharperatio3yr,
    -- Relative Risk
    rr.enddate as relative_enddate,
    rr.indexname,
    rr.alpha3yr,
    rr.beta3yr,
    rr.rsquared3yr,
    rr.captureratioupside3yr,
    rr.captureratiodownside3yr,
    rr.informationratio3yr
  FROM ms.fn_get_risk_measures_at_date(p_fund_ids, p_asof_date) r
  FULL OUTER JOIN ms.fn_get_relative_risk_at_date(p_fund_ids, p_asof_date) rr
    ON r._id = rr._id;
$$;

-- =====================================================
-- Usage Examples
-- =====================================================

-- Example 1: Get all risk metrics for single fund
/*
SELECT * FROM ms.fn_get_all_risk_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Example 2: Get just absolute risk measures
/*
SELECT 
  _id,
  enddate,
  standarddeviation3yr,
  standarddeviation5yr,
  sharperatio3yr,
  maxdrawdown3yr
FROM ms.fn_get_risk_measures_at_date(
  ARRAY['F00000ABCD'],
  '2024-06-30'::DATE
);
*/

-- Example 3: Compare risk across category
/*
WITH category_funds AS (
  SELECT ARRAY_AGG(DISTINCT _id) as fund_ids
  FROM ms.fund_share_class_basic_info_ca_openend
  WHERE categorycode = 'CAEQUITY'
    AND _timestampto IS NULL
)
SELECT 
  r._id,
  r.standarddeviation3yr,
  r.sharperatio3yr,
  r.alpha3yr,
  r.beta3yr
FROM category_funds cf
CROSS JOIN LATERAL ms.fn_get_all_risk_at_date(cf.fund_ids, CURRENT_DATE) r
ORDER BY r.sharperatio3yr DESC NULLS LAST;
*/

-- =====================================================
-- Notes
-- =====================================================
-- 1. Standard deviation measures volatility (higher = more volatile)
-- 2. Sharpe ratio measures risk-adjusted returns (higher = better)
-- 3. Alpha measures excess return vs benchmark (positive = outperformance)
-- 4. Beta measures sensitivity to benchmark (1.0 = same as benchmark)
-- 5. R-squared measures correlation to benchmark (1.0 = perfect correlation)
-- 6. Capture ratios show performance in up/down markets (>100 = better than benchmark)
-- 7. Max drawdown shows largest peak-to-trough decline
