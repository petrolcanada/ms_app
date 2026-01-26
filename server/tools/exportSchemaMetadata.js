/**
 * Export Schema Metadata Script
 * 
 * Pulls raw metadata from PostgreSQL information_schema for the 'ms' schema
 * and saves it to the docs folder in multiple formats for easy reference.
 * 
 * Usage:
 *   node server/tools/exportSchemaMetadata.js
 */

const { pool } = require('../db/config/db');
const fs = require('fs').promises;
const path = require('path');

/**
 * Query to get all column metadata for 'ms' schema
 */
const COLUMN_METADATA_QUERY = `
  SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default,
    ordinal_position
  FROM information_schema.columns
  WHERE table_schema = 'ms'
  ORDER BY table_name, ordinal_position;
`;

/**
 * Query to get table metadata (type, row count estimates)
 */
const TABLE_METADATA_QUERY = `
  SELECT 
    t.table_name,
    t.table_type,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))) as total_size,
    (SELECT reltuples::bigint 
     FROM pg_class 
     WHERE oid = (quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))::regclass) as estimated_rows
  FROM information_schema.tables t
  WHERE t.table_schema = 'ms'
  ORDER BY t.table_name;
`;

/**
 * Query to get index information
 */
const INDEX_METADATA_QUERY = `
  SELECT 
    t.relname as table_name,
    i.relname as index_name,
    a.attname as column_name,
    ix.indisunique as is_unique,
    ix.indisprimary as is_primary
  FROM pg_class t
  JOIN pg_index ix ON t.oid = ix.indrelid
  JOIN pg_class i ON i.oid = ix.indexrelid
  JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'ms'
  ORDER BY t.relname, i.relname, a.attnum;
`;

/**
 * Query to get materialized view definitions
 */
const MATERIALIZED_VIEW_QUERY = `
  SELECT 
    schemaname,
    matviewname,
    definition
  FROM pg_matviews
  WHERE schemaname = 'ms'
  ORDER BY matviewname;
`;

/**
 * Main export function
 */
async function exportSchemaMetadata() {
  console.log('🔍 Connecting to database...');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully\n');

    // Fetch all metadata
    console.log('📊 Fetching column metadata...');
    const columnsResult = await pool.query(COLUMN_METADATA_QUERY);
    
    console.log('📊 Fetching table metadata...');
    const tablesResult = await pool.query(TABLE_METADATA_QUERY);
    
    console.log('📊 Fetching index metadata...');
    const indexesResult = await pool.query(INDEX_METADATA_QUERY);
    
    console.log('📊 Fetching materialized view definitions...');
    const matViewsResult = await pool.query(MATERIALIZED_VIEW_QUERY);
    
    console.log(`\n✅ Fetched metadata for ${tablesResult.rows.length} tables/views\n`);

    // Organize data by table
    const tableMetadata = organizeMetadata(
      columnsResult.rows,
      tablesResult.rows,
      indexesResult.rows,
      matViewsResult.rows
    );

    // Create output directory if it doesn't exist
    const docsDir = path.join(__dirname, '../db/docs');
    await fs.mkdir(docsDir, { recursive: true });

    // Export in multiple formats
    await exportAsJSON(tableMetadata, docsDir);
    await exportAsMarkdown(tableMetadata, docsDir);
    await exportAsCSV(columnsResult.rows, docsDir);
    await exportSummary(tableMetadata, docsDir);

    console.log('\n✅ Schema metadata exported successfully!');
    console.log('\nGenerated files:');
    console.log('  - server/db/docs/schema-metadata.json');
    console.log('  - server/db/docs/schema-metadata.md');
    console.log('  - server/db/docs/schema-columns.csv');
    console.log('  - server/db/docs/schema-summary.md');

  } catch (error) {
    console.error('❌ Error exporting schema metadata:', error);
    throw error;
  } finally {
    // Don't end the pool - let the process handle it
    // The pool is shared across the application
    process.exit(0);
  }
}

/**
 * Organize raw metadata into structured format
 */
