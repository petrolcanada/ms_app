# Design Document: Category List API

## Overview

This feature adds a backend API endpoint that retrieves distinct category names from the PostgreSQL database and integrates it with the existing FilterPanel component on the frontend. The implementation replaces the hardcoded category list with dynamic data, ensuring users always see accurate filter options that reflect the actual categories in the database.

The design follows the existing architecture patterns established in the fund-data-dashboard application, using Node.js/Express for the backend and React with React Query for the frontend.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend"
        FP[FilterPanel Component]
        Hook[useCategories Hook]
        Cache[React Query Cache]
    end
    
    subgraph "Backend"
        Route[/api/categories Route]
        Controller[categoryController]
        Validator[Validation Middleware]
    end
    
    subgraph "Database"
        MV[mv_fund_share_class_basic_info_ca_openend_latest]
    end
    
    FP --> Hook
    Hook --> Cache
    Hook --> Route
    Route --> Validator
    Validator --> Controller
    Controller --> MV
    MV --> Controller
    Controller --> Route
    Route --> Hook
    Hook --> FP
```

### Integration Points

This feature integrates with existing components:

1. **Backend Integration**: Adds a new route to the existing Express server
2. **Frontend Integration**: Enhances the existing FilterPanel component
3. **Database Integration**: Queries the existing materialized view used by fundController

## Components and Interfaces

### Backend Components

#### 1. Category Controller (server/controllers/categoryController.js)

**Purpose**: Handles business logic for retrieving category names

**Functions**:
- `getAllCategories()`: Retrieves distinct category names from database

**Implementation**:
```javascript
const getAllCategories = async (req, res, next) => {
  try {
    const queryText = `
      SELECT DISTINCT categoryname
      FROM ms.mv_fund_share_class_basic_info_ca_openend_latest
    `;
    
    const result = await pool.query(queryText);
    const categories = result.rows.map(row => row.categoryname);
    
    res.status(200).json({
      data: categories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    next(err);
  }
};
```

**Error Handling**:
- Database connection errors → 503 Service Unavailable
- Query errors → 500 Internal Server Error
- Uses centralized error handler middleware

#### 2. Category Routes (server/routes/categories.js)

**Purpose**: Defines API endpoints for category operations

**Endpoints**:
- `GET /api/categories` - Retrieve all distinct category names

**Implementation**:
```javascript
const express = require('express');
const router = express.Router();
const { getAllCategories } = require('../controllers/categoryController');

// GET /api/categories - Get all distinct category names
router.get('/', getAllCategories);

module.exports = router;
```

**Route Registration** (in server/server.js):
```javascript
const categoryRoutes = require('./routes/categories');
app.use('/api/categories', categoryRoutes);
```

### Frontend Components

#### 1. useCategories Hook (client/src/hooks/useCategories.js)

**Purpose**: Encapsulates React Query logic for fetching categories

**Implementation**:
```javascript
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const DEFAULT_CATEGORIES = [
  'Alternative',
  'Balanced',
  'Canadian Equity',
  'Canadian Fixed Income',
  'Global Equity',
  'Global Fixed Income',
  'International Equity',
  'Money Market',
  'Specialty',
  'US Equity',
];

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data;
    },
    staleTime: Infinity, // Categories don't change frequently
    cacheTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1, // Only retry once on failure
    onError: (error) => {
      console.error('Failed to fetch categories:', error);
    },
    placeholderData: DEFAULT_CATEGORIES, // Use defaults while loading
    fallbackData: DEFAULT_CATEGORIES, // Use defaults on error
  });
};
```

**Features**:
- Infinite stale time (categories rarely change)
- 1-hour cache time
- Fallback to default categories on error
- Placeholder data for immediate rendering

#### 2. FilterPanel Component Updates (client/src/components/FilterPanel.jsx)

**Changes Required**:
1. Import and use the `useCategories` hook
2. Remove hardcoded DEFAULT_CATEGORIES constant
3. Use categories from the hook instead of props

**Updated Implementation**:
```javascript
import { useCategories } from '../hooks/useCategories';

