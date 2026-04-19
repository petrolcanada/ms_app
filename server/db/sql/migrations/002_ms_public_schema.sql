BEGIN;

CREATE SCHEMA IF NOT EXISTS ms_public;

CREATE TABLE IF NOT EXISTS ms_public.snapshot_meta (
  snapshot_name TEXT PRIMARY KEY,
  published_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL
);

DROP MATERIALIZED VIEW IF EXISTS ms_public.dashboard_stats_mv;
CREATE MATERIALIZED VIEW ms_public.dashboard_stats_mv AS
SELECT
  (SELECT COUNT(*)::INTEGER FROM ms.mv_fund_share_class_basic_info_ca_openend_latest) AS total_funds,
  ROUND(AVG(s.return1yr::NUMERIC), 2) AS avg_return_1yr,
  ROUND(AVG(f.mer::NUMERIC), 2) AS avg_mer,
  ROUND(AVG(r.ratingoverall::NUMERIC), 1) AS avg_rating,
  MAX(s.monthenddate) AS latest_date
FROM ms.month_end_trailing_total_returns_ca_openend s
LEFT JOIN ms.annual_report_fees_ca_openend f
  ON f._id = s._id
  AND f._timestampto IS NULL
LEFT JOIN ms.morningstar_rating_ca_openend r
  ON r._id = s._id
  AND r.monthenddate = s.monthenddate
WHERE s.return1yr IS NOT NULL
  AND s.monthenddate = (
    SELECT MAX(monthenddate)
    FROM ms.month_end_trailing_total_returns_ca_openend
    WHERE monthenddate IS NOT NULL
  )
WITH NO DATA;

DROP MATERIALIZED VIEW IF EXISTS ms_public.top_performers_mv;
CREATE MATERIALIZED VIEW ms_public.top_performers_mv AS
SELECT
  ROW_NUMBER() OVER (ORDER BY p.return1yr::NUMERIC DESC NULLS LAST)::INTEGER AS display_order,
  p._id,
  b.fundname,
  b.ticker,
  b.categoryname,
  b.securitytype,
  p.return1yr::NUMERIC AS return1yr,
  p.return3yr::NUMERIC AS return3yr,
  p.return5yr::NUMERIC AS return5yr,
  r.ratingoverall::NUMERIC AS ratingoverall
FROM ms.month_end_trailing_total_returns_ca_openend p
JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b
  ON b._id = p._id
LEFT JOIN ms.morningstar_rating_ca_openend r
  ON r._id = p._id
  AND r.monthenddate = p.monthenddate
WHERE p.return1yr IS NOT NULL
  AND p.monthenddate = (
    SELECT MAX(monthenddate)
    FROM ms.month_end_trailing_total_returns_ca_openend
    WHERE monthenddate IS NOT NULL
  )
ORDER BY p.return1yr::NUMERIC DESC NULLS LAST
LIMIT 10
WITH NO DATA;

DROP MATERIALIZED VIEW IF EXISTS ms_public.largest_flows_mv;
CREATE MATERIALIZED VIEW ms_public.largest_flows_mv AS
(SELECT
   1::INTEGER AS group_order,
   ROW_NUMBER() OVER (ORDER BY f.estfundlevelnetflow1momoend::NUMERIC DESC NULLS LAST)::INTEGER AS display_order,
   f._id,
   b.fundname,
   b.ticker,
   b.categoryname,
   f.estfundlevelnetflow1momoend::NUMERIC AS flow_1m,
   f.estfundlevelnetflow1yrmoend::NUMERIC AS flow_1yr,
   'inflow'::TEXT AS direction
 FROM ms.fund_flow_details_ca_openend f
 JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b
   ON b._id = f._id
 WHERE f.estfundlevelnetflow1momoend IS NOT NULL
   AND f.estfundlevelnetflowdatemoend = (
     SELECT MAX(estfundlevelnetflowdatemoend)
     FROM ms.fund_flow_details_ca_openend
     WHERE estfundlevelnetflowdatemoend IS NOT NULL
   )
 ORDER BY f.estfundlevelnetflow1momoend::NUMERIC DESC NULLS LAST
 LIMIT 5)
