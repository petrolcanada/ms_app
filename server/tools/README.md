# Database Scripts

This directory contains utility scripts for managing and documenting the Morningstar database.

---

## Export Schema Metadata

**Script:** `exportSchemaMetadata.js`

Pulls raw metadata from PostgreSQL `information_schema` for the 'ms' schema and exports it in multiple formats for easy reference and documentation.

### What It Exports

1. **schema-metadata.json** - Complete structured metadata in JSON format
2. **schema-metadata.md** - Human-readable Markdown documentation
3. **schema-columns.csv** - CSV file of all columns (for Excel/spreadsheet analysis)
4. **schema-summary.md** - High-level summary with statistics

### Usage

```bash
# From project root
node server/tools/exportSchemaMetadata.js

# Or with npm script
cd server
npm run export-schema
```

### Environment Variables

The script uses your existing database configuration from `server/db/config/db.js`, which reads these environment variables from your `.env` file:

```bash
POSTGRES_HOST=localhost        # Database host
POSTGRES_PORT=5432            # Database port
POSTGRES_DATABASE=postgres    # Database name
POSTGRES_USER=postgres        # Database user
POSTGRES_PASSWORD=yourpass    # Database password
```

Make sure your `.env` file is properly configured in the `server` directory.

### Output Files

All files are saved to `server/db/docs/`:

#### 1. schema-metadata.json
Complete metadata in JSON format, organized by table:
```json
{
  "fund_share_class_basic_info_ca_openend": {
    "table_name": "fund_share_class_basic_info_ca_openend",
    "columns": [...],
    "indexes": [...],
    "table_info": {
      "table_type": "BASE TABLE",
      "total_size": "1024 MB",
      "estimated_rows": 50000
    }
  }
}
```

#### 2. schema-metadata.md
Markdown documentation with:
- Table type and size
- Complete column list with data types
- Index information
- Materialized view definitions

#### 3. schema-columns.csv
CSV export of all columns for spreadsheet analysis:
```csv
table_name,column_name,data_type,character_maximum_length,is_nullable,...
fund_share_class_basic_info_ca_openend,_id,text,,NO,...
```

#### 4. schema-summary.md
High-level summary including:
- Object counts (tables, views, materialized views)
- Tables sorted by column count
- Common column names across tables
- Temporal tracking analysis
- Date/time columns by table

### Example Output

```
🔍 Connecting to database...
✅ Database connected successfully

📊 Fetching column metadata...
📊 Fetching table metadata...
📊 Fetching index metadata...
📊 Fetching materialized view definitions...

✅ Fetched metadata for 15 tables/views

✅ Exported JSON: schema-metadata.json
✅ Exported Markdown: schema-metadata.md
✅ Exported CSV: schema-columns.csv
✅ Exported Summary: schema-summary.md

✅ Schema metadata exported successfully!

Generated files:
  - server/db/docs/schema-metadata.json
  - server/db/docs/schema-metadata.md
  - server/db/docs/schema-columns.csv
  - server/db/docs/schema-summary.md

✨ Done!
```

### When to Run

Run this script:
- After initial database setup
- After schema migrations
- When documenting the database structure
- Before major refactoring
- To generate up-to-date reference documentation

### Adding to package.json

Already added! Use these commands:

```bash
npm run export-schema
# or
npm run docs:schema
```

---

## Deploy SQL Functions + Indexes

**Script:** `deploy-functions.js`

Deploys the SQL functions from `server/db/sql/functions/` and creates the recommended indexes.

### Usage

```bash
cd server
npm run deploy-functions

# or
node tools/deploy-functions.js
```

## Other Scripts

### inspectTable.js
Inspect a specific table's structure and sample data.

### scanMsSchema.js
Scan the entire 'ms' schema for analysis.

---

## Future Scripts

Additional scripts to be added:

- `generateMigration.js` - Generate migration files from schema changes
- `validateSchema.js` - Validate schema against expected structure
- `compareSchemas.js` - Compare two database schemas
- `seedTestData.js` - Seed database with test data
