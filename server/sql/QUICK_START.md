# Quick Start Guide - Date-Sensitive SQL Functions

## 🚀 Get Started in 5 Minutes

### Step 1: Deploy Functions (2 minutes)

```bash
cd server
npm run deploy-functions
```

This will:
- ✅ Create all 8 domain functions in the `ms` schema
- ✅ Verify functions were created successfully
- ✅ Create recommended indexes for performance

### Step 2: Test a Function (1 minute)

```sql
-- Test basic info function
SELECT * FROM ms.fn_get_basic_info_at_date(
  ARRAY['F00000ABCD'],
  CURRENT_DATE
);
```

### Step 3: Use in Backend (2 minutes)

```javascript
// Get fund details
const { pool } = require('./config/db');

async function getFundDetails(fundId) {
  const fundIds = [fundId];
  const asofDate = new Date();
  
  const [basicInfo, performance] = await Promise.all([
    pool.query('SELECT * FROM ms.fn_get_basic_info_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_performance_at_date($1, $2)', [fundIds, asofDate])
  ]);
  
  return {
    basicInfo: basicInfo.rows[0],
    performance: performance.rows[0]
  };
}
```

## 📚 What You Get

### 8 Domain Functions

| Function | What It Returns |
|----------|----------------|
| `fn_get_basic_info_at_date` | Fund name, category, company, inception date |
| `fn_get_performance_at_date` | Returns for 1day, 1mo, 3mo, 1yr, 3yr, 5yr, 10yr, etc. |
| `fn_get_rankings_at_date` | Absolute and percentile ranks vs peers |
| `fn_get_ratings_at_date` | Morningstar star ratings (3yr, 5yr, 10yr, overall) |
| `fn_get_all_fees_at_date` | Expense ratios, MER, trading expenses, fee levels |
| `fn_get_all_risk_at_date` | Standard deviation, Sharpe ratio, alpha, beta |
| `fn_get_flows_at_date` | Net flows for 1mo, 3mo, 1yr, 3yr, 5yr, etc. |
| `fn_get_assets_at_date` | Fund net assets, normalized assets |

### Key Features

✅ **Date-Sensitive**: Query data as of any historical date
✅ **Temporal Tracking**: Handles `_timestampfrom` and `_timestampto` correctly
✅ **Batch Processing**: Query multiple funds at once
✅ **Parallel Execution**: Execute domain queries in parallel
✅ **Time-Series Support**: Get historical data for date ranges

## 🎯 Common Use Cases

### Use Case 1: Get Current Fund Data

```javascript
const fundData = await getFundDetails('F00000ABCD');
```

### Use Case 2: Get Historical Fund Data

```javascript
const historicalData = await getFundDetails('F00000ABCD', new Date('2023-12-31'));
```

### Use Case 3: Compare Multiple Funds

```javascript
const comparison = await compareFunds(['F00000ABCD', 'F00000EFGH', 'F00000IJKL']);
```

### Use Case 4: Get Category Performance

```javascript
const categoryData = await getCategoryPerformance('CAEQUITY');
```

### Use Case 5: Get Performance History

```javascript
const history = await getPerformanceHistory('F00000ABCD', '2023-01-01', '2024-12-31');
```

## 📖 Documentation

- **README.md** - Detailed usage guide with examples
- **IMPLEMENTATION_SUMMARY.md** - Architecture and design decisions
- **BACKEND_INTEGRATION_GUIDE.md** - Express.js integration examples
- **QUICK_START.md** - This file

## 🔧 Troubleshooting

### Problem: Functions not found

**Solution**: Run deployment script
```bash
npm run deploy-functions
```

### Problem: Slow queries

**Solution**: Check indexes exist
```sql
SELECT indexname FROM pg_indexes WHERE schemaname = 'ms';
```

### Problem: No results returned

**Solution**: Check if data exists for that fund and date
```sql
SELECT _id, monthenddate, _timestampfrom, _timestampto
FROM ms.month_end_trailing_total_returns_ca_openend
WHERE _id = 'F00000ABCD'
ORDER BY monthenddate DESC
LIMIT 5;
```

## 💡 Pro Tips

1. **Always use Promise.all** for parallel queries
2. **Batch fund IDs** (50-100 at a time) instead of one at a time
3. **Cache frequently accessed data** (e.g., current data for popular funds)
4. **Use connection pooling** for better performance
5. **Monitor slow queries** with EXPLAIN ANALYZE

## 🎉 Next Steps

1. ✅ Deploy functions
2. ✅ Test with sample queries
3. ✅ Integrate with backend API
4. ✅ Build frontend components
5. ✅ Add caching layer
6. ✅ Monitor performance

## 📞 Need Help?

- Check the README.md for detailed examples
- Review the BACKEND_INTEGRATION_GUIDE.md for Express.js patterns
- Read the IMPLEMENTATION_SUMMARY.md for architecture details

---

**Ready to build amazing fund analytics features!** 🚀
