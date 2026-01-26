# Date-Sensitive SQL Functions for Morningstar Data

This directory contains PostgreSQL functions that provide date-sensitive queries for the Morningstar database schema. All functions handle both **time-series date columns** (like `monthenddate`, `ratingdate`) and **temporal tracking** (`_timestampfrom`, `_timestampto`) to ensure accurate point-in-time queries.

## Overview

The Morningstar database has 14 tables with two types of date sensitivity:

1. **Snapshot Tables**: Only use temporal tracking (`_timestampfrom`, `_timestampto`)
   - Example: `fund_share_class_basic_info_ca_openend`
   - Query pattern: Get the version that was valid at the asof date

2. **Time-Series Tables**: Use BOTH a date column AND temporal tracking
   - Example: `month_end_trailing_total_returns_ca_openend` (has `monthenddate`)
   - Query pattern: Get the most recent data point on or before asof date, using the version valid at that date

## Function Architecture

### 8 Domain Functions

These functions align with the multi-domain query architecture:

| Function | File | Table(s) | Domain | Date Column |
|----------|------|----------|--------|-------------|
| `fn_get_basic_info_at_date` | 01_basic_info_at_date.sql | fund_share_class_basic_info_ca_openend | Basic Info | Temporal only |
| `fn_get_performance_at_date` | 02_performance_at_date.sql | month_end_trailing_total_returns_ca_openend | Performance | monthenddate |
| `fn_get_rankings_at_date` | 03_rankings_at_date.sql | month_end_trailing_total_return_percentile_and_absolute_ranks_c | Rankings | monthenddate |
| `fn_get_ratings_at_date` | 04_ratings_at_date.sql | morningstar_rating_ca_openend | Ratings | ratingdate |
| `fn_get_all_fees_at_date` | 05_fees_at_date.sql | prospectus_fees, annual_report_fees, fee_levels | Fees | Multiple |
| `fn_get_all_risk_at_date` | 06_risk_at_date.sql | risk_measure, relative_risk_measure_prospectus | Risk | enddate |
| `fn_get_flows_at_date` | 07_flows_at_date.sql | fund_flow_details_ca_openend | Flows | estfundlevelnetflowdatemoend |
| `fn_get_assets_at_date` | 08_assets_at_date.sql | fund_level_net_assets_ca_openend | Assets | netassetsdate |

### Additional Helper Functions

- `fn_get_performance_history` - Get performance data for a date range
- `fn_get_flow_history` - Get flow data for a date range
- `fn_get_assets_history` - Get asset data for a date range
- `fn_get_prospectus_fees_at_date` - Get just prospectus fees
- `fn_get_annual_report_fees_at_date` - Get just annual report fees
- `fn_get_fee_levels_at_date` - Get just fee levels
- `fn_get_risk_measures_at_date` - Get just absolute risk measures
- `fn_get_relative_risk_at_date` - Get just relative risk measures

## Installation

### Option 1: Deploy All Functions

```bash
cd server
npm run deploy-functions
```

This will execute all SQL files in order and create all functions in the `ms` schema.

### Option 2: Deploy Individual Functions

```bash
psql -h localhost -U postgres -d your_database -f sql/functions/01_basic_info_at_date.sql
```

### Option 3: Use the Deployment Script

```bash
node tools/deploy-functions.js
```

## Usage Patterns

### Pattern 1: Single Fund, Single Domain

Get performance data for one fund as of today:

```sql
SELECT * FROM ms.fn_get_performance_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
```

### Pattern 2: Multiple Funds, Single Domain

Get ratings for multiple funds as of a specific date:

```sql
SELECT * FROM ms.fn_get_ratings_at_date(
  ARRAY['F00000ABCD', 'F00000EFGH', 'F00000IJKL'],
  '2024-06-30'::DATE
);
```

### Pattern 3: Category-Wide Query

Get all funds in a category with their performance:

```sql
WITH category_funds AS (
  SELECT ARRAY_AGG(DISTINCT _id) as fund_ids
  FROM ms.fund_share_class_basic_info_ca_openend
  WHERE categorycode = 'CAEQUITY'
    AND _timestampto IS NULL
)
SELECT p.*
FROM category_funds cf
CROSS JOIN LATERAL ms.fn_get_performance_at_date(cf.fund_ids, CURRENT_DATE) p
ORDER BY p.trailingreturn1yr DESC NULLS LAST;
```

### Pattern 4: Multi-Domain Query (Backend Merge)

The backend should call multiple functions in parallel and merge results:

```javascript
// Backend code (Node.js)
const [basicInfo, performance, fees, ratings] = await Promise.all([
  db.query('SELECT * FROM ms.fn_get_basic_info_at_date($1, $2)', [fundIds, asofDate]),
  db.query('SELECT * FROM ms.fn_get_performance_at_date($1, $2)', [fundIds, asofDate]),
  db.query('SELECT * FROM ms.fn_get_all_fees_at_date($1, $2)', [fundIds, asofDate]),
  db.query('SELECT * FROM ms.fn_get_ratings_at_date($1, $2)', [fundIds, asofDate])
]);

// Merge results by _id
const merged = mergeFundData(basicInfo.rows, performance.rows, fees.rows, ratings.rows);
```

### Pattern 5: Historical Time-Series Query

Get 12 months of performance history:

```sql
SELECT * FROM ms.fn_get_performance_history(
  'F00000ABCD',
  '2023-07-01'::DATE,
  '2024-06-30'::DATE
);
```

## Date Filtering Logic

### For Snapshot Tables (Temporal Tracking Only)

```sql
WHERE _id = ANY(p_fund_ids)
  AND _timestampfrom <= p_asof_date
  AND (_timestampto IS NULL OR _timestampto > p_asof_date)
```

### For Time-Series Tables (Date Column + Temporal Tracking)

```sql
WHERE _id = ANY(p_fund_ids)
  -- Time-series: get data point on or before asof date
  AND date_column <= p_asof_date::TEXT
  -- Temporal: get version valid at asof date
  AND _timestampfrom <= p_asof_date
  AND (_timestampto IS NULL OR _timestampto > p_asof_date)
ORDER BY _id, date_column DESC
```

**IMPORTANT**: The `monthenddate` must be **between** `_timestampfrom` and `_timestampto` to ensure the data point existed at that time.

## Key Concepts

### Temporal Tracking

All 14 tables have `_timestampfrom` and `_timestampto` columns:
- `_timestampfrom`: When this version of the record was loaded into the database
- `_timestampto`: When this version was superseded (NULL = current version)

This allows "time travel" queries to see data as it existed on any historical date.

### Time-Series Date Columns

Some tables have dedicated date columns representing when the data was measured:
- `monthenddate`: Month-end data points (performance, rankings)
- `ratingdate`: When ratings were calculated
- `enddate`: End date of measurement period (risk metrics)
- `netassetsdate`: Date of asset valuation
- `estfundlevelnetflowdatemoend`: Month-end flow date

### Date Column Data Types

**IMPORTANT**: Most date columns are stored as TEXT, not DATE type:
- Format: `YYYY-MM-DD` (e.g., "2024-06-30")
- Comparison works with TEXT: `monthenddate <= '2024-06-30'`
- Cast to DATE when needed: `monthenddate::DATE`

## Performance Considerations

### Indexing

Ensure these indexes exist for optimal performance:

