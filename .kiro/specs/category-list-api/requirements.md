# Requirements Document

## Introduction

A backend API endpoint that retrieves distinct category names from the fund database and a frontend integration that populates the category filter dropdown dynamically. This replaces the hardcoded category list in the FilterPanel component with real data from the database, ensuring the filter options always reflect the actual categories present in the fund data.

## Glossary

- **Category**: A classification grouping for funds based on investment type or strategy (e.g., "Canadian Equity", "US Equity")
- **Backend**: The Node.js/Express API server that interfaces with the PostgreSQL database
- **Frontend**: The React-based user interface component
- **FilterPanel**: The React component that provides dropdown filters for fund type and category
- **API_Endpoint**: A REST API route that handles HTTP requests and returns JSON responses
- **Database**: The PostgreSQL database containing fund data in the ms.mv_fund_share_class_basic_info_ca_openend_latest materialized view

## Requirements

### Requirement 1: Retrieve Distinct Category Names

**User Story:** As a user, I want the category filter to show only categories that actually exist in the database, so that I don't select categories with no results.

#### Acceptance Criteria

1. THE Backend SHALL provide a GET endpoint at /api/categories that returns a list of distinct category names
2. WHEN querying categories, THE Backend SHALL retrieve distinct values from the categoryname column in the database
3. WHEN the database query completes, THE Backend SHALL return results within 500ms

### Requirement 2: API Response Format

**User Story:** As a frontend developer, I want a consistent API response format, so that I can reliably parse and use the category data.

#### Acceptance Criteria

1. THE Backend SHALL return category data in JSON format
2. THE Backend SHALL structure the response with a "data" field containing an array of category names
3. WHEN categories are successfully retrieved, THE Backend SHALL return HTTP status code 200
4. THE Backend SHALL return each category as a string value in the data array

### Requirement 3: Frontend Integration

**User Story:** As a user, I want the category dropdown to be populated with real categories from the database, so that I can filter funds by actual available categories.

#### Acceptance Criteria

1. WHEN the FilterPanel component mounts, THE Frontend SHALL fetch the category list from the API
2. THE Frontend SHALL display a loading state while fetching categories
3. WHEN categories are successfully loaded, THE Frontend SHALL populate the category dropdown with the retrieved values
4. IF the API request fails, THEN THE Frontend SHALL fall back to the default hardcoded category list
5. THE Frontend SHALL cache the category list to avoid repeated API calls on every component mount

### Requirement 4: Error Handling

**User Story:** As a user, I want the application to handle errors gracefully, so that I can still use the category filter even if the API fails.

#### Acceptance Criteria

1. IF the database is unavailable, THEN THE Backend SHALL return HTTP status code 503 with an error message
2. IF the database query fails, THEN THE Backend SHALL return HTTP status code 500 with an error message
3. WHEN the Frontend receives an error response, THE Frontend SHALL fall back to the default category list
4. THE Frontend SHALL log errors to the console for debugging purposes
5. THE Frontend SHALL not display error messages to the user for category loading failures (silent fallback)

### Requirement 5: Performance and Caching

**User Story:** As a system administrator, I want efficient category retrieval, so that the application performs well even with large datasets.

#### Acceptance Criteria

1. THE Backend SHALL use a SELECT DISTINCT query to retrieve unique category names
2. THE Backend SHALL leverage database indexes on the categoryname column if available
3. THE Frontend SHALL cache the category list for the duration of the user session
4. THE Frontend SHALL only fetch categories once per page load unless explicitly refreshed
5. WHEN the category list is cached, THE Frontend SHALL use the cached data instead of making new API requests
