# Fund Data Dashboard - Backend API

Express + PostgreSQL API serving Morningstar fund data. Provides paginated fund listings, single-fund detail lookups, and date-sensitive domain queries (performance, fees, ratings, risk, rankings, flows, assets) powered by server-side SQL functions.

---

## Quick Start

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
PORT=5000
```

Start the dev server (auto-restarts on file changes):

```bash
npm start
```

Verify it's running:

```bash
curl http://localhost:5000/health
# => { "status": "ok", "message": "Server is running" }
```

---

## Project Structure

```
server/
├── server.js              # Entry point - Express app, middleware, route mounting
├── .env                   # Environment variables (not committed)
├── package.json           # Dependencies and npm scripts
├── nodemon.json           # Dev server watch config
│
├── config/                # Application configuration
│   └── db.js              # PostgreSQL connection pool and testConnection()
│
├── routes/                # Route definitions (URL -> middleware -> controller)
│   ├── funds.js           # /api/funds/* routes
│   └── categories.js      # /api/categories routes
│
├── controllers/           # HTTP adapters (parse request, call service, send response)
│   ├── fundController.js  # GET /api/funds, GET /api/funds/:id
│   ├── domainController.js# POST /api/funds/domains/* (all 8 domain endpoints)
│   └── categoryController.js
│
├── services/              # Business logic (orchestration, merging, shaping)
│   ├── fundService.js     # Pagination assembly, fund detail lookup
│   └── domainService.js   # Single/multi-domain fetching, row merging by _id
│
├── queries/               # Data access layer (raw SQL, pool.query calls)
│   ├── fundQueries.js     # Fund list/count/detail queries against materialized views
│   ├── domainQueries.js   # Calls to ms.fn_get_*_at_date() SQL functions
│   └── categoryQueries.js # Distinct category query
│
├── middleware/             # Express middleware
│   ├── errorHandler.js    # AppError class, centralized error handler, 404 handler
│   └── validator.js       # Request validation (pagination, filters, fundIds, asofDate, domains)
│
├── db/                    # Database schema artifacts (not runtime code)
│   ├── docs/              # Generated schema documentation
│   └── sql/functions/     # Ordered SQL function definitions (01-08)
│
├── tools/                 # Dev-time CLI scripts
│   ├── deploy-functions.js    # Deploy SQL functions to PostgreSQL
│   ├── exportSchemaMetadata.js# Export schema docs to db/docs/
│   └── tableMetadata.js       # Inspect table structure interactively
│
└── tests/                 # Jest + Supertest test suites
    ├── pagination.property.test.js       # Property-based pagination tests
    └── fundDomains.integration.test.js   # Integration test for multi-domain endpoint
```

### Request Flow

```
HTTP Request
  -> routes/        (URL matching + middleware chain)
  -> middleware/     (validation)
  -> controllers/   (parse req, send res)
  -> services/      (business logic)
  -> queries/       (SQL execution)
  -> config/db.js   (connection pool)
  -> PostgreSQL
```

---

## API Reference

Base URL: `http://localhost:5000`

### Health Check

```
GET /health
```

Returns `{ "status": "ok", "message": "Server is running" }`.

---

### Funds

#### List Funds

```
GET /api/funds
```

Paginated list with search and filter support.

| Query Param | Type   | Default | Description |
|-------------|--------|---------|-------------|
| `page`      | number | 1       | Page number (>= 1) |
| `limit`     | number | 20      | Items per page (1-100) |
| `search`    | string |         | Search in fund name, legal name, ticker |
| `type`      | string |         | Filter by security type or legal structure |
| `category`  | string |         | Filter by category name |

**Response:**

```json
{
  "data": [
    {
      "_id": "F00000XGDA",
      "_name": "...",
      "fundname": "...",
      "ticker": "...",
      "categoryname": "...",
      "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5432,
    "totalPages": 272
  }
}
```

**Example:**

```bash
# Page 2, 10 per page, search for "balanced"
curl "http://localhost:5000/api/funds?page=2&limit=10&search=balanced"

# Filter by category
curl "http://localhost:5000/api/funds?category=Canadian%20Equity"
```

---

#### Get Fund by ID

```
GET /api/funds/:id
```

Returns full detail for a single fund (90+ columns).

**Response:**

