-- =====================================================
-- Function: Get Fee Information at Specific Date
-- =====================================================
-- Tables: prospectus_fees_ca_openend, annual_report_fees_ca_openend, fee_levels_ca_openend
-- Date Sensitivity: Snapshot tables with temporal tracking + report dates
-- Pattern: last record date_column<=asofdate per _ID
-- This function combines data from 3 fee-related tables
-- =====================================================

-- Prospectus Fees (snapshot with temporal tracking)
CREATE OR REPLACE FUNCTION ms.fn_get_prospectus_fees_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  -- Core Identifiers
  _id TEXT,
  _idtype TEXT,
  _name TEXT,
  
  -- Dates
  prospectusdate TEXT,
  latestprospectusdate TEXT,
  
  -- Expense Ratios
  grossexpenseratio NUMERIC,
  netexpenseratio NUMERIC,
  
  -- Fee Components
  actualmanagementfee NUMERIC,
  administrationfee NUMERIC,
  trusteefee NUMERIC,
  transactionfee NUMERIC,
  switchingfee NUMERIC,
  
  -- Performance Fees
  performancefee NUMERIC,
  performancefeecharged TEXT,
  performancefeeindexname TEXT,
  performancefeeindexweighting NUMERIC,
  
  -- Fee Negotiability
  feenegotiable TEXT,
  
  -- Metadata
  status_code NUMERIC,
  status_message TEXT
)
LANGUAGE sql
STABLE
AS $$
  -- Get prospectus fees where prospectusdate <= asofdate
  -- Pattern: last record prospectusdate<=asofdate per _ID
  SELECT DISTINCT ON (p._id)
    -- Core Identifiers
    p._id,
    p._idtype,
    p._name,
    
    -- Dates
    p.prospectusdate,
    p.latestprospectusdate,
    
    -- Expense Ratios
    p.grossexpenseratio::NUMERIC,
    p.netexpenseratio::NUMERIC,
    
    -- Fee Components
    p.actualmanagementfee::NUMERIC,
    p.administrationfee::NUMERIC,
    p.trusteefee::NUMERIC,
    p.transactionfee::NUMERIC,
    p.switchingfee::NUMERIC,
    
    -- Performance Fees
    p.performancefee::NUMERIC,
    p.performancefeecharged,
    p.performancefeeindexname,
    p.performancefeeindexweighting::NUMERIC,
    
    -- Fee Negotiability
    p.feenegotiable,
    
    -- Metadata
    p.status_code,
    p.status_message
  FROM ms.prospectus_fees_ca_openend p
  WHERE p._id = ANY(p_fund_ids)
    -- Last record where prospectusdate <= asofdate
    AND p.prospectusdate <= p_asof_date::TEXT
  ORDER BY p._id, p.prospectusdate DESC;
$$;

-- Annual Report Fees (report-based with temporal tracking)
CREATE OR REPLACE FUNCTION ms.fn_get_annual_report_fees_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  -- Core Identifiers
  _id TEXT,
  _idtype TEXT,
  _name TEXT,
  _currencyid TEXT,
  
  -- Dates
  annualreportdate TEXT,
  interimnetexpenseratiodate TEXT,
  semi_annual_report_net_expense_ratio_date TEXT,
  semi_annual_report_turnover_ratio_date TEXT,
  
  -- Expense Ratios
  mer NUMERIC,
  interimnetexpenseratio NUMERIC,
  
  -- Trading Costs
  tradingexpenseratio NUMERIC,
  
  -- Metadata
  status_code NUMERIC,
  status_message TEXT,
  fault_faultstring TEXT,
  fault_detail_errorcode TEXT
)
LANGUAGE sql
STABLE
AS $$
  -- Get annual report fees where annualreportdate <= asofdate
  -- Pattern: last record annualreportdate<=asofdate per _ID
  SELECT DISTINCT ON (a._id)
    -- Core Identifiers
    a._id,
    a._idtype,
    a._name,
    a._currencyid,
    
    -- Dates
    a.annualreportdate,
    a.interimnetexpenseratiodate,
    a.semi_annual_report_net_expense_ratio_date,
    a.semi_annual_report_turnover_ratio_date,
    
    -- Expense Ratios
    a.mer::NUMERIC,
    a.interimnetexpenseratio::NUMERIC,
    
    -- Trading Costs
    a.tradingexpenseratio::NUMERIC,
    
    -- Metadata
    a.status_code,
    a.status_message,
    a.fault_faultstring,
    a.fault_detail_errorcode
  FROM ms.annual_report_fees_ca_openend a
  WHERE a._id = ANY(p_fund_ids)
    -- Last record where annualreportdate <= asofdate
    AND a.annualreportdate <= p_asof_date::TEXT
  ORDER BY a._id, a.annualreportdate DESC;
$$;

-- Fee Levels (time-series with temporal tracking)
CREATE OR REPLACE FUNCTION ms.fn_get_fee_levels_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  -- Core Identifiers
  _id TEXT,
  _idtype TEXT,
  _name TEXT,
  
  -- Fee Level Data
  feeleveldate TEXT,
  feelevel TEXT,
  feelevelrank TEXT,
  
  -- Metadata
  status_code NUMERIC,
  status_message TEXT,
  fault_faultstring TEXT,
  fault_detail_errorcode TEXT
)
LANGUAGE sql
STABLE
AS $$
  -- Get fee level data where feeleveldate <= asofdate
  -- Pattern: last record feeleveldate<=asofdate per _ID
  SELECT DISTINCT ON (f._id)
    -- Core Identifiers
    f._id,
    f._idtype,
    f._name,
    
    -- Fee Level Data
    f.feeleveldate,
    f.feelevel,
    f.feelevelrank,
    
    -- Metadata
    f.status_code,
    f.status_message,
    f.fault_faultstring,
    f.fault_detail_errorcode
  FROM ms.fee_levels_ca_openend f
  WHERE f._id = ANY(p_fund_ids)
    -- Last record where feeleveldate <= asofdate
    AND f.feeleveldate <= p_asof_date::TEXT
  ORDER BY f._id, f.feeleveldate DESC;