function organizeMetadata(columns, tables, indexes, matViews) {
  const metadata = {};

  // Group columns by table
  columns.forEach(col => {
    if (!metadata[col.table_name]) {
      metadata[col.table_name] = {
        table_name: col.table_name,
        columns: [],
        indexes: [],
        table_info: null,
        materialized_view_definition: null
      };
    }
    metadata[col.table_name].columns.push(col);
  });

  // Add table info
  tables.forEach(table => {
    if (metadata[table.table_name]) {
      metadata[table.table_name].table_info = {
        table_type: table.table_type,
        total_size: table.total_size,
        estimated_rows: table.estimated_rows
      };
    }
  });

  // Group indexes by table
  indexes.forEach(idx => {
    if (metadata[idx.table_name]) {
      const existingIndex = metadata[idx.table_name].indexes.find(
        i => i.index_name === idx.index_name
      );
      
      if (existingIndex) {
        existingIndex.columns.push(idx.column_name);
      } else {
        metadata[idx.table_name].indexes.push({
          index_name: idx.index_name,
          columns: [idx.column_name],
          is_unique: idx.is_unique,
          is_primary: idx.is_primary
        });
      }
    }
  });

  // Add materialized view definitions
  matViews.forEach(mv => {
    if (metadata[mv.matviewname]) {
      metadata[mv.matviewname].materialized_view_definition = mv.definition;
    }
  });

  return metadata;
}

/**
 * Export as JSON
 */
async function exportAsJSON(metadata, docsDir) {
  const filePath = path.join(docsDir, 'schema-metadata.json');
  const jsonContent = JSON.stringify(metadata, null, 2);
  await fs.writeFile(filePath, jsonContent, 'utf8');
  console.log('✅ Exported JSON: schema-metadata.json');
}

/**
 * Export as Markdown
 */
async function exportAsMarkdown(metadata, docsDir) {
  const filePath = path.join(docsDir, 'schema-metadata.md');
  
  let markdown = '# Morningstar Schema Metadata\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `Total Tables/Views: ${Object.keys(metadata).length}\n\n`;
  markdown += '---\n\n';

  // Sort tables alphabetically
  const sortedTables = Object.keys(metadata).sort();

  sortedTables.forEach(tableName => {
    const table = metadata[tableName];
    
    markdown += `## ${tableName}\n\n`;
    
    // Table info
    if (table.table_info) {
      markdown += `**Type:** ${table.table_info.table_type}\n`;
      markdown += `**Size:** ${table.table_info.total_size || 'N/A'}\n`;
      markdown += `**Estimated Rows:** ${table.table_info.estimated_rows || 'N/A'}\n\n`;
    }

    // Columns
    markdown += `**Total Columns:** ${table.columns.length}\n\n`;
    markdown += '### Columns\n\n';
    markdown += '| Column Name | Data Type | Nullable | Default |\n';
    markdown += '|-------------|-----------|----------|----------|\n';
    
    table.columns.forEach(col => {
      const dataType = formatDataType(col);
      const nullable = col.is_nullable === 'YES' ? 'Yes' : 'No';
      const defaultVal = col.column_default || '-';
      markdown += `| ${col.column_name} | ${dataType} | ${nullable} | ${defaultVal} |\n`;
    });
    
    markdown += '\n';

    // Indexes
    if (table.indexes.length > 0) {
      markdown += '### Indexes\n\n';
      markdown += '| Index Name | Columns | Type |\n';
      markdown += '|------------|---------|------|\n';
      
      table.indexes.forEach(idx => {
        const type = idx.is_primary ? 'PRIMARY KEY' : 
                     idx.is_unique ? 'UNIQUE' : 'INDEX';
        markdown += `| ${idx.index_name} | ${idx.columns.join(', ')} | ${type} |\n`;
      });
      
      markdown += '\n';
    }

    // Materialized view definition
    if (table.materialized_view_definition) {
      markdown += '### Materialized View Definition\n\n';
      markdown += '```sql\n';
      markdown += table.materialized_view_definition;
      markdown += '\n```\n\n';
    }

    markdown += '---\n\n';
  });

  await fs.writeFile(filePath, markdown, 'utf8');
  console.log('✅ Exported Markdown: schema-metadata.md');
}

/**
 * Export columns as CSV
 */
async function exportAsCSV(columns, docsDir) {
  const filePath = path.join(docsDir, 'schema-columns.csv');
  
  let csv = 'table_name,column_name,data_type,character_maximum_length,numeric_precision,numeric_scale,is_nullable,column_default,ordinal_position\n';
  
  columns.forEach(col => {
    csv += `"${col.table_name}",`;
    csv += `"${col.column_name}",`;
    csv += `"${col.data_type}",`;
    csv += `"${col.character_maximum_length || ''}",`;
    csv += `"${col.numeric_precision || ''}",`;
    csv += `"${col.numeric_scale || ''}",`;
    csv += `"${col.is_nullable}",`;
    csv += `"${col.column_default || ''}",`;
    csv += `"${col.ordinal_position}"\n`;
  });

  await fs.writeFile(filePath, csv, 'utf8');
  console.log('✅ Exported CSV: schema-columns.csv');
}