```json
{
  "data": {
    "_id": "F00000XGDA",
    "fundname": "...",
    "legalname": "...",
    "ticker": "...",
    "categoryname": "...",
    "inceptiondate": "...",
    "prospectusobjective": "...",
    "..."
  }
}
```

**Example:**

```bash
curl http://localhost:5000/api/funds/F00000XGDA
```

---

### Domain Endpoints

Domain endpoints return time-sensitive data for one or more funds at a specific as-of date. Each domain maps to a PostgreSQL function that handles temporal logic.

All domain endpoints use **POST** with the same request body shape:

```json
{
  "fundIds": ["F00000XGDA", "F00001QJVO"],
  "asofDate": "2024-06-30"
}
```

| Field      | Type     | Required | Constraints |
|------------|----------|----------|-------------|
| `fundIds`  | string[] | yes      | 1-100 Morningstar fund IDs |
| `asofDate` | string   | yes      | `YYYY-MM-DD` format, must be a valid calendar date |

**Response shape** (all single-domain endpoints):

```json
{
  "asofDate": "2024-06-30",
  "funds": [
    { "_id": "F00000XGDA", "...domain-specific columns..." },
    { "_id": "F00001QJVO", "...domain-specific columns..." }
  ]
}
```

#### Single-Domain Endpoints

| Endpoint | Domain Key | SQL Function | Description |
|----------|------------|--------------|-------------|
| `POST /api/funds/domains/basic-info` | `basicInfo` | `fn_get_basic_info_at_date` | Fund identifiers, company, structure |
| `POST /api/funds/domains/performance` | `performance` | `fn_get_performance_at_date` | Trailing total returns (1m-20yr, YTD) |
| `POST /api/funds/domains/rankings` | `rankings` | `fn_get_rankings_at_date` | Percentile rank, quartile, absolute rank |
| `POST /api/funds/domains/fees` | `fees` | `fn_get_all_fees_at_date` | Prospectus and annual report fees |
| `POST /api/funds/domains/ratings` | `ratings` | `fn_get_ratings_at_date` | Morningstar star ratings |
| `POST /api/funds/domains/risk` | `risk` | `fn_get_all_risk_at_date` | Standard deviation, Sharpe, alpha, beta |
| `POST /api/funds/domains/flows` | `flows` | `fn_get_flows_at_date` | Estimated fund-level net flows |
| `POST /api/funds/domains/assets` | `assets` | `fn_get_assets_at_date` | Fund-level net assets |

**Example:**

```bash
curl -X POST http://localhost:5000/api/funds/domains/performance \
  -H "Content-Type: application/json" \
  -d '{"fundIds": ["F00000XGDA"], "asofDate": "2024-06-30"}'
```

---

#### Multi-Domain Endpoint

```
POST /api/funds/domains
```

Fetch multiple domains in a single request. Queries run in parallel and results are merged by `_id`.

**Request body:**

```json
{
  "fundIds": ["F00000XGDA", "F00001QJVO"],
  "asofDate": "2024-06-30",
  "domains": ["basicInfo", "performance", "ratings"]
}
```

| Field     | Type     | Required | Allowed values |
|-----------|----------|----------|----------------|
| `domains` | string[] | yes      | `basicInfo`, `performance`, `rankings`, `fees`, `ratings`, `risk`, `flows`, `assets` |

**Response:**

```json
{
  "asofDate": "2024-06-30",
  "funds": [
    {
      "basicInfo":   { "_id": "F00000XGDA", "fundname": "...", "..." },
      "performance": { "_id": "F00000XGDA", "monthenddate": "2024-06-30", "..." },
      "ratings":     { "_id": "F00000XGDA", "ratingdate": "...", "..." }
    },
    {
      "basicInfo":   { "_id": "F00001QJVO", "..." },
      "performance": { "_id": "F00001QJVO", "..." },
      "ratings":     { "_id": "F00001QJVO", "..." }
    }
  ]
}
```

**Example:**

```bash
curl -X POST http://localhost:5000/api/funds/domains \
  -H "Content-Type: application/json" \
  -d '{
    "fundIds": ["F00000XGDA", "F00001QJVO"],
    "asofDate": "2024-06-30",
    "domains": ["basicInfo", "performance", "fees"]
  }'
```

---

