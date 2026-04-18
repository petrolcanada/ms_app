-- =====================================================
-- Function: Get Category Average Performance Returns
-- =====================================================
-- Table: category_monthly_nav_trailing_performance_returns
-- Date Column: dayenddate (DATE type, month-end grid)
-- Pattern: exact dayenddate match — one row per (categorycode, dayenddate)
-- Unique constraint: (categorycode, dayenddate)
-- =====================================================

-- =====================================================
-- 1. Point-in-time: by category codes
-- =====================================================

CREATE OR REPLACE FUNCTION ms.fn_get_category_performance_at_date(
  p_category_codes TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  categorycode TEXT,
  categoryname TEXT,
  dayenddate TEXT,
  return1mth NUMERIC,
  return3mth NUMERIC,
  return6mth NUMERIC,
  return9mth NUMERIC,
  returnytd NUMERIC,
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
  return20yr NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.categorycode::TEXT,
    c.categoryname::TEXT,
    c.dayenddate::TEXT,
    c.return1mth::NUMERIC,
    c.return3mth::NUMERIC,
    c.return6mth::NUMERIC,
    c.return9mth::NUMERIC,
    c.returnytd::NUMERIC,
    c.return1yr::NUMERIC,
    c.return2yr::NUMERIC,
    c.return3yr::NUMERIC,
    c.return4yr::NUMERIC,
    c.return5yr::NUMERIC,
    c.return6yr::NUMERIC,
    c.return7yr::NUMERIC,
    c.return8yr::NUMERIC,
    c.return9yr::NUMERIC,
    c.return10yr::NUMERIC,
    c.return15yr::NUMERIC,
    c.return20yr::NUMERIC
  FROM ms.category_monthly_nav_trailing_performance_returns c
  WHERE c.categorycode = ANY(p_category_codes)
    AND c.dayenddate = p_asof_date;
$$;

-- =====================================================
-- 2. Point-in-time: by fund IDs (auto-resolves category)
-- =====================================================
-- Returns category avg returns for each fund's category.
-- The _id column maps back to the requesting fund ID so
-- the domain merge logic can attach it to the right fund.

CREATE OR REPLACE FUNCTION ms.fn_get_category_performance_for_funds(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  _id TEXT,
  categorycode TEXT,
  categoryname TEXT,
  dayenddate TEXT,
  cat_return1mth NUMERIC,
  cat_return3mth NUMERIC,
  cat_return6mth NUMERIC,
  cat_return9mth NUMERIC,
  cat_returnytd NUMERIC,
  cat_return1yr NUMERIC,
  cat_return2yr NUMERIC,
  cat_return3yr NUMERIC,
  cat_return4yr NUMERIC,
  cat_return5yr NUMERIC,
  cat_return6yr NUMERIC,
  cat_return7yr NUMERIC,
  cat_return8yr NUMERIC,
  cat_return9yr NUMERIC,
  cat_return10yr NUMERIC,
  cat_return15yr NUMERIC,
  cat_return20yr NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    b._id,
    c.categorycode::TEXT,
    c.categoryname::TEXT,
    c.dayenddate::TEXT,
    c.return1mth::NUMERIC,
    c.return3mth::NUMERIC,
    c.return6mth::NUMERIC,
    c.return9mth::NUMERIC,
    c.returnytd::NUMERIC,
    c.return1yr::NUMERIC,
    c.return2yr::NUMERIC,
    c.return3yr::NUMERIC,
    c.return4yr::NUMERIC,
    c.return5yr::NUMERIC,
    c.return6yr::NUMERIC,
    c.return7yr::NUMERIC,
    c.return8yr::NUMERIC,
    c.return9yr::NUMERIC,
    c.return10yr::NUMERIC,
    c.return15yr::NUMERIC,
    c.return20yr::NUMERIC
  FROM ms.mv_fund_share_class_basic_info_ca_openend_latest b
  JOIN ms.category_monthly_nav_trailing_performance_returns c
    ON c.categorycode = b.categorycode
    AND c.dayenddate = p_asof_date
  WHERE b._id = ANY(p_fund_ids)
    AND b.categorycode IS NOT NULL;
$$;

-- =====================================================
-- 3. Time-series: category performance history
-- =====================================================

CREATE OR REPLACE FUNCTION ms.fn_get_category_performance_history(
  p_category_code TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  categorycode TEXT,
  categoryname TEXT,
  dayenddate TEXT,
  return1mth NUMERIC,
  return1yr NUMERIC,
  return3yr NUMERIC,
  returnytd NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.categorycode::TEXT,
    c.categoryname::TEXT,
    c.dayenddate::TEXT,
    c.return1mth::NUMERIC,
    c.return1yr::NUMERIC,
    c.return3yr::NUMERIC,
    c.returnytd::NUMERIC
  FROM ms.category_monthly_nav_trailing_performance_returns c
  WHERE c.categorycode = p_category_code
    AND c.dayenddate >= p_start_date
    AND c.dayenddate <= p_end_date
  ORDER BY c.dayenddate ASC;
$$;

-- =====================================================
-- 4. Time-series: category performance history by fund ID
-- =====================================================
-- Looks up the fund's category and returns the history.

CREATE OR REPLACE FUNCTION ms.fn_get_category_performance_history_for_fund(
  p_fund_id TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  _id TEXT,
  categorycode TEXT,
  categoryname TEXT,
  dayenddate TEXT,
  return1mth NUMERIC,
  return1yr NUMERIC,
  return3yr NUMERIC,
  returnytd NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    b._id,
    c.categorycode::TEXT,
    c.categoryname::TEXT,
    c.dayenddate::TEXT,
    c.return1mth::NUMERIC,
    c.return1yr::NUMERIC,
    c.return3yr::NUMERIC,
    c.returnytd::NUMERIC
  FROM ms.mv_fund_share_class_basic_info_ca_openend_latest b
  JOIN ms.category_monthly_nav_trailing_performance_returns c
    ON c.categorycode = b.categorycode
    AND c.dayenddate >= p_start_date
    AND c.dayenddate <= p_end_date
  WHERE b._id = p_fund_id
    AND b.categorycode IS NOT NULL
  ORDER BY c.dayenddate ASC;
$$;