const FilterPanel = ({ filters, onFilterChange }) => {
  const { data: categories = [], isLoading } = useCategories();
  
  // Rest of component implementation remains the same
  // Use 'categories' instead of 'availableCategories' prop
};
```

**Props Changes**:
- Remove `availableCategories` prop (no longer needed)
- Keep `filters` and `onFilterChange` props unchanged

### API Endpoints

#### GET /api/categories

**Description**: Retrieve all distinct category names from the database

**Request**:
- Method: GET
- URL: `/api/categories`
- Query Parameters: None
- Headers: None required

**Response (Success - 200)**:
```json
{
  "data": [
    "Alternative",
    "Balanced",
    "Canadian Equity",
    "Canadian Fixed Income",
    "Global Equity",
    "Global Fixed Income",
    "International Equity",
    "Money Market",
    "Specialty",
    "US Equity"
  ]
}
```

**Response (Error - 500)**:
```json
{
  "error": {
    "message": "Internal server error",
    "status": 500,
    "timestamp": "2025-01-17T10:30:00.000Z"
  }
}
```

**Response (Error - 503)**:
```json
{
  "error": {
    "message": "Database temporarily unavailable",
    "status": 503,
    "timestamp": "2025-01-17T10:30:00.000Z"
  }
}
```

## Data Models

### Database Query

**Source Table**: `ms.mv_fund_share_class_basic_info_ca_openend_latest`

**Column Used**: `categoryname` (VARCHAR)

**Query Pattern**:
```sql
SELECT DISTINCT categoryname
FROM ms.mv_fund_share_class_basic_info_ca_openend_latest
```

**Performance Considerations**:
- DISTINCT operation on indexed column (if index exists)
- Simple query with no filtering or ordering for maximum performance
- Expected result set: 10-50 categories (small dataset)
- Results may include NULL values if present in the database

### Frontend Data Model

**Type**: Array of strings

**Example**:
```javascript
const categories = [
  "Alternative",
  "Balanced",
  "Canadian Equity",
  // ... more categories
];
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: No duplicate categories
*For any* API response from GET /api/categories, the returned array should contain no duplicate category names.
**Validates: Requirements 1.2**

### Property 2: Valid JSON structure
*For any* successful API response, the response should be valid JSON with a "data" field containing an array of strings.
**Validates: Requirements 2.1, 2.2, 2.4**

### Property 3: Fallback on error
*For any* error response from the API, the frontend should display the default hardcoded category list without showing an error message to the user.
**Validates: Requirements 4.3, 4.5**

### Property 4: Single fetch per session
*For any* user session, the frontend should fetch the category list at most once unless the cache is explicitly invalidated.
**Validates: Requirements 5.3, 5.4, 5.5**

## Error Handling

### Backend Error Handling

**Database Connection Errors**:
- Catch connection pool errors
- Return 503 Service Unavailable
- Log error details for debugging
- Message: "Database temporarily unavailable"

**Query Execution Errors**:
- Catch SQL errors during query execution
- Return 500 Internal Server Error
- Log query and error details
- Message: "Internal server error"

**Error Handler Integration**:
- Use existing centralized error handler middleware
- Pass errors to `next(err)` for consistent handling
- Leverage existing AppError class if needed

### Frontend Error Handling

**API Request Failures**:
- Silent fallback to default categories
- No error message displayed to user
- Log error to console for debugging
- Continue normal operation with defaults

**Loading States**:
- Show loading indicator while fetching (optional)
- Use placeholder data for immediate rendering
- Prevent UI flicker with smooth transitions

**Cache Invalidation**:
- Automatic retry on network errors (1 retry)
- Manual cache invalidation available via React Query
- Stale data served while revalidating in background

## Testing Strategy

### Unit Testing

**Backend Unit Tests**:
- Test `getAllCategories` controller function with mocked database
- Test that query returns distinct values
- Test error handling for database failures
- Framework: Jest with supertest

**Frontend Unit Tests**:
- Test `useCategories` hook with mocked API responses
- Test that hook returns data correctly
- Test fallback to default categories on error
- Test caching behavior
- Test FilterPanel component with categories from hook
- Framework: Jest with React Testing Library