```sql
-- Basic Info
CREATE INDEX IF NOT EXISTS idx_basic_info_id_timestamp 
  ON ms.fund_share_class_basic_info_ca_openend(_id, _timestampfrom, _timestampto);

-- Performance
CREATE INDEX IF NOT EXISTS idx_performance_id_date_timestamp 
  ON ms.month_end_trailing_total_returns_ca_openend(_id, monthenddate, _timestampfrom, _timestampto);

-- Rankings
CREATE INDEX IF NOT EXISTS idx_rankings_id_date_timestamp 
  ON ms.month_end_trailing_total_return_percentile_and_absolute_ranks_c(_id, monthenddate, _timestampfrom, _timestampto);

-- Ratings
CREATE INDEX IF NOT EXISTS idx_ratings_id_date_timestamp 
  ON ms.morningstar_rating_ca_openend(_id, ratingdate, _timestampfrom, _timestampto);

-- Fees
CREATE INDEX IF NOT EXISTS idx_prospectus_fees_id_timestamp 
  ON ms.prospectus_fees_ca_openend(_id, _timestampfrom, _timestampto);

-- Risk
CREATE INDEX IF NOT EXISTS idx_risk_id_date_timestamp 
  ON ms.risk_measure_ca_openend(_id, enddate, _timestampfrom, _timestampto);

-- Flows
CREATE INDEX IF NOT EXISTS idx_flows_id_date_timestamp 
  ON ms.fund_flow_details_ca_openend(_id, estfundlevelnetflowdatemoend, _timestampfrom, _timestampto);

-- Assets
CREATE INDEX IF NOT EXISTS idx_assets_id_date_timestamp 
  ON ms.fund_level_net_assets_ca_openend(_id, netassetsdate, _timestampfrom, _timestampto);
```

### Query Optimization

1. **Use Arrays for Multiple Funds**: Pass fund IDs as arrays instead of making multiple calls
2. **Parallel Queries**: Execute domain functions in parallel, not sequentially
3. **Limit Result Sets**: Use category filters to reduce the number of funds queried
4. **Cache Results**: Cache frequently accessed data (e.g., current data for popular funds)

## Testing

Each function file includes test queries in the comments. To test a function:

```sql
-- Test basic info function
SELECT * FROM ms.fn_get_basic_info_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);

-- Test with historical date
SELECT * FROM ms.fn_get_basic_info_at_date(
  ARRAY['F00000ABCD'],
  '2023-01-01'::DATE
);

-- Test with multiple funds
SELECT * FROM ms.fn_get_basic_info_at_date(
  (SELECT ARRAY_AGG(_id) FROM ms.fund_share_class_basic_info_ca_openend WHERE _timestampto IS NULL LIMIT 10),
  CURRENT_DATE
);
```

## Troubleshooting

### Issue: No results returned

**Possible causes:**
1. Fund ID doesn't exist
2. No data available for the specified date
3. Date is before fund inception

**Solution**: Check if data exists for that fund and date:

```sql
SELECT _id, monthenddate, _timestampfrom, _timestampto
FROM ms.month_end_trailing_total_returns_ca_openend
WHERE _id = 'F00000ABCD'
ORDER BY monthenddate DESC
LIMIT 5;
```

### Issue: Wrong data returned

**Possible cause**: Date column is TEXT, not DATE

**Solution**: Ensure date comparisons use TEXT format:

```sql
-- CORRECT
WHERE monthenddate <= '2024-06-30'

-- INCORRECT (may not work)
WHERE monthenddate <= '2024-6-30'  -- Missing leading zero
```

### Issue: Slow performance

**Possible causes:**
1. Missing indexes
2. Querying too many funds at once
3. Large date ranges for history functions

**Solutions:**
1. Create indexes (see Performance Considerations)
2. Batch fund queries (50-100 funds per call)
3. Limit date ranges to necessary periods

## Next Steps

1. **Deploy Functions**: Run the deployment script to create all functions
2. **Create Indexes**: Execute the index creation statements
3. **Test Functions**: Run test queries to verify correct behavior
4. **Integrate with Backend**: Update API controllers to use these functions
5. **Monitor Performance**: Track query execution times and optimize as needed

## Related Documentation

- `server/db/docs/schema-summary.md` - Complete schema documentation
- `server/db/docs/tables.yaml` - Table configuration and sync details
- `.kiro/specs/fund-analytics-platform/design.md` - API architecture design
