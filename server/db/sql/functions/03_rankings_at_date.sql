-- =====================================================
-- Function: Get Performance Rankings at Specific Date
-- =====================================================
-- Table: month_end_trailing_total_return_percentile_and_absolute_ranks_c
-- Date Sensitivity: monthenddate (time-series) + temporal tracking
-- Pattern: exactly monthenddate=asofdate, last record per _ID based on _timestampfrom
-- This is a TIME-SERIES table with monthly ranking data
-- =====================================================

CREATE OR REPLACE FUNCTION ms.fn_get_rankings_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  -- Core Identifiers
  _id TEXT,
  _idtype TEXT,
  _name TEXT,
  monthenddate TEXT,
  
  -- 1 Month Rankings
  rank1mth NUMERIC,
  rank1mthquartile TEXT,
  rank1mthquartilebreakpoint1 NUMERIC,
  rank1mthquartilebreakpoint25 NUMERIC,
  rank1mthquartilebreakpoint50 NUMERIC,
  rank1mthquartilebreakpoint75 NUMERIC,
  rank1mthquartilebreakpoint99 NUMERIC,
  absrank1mth INTEGER,
  categorysize1mth INTEGER,
  
  -- 2 Month Rankings
  rank2mth NUMERIC,
  rank2mthquartile TEXT,
  rank2mthquartilebreakpoint1 NUMERIC,
  rank2mthquartilebreakpoint25 NUMERIC,
  rank2mthquartilebreakpoint50 NUMERIC,
  rank2mthquartilebreakpoint75 NUMERIC,
  rank2mthquartilebreakpoint99 NUMERIC,
  absrank2mth INTEGER,
  categorysize2mth INTEGER,
  
  -- 3 Month Rankings
  rank3mth NUMERIC,
  rank3mthquartile TEXT,
  rank3mthquartilebreakpoint1 NUMERIC,
  rank3mthquartilebreakpoint25 NUMERIC,
  rank3mthquartilebreakpoint50 NUMERIC,
  rank3mthquartilebreakpoint75 NUMERIC,
  rank3mthquartilebreakpoint99 NUMERIC,
  absrank3mth INTEGER,
  categorysize3mth INTEGER,
  
  -- 6 Month Rankings
  rank6mth NUMERIC,
  rank6mthquartile TEXT,
  rank6mthquartilebreakpoint1 NUMERIC,
  rank6mthquartilebreakpoint25 NUMERIC,
  rank6mthquartilebreakpoint50 NUMERIC,
  rank6mthquartilebreakpoint75 NUMERIC,
  rank6mthquartilebreakpoint99 NUMERIC,
  absrank6mth INTEGER,
  categorysize6mth INTEGER,
  
  -- 9 Month Rankings
  rank9mth NUMERIC,
  rank9mthquartile TEXT,
  rank9mthquartilebreakpoint1 NUMERIC,
  rank9mthquartilebreakpoint25 NUMERIC,
  rank9mthquartilebreakpoint50 NUMERIC,
  rank9mthquartilebreakpoint75 NUMERIC,
  rank9mthquartilebreakpoint99 NUMERIC,
  absrank9mth INTEGER,
  categorysize9mth INTEGER,
  
  -- 1 Year Rankings
  rank1yr NUMERIC,
  rank1yrquartile TEXT,
  rank1yrquartilebreakpoint1 NUMERIC,
  rank1yrquartilebreakpoint25 NUMERIC,
  rank1yrquartilebreakpoint50 NUMERIC,
  rank1yrquartilebreakpoint75 NUMERIC,
  rank1yrquartilebreakpoint99 NUMERIC,
  absrank1yr INTEGER,
  categorysize1yr INTEGER,
  
  -- 2 Year Rankings
  rank2yr NUMERIC,
  rank2yrquartile TEXT,
  rank2yrquartilebreakpoint1 NUMERIC,
  rank2yrquartilebreakpoint25 NUMERIC,
  rank2yrquartilebreakpoint50 NUMERIC,
  rank2yrquartilebreakpoint75 NUMERIC,
  rank2yrquartilebreakpoint99 NUMERIC,
  absrank2yr INTEGER,
  categorysize2yr INTEGER,
  
  -- 3 Year Rankings
  rank3yr NUMERIC,
  rank3yrquartile TEXT,
  rank3yrquartilebreakpoint1 NUMERIC,
  rank3yrquartilebreakpoint25 NUMERIC,
  rank3yrquartilebreakpoint50 NUMERIC,
  rank3yrquartilebreakpoint75 NUMERIC,
  rank3yrquartilebreakpoint99 NUMERIC,
  absrank3yr INTEGER,
  categorysize3yr INTEGER,
  
  -- 4 Year Rankings
  rank4yr NUMERIC,
  rank4yrquartile TEXT,
  rank4yrquartilebreakpoint1 NUMERIC,
  rank4yrquartilebreakpoint25 NUMERIC,
  rank4yrquartilebreakpoint50 NUMERIC,
  rank4yrquartilebreakpoint75 NUMERIC,
  rank4yrquartilebreakpoint99 NUMERIC,
  absrank4yr INTEGER,
  categorysize4yr INTEGER,
  
  -- 5 Year Rankings
  rank5yr NUMERIC,
  rank5yrquartile TEXT,
  rank5yrquartilebreakpoint1 NUMERIC,
  rank5yrquartilebreakpoint25 NUMERIC,
  rank5yrquartilebreakpoint50 NUMERIC,
  rank5yrquartilebreakpoint75 NUMERIC,
  rank5yrquartilebreakpoint99 NUMERIC,
  absrank5yr INTEGER,
  categorysize5yr INTEGER,
  
  -- 6 Year Rankings
  rank6yr NUMERIC,
  rank6yrquartile TEXT,
  rank6yrquartilebreakpoint1 NUMERIC,
  rank6yrquartilebreakpoint25 NUMERIC,
  rank6yrquartilebreakpoint50 NUMERIC,
  rank6yrquartilebreakpoint75 NUMERIC,
  rank6yrquartilebreakpoint99 NUMERIC,
  absrank6yr INTEGER,
  categorysize6yr INTEGER,
  
  -- 7 Year Rankings
  rank7yr NUMERIC,
  rank7yrquartile TEXT,
  rank7yrquartilebreakpoint1 NUMERIC,
  rank7yrquartilebreakpoint25 NUMERIC,
  rank7yrquartilebreakpoint50 NUMERIC,
  rank7yrquartilebreakpoint75 NUMERIC,
  rank7yrquartilebreakpoint99 NUMERIC,
  absrank7yr INTEGER,
  categorysize7yr INTEGER,
  
  -- 8 Year Rankings
  rank8yr NUMERIC,
  rank8yrquartile TEXT,
  rank8yrquartilebreakpoint1 NUMERIC,
  rank8yrquartilebreakpoint25 NUMERIC,
  rank8yrquartilebreakpoint50 NUMERIC,
  rank8yrquartilebreakpoint75 NUMERIC,
  rank8yrquartilebreakpoint99 NUMERIC,
  absrank8yr INTEGER,
  categorysize8yr INTEGER,
  
  -- 9 Year Rankings
  rank9yr NUMERIC,
  rank9yrquartile TEXT,
  rank9yrquartilebreakpoint1 NUMERIC,
  rank9yrquartilebreakpoint25 NUMERIC,
  rank9yrquartilebreakpoint50 NUMERIC,
  rank9yrquartilebreakpoint75 NUMERIC,
  rank9yrquartilebreakpoint99 NUMERIC,
  absrank9yr INTEGER,
  categorysize9yr INTEGER,
  
  -- 10 Year Rankings
  rank10yr NUMERIC,
  rank10yrquartile TEXT,
  rank10yrquartilebreakpoint1 NUMERIC,
  rank10yrquartilebreakpoint25 NUMERIC,
  rank10yrquartilebreakpoint50 NUMERIC,
  rank10yrquartilebreakpoint75 NUMERIC,
  rank10yrquartilebreakpoint99 NUMERIC,
  absrank10yr INTEGER,
  categorysize10yr INTEGER,
  
  -- 15 Year Rankings
  rank15yr NUMERIC,
  rank15yrquartile TEXT,
  rank15yrquartilebreakpoint1 NUMERIC,
  rank15yrquartilebreakpoint25 NUMERIC,
  rank15yrquartilebreakpoint50 NUMERIC,
  rank15yrquartilebreakpoint75 NUMERIC,
  rank15yrquartilebreakpoint99 NUMERIC,
  absrank15yr INTEGER,
  categorysize15yr INTEGER,
  
  -- 20 Year Rankings
  rank20yr NUMERIC,
  rank20yrquartile TEXT,
  rank20yrquartilebreakpoint1 NUMERIC,
  rank20yrquartilebreakpoint25 NUMERIC,
  rank20yrquartilebreakpoint50 NUMERIC,
  rank20yrquartilebreakpoint75 NUMERIC,
  rank20yrquartilebreakpoint99 NUMERIC,
  absrank20yr INTEGER,
  categorysize20yr INTEGER,
  
  -- YTD Rankings
  rankytd NUMERIC,
  rankytdquartile TEXT,
  rankytdquartilebreakpoint1 NUMERIC,
  rankytdquartilebreakpoint25 NUMERIC,
  rankytdquartilebreakpoint50 NUMERIC,
  rankytdquartilebreakpoint75 NUMERIC,
  rankytdquartilebreakpoint99 NUMERIC,
  absrankytd INTEGER,
  categorysizeytd INTEGER,
  
  -- Metadata
  status_code NUMERIC,
  status_message TEXT
)
LANGUAGE sql
STABLE
AS $$
  -- Get ranking data where monthenddate EXACTLY matches asofdate
  -- Pattern: exactly monthenddate=asofdate, last record per _ID based on _timestampfrom
  SELECT DISTINCT ON (r._id)
    -- Core Identifiers
    r._id,
    r._idtype,
    r._name,
    r.monthenddate,
    
    -- 1 Month
    r.rank1mth::NUMERIC,
    r.rank1mthquartile,
    r.rank1mthquartilebreakpoint1::NUMERIC,
    r.rank1mthquartilebreakpoint25::NUMERIC,
    r.rank1mthquartilebreakpoint50::NUMERIC,
    r.rank1mthquartilebreakpoint75::NUMERIC,
    r.rank1mthquartilebreakpoint99::NUMERIC,
    r.absrank1mth::INTEGER,
    r.categorysize1mth::INTEGER,
    
    -- 2 Month
    r.rank2mth::NUMERIC,
    r.rank2mthquartile,
    r.rank2mthquartilebreakpoint1::NUMERIC,
    r.rank2mthquartilebreakpoint25::NUMERIC,
    r.rank2mthquartilebreakpoint50::NUMERIC,
    r.rank2mthquartilebreakpoint75::NUMERIC,
    r.rank2mthquartilebreakpoint99::NUMERIC,
    r.absrank2mth::INTEGER,
    r.categorysize2mth::INTEGER,
    
    -- 3 Month
    r.rank3mth::NUMERIC,
    r.rank3mthquartile,
    r.rank3mthquartilebreakpoint1::NUMERIC,
    r.rank3mthquartilebreakpoint25::NUMERIC,
    r.rank3mthquartilebreakpoint50::NUMERIC,
    r.rank3mthquartilebreakpoint75::NUMERIC,
    r.rank3mthquartilebreakpoint99::NUMERIC,
    r.absrank3mth::INTEGER,
    r.categorysize3mth::INTEGER,
    
    -- 6 Month
    r.rank6mth::NUMERIC,
    r.rank6mthquartile,
    r.rank6mthquartilebreakpoint1::NUMERIC,
    r.rank6mthquartilebreakpoint25::NUMERIC,
    r.rank6mthquartilebreakpoint50::NUMERIC,
    r.rank6mthquartilebreakpoint75::NUMERIC,
    r.rank6mthquartilebreakpoint99::NUMERIC,
    r.absrank6mth::INTEGER,
    r.categorysize6mth::INTEGER,
    
    -- 9 Month
    r.rank9mth::NUMERIC,
    r.rank9mthquartile,
    r.rank9mthquartilebreakpoint1::NUMERIC,
    r.rank9mthquartilebreakpoint25::NUMERIC,
    r.rank9mthquartilebreakpoint50::NUMERIC,
    r.rank9mthquartilebreakpoint75::NUMERIC,
    r.rank9mthquartilebreakpoint99::NUMERIC,
    r.absrank9mth::INTEGER,
    r.categorysize9mth::INTEGER,
    
    -- 1 Year
    r.rank1yr::NUMERIC,
    r.rank1yrquartile,
    r.rank1yrquartilebreakpoint1::NUMERIC,
    r.rank1yrquartilebreakpoint25::NUMERIC,
    r.rank1yrquartilebreakpoint50::NUMERIC,
    r.rank1yrquartilebreakpoint75::NUMERIC,
    r.rank1yrquartilebreakpoint99::NUMERIC,
    r.absrank1yr::INTEGER,
    r.categorysize1yr::INTEGER,
    
    -- 2 Year
    r.rank2yr::NUMERIC,
    r.rank2yrquartile,
    r.rank2yrquartilebreakpoint1::NUMERIC,
    r.rank2yrquartilebreakpoint25::NUMERIC,
    r.rank2yrquartilebreakpoint50::NUMERIC,
    r.rank2yrquartilebreakpoint75::NUMERIC,
    r.rank2yrquartilebreakpoint99::NUMERIC,
    r.absrank2yr::INTEGER,
    r.categorysize2yr::INTEGER,
    
    -- 3 Year
    r.rank3yr::NUMERIC,
    r.rank3yrquartile,
    r.rank3yrquartilebreakpoint1::NUMERIC,
    r.rank3yrquartilebreakpoint25::NUMERIC,
    r.rank3yrquartilebreakpoint50::NUMERIC,
    r.rank3yrquartilebreakpoint75::NUMERIC,
    r.rank3yrquartilebreakpoint99::NUMERIC,
    r.absrank3yr::INTEGER,
    r.categorysize3yr::INTEGER,
    
    -- 4 Year
    r.rank4yr::NUMERIC,
    r.rank4yrquartile,
    r.rank4yrquartilebreakpoint1::NUMERIC,
    r.rank4yrquartilebreakpoint25::NUMERIC,
    r.rank4yrquartilebreakpoint50::NUMERIC,
    r.rank4yrquartilebreakpoint75::NUMERIC,
    r.rank4yrquartilebreakpoint99::NUMERIC,
    r.absrank4yr::INTEGER,
    r.categorysize4yr::INTEGER,
    
    -- 5 Year
    r.rank5yr::NUMERIC,
    r.rank5yrquartile,
    r.rank5yrquartilebreakpoint1::NUMERIC,
    r.rank5yrquartilebreakpoint25::NUMERIC,
    r.rank5yrquartilebreakpoint50::NUMERIC,
    r.rank5yrquartilebreakpoint75::NUMERIC,
    r.rank5yrquartilebreakpoint99::NUMERIC,
    r.absrank5yr::INTEGER,
    r.categorysize5yr::INTEGER,
    
    -- 6 Year
    r.rank6yr::NUMERIC,
    r.rank6yrquartile,
    r.rank6yrquartilebreakpoint1::NUMERIC,
    r.rank6yrquartilebreakpoint25::NUMERIC,
    r.rank6yrquartilebreakpoint50::NUMERIC,
    r.rank6yrquartilebreakpoint75::NUMERIC,
    r.rank6yrquartilebreakpoint99::NUMERIC,
    r.absrank6yr::INTEGER,
    r.categorysize6yr::INTEGER,
    
    -- 7 Year
    r.rank7yr::NUMERIC,
    r.rank7yrquartile,
    r.rank7yrquartilebreakpoint1::NUMERIC,
    r.rank7yrquartilebreakpoint25::NUMERIC,
    r.rank7yrquartilebreakpoint50::NUMERIC,
    r.rank7yrquartilebreakpoint75::NUMERIC,
    r.rank7yrquartilebreakpoint99::NUMERIC,
    r.absrank7yr::INTEGER,
    r.categorysize7yr::INTEGER,
    
    -- 8 Year
    r.rank8yr::NUMERIC,
    r.rank8yrquartile,
    r.rank8yrquartilebreakpoint1::NUMERIC,
    r.rank8yrquartilebreakpoint25::NUMERIC,
    r.rank8yrquartilebreakpoint50::NUMERIC,
    r.rank8yrquartilebreakpoint75::NUMERIC,
    r.rank8yrquartilebreakpoint99::NUMERIC,
    r.absrank8yr::INTEGER,
    r.categorysize8yr::INTEGER,
    
    -- 9 Year
    r.rank9yr::NUMERIC,
    r.rank9yrquartile,
    r.rank9yrquartilebreakpoint1::NUMERIC,
    r.rank9yrquartilebreakpoint25::NUMERIC,
    r.rank9yrquartilebreakpoint50::NUMERIC,
    r.rank9yrquartilebreakpoint75::NUMERIC,
    r.rank9yrquartilebreakpoint99::NUMERIC,
    r.absrank9yr::INTEGER,
    r.categorysize9yr::INTEGER,
    
    -- 10 Year
    r.rank10yr::NUMERIC,
    r.rank10yrquartile,
    r.rank10yrquartilebreakpoint1::NUMERIC,
    r.rank10yrquartilebreakpoint25::NUMERIC,
    r.rank10yrquartilebreakpoint50::NUMERIC,
    r.rank10yrquartilebreakpoint75::NUMERIC,
    r.rank10yrquartilebreakpoint99::NUMERIC,
    r.absrank10yr::INTEGER,
    r.categorysize10yr::INTEGER,
    
    -- 15 Year
    r.rank15yr::NUMERIC,
    r.rank15yrquartile,
    r.rank15yrquartilebreakpoint1::NUMERIC,
    r.rank15yrquartilebreakpoint25::NUMERIC,
    r.rank15yrquartilebreakpoint50::NUMERIC,
    r.rank15yrquartilebreakpoint75::NUMERIC,
    r.rank15yrquartilebreakpoint99::NUMERIC,
    r.absrank15yr::INTEGER,
    r.categorysize15yr::INTEGER,
    
    -- 20 Year
    r.rank20yr::NUMERIC,
    r.rank20yrquartile,
    r.rank20yrquartilebreakpoint1::NUMERIC,
    r.rank20yrquartilebreakpoint25::NUMERIC,
    r.rank20yrquartilebreakpoint50::NUMERIC,
    r.rank20yrquartilebreakpoint75::NUMERIC,
    r.rank20yrquartilebreakpoint99::NUMERIC,
    r.absrank20yr::INTEGER,
    r.categorysize20yr::INTEGER,
    
    -- YTD
    r.rankytd::NUMERIC,
    r.rankytdquartile,
    r.rankytdquartilebreakpoint1::NUMERIC,
    r.rankytdquartilebreakpoint25::NUMERIC,
    r.rankytdquartilebreakpoint50::NUMERIC,
    r.rankytdquartilebreakpoint75::NUMERIC,
    r.rankytdquartilebreakpoint99::NUMERIC,
    r.absrankytd::INTEGER,
    r.categorysizeytd::INTEGER,
    
    -- Metadata
    r.status_code,
    r.status_message
  FROM ms.month_end_trailing_total_return_percentile_and_absolute_ranks_c r
  WHERE r._id = ANY(p_fund_ids)
    -- Exact match: monthenddate = asofdate
    AND r.monthenddate = p_asof_date::TEXT
  -- Get the last record based on _timestampfrom
  ORDER BY r._id, r._timestampfrom DESC;