**Example Unit Tests**:
```javascript
// Backend
describe('getAllCategories', () => {
  it('should return distinct categories', async () => {
    const mockResult = {
      rows: [
        { categoryname: 'US Equity' },
        { categoryname: 'Canadian Equity' },
        { categoryname: 'Balanced' }
      ]
    };
    pool.query.mockResolvedValue(mockResult);
    
    const response = await request(app).get('/api/categories');
    
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([
      'US Equity',
      'Canadian Equity',
      'Balanced'
    ]);
  });
});

// Frontend
describe('useCategories', () => {
  it('should return categories from API', async () => {
    const mockCategories = ['Category A', 'Category B'];
    api.get.mockResolvedValue({ data: { data: mockCategories } });
    
    const { result, waitFor } = renderHook(() => useCategories());
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCategories);
  });
  
  it('should fallback to defaults on error', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    
    const { result, waitFor } = renderHook(() => useCategories());
    
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toEqual(DEFAULT_CATEGORIES);
  });
});
```

### Property-Based Testing

**Configuration**:
- Use fast-check library for JavaScript property-based testing
- Configure each property test to run minimum 100 iterations
- Tag each test with feature name and property number

**Backend Property Tests**:

**Property 1: No duplicate categories**
```javascript
// Feature: category-list-api, Property 1: No duplicate categories
test('API response contains no duplicate category names', async () => {
  const response = await request(app).get('/api/categories');
  const categories = response.body.data;
  const uniqueCategories = [...new Set(categories)];
  
  expect(categories.length).toBe(uniqueCategories.length);
});
```

**Property 2: Valid JSON structure**
```javascript
// Feature: category-list-api, Property 2: Valid JSON structure
test('API returns valid JSON with data array of strings', async () => {
  const response = await request(app).get('/api/categories');
  
  expect(response.body).toHaveProperty('data');
  expect(Array.isArray(response.body.data)).toBe(true);
  response.body.data.forEach(item => {
    expect(typeof item).toBe('string');
  });
});
```

**Frontend Property Tests**:

**Property 3: Fallback on error**
```javascript
// Feature: category-list-api, Property 5: Fallback on error
test('Frontend uses default categories when API fails', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.constantFrom('Network error', 'Timeout', '500 error'),
      async (errorType) => {
        api.get.mockRejectedValue(new Error(errorType));
        
        const { result, waitFor } = renderHook(() => useCategories());
        
        await waitFor(() => result.current.isError || result.current.isSuccess);
        
        // Should have data (either from API or fallback)
        expect(result.current.data).toBeDefined();
        expect(Array.isArray(result.current.data)).toBe(true);
        expect(result.current.data.length).toBeGreaterThan(0);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 4: Single fetch per session**
```javascript
// Feature: category-list-api, Property 4: Single fetch per session
test('Categories are fetched only once per session', async () => {
  const mockCategories = ['Category A', 'Category B'];
  const apiSpy = jest.fn().mockResolvedValue({ data: { data: mockCategories } });
  api.get = apiSpy;
  
  const { result: result1 } = renderHook(() => useCategories());
  const { result: result2 } = renderHook(() => useCategories());
  
  await waitFor(() => result1.current.isSuccess && result2.current.isSuccess);
  
  // API should be called only once due to caching
  expect(apiSpy).toHaveBeenCalledTimes(1);
});
```

### Integration Testing

**API Integration Tests**:
- Test complete request/response cycle with real database
- Verify actual categories from test database are returned
- Test error scenarios with database unavailable
- Test response time meets 500ms requirement

**Frontend Integration Tests**:
- Test FilterPanel component with real API calls (mocked)
- Verify dropdown is populated with fetched categories
- Test user interaction with dynamically loaded categories
- Test fallback behavior when API is unavailable

### Testing Best Practices

**Balance**:
- Unit tests for specific examples and edge cases
- Property tests for universal correctness across many inputs
- Integration tests for end-to-end flows
- Both unit and property tests are complementary and necessary

**Coverage Goals**:
- Aim for 80%+ code coverage on backend controller
- Focus on critical paths: query execution, error handling
- Test frontend hook thoroughly with various scenarios
- Don't over-test trivial code

**Test Maintenance**:
- Keep tests simple and readable
- Mock external dependencies (database, API)
- Update tests when requirements change
- Remove obsolete tests promptly

