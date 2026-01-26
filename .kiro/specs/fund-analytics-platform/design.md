# Design Document: Fund Analytics Platform

## Overview

The Fund Analytics Platform extends the existing Fund Data Dashboard with advanced analytics features leveraging the comprehensive Morningstar database schema. Building on the established React/Express/PostgreSQL architecture, this design adds new API endpoints and frontend components for performance analysis, fee comparison, Morningstar ratings, risk metrics, fund flows, and multi-fund comparison capabilities.

**Existing Infrastructure (from fund-data-dashboard):**
- React 18 frontend with Material-UI components
- Express.js backend with PostgreSQL connection pooling
- Basic fund search and display functionality
- Error handling and validation middleware
- Testing framework with Jest and fast-check

**New Features to Add:**
- Performance analysis with trailing returns and rankings
- Comprehensive fee analysis (prospectus, annual report, fee levels)
- Morningstar star ratings display
- Risk metrics (absolute and relative to benchmark)
- Fund flow tracking and visualization
- Multi-fund comparison tool
- Category analytics dashboard
- Historical data queries with temporal filtering
- Data export functionality (CSV/JSON)

The design emphasizes integration with existing components while adding new specialized controllers, services, and UI components for advanced analytics.

## Architecture

### System Architecture

**Extends existing fund-data-dashboard architecture with new analytics features:**

```
┌─────────────────────────────────────────────────────────────┐
│                   React Frontend (Existing)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ FundList     │  │ FundDetail   │  │ SearchBar    │      │
│  │ (existing)   │  │ (existing)   │  │ (existing)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  NEW COMPONENTS TO ADD:                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Performance  │  │ FeeBreakdown │  │ RatingDisplay│      │
│  │ Chart        │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ RiskMetrics  │  │ FlowChart    │  │ Comparison   │      │
│  │ Table        │  │              │  │ Tool         │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  API Service   │                        │
│                    │ (extend api.js)│                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │ HTTP/JSON
                             │
┌────────────────────────────▼──────────────────────────────────┐
│              Express.js Backend (Existing + New)              │
│  EXISTING ROUTES:                                             │
│  /api/funds (basic search)                                    │
│                                                               │
│  NEW ROUTES TO ADD:                                           │
│  /api/funds/:id/performance                                   │
│  /api/funds/:id/fees                                          │
│  /api/funds/:id/ratings                                       │
│  /api/funds/:id/risk                                          │
│  /api/funds/:id/flows                                         │
│  /api/funds/compare                                           │
│  /api/categories/:code/analytics                              │
│  /api/export                                                  │
│                                                               │
│  NEW CONTROLLERS TO ADD:                                      │
│  performanceController, feeController, ratingController,      │
│  riskController, flowController, comparisonController         │
│                                                               │
│  NEW SERVICES TO ADD:                                         │
│  cacheService, queryBuilder (temporal queries)                │
│                                                               │
│  EXISTING: db.js connection pool, errorHandler middleware     │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         │ SQL (query ms schema)
                         │
┌────────────────────────▼──────────────────────────────────────┐
│          PostgreSQL Database (ms schema - Morningstar)        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 14 Base Tables + 1 Materialized View                 │    │
│  │ - fund_share_class_basic_info_ca_openend            │    │
│  │ - month_end_trailing_total_returns_ca_openend       │    │
│  │ - morningstar_rating_ca_openend                     │    │
│  │ - prospectus_fees_ca_openend                        │    │
│  │ - risk_measure_ca_openend                           │    │
│  │ - fund_flow_details_ca_openend                      │    │
│  │ - mv_fund_share_class_basic_info_ca_openend_latest  │    │
│  │ ... and 8 more tables                                │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Leverages existing stack from fund-data-dashboard:**

**Backend (Existing):**
- Node.js with Express.js framework
- PostgreSQL with pg driver and connection pooling
- Express-validator for input validation
- Dotenv for configuration management

**Backend (New Dependencies to Add):**
- Node-cache for in-memory caching
- CSV generation library (e.g., json2csv)

**Frontend (Existing):**
- React 18 with functional components and hooks
- Material-UI (MUI) for component library
- Axios for HTTP requests
- React Router for navigation

**Frontend (New Dependencies to Add):**
- Recharts or Chart.js for data visualization
- Date-fns for date manipulation

**Database:**
- PostgreSQL with Morningstar schema (ms)
- Materialized view: mv_fund_share_class_basic_info_ca_openend_latest
- Temporal data support with _timestampfrom/_timestampto fields

## Components and Interfaces

### Backend Components

#### 1. Routes Layer

**Purpose:** Define API endpoints and route requests to appropriate controllers

**Key Routes:**

```javascript
// Fund search and basic info
GET  /api/funds                    // Search funds with filters
GET  /api/funds/:id                // Get fund details
GET  /api/funds/:id/basic-info     // Get basic fund information