### Categories

#### List Categories

```
GET /api/categories
```

Returns all distinct category names.

**Response:**

```json
{
  "data": [
    "Canadian Equity",
    "Canadian Fixed Income",
    "Global Equity",
    "..."
  ]
}
```

---

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "message": "Description of the error",
  "status": 400,
  "timestamp": "2024-06-30T12:00:00.000Z",
  "path": "/api/funds"
}
```

| Status | Meaning |
|--------|---------|
| 400    | Validation error (bad params, missing fields) |
| 404    | Fund not found or undefined route |
| 500    | Internal server error |
| 503    | Database connection unavailable |

In development mode (`NODE_ENV=development`), error responses also include a `stack` trace.

---

## npm Scripts

Run from the `server/` directory:

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server with nodemon (auto-restart) |
| `npm run start:prod` | Start production server with node |
| `npm test` | Run Jest test suites |
| `npm run deploy-functions` | Deploy SQL functions from `db/sql/functions/` to PostgreSQL |
| `npm run export-schema` | Export schema metadata to `db/docs/` |
| `npm run docs:schema` | Alias for `export-schema` |
| `npm run inspect-table` | Inspect a table's columns, keys, and indexes |

---

## Database Setup

The API expects a PostgreSQL database with the `ms` schema populated with Morningstar data tables and materialized views.

### Prerequisites

1. PostgreSQL running with the `ms` schema and base tables loaded
2. Deploy the SQL functions (required for domain endpoints):

```bash
cd server
npm run deploy-functions
```

This deploys 8 date-sensitive SQL functions (`fn_get_*_at_date`) and creates recommended indexes.

3. The materialized view `ms.mv_fund_share_class_basic_info_ca_openend_latest` must exist for fund listing and category endpoints.

### Key Database Objects

| Object | Type | Used By |
|--------|------|---------|
| `ms.mv_fund_share_class_basic_info_ca_openend_latest` | Materialized view | Fund list, fund detail, categories |
| `ms.fn_get_basic_info_at_date(TEXT[], DATE)` | Function | `/domains/basic-info` |
| `ms.fn_get_performance_at_date(TEXT[], DATE)` | Function | `/domains/performance` |
| `ms.fn_get_rankings_at_date(TEXT[], DATE)` | Function | `/domains/rankings` |
| `ms.fn_get_all_fees_at_date(TEXT[], DATE)` | Function | `/domains/fees` |
| `ms.fn_get_ratings_at_date(TEXT[], DATE)` | Function | `/domains/ratings` |
| `ms.fn_get_all_risk_at_date(TEXT[], DATE)` | Function | `/domains/risk` |
| `ms.fn_get_flows_at_date(TEXT[], DATE)` | Function | `/domains/flows` |
| `ms.fn_get_assets_at_date(TEXT[], DATE)` | Function | `/domains/assets` |

---

## Testing

```bash
cd server
npm test
```

Tests use **Jest** + **Supertest** against a live database connection. The test suite includes:

- **Property-based pagination tests** (`fast-check`) - verifies pagination correctness across randomized page/limit combinations
- **Domain integration tests** - verifies multi-domain merging with real database queries

Make sure the database is running and `.env` is configured before running tests.

---

## Adding a New Domain

To add a new domain endpoint (e.g., `holdings`):

1. **SQL function** - Create `db/sql/functions/09_holdings_at_date.sql` defining `ms.fn_get_holdings_at_date(TEXT[], DATE)`

2. **Register in queries** - Add the mapping in `queries/domainQueries.js`:
   ```js
   const DOMAIN_FUNCTIONS = {
     // ...existing domains
     holdings: 'ms.fn_get_holdings_at_date',
   };
   ```

3. **Controller handler** - Add one line in `controllers/domainController.js`:
   ```js
   const getHoldingsAtDate = makeSingleDomainHandler('holdings');
   ```

4. **Route** - Add in `routes/funds.js`:
   ```js
   router.post('/domains/holdings', validateFundIdsBody, validateAsofDateBody, getHoldingsAtDate);
   ```

5. **Validator** - Add `'holdings'` to the `allowed` set in `middleware/validator.js` so it works with the multi-domain endpoint.

6. **Deploy** - Run `npm run deploy-functions` to deploy the SQL function, then restart the server.
