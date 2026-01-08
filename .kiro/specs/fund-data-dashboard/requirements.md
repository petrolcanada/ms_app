# Requirements Document

## Introduction

A full-stack web application that displays US and Canada mutual fund and ETF data, including category performance, rankings, fund basic information, fees, and portfolio manager details. The application retrieves data from a locally hosted PostgreSQL database containing 10+ tables and presents it through a modern, responsive React-based user interface.

## Glossary

- **Fund**: A mutual fund or ETF (Exchange-Traded Fund)
- **Category**: A classification grouping for funds based on investment type or strategy
- **Ranking**: A numerical or percentile position of a fund relative to peers
- **Portfolio_Manager**: The individual or team responsible for managing a fund's investments
- **Frontend**: The React-based user interface component
- **Backend**: The API server that interfaces with the PostgreSQL database
- **Database**: The PostgreSQL database containing fund data across 10+ tables

## Requirements

### Requirement 1: Display Fund Basic Information

**User Story:** As a user, I want to view basic information about mutual funds and ETFs, so that I can understand key details about each fund.

#### Acceptance Criteria

1. WHEN a user selects a fund, THE Frontend SHALL display the fund's name, ticker symbol, and type (mutual fund or ETF)
2. WHEN displaying fund information, THE Frontend SHALL show the fund's inception date and current net asset value
3. WHEN a user requests fund details, THE Backend SHALL retrieve the data from the Database within 500ms
4. THE Backend SHALL return fund information in JSON format with all required fields populated

### Requirement 2: Display Fund Fees and Costs

**User Story:** As a user, I want to see fee information for funds, so that I can compare costs across different investment options.

#### Acceptance Criteria

1. WHEN displaying a fund, THE Frontend SHALL show the management expense ratio (MER) or expense ratio
2. WHEN fee information is available, THE Frontend SHALL display any front-end loads, back-end loads, and transaction fees
3. THE Backend SHALL retrieve fee data from the Database and return it with two decimal precision
4. IF fee information is missing for a fund, THEN THE Frontend SHALL display "N/A" instead of blank fields

### Requirement 3: Display Portfolio Manager Information

**User Story:** As a user, I want to see who manages each fund, so that I can evaluate the fund based on manager experience and track record.

#### Acceptance Criteria

1. WHEN displaying fund details, THE Frontend SHALL show the portfolio manager's name
2. WHERE multiple managers exist for a fund, THE Frontend SHALL display all manager names
3. WHEN available, THE Frontend SHALL show the manager's tenure with the fund
4. THE Backend SHALL join fund and manager tables to retrieve complete manager information

### Requirement 4: Display Category Performance

**User Story:** As a user, I want to view performance metrics by fund category, so that I can compare how different investment categories are performing.

#### Acceptance Criteria

1. WHEN a user views category performance, THE Frontend SHALL display returns for 1-year, 3-year, and 5-year periods
2. THE Frontend SHALL show year-to-date (YTD) performance for each category
3. WHEN calculating performance, THE Backend SHALL aggregate fund data by category and compute average returns
4. THE Frontend SHALL display performance metrics as percentages with two decimal places

### Requirement 5: Display Fund Rankings

**User Story:** As a user, I want to see how funds rank within their categories, so that I can identify top-performing funds.

#### Acceptance Criteria

1. WHEN displaying rankings, THE Frontend SHALL show each fund's rank within its category
2. THE Frontend SHALL display the total number of funds in each category for context
3. WHEN a user sorts by ranking, THE Frontend SHALL order funds from highest to lowest rank
4. THE Backend SHALL calculate rankings based on performance metrics stored in the Database

### Requirement 6: Filter and Search Funds

**User Story:** As a user, I want to filter and search for specific funds, so that I can quickly find funds that match my criteria.

#### Acceptance Criteria

1. WHEN a user enters a search term, THE Frontend SHALL filter funds by name, ticker symbol, or manager name
2. THE Frontend SHALL provide filter options for fund type (mutual fund vs ETF)
3. THE Frontend SHALL provide filter options for category
4. WHEN filters are applied, THE Backend SHALL query the Database with appropriate WHERE clauses and return matching results within 1 second

### Requirement 7: Responsive Modern UI Design

**User Story:** As a user, I want a modern, responsive interface, so that I can access fund data on any device with an intuitive experience.

#### Acceptance Criteria

1. THE Frontend SHALL render correctly on desktop, tablet, and mobile screen sizes
2. THE Frontend SHALL use a modern component library that supports responsive design
3. WHEN displaying data tables, THE Frontend SHALL implement horizontal scrolling on small screens
4. THE Frontend SHALL provide clear visual hierarchy with consistent spacing, typography, and color scheme

### Requirement 8: API Endpoints for Data Retrieval

**User Story:** As a developer, I want well-defined API endpoints, so that the frontend can reliably retrieve fund data from the backend.

#### Acceptance Criteria

1. THE Backend SHALL provide a GET endpoint for retrieving all funds with pagination support
2. THE Backend SHALL provide a GET endpoint for retrieving individual fund details by ID
3. THE Backend SHALL provide a GET endpoint for category performance data
4. THE Backend SHALL provide a GET endpoint for fund rankings within categories
5. WHEN an API request fails, THE Backend SHALL return appropriate HTTP status codes and error messages

### Requirement 9: Database Connection and Query Optimization

**User Story:** As a system administrator, I want efficient database queries, so that the application performs well even with large datasets.

#### Acceptance Criteria

1. THE Backend SHALL establish a connection pool to the PostgreSQL Database
2. THE Backend SHALL use prepared statements or parameterized queries to prevent SQL injection
3. WHEN querying multiple tables, THE Backend SHALL use JOIN operations rather than multiple sequential queries
4. THE Backend SHALL implement database indexes on frequently queried columns (fund ID, category, ticker)

### Requirement 10: Error Handling and Data Validation

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and can take appropriate action.

#### Acceptance Criteria

1. WHEN the Database is unavailable, THE Backend SHALL return a 503 status code with a descriptive error message
2. WHEN invalid query parameters are provided, THE Backend SHALL return a 400 status code with validation details
3. IF a requested fund does not exist, THEN THE Backend SHALL return a 404 status code
4. THE Frontend SHALL display user-friendly error messages instead of technical error details
5. WHEN an error occurs, THE Frontend SHALL provide options to retry or return to the previous view