// Performance data
GET  /api/funds/:id/performance    // Get performance metrics
GET  /api/funds/:id/returns        // Get trailing returns
GET  /api/funds/:id/rankings       // Get performance rankings

// Fee information
GET  /api/funds/:id/fees           // Get all fee data
GET  /api/funds/:id/fees/prospectus // Get prospectus fees
GET  /api/funds/:id/fees/annual    // Get annual report fees

// Ratings
GET  /api/funds/:id/ratings        // Get Morningstar ratings
GET  /api/funds/:id/ratings/extended // Get extended rating data

// Risk metrics
GET  /api/funds/:id/risk           // Get risk measures
GET  /api/funds/:id/risk/relative  // Get relative risk measures

// Fund flows
GET  /api/funds/:id/flows          // Get fund flow data

// Comparison
POST /api/funds/compare            // Compare multiple funds

// Category analytics
GET  /api/categories               // List all categories
GET  /api/categories/:code         // Get category details
GET  /api/categories/:code/analytics // Get category analytics

// Export
POST /api/export                   // Export fund data
```

#### 2. Controllers Layer

**Purpose:** Handle HTTP requests, validate input, call services, format responses

**fundController.js:**
```javascript
exports.searchFunds = async (req, res, next) => {
  // Validate query parameters
  // Call fundService.searchFunds()
  // Format and return response
}

exports.getFundDetails = async (req, res, next) => {
  // Validate fund ID
  // Call fundService.getFundById()
  // Return fund details or 404
}

exports.compareFunds = async (req, res, next) => {
  // Validate fund IDs (max 5)
  // Call fundService.compareFunds()
  // Return comparison data
}
```

**performanceController.js:**
```javascript
exports.getPerformance = async (req, res, next) => {
  // Validate fund ID and date range
  // Call performanceService.getPerformance()
  // Return performance data
}

exports.getRankings = async (req, res, next) => {
  // Validate fund ID
  // Call performanceService.getRankings()
  // Return ranking data
}
```

**feeController.js:**
```javascript
exports.getAllFees = async (req, res, next) => {
  // Validate fund ID
  // Call feeService.getAllFees()
  // Return combined fee data
}
```

**ratingController.js:**
```javascript
exports.getRatings = async (req, res, next) => {
  // Validate fund ID
  // Call ratingService.getRatings()
  // Return rating data with stars
}
```

**riskController.js:**
```javascript
exports.getRiskMetrics = async (req, res, next) => {
  // Validate fund ID
  // Call riskService.getRiskMetrics()
  // Return risk data
}
```

**categoryController.js:**
```javascript
exports.getCategoryAnalytics = async (req, res, next) => {
  // Validate category code
  // Call categoryService.getAnalytics()
  // Return aggregated category data
}
```

#### 3. Services Layer

**Purpose:** Business logic, data aggregation, caching

**fundService.js:**
```javascript
exports.searchFunds = async (filters, pagination) => {
  // Build query with filters
  // Check cache
  // Query database
  // Cache results
  // Return funds
}

exports.getFundById = async (fundId) => {
  // Check cache
  // Query multiple tables (basic info, attributes, manager)
  // Join data
  // Cache result
  // Return fund object
}

