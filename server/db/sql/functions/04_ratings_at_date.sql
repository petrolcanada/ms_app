-- =====================================================
-- Function: Get Morningstar Ratings at Specific Date
-- =====================================================
-- Table: morningstar_rating_ca_openend
-- Date Sensitivity: ratingdate (time-series)
-- Pattern: exact monthenddate match — one row per (_ID, monthenddate)
-- This is a TIME-SERIES table with periodic rating updates
-- =====================================================

CREATE OR REPLACE FUNCTION ms.fn_get_ratings_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  -- Core Identifiers
  _id TEXT,
  _idtype TEXT,
  _name TEXT,
  ratingdate TEXT,
  
  -- Star Ratings (1-5 stars, stored as decimals in some records)
  rating3year NUMERIC,
  rating5year NUMERIC,
  rating10year NUMERIC,
  ratingoverall NUMERIC,
  
  -- Returns (verbal: High / Above Average / Average / Below Average / Low)
  return3year TEXT,
  return5year TEXT,
  return10year TEXT,
  returnoverall TEXT,
  
  -- Risk Measures (verbal: High / Above Average / Average / Below Average / Low)
  risk3year TEXT,
  risk5year TEXT,
  risk10year TEXT,
  riskoverall TEXT,
  
  -- Risk-Adjusted Returns
  riskadjustedreturn3yr NUMERIC,
  riskadjustedreturn5yr NUMERIC,
  riskadjustedreturn10yr NUMERIC,
  riskadjustedreturnoverall NUMERIC,
  
  -- Performance Scores
  performancescore3yr NUMERIC,
  performancescore5yr NUMERIC,
  performancescore10yr NUMERIC,
  performancescoreoverall NUMERIC,
  
  -- Risk Scores
  riskscore3yr NUMERIC,
  riskscore5yr NUMERIC,
  riskscore10yr NUMERIC,
  riskscoreoverall NUMERIC,
  
  -- Category Context
  numberoffunds3year NUMERIC,
  numberoffunds5year NUMERIC,
  numberoffunds10year NUMERIC,
  numberoffundsoverall NUMERIC,
  
  -- Performance Category Ranks
  perfcatrank3year NUMERIC,
  perfcatrank5year NUMERIC,
  perfcatrank10year NUMERIC,
  
  -- Risk Category Ranks
  riskcatrank3year NUMERIC,
  riskcatrank5year NUMERIC,
  riskcatrank10year NUMERIC,
  
  -- Rating Category Ranks
  ratingcatrank3year NUMERIC,
  ratingcatrank5year NUMERIC,
  ratingcatrank10year NUMERIC,
  
  -- Metadata
  status_code NUMERIC,
  status_message TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    -- Core Identifiers
    m._id,
    m._idtype,
    m._name,
    m.ratingdate,
    
    -- Star Ratings
    m.rating3year::NUMERIC,
    m.rating5year::NUMERIC,
    m.rating10year::NUMERIC,
    m.ratingoverall::NUMERIC,
    
    -- Returns (verbal descriptors)
    m.return3year::TEXT,
    m.return5year::TEXT,
    m.return10year::TEXT,
    m.returnoverall::TEXT,
    
    -- Risk Measures (verbal descriptors)
    m.risk3year::TEXT,
    m.risk5year::TEXT,
    m.risk10year::TEXT,
    m.riskoverall::TEXT,
    
    -- Risk-Adjusted Returns
    m.riskadjustedreturn3yr::NUMERIC,
    m.riskadjustedreturn5yr::NUMERIC,
    m.riskadjustedreturn10yr::NUMERIC,
    m.riskadjustedreturnoverall::NUMERIC,
    
    -- Performance Scores
    m.performancescore3yr::NUMERIC,
    m.performancescore5yr::NUMERIC,
    m.performancescore10yr::NUMERIC,
    m.performancescoreoverall::NUMERIC,
    
    -- Risk Scores
    m.riskscore3yr::NUMERIC,
    m.riskscore5yr::NUMERIC,
    m.riskscore10yr::NUMERIC,
    m.riskscoreoverall::NUMERIC,
    
    -- Category Context
    m.numberoffunds3year::NUMERIC,
    m.numberoffunds5year::NUMERIC,
    m.numberoffunds10year::NUMERIC,
    m.numberoffundsoverall::NUMERIC,
    
    -- Performance Category Ranks
    m.perfcatrank3year::NUMERIC,
    m.perfcatrank5year::NUMERIC,
    m.perfcatrank10year::NUMERIC,
    
    -- Risk Category Ranks
    m.riskcatrank3year::NUMERIC,
    m.riskcatrank5year::NUMERIC,
    m.riskcatrank10year::NUMERIC,
    
    -- Rating Category Ranks
    m.ratingcatrank3year::NUMERIC,
    m.ratingcatrank5year::NUMERIC,
    m.ratingcatrank10year::NUMERIC,
    
    -- Metadata
    m.status_code,
    m.status_message
  FROM ms.morningstar_rating_ca_openend m
  WHERE m._id = ANY(p_fund_ids)
    AND m.monthenddate = p_asof_date::TEXT;