$$;

-- =====================================================
-- Usage Examples
-- =====================================================

-- Example 1: Get rankings for single fund as of today
/*
SELECT 
  _id,
  _name,
  monthenddate,
  rank1yr,
  rank1yrquartile,
  absrank1yr,
  categorysize1yr
FROM ms.fn_get_rankings_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Example 2: Get rankings for multiple funds as of specific date
/*
SELECT 
  _id,
  monthenddate,
  rank3yr,
  rank3yrquartile,
  rank5yr,
  rank5yrquartile
FROM ms.fn_get_rankings_at_date(
  ARRAY['F00000ABCD', 'F00000EFGH', 'F00000IJKL'],
  '2024-06-30'::DATE
);
*/

-- Example 3: Get rankings for all funds in category
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
  r.monthenddate,
  r.rank1yr,
  r.absrank1yr,
  r.categorysize1yr
FROM category_funds cf
CROSS JOIN LATERAL ms.fn_get_rankings_at_date(cf.fund_ids, '2024-06-30'::DATE) r
ORDER BY r.absrank1yr ASC NULLS LAST;
*/

-- =====================================================
-- Notes
-- =====================================================
-- 1. Rankings show how a fund performs relative to peers in its category
-- 2. Percentile rank (rank): 0-100, where lower = better performance
-- 3. Absolute rank (absrank): 1 = best performer, higher numbers = worse performance
-- 4. Quartile: 1 (top 25%), 2 (25-50%), 3 (50-75%), 4 (bottom 25%)
-- 5. Quartile breakpoints show the performance thresholds for each quartile
-- 6. Category size shows how many funds are in the comparison group
-- 7. Rankings are calculated monthly (month-end)
-- 8. Returns 173 columns total including all time periods and quartile breakpoints
-- 9. Use this with performance returns to get complete picture