exports.compareFunds = async (fundIds) => {
  // Validate max 5 funds
  // Get data for all funds
  // Align data structure
  // Calculate comparisons
  // Return comparison object
}
```

**performanceService.js:**
```javascript
exports.getPerformance = async (fundId, dateRange) => {
  // Query returns table
  // Query rankings table
  // Combine data
  // Return performance object
}
```

**feeService.js:**
```javascript
exports.getAllFees = async (fundId) => {
  // Query prospectus fees
  // Query annual report fees
  // Query fee levels
  // Combine into single object
  // Return fee data
}
```

**cacheService.js:**
```javascript
exports.get = (key) => {
  // Get from node-cache
}

exports.set = (key, value, ttl = 3600) => {
  // Set in node-cache with TTL
}

exports.del = (key) => {
  // Delete from cache
}

exports.flush = () => {
  // Clear all cache
}
```

**queryBuilder.js:**
```javascript
exports.buildSearchQuery = (filters) => {
  // Build WHERE clauses
  // Add temporal filtering
  // Add pagination
  // Return query and params
}

exports.buildJoinQuery = (tables) => {
  // Build multi-table JOIN
  // Add temporal filtering
  // Return query
}
```

#### 4. Database Access Layer

**db.js:**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

exports.query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Log slow queries
  if (duration > 2000) {
    console.warn('Slow query detected:', { text, duration });
  }
  
  return res;
};

exports.pool = pool;
```

#### 5. Middleware

**validator.js:**
```javascript
const { validationResult } = require('express-validator');

exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    next();
  };
};

// Validation rules
exports.fundIdValidation = [
  param('id').notEmpty().withMessage('Fund ID is required')
];

exports.searchValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString()
];
```

**errorHandler.js:**
```javascript
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Database errors
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};
```

### Frontend Components

#### 1. Search and Filter Components

**SearchBar.jsx:**
```javascript
// Text search input with autocomplete
// Debounced search to reduce API calls
// Props: onSearch, placeholder
```

**FilterPanel.jsx:**
```javascript
// Category filter dropdown
// Performance filter sliders (min/max returns)
// Fee filter sliders (max expense ratio)
// Rating filter (min stars)
// Asset size filter
// Date range picker
// Props: filters, onFilterChange, onApply, onReset
```

**FundList.jsx:**
```javascript
// Paginated list of fund results
// Sortable columns (name, return, rating, fees)
// Click to view details
// Props: funds, loading, onSort, onPageChange
```

#### 2. Fund Detail Components

**FundDetail.jsx:**
```javascript
// Main container for fund details
// Tabs for different sections:
//   - Overview (basic info, attributes)
//   - Performance (returns, rankings, charts)
//   - Fees (all fee data)
//   - Ratings (star ratings, risk-adjusted returns)
//   - Risk (risk metrics, relative measures)
//   - Flows (fund flow trends)
// Props: fundId
```

**PerformanceChart.jsx:**
```javascript
// Line chart showing returns over time
// Multiple time period selection
// Comparison to benchmark
// Props: performanceData, timePeriod
```

**FeeBreakdown.jsx:**
```javascript
// Pie chart or bar chart of fee components
// Comparison to category average
// Props: feeData, categoryAverage
```

**RatingDisplay.jsx:**
```javascript
// Star rating visualization
// Rating date and period
// Risk-adjusted return metrics
// Props: ratingData
```

**RiskMetricsTable.jsx:**
```javascript
// Table of risk metrics by time period
// Standard deviation, beta, alpha, Sharpe ratio
// Props: riskData
```

#### 3. Comparison Components

**FundComparison.jsx:**
```javascript
// Side-by-side comparison table
// Select up to 5 funds
// Highlight best/worst in each metric
// Export comparison data
// Props: fundIds
```

**ComparisonChart.jsx:**
```javascript
// Multi-line chart comparing fund performance
// Toggle metrics (returns, risk, fees)
// Props: comparisonData, metric
```

#### 4. Category Components

**CategoryDashboard.jsx:**
```javascript
// Category overview with aggregate stats
// Distribution charts (asset size, returns)
// Top performers list
// Props: categoryCode
```

#### 5. Shared Components