$$;

-- =====================================================
-- Usage Examples
-- =====================================================

-- Example 1: Get ratings for single fund as of today
/*
SELECT 
  _id,
  _name,
  ratingdate,
  rating3year,
  rating5year,
  ratingoverall,
  riskadjustedreturn3yr,
  performancescore3yr,
  riskscore3yr
FROM ms.fn_get_ratings_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Example 2: Get ratings as of specific historical date
/*
SELECT 
  _id,
  ratingdate,
  rating3year,
  rating5year,
  rating10year,
  ratingoverall,
  return3year,
  return5year
FROM ms.fn_get_ratings_at_date(
  ARRAY['F00000ABCD'],
  '2024-06-30'::DATE
);
*/

-- Example 3: Find all 5-star funds in category
/*
WITH category_funds AS (
  SELECT ARRAY_AGG(DISTINCT _id) as fund_ids
  FROM ms.fund_share_class_basic_info_ca_openend
  WHERE categorycode = 'CAEQUITY'
    AND _timestampto IS NULL
)
SELECT 
  r._id,
  r._name,
  r.ratingdate,
  r.rating3year,
  r.rating5year,
  r.ratingoverall,
  r.riskadjustedreturn3yr,
  r.ratingcatrank3year,
  r.numberoffunds3year
FROM category_funds cf
CROSS JOIN LATERAL ms.fn_get_ratings_at_date(cf.fund_ids, CURRENT_DATE) r
WHERE r.ratingoverall = 5
ORDER BY r.riskadjustedreturn3yr DESC NULLS LAST;
*/

-- Example 4: Compare ratings and scores
/*
SELECT 
  _id,
  _name,
  ratingdate,
  rating3year,
  performancescore3yr,
  riskscore3yr,
  perfcatrank3year,
  riskcatrank3year,
  ratingcatrank3year
FROM ms.fn_get_ratings_at_date(
  ARRAY['F00000ABCD', 'F00000EFGH'],
  CURRENT_DATE
);
*/

-- =====================================================
-- Notes
-- =====================================================
-- 1. Star ratings range from 1 (worst) to 5 (best)
-- 2. Ratings are based on risk-adjusted returns (Morningstar Risk-Adjusted Return)
-- 3. Ratings are calculated for 3yr, 5yr, 10yr, and overall periods
-- 4. Overall rating is a weighted average of period ratings (if available)
-- 5. Performance score: Higher is better (measures return relative to category)
-- 6. Risk score: Lower is better (measures volatility relative to category)
-- 7. Category ranks: Lower is better (1 = best in category)
-- 8. Number of funds shows the size of the comparison group
-- 9. Ratings are updated periodically (typically monthly)
-- 10. NULL ratings indicate insufficient history for that period
-- 11. Returns 48 columns total including all rating components and scores
