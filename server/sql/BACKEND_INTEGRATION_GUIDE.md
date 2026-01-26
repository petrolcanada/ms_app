# Backend Integration Guide - Date-Sensitive SQL Functions

## Quick Start

This guide shows how to integrate the date-sensitive SQL functions into your Express.js backend.

## Basic Pattern

### 1. Single Fund, Single Domain

```javascript
// Get performance data for one fund
async function getFundPerformance(fundId, asofDate = new Date()) {
  const query = 'SELECT * FROM ms.fn_get_performance_at_date($1, $2)';
  const result = await pool.query(query, [[fundId], asofDate]);
  return result.rows[0];
}

// Usage
const performance = await getFundPerformance('F00000ABCD', new Date('2024-06-30'));
```

### 2. Multiple Funds, Single Domain

```javascript
// Get performance for multiple funds
async function getMultipleFundsPerformance(fundIds, asofDate = new Date()) {
  const query = 'SELECT * FROM ms.fn_get_performance_at_date($1, $2)';
  const result = await pool.query(query, [fundIds, asofDate]);
  return result.rows;
}

// Usage
const performance = await getMultipleFundsPerformance(
  ['F00000ABCD', 'F00000EFGH', 'F00000IJKL'],
  new Date('2024-06-30')
);
```

### 3. Single Fund, Multiple Domains (Parallel)

```javascript
// Get all data for one fund
async function getFundDetails(fundId, asofDate = new Date()) {
  const fundIds = [fundId];
  
  // Execute all queries in parallel
  const [basicInfo, performance, fees, ratings, risk, flows, assets] = await Promise.all([
    pool.query('SELECT * FROM ms.fn_get_basic_info_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_performance_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_all_fees_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_ratings_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_all_risk_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_flows_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_assets_at_date($1, $2)', [fundIds, asofDate])
  ]);
  
  return {
    basicInfo: basicInfo.rows[0],
    performance: performance.rows[0],
    fees: fees.rows[0],
    ratings: ratings.rows[0],
    risk: risk.rows[0],
    flows: flows.rows[0],
    assets: assets.rows[0]
  };
}

// Usage
const fundDetails = await getFundDetails('F00000ABCD', new Date());
```

### 4. Multiple Funds, Multiple Domains (Parallel + Merge)

```javascript
// Get all data for multiple funds
async function getMultipleFundsDetails(fundIds, asofDate = new Date()) {
  // Execute all queries in parallel
  const [basicInfo, performance, fees, ratings, risk] = await Promise.all([
    pool.query('SELECT * FROM ms.fn_get_basic_info_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_performance_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_all_fees_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_ratings_at_date($1, $2)', [fundIds, asofDate]),
    pool.query('SELECT * FROM ms.fn_get_all_risk_at_date($1, $2)', [fundIds, asofDate])
  ]);
  
  // Merge results by _id
  const merged = new Map();
  
  basicInfo.rows.forEach(row => {
    merged.set(row._id, { basicInfo: row });
  });
  
  performance.rows.forEach(row => {
    const fund = merged.get(row._id) || {};
    fund.performance = row;
    merged.set(row._id, fund);
  });
  
  fees.rows.forEach(row => {
    const fund = merged.get(row._id) || {};
    fund.fees = row;
    merged.set(row._id, fund);
  });
  
  ratings.rows.forEach(row => {
    const fund = merged.get(row._id) || {};
    fund.ratings = row;
    merged.set(row._id, fund);
  });
  
  risk.rows.forEach(row => {
    const fund = merged.get(row._id) || {};
    fund.risk = row;
    merged.set(row._id, fund);
  });
  
  // Convert Map to array
  return Array.from(merged.values());
}

// Usage
const funds = await getMultipleFundsDetails(
  ['F00000ABCD', 'F00000EFGH', 'F00000IJKL'],
  new Date('2024-06-30')
);
```

### 5. Category-Wide Query

```javascript
// Get all funds in a category with performance data
async function getCategoryPerformance(categoryCode, asofDate = new Date()) {
  const query = `
    WITH category_funds AS (
      SELECT ARRAY_AGG(DISTINCT _id) as fund_ids
      FROM ms.fund_share_class_basic_info_ca_openend
      WHERE categorycode = $1
        AND _timestampto IS NULL
    )
    SELECT p.*
    FROM category_funds cf
    CROSS JOIN LATERAL ms.fn_get_performance_at_date(cf.fund_ids, $2) p
    ORDER BY p.trailingreturn1yr DESC NULLS LAST;
  `;
  
  const result = await pool.query(query, [categoryCode, asofDate]);
  return result.rows;
}

// Usage
const categoryPerformance = await getCategoryPerformance('CAEQUITY', new Date());
```

