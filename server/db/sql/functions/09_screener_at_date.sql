-- =====================================================
-- Function: Get Screener Data at Specific Date
-- =====================================================
-- Purpose: Single-query screener that joins basic info with
--          performance, fees, risk, ratings, and assets tables
--          returning only the lean column set the screener UI needs.
--
-- Replaces the N+1 waterfall of separate fund-list pagination
-- followed by batched domain calls (5 functions × N batches).
--
-- When p_asof_date is NULL the latest monthenddate is auto-discovered
-- and the fast materialized view is used for fund identity columns.
-- =====================================================

CREATE OR REPLACE FUNCTION ms.fn_get_screener_at_date(
    p_category TEXT DEFAULT NULL,
    p_type     TEXT DEFAULT NULL,
    p_asof_date DATE DEFAULT NULL
)
RETURNS TABLE (
    _id            TEXT,
    fundname       TEXT,
    ticker         TEXT,
    categoryname   TEXT,
    securitytype   TEXT,
    return1yr      NUMERIC,
    return3yr      NUMERIC,
    return5yr      NUMERIC,
    return10yr     NUMERIC,
    mer            NUMERIC,
    sharperatio3yr NUMERIC,
    ratingoverall  NUMERIC,
    fundnetassets  NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_asof_date DATE;
BEGIN
    -- Resolve effective month-end date
    IF p_asof_date IS NOT NULL THEN
        v_asof_date := p_asof_date;
    ELSE
        SELECT MAX(monthenddate::DATE) INTO v_asof_date
        FROM ms.month_end_trailing_total_returns_ca_openend
        WHERE monthenddate IS NOT NULL;
    END IF;

    IF p_asof_date IS NULL THEN
        -- Fast path: latest materialized view (securitytype already translated)
        RETURN QUERY
        SELECT
            bf._id,
            bf.fundname,
            bf.ticker,
            bf.categoryname,
            bf.securitytype,
            perf.return1yr::NUMERIC,
            perf.return3yr::NUMERIC,
            perf.return5yr::NUMERIC,
            perf.return10yr::NUMERIC,
            fees.mer::NUMERIC,
            risk.sharperatio3yr::NUMERIC,
            rat.ratingoverall::NUMERIC,
            assets.fundnetassets::NUMERIC
        FROM ms.mv_fund_share_class_basic_info_ca_openend_latest bf
        LEFT JOIN ms.month_end_trailing_total_returns_ca_openend perf
            ON perf._id = bf._id AND perf.monthenddate = v_asof_date::TEXT
        LEFT JOIN ms.annual_report_fees_ca_openend fees
            ON fees._id = bf._id AND fees.monthenddate = v_asof_date::TEXT
        LEFT JOIN ms.risk_measure_ca_openend risk
            ON risk._id = bf._id AND risk.monthenddate = v_asof_date::TEXT
        LEFT JOIN ms.morningstar_rating_ca_openend rat
            ON rat._id = bf._id AND rat.monthenddate = v_asof_date::TEXT
        LEFT JOIN ms.fund_level_net_assets_ca_openend assets
            ON assets._id = bf._id AND assets.monthenddate = v_asof_date::TEXT
        WHERE (p_category IS NULL OR bf.categoryname = p_category)
          AND (p_type IS NULL OR bf.securitytype = p_type)
        ORDER BY perf.return1yr::NUMERIC DESC NULLS LAST;
    ELSE
        -- Temporal path: point-in-time basic info (securitytype needs translation)
        RETURN QUERY
        SELECT
            bf._id,
            bf.fundname,
            bf.ticker,
            bf.categoryname,
            CASE bf.securitytype
                WHEN 'FO' THEN 'Mutual Fund'
                WHEN 'FE' THEN 'ETF'
                ELSE bf.securitytype
            END,
            perf.return1yr::NUMERIC,
            perf.return3yr::NUMERIC,
            perf.return5yr::NUMERIC,
            perf.return10yr::NUMERIC,
            fees.mer::NUMERIC,
            risk.sharperatio3yr::NUMERIC,
            rat.ratingoverall::NUMERIC,
            assets.fundnetassets::NUMERIC
        FROM ms.fund_share_class_basic_info_ca_openend bf
        LEFT JOIN ms.month_end_trailing_total_returns_ca_openend perf
            ON perf._id = bf._id AND perf.monthenddate = v_asof_date::TEXT
        LEFT JOIN ms.annual_report_fees_ca_openend fees
            ON fees._id = bf._id AND fees.monthenddate = v_asof_date::TEXT
        LEFT JOIN ms.risk_measure_ca_openend risk
            ON risk._id = bf._id AND risk.monthenddate = v_asof_date::TEXT
        LEFT JOIN ms.morningstar_rating_ca_openend rat
            ON rat._id = bf._id AND rat.monthenddate = v_asof_date::TEXT
        LEFT JOIN ms.fund_level_net_assets_ca_openend assets
            ON assets._id = bf._id AND assets.monthenddate = v_asof_date::TEXT
        WHERE bf.monthenddate = v_asof_date::TEXT
          AND (p_category IS NULL OR bf.categoryname = p_category)
          AND (p_type IS NULL OR
               CASE bf.securitytype
                   WHEN 'FO' THEN 'Mutual Fund'
                   WHEN 'FE' THEN 'ETF'
                   ELSE bf.securitytype
               END = p_type)
        ORDER BY perf.return1yr::NUMERIC DESC NULLS LAST;
    END IF;
END;
$$;