**LoadingSpinner.jsx:**
```javascript
// Loading indicator
// Props: size, message
```

**ErrorMessage.jsx:**
```javascript
// Error display with retry option
// Props: error, onRetry
```

**DataTable.jsx:**
```javascript
// Reusable sortable table
// Props: columns, data, onSort
```

**ExportButton.jsx:**
```javascript
// Export data to CSV/JSON
// Props: data, filename, format
```

### API Service (Frontend)

**api/fundService.js:**
```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(config => {
  console.log('API Request:', config.method.toUpperCase(), config.url);
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // No response received
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const searchFunds = (filters, page = 1, limit = 50) => {
  return apiClient.get('/funds', { params: { ...filters, page, limit } });
};

export const getFundDetails = (fundId) => {
  return apiClient.get(`/funds/${fundId}`);
};

export const getFundPerformance = (fundId) => {
  return apiClient.get(`/funds/${fundId}/performance`);
};

export const getFundFees = (fundId) => {
  return apiClient.get(`/funds/${fundId}/fees`);
};

export const getFundRatings = (fundId) => {
  return apiClient.get(`/funds/${fundId}/ratings`);
};

export const getFundRisk = (fundId) => {
  return apiClient.get(`/funds/${fundId}/risk`);
};

export const getFundFlows = (fundId) => {
  return apiClient.get(`/funds/${fundId}/flows`);
};

export const compareFunds = (fundIds) => {
  return apiClient.post('/funds/compare', { fundIds });
};

export const getCategoryAnalytics = (categoryCode) => {
  return apiClient.get(`/categories/${categoryCode}/analytics`);
};

export const exportData = (data, format = 'csv') => {
  return apiClient.post('/export', { data, format }, { responseType: 'blob' });
};
```

## Data Models

### Backend Data Models

#### Fund Search Result
```javascript
{
  id: string,              // _id from database
  idType: string,          // _idtype
  name: string,            // _name
  categoryName: string,    // categoryname
  categoryCode: string,    // categorycode
  inceptionDate: string,   // inceptiondate (ISO 8601)
  netAssets: number,       // fundnetassets
  rating3Year: number,     // rating3year (1-5 or null)
  trailingReturn1Yr: number, // trailingreturn1yr (percentage)
  expenseRatio: number,    // netexpenseratio (percentage)
  dataAsOf: string         // Latest data date
}
```

#### Fund Details
```javascript
{
  basicInfo: {
    id: string,
    idType: string,
    name: string,
    categoryName: string,
    categoryCode: string,
    inceptionDate: string,
    terminationDate: string | null,
    securityType: string,
    productType: string,
    broadAssetClass: string,
    legalStructureName: string,
    fundCompanyName: string,
    advisoryCompanyName: string,
    managementCompanyName: string,
    primaryBenchmarkName: string
  },
  attributes: {
    masterFeeder: string | null,
    masterFundName: string | null,
    fundLevelCategoryName: string,
    fundLevelCategoryCode: string,
    oldestShareClassInceptionDate: string,
    availableFor529Only: boolean,
    availableInsuranceProduct: boolean,
    availablePensionPlan: boolean
  },
  manager: {
    fundManagerTenureAverage: number,
    firmAverageManagerTenureLongest: number,
    firmAssetsManagerInvestment: {
      zero: number,
      upTo10k: number,
      upTo50k: number,
      upTo500k: number,
      upTo1M: number,
      over1M: number
    }
  },
  netAssets: {
    fundNetAssets: number,
    normalizedFundNetAssets: number,
    netAssetsDate: string,
    currencyId: string
  }
}
```