/**
 * Export summary statistics
 */
async function exportSummary(metadata, docsDir) {
  const filePath = path.join(docsDir, 'schema-summary.md');
  
  let summary = '# Morningstar Schema Summary\n\n';
  summary += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Count statistics
  const tables = Object.values(metadata).filter(t => 
    t.table_info?.table_type === 'BASE TABLE'
  );
  const views = Object.values(metadata).filter(t => 
    t.table_info?.table_type === 'VIEW'
  );
  const matViews = Object.values(metadata).filter(t => 
    t.table_info?.table_type === 'MATERIALIZED VIEW'
  );
  
  summary += '## Overview\n\n';
  summary += `- **Total Objects:** ${Object.keys(metadata).length}\n`;
  summary += `- **Base Tables:** ${tables.length}\n`;
  summary += `- **Views:** ${views.length}\n`;
  summary += `- **Materialized Views:** ${matViews.length}\n\n`;
  
  // Column count by table
  summary += '## Tables by Column Count\n\n';
  summary += '| Table Name | Type | Columns | Estimated Rows | Size |\n';
  summary += '|------------|------|---------|----------------|------|\n';
  
  const sortedByColumns = Object.values(metadata)
    .sort((a, b) => b.columns.length - a.columns.length);
  
  sortedByColumns.forEach(table => {
    const type = table.table_info?.table_type || 'N/A';
    const rows = table.table_info?.estimated_rows || 'N/A';
    const size = table.table_info?.total_size || 'N/A';
    summary += `| ${table.table_name} | ${type} | ${table.columns.length} | ${rows} | ${size} |\n`;
  });
  
  summary += '\n';
  
  // Common column names
  summary += '## Common Column Names\n\n';
  const columnCounts = {};
  Object.values(metadata).forEach(table => {
    table.columns.forEach(col => {
      columnCounts[col.column_name] = (columnCounts[col.column_name] || 0) + 1;
    });
  });
  
  const sortedColumns = Object.entries(columnCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  summary += '| Column Name | Appears in N Tables |\n';
  summary += '|-------------|---------------------|\n';
  sortedColumns.forEach(([name, count]) => {
    summary += `| ${name} | ${count} |\n`;
  });
  
  summary += '\n';
  
  // Temporal tracking
  summary += '## Temporal Tracking\n\n';
  const temporalTables = Object.values(metadata).filter(table =>
    table.columns.some(col => col.column_name === '_timestampfrom') &&
    table.columns.some(col => col.column_name === '_timestampto')
  );
  
  summary += `Tables with temporal tracking (_timestampfrom, _timestampto): ${temporalTables.length}\n\n`;
  temporalTables.forEach(table => {
    summary += `- ${table.table_name}\n`;
  });
  
  summary += '\n';
  
  // Date columns - enhanced detection
  summary += '## Date/Time Columns by Table\n\n';
  summary += 'Includes columns with date/time data types AND columns with "date" or "asof" in their names.\n\n';
  
  Object.values(metadata).forEach(table => {
    const dateColumns = table.columns.filter(col => {
      // Check data type
      const hasDateType = col.data_type.includes('date') || col.data_type.includes('time');
      
      // Check column name for date-related keywords
      const columnNameLower = col.column_name.toLowerCase();
      const hasDateInName = columnNameLower.includes('date') || 
                           columnNameLower.includes('asof') ||
                           columnNameLower.includes('timestamp');
      
      return hasDateType || hasDateInName;
    });
    
    if (dateColumns.length > 0) {
      summary += `### ${table.table_name}\n\n`;
      dateColumns.forEach(col => {
        const isDateType = col.data_type.includes('date') || col.data_type.includes('time');
        const marker = isDateType ? '📅' : '📝'; // Calendar for date types, note for text dates
        summary += `- ${marker} **${col.column_name}** (${col.data_type})`;
        
        // Add note if it's a text column with date in name
        if (!isDateType) {
          summary += ` - _Text field with date in name_`;
        }
        summary += '\n';
      });
      summary += '\n';
    }
  });
  
  // Add categorization of date columns
  summary += '## Date Column Analysis\n\n';
  
  // Collect all date-related columns
  const allDateColumns = [];
  Object.values(metadata).forEach(table => {
    table.columns.forEach(col => {
      const hasDateType = col.data_type.includes('date') || col.data_type.includes('time');
      const columnNameLower = col.column_name.toLowerCase();
      const hasDateInName = columnNameLower.includes('date') || 
                           columnNameLower.includes('asof') ||
                           columnNameLower.includes('timestamp');
      
      if (hasDateType || hasDateInName) {
        allDateColumns.push({
          table: table.table_name,
          column: col.column_name,
          dataType: col.data_type,
          isDateType: hasDateType,
          hasDateInName: hasDateInName
        });
      }
    });
  });
  
  // Categorize by purpose
  const timeSeriesColumns = allDateColumns.filter(col => 
    col.column.toLowerCase().includes('monthenddate') ||
    col.column.toLowerCase().includes('ratingdate') ||
    col.column.toLowerCase().includes('enddate') ||
    col.column.toLowerCase().includes('flowdate')
  );
  
  const reportDateColumns = allDateColumns.filter(col =>
    col.column.toLowerCase().includes('reportdate') ||
    col.column.toLowerCase().includes('prospectusdate')
  );
  
  const asOfColumns = allDateColumns.filter(col =>
    col.column.toLowerCase().includes('asof')
  );
  
  const timestampColumns = allDateColumns.filter(col =>
    col.column.toLowerCase().includes('timestamp')
  );
  
  summary += '### Time-Series Date Columns (for historical queries)\n\n';
  summary += '| Table | Column | Data Type |\n';
  summary += '|-------|--------|----------|\n';
  timeSeriesColumns.forEach(col => {
    summary += `| ${col.table} | ${col.column} | ${col.dataType} |\n`;
  });
  summary += '\n';
  
  summary += '### Report Date Columns (periodic reports)\n\n';
  summary += '| Table | Column | Data Type |\n';
  summary += '|-------|--------|----------|\n';
  reportDateColumns.forEach(col => {
    summary += `| ${col.table} | ${col.column} | ${col.dataType} |\n`;
  });
  summary += '\n';
  
  summary += '### "As Of" Date Columns\n\n';
  summary += '| Table | Column | Data Type |\n';
  summary += '|-------|--------|----------|\n';
  asOfColumns.forEach(col => {
    summary += `| ${col.table} | ${col.column} | ${col.dataType} |\n`;
  });
  summary += '\n';
  
  summary += '### Temporal Tracking Columns\n\n';
  summary += '| Table | Column | Data Type |\n';
  summary += '|-------|--------|----------|\n';
  timestampColumns.forEach(col => {
    summary += `| ${col.table} | ${col.column} | ${col.dataType} |\n`;
  });
  summary += '\n';
  
  // Summary of date column types
  summary += '### Summary\n\n';
  summary += `- **Total Date-Related Columns:** ${allDateColumns.length}\n`;
  summary += `- **Proper Date/Time Types:** ${allDateColumns.filter(c => c.isDateType).length}\n`;
  summary += `- **Text Fields with Date Names:** ${allDateColumns.filter(c => !c.isDateType && c.hasDateInName).length}\n`;
  summary += `- **Time-Series Columns:** ${timeSeriesColumns.length}\n`;
  summary += `- **Report Date Columns:** ${reportDateColumns.length}\n`;
  summary += `- **"As Of" Columns:** ${asOfColumns.length}\n`;
  summary += `- **Temporal Tracking Columns:** ${timestampColumns.length}\n`;
  summary += '\n';

  await fs.writeFile(filePath, summary, 'utf8');
  console.log('✅ Exported Summary: schema-summary.md');
}

/**
 * Format data type with length/precision
 */
function formatDataType(col) {
  let type = col.data_type;
  
  if (col.character_maximum_length) {
    type += `(${col.character_maximum_length})`;
  } else if (col.numeric_precision && col.numeric_scale) {
    type += `(${col.numeric_precision},${col.numeric_scale})`;
  } else if (col.numeric_precision) {
    type += `(${col.numeric_precision})`;
  }
  
  return type;
}

// Run the export
if (require.main === module) {
  exportSchemaMetadata()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Export failed:', error);
      process.exit(1);
    });
}

module.exports = { exportSchemaMetadata };