UNION ALL
(SELECT
   2::INTEGER AS group_order,
   ROW_NUMBER() OVER (ORDER BY f.estfundlevelnetflow1momoend::NUMERIC ASC NULLS LAST)::INTEGER AS display_order,
   f._id,
   b.fundname,
   b.ticker,
   b.categoryname,
   f.estfundlevelnetflow1momoend::NUMERIC AS flow_1m,
   f.estfundlevelnetflow1yrmoend::NUMERIC AS flow_1yr,
   'outflow'::TEXT AS direction
 FROM ms.fund_flow_details_ca_openend f
 JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b
   ON b._id = f._id
 WHERE f.estfundlevelnetflow1momoend IS NOT NULL
   AND f.estfundlevelnetflowdatemoend = (
     SELECT MAX(estfundlevelnetflowdatemoend)
     FROM ms.fund_flow_details_ca_openend
     WHERE estfundlevelnetflowdatemoend IS NOT NULL
   )
 ORDER BY f.estfundlevelnetflow1momoend::NUMERIC ASC NULLS LAST
 LIMIT 5)
WITH NO DATA;

DROP MATERIALIZED VIEW IF EXISTS ms_public.highest_rated_mv;
CREATE MATERIALIZED VIEW ms_public.highest_rated_mv AS
SELECT
  ROW_NUMBER() OVER (
    ORDER BY r.ratingoverall::NUMERIC DESC, p.return1yr::NUMERIC DESC NULLS LAST
  )::INTEGER AS display_order,
  r._id,
  b.fundname,
  b.ticker,
  b.categoryname,
  b.securitytype,
  r.ratingoverall::NUMERIC AS ratingoverall,
  r.rating3year::NUMERIC AS rating3year,
  r.rating5year::NUMERIC AS rating5year,
  p.return1yr::NUMERIC AS return1yr,
  p.return3yr::NUMERIC AS return3yr
FROM ms.morningstar_rating_ca_openend r
JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b
  ON b._id = r._id
LEFT JOIN ms.month_end_trailing_total_returns_ca_openend p
  ON p._id = r._id
  AND p.monthenddate = r.monthenddate
WHERE r.ratingoverall IS NOT NULL
  AND r.ratingoverall::NUMERIC >= 4
  AND r.monthenddate = (
    SELECT MAX(monthenddate)
    FROM ms.month_end_trailing_total_returns_ca_openend
    WHERE monthenddate IS NOT NULL
  )
ORDER BY r.ratingoverall::NUMERIC DESC, p.return1yr::NUMERIC DESC NULLS LAST
LIMIT 10
WITH NO DATA;

DROP MATERIALIZED VIEW IF EXISTS ms_public.available_dates_mv;
CREATE MATERIALIZED VIEW ms_public.available_dates_mv AS
SELECT
  ROW_NUMBER() OVER (ORDER BY monthenddate DESC)::INTEGER AS display_order,
  monthenddate
FROM (
  SELECT DISTINCT monthenddate
  FROM ms.month_end_trailing_total_returns_ca_openend
  WHERE monthenddate IS NOT NULL
) dates
ORDER BY monthenddate DESC
WITH NO DATA;

CREATE OR REPLACE FUNCTION ms_public.refresh_public_dashboard()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  refreshed_at TIMESTAMPTZ := NOW();
BEGIN
  REFRESH MATERIALIZED VIEW ms_public.dashboard_stats_mv;
  REFRESH MATERIALIZED VIEW ms_public.top_performers_mv;
  REFRESH MATERIALIZED VIEW ms_public.largest_flows_mv;
  REFRESH MATERIALIZED VIEW ms_public.highest_rated_mv;
  REFRESH MATERIALIZED VIEW ms_public.available_dates_mv;

  INSERT INTO ms_public.snapshot_meta (snapshot_name, published_at, source)
  VALUES
    ('dashboard', refreshed_at, 'ms_public'),
    ('available_dates', refreshed_at, 'ms_public')
  ON CONFLICT (snapshot_name) DO UPDATE
  SET published_at = EXCLUDED.published_at,
      source = EXCLUDED.source;
END;
$$;

SELECT ms_public.refresh_public_dashboard();

COMMIT;