$$;

-- Combined Fee Function (all fee data in one call)
CREATE OR REPLACE FUNCTION ms.fn_get_all_fees_at_date(
  p_fund_ids TEXT[],
  p_asof_date DATE
)
RETURNS TABLE (
  _id TEXT,
  _name TEXT,
  
  -- Prospectus Fees
  prospectusdate TEXT,
  latestprospectusdate TEXT,
  grossexpenseratio NUMERIC,
  netexpenseratio NUMERIC,
  actualmanagementfee NUMERIC,
  administrationfee NUMERIC,
  trusteefee NUMERIC,
  transactionfee NUMERIC,
  switchingfee NUMERIC,
  performancefee NUMERIC,
  performancefeecharged TEXT,
  performancefeeindexname TEXT,
  performancefeeindexweighting NUMERIC,
  feenegotiable TEXT,
  
  -- Annual Report Fees
  annualreportdate TEXT,
  mer NUMERIC,
  interimnetexpenseratio NUMERIC,
  interimnetexpenseratiodate TEXT,
  tradingexpenseratio NUMERIC,
  semi_annual_report_net_expense_ratio_date TEXT,
  semi_annual_report_turnover_ratio_date TEXT,
  annual_currencyid TEXT,
  
  -- Fee Levels
  feeleveldate TEXT,
  feelevel TEXT,
  feelevelrank TEXT
)
LANGUAGE sql
STABLE
AS $$
  -- Combine all fee data using LEFT JOINs
  SELECT 
    COALESCE(p._id, a._id, f._id) as _id,
    COALESCE(p._name, a._name, f._name) as _name,
    
    -- Prospectus Fees
    p.prospectusdate,
    p.latestprospectusdate,
    p.grossexpenseratio,
    p.netexpenseratio,
    p.actualmanagementfee,
    p.administrationfee,
    p.trusteefee,
    p.transactionfee,
    p.switchingfee,
    p.performancefee,
    p.performancefeecharged,
    p.performancefeeindexname,
    p.performancefeeindexweighting,
    p.feenegotiable,
    
    -- Annual Report Fees
    a.annualreportdate,
    a.mer,
    a.interimnetexpenseratio,
    a.interimnetexpenseratiodate,
    a.tradingexpenseratio,
    a.semi_annual_report_net_expense_ratio_date,
    a.semi_annual_report_turnover_ratio_date,
    a._currencyid as annual_currencyid,
    
    -- Fee Levels
    f.feeleveldate,
    f.feelevel,
    f.feelevelrank
  FROM ms.fn_get_prospectus_fees_at_date(p_fund_ids, p_asof_date) p
  FULL OUTER JOIN ms.fn_get_annual_report_fees_at_date(p_fund_ids, p_asof_date) a
    ON p._id = a._id
  FULL OUTER JOIN ms.fn_get_fee_levels_at_date(p_fund_ids, p_asof_date) f
    ON COALESCE(p._id, a._id) = f._id;
$$;

-- =====================================================
-- Usage Examples
-- =====================================================

-- Example 1: Get all fees for single fund
/*
SELECT * FROM ms.fn_get_all_fees_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Example 2: Get just prospectus fees
/*
SELECT 
  _id,
  _name,
  prospectusdate,
  grossexpenseratio,
  netexpenseratio,
  actualmanagementfee,
  performancefee,
  feenegotiable
FROM ms.fn_get_prospectus_fees_at_date(
  ARRAY['F00000ABCD', 'F00000EFGH'],
  '2024-06-30'::DATE
);
*/

-- Example 3: Get annual report fees (actual fees charged)
/*
SELECT 
  _id,
  _name,
  annualreportdate,
  mer,
  tradingexpenseratio,
  interimnetexpenseratio,
  _currencyid
FROM ms.fn_get_annual_report_fees_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
*/

-- Example 4: Compare fees across category
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
  f.netexpenseratio,
  f.mer,
  f.feelevel,
  f.feelevelrank
FROM category_funds cf
CROSS JOIN LATERAL ms.fn_get_all_fees_at_date(cf.fund_ids, CURRENT_DATE) f
ORDER BY f.netexpenseratio ASC NULLS LAST;
*/

-- Example 5: Get fee levels only
/*
SELECT 
  _id,
  _name,
  feeleveldate,
  feelevel,
  feelevelrank
FROM ms.fn_get_fee_levels_at_date(
  ARRAY['F00000ABCD', 'F00000EFGH'],
  CURRENT_DATE
)
ORDER BY feelevel ASC;
*/

-- =====================================================
-- Notes
-- =====================================================
-- 1. Prospectus fees: Forward-looking fee estimates from fund prospectus
-- 2. Annual report fees: Actual fees charged (MER = Management Expense Ratio)
-- 3. Fee levels: Ranking of fees within category (1 = lowest fees, 5 = highest)
-- 4. Net expense ratio includes fee waivers, gross does not
-- 5. MER is the Canadian equivalent of expense ratio (total annual operating expenses)
-- 6. Trading expense ratio shows portfolio turnover costs
-- 7. Performance fees are charged when fund outperforms a benchmark
-- 8. Fee negotiability indicates if fees can be negotiated for large investments
-- 9. Use prospectus fees for forward-looking analysis
-- 10. Use annual report fees (MER) for actual historical costs
-- 11. Fee levels provide easy comparison within category