## Express.js Route Examples

### Route 1: Get Fund Details

```javascript
// routes/fundRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/funds/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const asofDate = req.query.asofDate ? new Date(req.query.asofDate) : new Date();
    
    const fundIds = [id];
    
    // Execute all queries in parallel
    const [basicInfo, performance, fees, ratings, risk, flows, assets] = await Promise.all([
      pool.query('SELECT * FROM ms.fn_get_basic_info_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_performance_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_all_fees_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_ratings_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_all_risk_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_flows_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_assets_at_date($1, $2)', [fundIds, asofDate])
    ]);
    
    // Check if fund exists
    if (basicInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Fund not found' });
    }
    
    res.json({
      basicInfo: basicInfo.rows[0],
      performance: performance.rows[0] || null,
      fees: fees.rows[0] || null,
      ratings: ratings.rows[0] || null,
      risk: risk.rows[0] || null,
      flows: flows.rows[0] || null,
      assets: assets.rows[0] || null,
      asofDate: asofDate.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### Route 2: Compare Multiple Funds

```javascript
// POST /api/funds/compare
router.post('/compare', async (req, res, next) => {
  try {
    const { fundIds, asofDate = new Date() } = req.body;
    
    // Validate
    if (!Array.isArray(fundIds) || fundIds.length === 0) {
      return res.status(400).json({ error: 'fundIds must be a non-empty array' });
    }
    
    if (fundIds.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 funds can be compared' });
    }
    
    // Execute all queries in parallel
    const [basicInfo, performance, fees, ratings] = await Promise.all([
      pool.query('SELECT * FROM ms.fn_get_basic_info_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_performance_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_all_fees_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_ratings_at_date($1, $2)', [fundIds, asofDate])
    ]);
    
    // Merge results
    const merged = new Map();
    
    basicInfo.rows.forEach(row => {
      merged.set(row._id, { basicInfo: row });
    });
    
    performance.rows.forEach(row => {
      const fund = merged.get(row._id) || {};
      fund.performance = row;
      merged.set(row._id, fund);
    });
    
    fees.rows.forEach(row => {
      const fund = merged.get(row._id) || {};
      fund.fees = row;
      merged.set(row._id, fund);
    });
    
    ratings.rows.forEach(row => {
      const fund = merged.get(row._id) || {};
      fund.ratings = row;
      merged.set(row._id, fund);
    });
    
    res.json({
      funds: Array.from(merged.values()),
      asofDate: asofDate
    });
  } catch (error) {
    next(error);
  }
});
```

### Route 3: Get Performance History

```javascript
// GET /api/funds/:id/performance/history
router.get('/:id/performance/history', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const query = 'SELECT * FROM ms.fn_get_performance_history($1, $2, $3)';
    const result = await pool.query(query, [id, new Date(startDate), new Date(endDate)]);
    
    res.json({
      fundId: id,
      startDate,
      endDate,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});
```

### Route 4: Get Category Analytics

```javascript
// GET /api/categories/:code/analytics
router.get('/:code/analytics', async (req, res, next) => {
  try {
    const { code } = req.params;
    const asofDate = req.query.asofDate ? new Date(req.query.asofDate) : new Date();
    
    const query = `
      WITH category_funds AS (
        SELECT ARRAY_AGG(DISTINCT _id) as fund_ids
        FROM ms.fund_share_class_basic_info_ca_openend
        WHERE categorycode = $1
          AND _timestampto IS NULL
      )
      SELECT 
        b._id,
        b._name,
        p.trailingreturn1yr,
        p.trailingreturn3yr,
        f.netexpenseratio,
        r.rating3year,
        a.fundnetassets
      FROM category_funds cf
      CROSS JOIN LATERAL ms.fn_get_basic_info_at_date(cf.fund_ids, $2) b
      LEFT JOIN LATERAL ms.fn_get_performance_at_date(cf.fund_ids, $2) p ON b._id = p._id
      LEFT JOIN LATERAL ms.fn_get_all_fees_at_date(cf.fund_ids, $2) f ON b._id = f._id
      LEFT JOIN LATERAL ms.fn_get_ratings_at_date(cf.fund_ids, $2) r ON b._id = r._id
      LEFT JOIN LATERAL ms.fn_get_assets_at_date(cf.fund_ids, $2) a ON b._id = a._id
      ORDER BY p.trailingreturn1yr DESC NULLS LAST;
    `;
    
    const result = await pool.query(query, [code, asofDate]);
    
    // Calculate aggregate statistics
    const funds = result.rows;
    const avgReturn1yr = funds.reduce((sum, f) => sum + (f.trailingreturn1yr || 0), 0) / funds.length;
    const avgExpenseRatio = funds.reduce((sum, f) => sum + (f.netexpenseratio || 0), 0) / funds.length;
    const totalAssets = funds.reduce((sum, f) => sum + (f.fundnetassets || 0), 0);
    
    res.json({
      categoryCode: code,
      asofDate: asofDate.toISOString(),
      fundCount: funds.length,
      aggregates: {
        avgReturn1yr,
        avgExpenseRatio,
        totalAssets
      },
      funds
    });
  } catch (error) {
    next(error);
  }
});
```

## Service Layer Pattern

For better code organization, create a service layer:

```javascript
// services/fundService.js
const { pool } = require('../config/db');

class FundService {
  async getFundDetails(fundId, asofDate = new Date()) {
    const fundIds = [fundId];
    
    const [basicInfo, performance, fees, ratings, risk, flows, assets] = await Promise.all([
      pool.query('SELECT * FROM ms.fn_get_basic_info_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_performance_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_all_fees_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_ratings_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_all_risk_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_flows_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_assets_at_date($1, $2)', [fundIds, asofDate])
    ]);
    
    if (basicInfo.rows.length === 0) {
      return null;
    }
    
    return {
      basicInfo: basicInfo.rows[0],
      performance: performance.rows[0] || null,
      fees: fees.rows[0] || null,
      ratings: ratings.rows[0] || null,
      risk: risk.rows[0] || null,
      flows: flows.rows[0] || null,
      assets: assets.rows[0] || null
    };
  }
  
  async compareFunds(fundIds, asofDate = new Date()) {
    const [basicInfo, performance, fees, ratings] = await Promise.all([
      pool.query('SELECT * FROM ms.fn_get_basic_info_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_performance_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_all_fees_at_date($1, $2)', [fundIds, asofDate]),
      pool.query('SELECT * FROM ms.fn_get_ratings_at_date($1, $2)', [fundIds, asofDate])
    ]);
    
    return this.mergeFundData(basicInfo.rows, performance.rows, fees.rows, ratings.rows);
  }
  
  mergeFundData(basicInfo, performance, fees, ratings) {
    const merged = new Map();
    
    basicInfo.forEach(row => {
      merged.set(row._id, { basicInfo: row });
    });
    
    performance.forEach(row => {
      const fund = merged.get(row._id) || {};
      fund.performance = row;
      merged.set(row._id, fund);
    });
    
    fees.forEach(row => {
      const fund = merged.get(row._id) || {};
      fund.fees = row;
      merged.set(row._id, fund);
    });
    
    ratings.forEach(row => {
      const fund = merged.get(row._id) || {};
      fund.ratings = row;
      merged.set(row._id, fund);
    });
    
    return Array.from(merged.values());
  }
}

module.exports = new FundService();
```

## Error Handling

```javascript
// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  // PostgreSQL errors
  if (err.code === '42P01') {
    return res.status(500).json({ error: 'Database table not found' });
  }
  
  if (err.code === '42883') {
    return res.status(500).json({ error: 'Database function not found' });
  }
  
  // Date parsing errors
  if (err.message.includes('invalid date')) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }
  
  // Default error
  res.status(500).json({ error: 'Internal server error' });
};
```

## Testing

```javascript
// tests/fundService.test.js
const fundService = require('../services/fundService');

describe('FundService', () => {
  test('getFundDetails returns fund data', async () => {
    const result = await fundService.getFundDetails('F00000ABCD', new Date('2024-06-30'));
    
    expect(result).toBeDefined();
    expect(result.basicInfo).toBeDefined();
    expect(result.basicInfo._id).toBe('F00000ABCD');
  });
  
  test('compareFunds returns multiple funds', async () => {
    const result = await fundService.compareFunds(
      ['F00000ABCD', 'F00000EFGH'],
      new Date('2024-06-30')
    );
    
    expect(result).toHaveLength(2);
    expect(result[0].basicInfo).toBeDefined();
  });
});
```

## Performance Tips

1. **Always use Promise.all for parallel queries**
2. **Batch fund IDs (50-100 at a time)**
3. **Cache frequently accessed data**
4. **Use connection pooling**
5. **Monitor slow queries**

## Common Pitfalls

1. **Don't query domains sequentially** - Use Promise.all
2. **Don't query one fund at a time** - Use arrays
3. **Don't forget to handle NULL results** - Some funds may not have all data
4. **Don't use string concatenation for dates** - Use parameterized queries
5. **Don't forget temporal filtering** - Always pass asofDate parameter