#### Performance Data
```javascript
{
  returns: {
    trailing1Day: number,
    trailing1Week: number,
    trailing1Month: number,
    trailing3Month: number,
    trailing6Month: number,
    trailing1Year: number,
    trailing2Year: number,
    trailing3Year: number,
    trailing5Year: number,
    trailing10Year: number,
    trailing15Year: number,
    trailing20Year: number,
    ytd: number,
    qtd: number,
    mtd: number
  },
  cumulativeReturns: {
    twoYear: number,
    threeYear: number,
    fiveYear: number,
    tenYear: number,
    fifteenYear: number,
    twentyYear: number
  },
  rankings: {
    oneMonth: { absolute: number, percentile: number, categorySize: number },
    threeMonth: { absolute: number, percentile: number, categorySize: number },
    oneYear: { absolute: number, percentile: number, categorySize: number },
    threeYear: { absolute: number, percentile: number, categorySize: number },
    fiveYear: { absolute: number, percentile: number, categorySize: number },
    tenYear: { absolute: number, percentile: number, categorySize: number }
  },
  monthEndDate: string
}
```

#### Fee Data
```javascript
{
  prospectus: {
    grossExpenseRatio: number,
    netExpenseRatio: number,
    actualManagementFee: number,
    administrationFee: number,
    performanceFee: number | null,
    performanceFeeIndexName: string | null,
    feeNegotiable: boolean,
    prospectusDate: string
  },
  annualReport: {
    mer: number,
    tradingExpenseRatio: number,
    interimNetExpenseRatio: number,
    annualReportDate: string
  },
  feeLevel: {
    feeLevel: number,
    feeLevelRank: number,
    feeLevelDate: string
  }
}
```

#### Rating Data
```javascript
{
  ratings: {
    threeYear: number,    // 1-5 stars
    fiveYear: number,
    tenYear: number,
    overall: number
  },
  returns: {
    threeYear: number,
    fiveYear: number,
    tenYear: number,
    overall: number
  },
  riskAdjustedReturns: {
    threeYear: number,
    fiveYear: number,
    tenYear: number
  },
  categoryRanks: {
    threeYear: number,
    fiveYear: number,
    tenYear: number
  },
  categoryContext: {
    numberOfFunds3Year: number,
    numberOfFunds5Year: number,
    numberOfFunds10Year: number,
    numberOfFundsOverall: number
  },
  ratingDate: string
}
```

#### Risk Data
```javascript
{
  absolute: {
    standardDeviation: {
      oneYear: number,
      threeYear: number,
      fiveYear: number,
      tenYear: number
    },
    kurtosis: {
      oneYear: number,
      threeYear: number,
      fiveYear: number
    },
    skewness: {
      oneYear: number,
      threeYear: number,
      fiveYear: number
    },
    downRisk: {
      oneYear: number,
      threeYear: number,
      fiveYear: number
    },
    maxDrawdown: {
      oneYear: number,
      threeYear: number,
      fiveYear: number
    }
  },
  relative: {
    indexName: string,
    alpha: {
      oneYear: number,
      threeYear: number,
      fiveYear: number,
      tenYear: number
    },
    beta: {
      oneYear: number,
      threeYear: number,
      fiveYear: number,
      tenYear: number
    },
    rSquared: {
      oneYear: number,
      threeYear: number,
      fiveYear: number
    },
    sharpeRatio: {
      oneYear: number,
      threeYear: number,
      fiveYear: number
    },
    captureRatioUpside: {
      oneYear: number,
      threeYear: number,
      fiveYear: number
    },
    captureRatioDownside: {
      oneYear: number,
      threeYear: number,
      fiveYear: number
    }
  },
  endDate: string
}
```

#### Flow Data
```javascript
{
  fundLevel: {
    oneMonth: number,
    threeMonth: number,
    oneYear: number,
    threeYear: number,
    fiveYear: number,
    tenYear: number,
    fifteenYear: number,
    flowDate: string
  },
  shareClass: {
    oneMonth: number,
    threeMonth: number,
    oneYear: number,
    threeYear: number,
    fiveYear: number,
    tenYear: number,
    fifteenYear: number,
    flowDate: string
  },
  currencyId: string
}
```

### Frontend State Models

#### Search State
```javascript
{
  filters: {
    searchText: string,
    category: string | null,
    minReturn1Yr: number | null,
    maxReturn1Yr: number | null,
    maxExpenseRatio: number | null,
    minRating: number | null,
    minNetAssets: number | null
  },
  results: Fund[],
  pagination: {
    page: number,
    limit: number,
    total: number
  },
  loading: boolean,
  error: string | null
}
```

#### Fund Detail State
```javascript
{
  fund: FundDetails | null,
  performance: PerformanceData | null,
  fees: FeeData | null,
  ratings: RatingData | null,
  risk: RiskData | null,
  flows: FlowData | null,
  loading: {
    fund: boolean,
    performance: boolean,
    fees: boolean,
    ratings: boolean,
    risk: boolean,
    flows: boolean
  },
  error: string | null
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Search Results Match Query

*For any* search query and search field (name, category, or identifier), all returned results should match the query in at least one of the specified search fields.

**Validates: Requirements 1.1**

### Property 2: API Response Structure Completeness

*For any* API endpoint response, all required fields specified in the data model for that endpoint should be present in the response structure.

**Validates: Requirements 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 7.2, 8.1, 8.2, 8.3, 9.1, 9.2, 9.3, 11.3, 14.4, 15.3**

### Property 3: Category Filter Correctness

*For any* category filter applied to a search, all returned funds should have a category matching the filter value.

**Validates: Requirements 1.3**

### Property 4: Pagination Behavior

*For any* pagination parameters (page and limit), the API should return exactly the requested number of results (or fewer if at the end), and consecutive pages should return different, non-overlapping results.

**Validates: Requirements 1.4**

### Property 5: Currency Normalization Consistency

*For any* flow data response, all monetary values should be normalized to a single currency as indicated by the currencyId field.

**Validates: Requirements 6.3**

### Property 6: Comparison Data Alignment

*For any* fund comparison request with multiple fund IDs, the response should contain data for all requested funds in an aligned structure with the same metrics for each fund.

**Validates: Requirements 7.1**

### Property 7: Comparison Best/Worst Identification

*For any* fund comparison response with multiple funds, the best and worst performers in each metric category should be correctly identified based on the metric values.

**Validates: Requirements 7.3**

### Property 8: Master-Feeder Relationship Indication

*For any* fund with a non-null masterFundId in the database, the fund details response should include the master-feeder relationship indicator and master fund name.

**Validates: Requirements 8.4**

### Property 9: Temporal Query Correctness

*For any* historical data query with a specified date range, all returned records should have _timestampfrom <= end_date AND (_timestampto IS NULL OR _timestampto > start_date).

**Validates: Requirements 10.1, 10.2**

### Property 10: CSV Export Escaping

*For any* CSV export containing special characters (commas, quotes, newlines), those characters should be properly escaped according to CSV RFC 4180 standards.

**Validates: Requirements 11.4**

### Property 11: Cache TTL Enforcement

*For any* cached data entry, if the entry age is less than 1 hour (3600 seconds), the cached data should be served; if the entry age exceeds 1 hour, fresh data should be fetched from the database.

**Validates: Requirements 12.2**

### Property 12: Continuation Token for Complex Queries

*For any* query that exceeds complexity thresholds (e.g., returning more than 1000 results), the response should include a continuation token for fetching additional results.

**Validates: Requirements 12.4**

### Property 13: Error Response Correctness

*For any* API error condition (invalid ID, missing parameters, database failure, rate limit), the response should have the appropriate HTTP status code (404, 400, 500, 429) and include a descriptive error message without exposing internal implementation details.

**Validates: Requirements 13.1, 13.2, 13.3, 13.4**

### Property 14: Multi-Filter AND Logic

*For any* screening request with multiple filters applied, all returned funds should satisfy ALL filter conditions (AND logic), not just some of them.

**Validates: Requirements 14.1, 14.2**

### Property 15: Numeric Range Filter Support

*For any* numeric filter with min and/or max values specified, all returned results should have values within the specified range (>= min AND <= max).

**Validates: Requirements 14.3**

## Error Handling

### Error Categories

**1. Client Errors (4xx)**

**400 Bad Request:**
- Missing required parameters
- Invalid parameter types
- Invalid date formats
- Invalid filter combinations

Response format:
```javascript
{
  error: "Validation error",
  details: [
    { field: "page", message: "Must be a positive integer" },
    { field: "limit", message: "Must be between 1 and 100" }
  ]
}
```

**404 Not Found:**
- Fund ID does not exist
- Category code not found
- Endpoint does not exist

Response format:
```javascript
{
  error: "Fund not found",
  fundId: "requested_id"
}
```

**429 Too Many Requests:**
- Rate limit exceeded

Response format:
```javascript
{
  error: "Rate limit exceeded",
  retryAfter: 60  // seconds
}
```

**2. Server Errors (5xx)**

**500 Internal Server Error:**
- Database connection failures
- Unexpected exceptions
- Data processing errors

Response format:
```javascript
{
  error: "Internal server error",
  message: "An unexpected error occurred. Please try again later."
}
```

**503 Service Unavailable:**
- Database maintenance
- System overload

Response format:
```javascript
{
  error: "Service temporarily unavailable",
  message: "The service is undergoing maintenance. Please try again later."
}
```

### Error Handling Strategy

**Backend:**
1. Use try-catch blocks in all async functions
2. Log errors with context (request ID, user, timestamp)
3. Never expose stack traces or internal details to clients
4. Use custom error classes for different error types
5. Implement error middleware for centralized handling

**Frontend:**
1. Display user-friendly error messages
2. Provide retry mechanisms for transient errors
3. Show loading states during retries
4. Log errors to console for debugging
5. Implement error boundaries for React components

### Validation Strategy

**Input Validation:**
- Use express-validator for all API inputs
- Validate fund IDs against expected format
- Validate date ranges (start < end)
- Validate pagination parameters (positive integers)
- Validate filter values against allowed ranges
- Sanitize string inputs to prevent injection

**Data Validation:**
- Verify database query results before processing
- Check for null/undefined values
- Validate data types match expected schema
- Verify temporal data consistency (_timestampfrom < _timestampto)

## Testing Strategy

### Dual Testing Approach

The Fund Analytics Platform will use both unit testing and property-based testing to ensure comprehensive coverage and correctness.

**Unit Tests:**
- Test specific examples and edge cases
- Test integration points between components
- Test error conditions and boundary values
- Verify specific API responses match expected format
- Test React component rendering and interactions

**Property-Based Tests:**
- Verify universal properties across all inputs
- Test with randomized data to find edge cases
- Validate data structure completeness
- Test filter and search logic with varied inputs
- Verify error handling across different error types

### Backend Testing

**Unit Tests (Jest):**

1. **Controller Tests:**
   - Test each endpoint with valid inputs
   - Test error handling for invalid inputs
   - Test pagination edge cases (first page, last page, empty results)
   - Test filter combinations
   - Mock service layer

2. **Service Tests:**
   - Test business logic with sample data
   - Test data aggregation and transformation
   - Test cache hit/miss scenarios
   - Test query building logic
   - Mock database layer

3. **Database Tests:**
   - Test query execution with test database
   - Test connection pool management
   - Test transaction handling
   - Test temporal queries with historical data

**Property-Based Tests (fast-check):**

Each property test should run a minimum of 100 iterations and be tagged with:
**Feature: fund-analytics-platform, Property {number}: {property_text}**

1. **Property 1 Test: Search Results Match Query**
   - Generate random search queries and fund datasets
   - Verify all results match query in at least one field
   - **Feature: fund-analytics-platform, Property 1: Search Results Match Query**

2. **Property 2 Test: API Response Structure Completeness**
   - Generate random fund IDs and endpoint requests
   - Verify all required fields are present in responses
   - **Feature: fund-analytics-platform, Property 2: API Response Structure Completeness**

3. **Property 3 Test: Category Filter Correctness**
   - Generate random category filters and fund datasets
   - Verify all results match the category filter
   - **Feature: fund-analytics-platform, Property 3: Category Filter Correctness**

4. **Property 4 Test: Pagination Behavior**
   - Generate random pagination parameters
   - Verify page size and non-overlapping results
   - **Feature: fund-analytics-platform, Property 4: Pagination Behavior**

5. **Property 5 Test: Currency Normalization Consistency**
   - Generate random flow data
   - Verify all values use consistent currency
   - **Feature: fund-analytics-platform, Property 5: Currency Normalization Consistency**

6. **Property 6 Test: Comparison Data Alignment**
   - Generate random fund ID sets for comparison
   - Verify aligned data structure for all funds
   - **Feature: fund-analytics-platform, Property 6: Comparison Data Alignment**

7. **Property 7 Test: Comparison Best/Worst Identification**
   - Generate random fund comparison data
   - Verify best/worst identification is correct
   - **Feature: fund-analytics-platform, Property 7: Comparison Best/Worst Identification**

8. **Property 8 Test: Master-Feeder Relationship Indication**
   - Generate random funds with master-feeder structures
   - Verify relationship is indicated in response
   - **Feature: fund-analytics-platform, Property 8: Master-Feeder Relationship Indication**

9. **Property 9 Test: Temporal Query Correctness**
   - Generate random date ranges and temporal data
   - Verify returned records fall within date range
   - **Feature: fund-analytics-platform, Property 9: Temporal Query Correctness**

10. **Property 10 Test: CSV Export Escaping**
    - Generate random data with special characters
    - Verify CSV escaping follows RFC 4180
    - **Feature: fund-analytics-platform, Property 10: CSV Export Escaping**

11. **Property 11 Test: Cache TTL Enforcement**
    - Generate random cache entries with varying ages
    - Verify cache behavior based on TTL
    - **Feature: fund-analytics-platform, Property 11: Cache TTL Enforcement**

12. **Property 12 Test: Continuation Token for Complex Queries**
    - Generate queries with varying result sizes
    - Verify continuation tokens for large results
    - **Feature: fund-analytics-platform, Property 12: Continuation Token for Complex Queries**

13. **Property 13 Test: Error Response Correctness**
    - Generate random error conditions
    - Verify appropriate status codes and messages
    - **Feature: fund-analytics-platform, Property 13: Error Response Correctness**

14. **Property 14 Test: Multi-Filter AND Logic**
    - Generate random multi-filter requests
    - Verify all filters are applied with AND logic
    - **Feature: fund-analytics-platform, Property 14: Multi-Filter AND Logic**

15. **Property 15 Test: Numeric Range Filter Support**
    - Generate random numeric range filters
    - Verify all results fall within specified ranges
    - **Feature: fund-analytics-platform, Property 15: Numeric Range Filter Support**

### Frontend Testing

**Unit Tests (Jest + React Testing Library):**

1. **Component Tests:**
   - Test component rendering with props
   - Test user interactions (clicks, inputs)
   - Test conditional rendering
   - Test error states and loading states
   - Mock API service

2. **Integration Tests:**
   - Test component interactions
   - Test data flow between components
   - Test routing and navigation
   - Mock API responses

3. **Hook Tests:**
   - Test custom hooks with various inputs
   - Test state management
   - Test side effects

**Property-Based Tests (fast-check):**

Frontend property tests focus on data transformation and validation logic:

1. **Data Transformation Properties:**
   - Test that API response transformations preserve data integrity
   - Test that chart data calculations are correct
   - Test that sorting and filtering logic works correctly

2. **Validation Properties:**
   - Test that form validation catches all invalid inputs
   - Test that date range validation works correctly

### Testing Configuration

**Backend (package.json):**
```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:property": "jest --testPathPattern=property.test.js"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

**Frontend (package.json):**
```json
{
  "scripts": {
    "test": "react-scripts test --coverage",
    "test:property": "react-scripts test --testPathPattern=property.test.js"
  }
}
```

### Test Data Strategy

**Unit Tests:**
- Use fixed test data for predictable results
- Create test fixtures for common scenarios
- Use factories for generating test objects

**Property-Based Tests:**
- Use fast-check arbitraries to generate random data
- Create custom arbitraries for domain-specific types (fund IDs, dates, etc.)
- Use constraints to generate valid data (e.g., positive numbers for returns)

### Continuous Integration

- Run all tests on every commit
- Require tests to pass before merging
- Generate coverage reports
- Run property tests with increased iterations (1000+) in CI
- Monitor test execution time and optimize slow tests
