const { pool } = require('../db/config/db');

/**
 * Get metadata for a specific table
 * @param {string} schemaName - Schema name (e.g., 'ms')
 * @param {string} tableName - Table name (e.g., 'fund_share_class_basic_info_ca_openend')
 * @returns {Promise<Object>} Table metadata including columns, primary keys, and indexes
 */
async function getTableMetadata(schemaName, tableName) {
  try {
    // Get column information
    const columnsQuery = `
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = $1 
        AND table_name = $2
      ORDER BY ordinal_position;
    `;
    
    const columnsResult = await pool.query(columnsQuery, [schemaName, tableName]);
    
    // Get primary key information
    const pkQuery = `
      SELECT a.attname AS column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass
        AND i.indisprimary;
    `;
    
    const pkResult = await pool.query(pkQuery, [`${schemaName}.${tableName}`]);
    
    // Get indexes information
    const indexQuery = `
      SELECT
        i.relname AS index_name,
        a.attname AS column_name,
        ix.indisunique AS is_unique,
        ix.indisprimary AS is_primary
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = $1
        AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = $2)
      ORDER BY i.relname, a.attnum;
    `;
    
    const indexResult = await pool.query(indexQuery, [tableName, schemaName]);
    
    return {
      schema: schemaName,
      table: tableName,
      columns: columnsResult.rows,
      primaryKeys: pkResult.rows.map(row => row.column_name),
      indexes: indexResult.rows,
      columnCount: columnsResult.rows.length,
    };
  } catch (err) {
    console.error('Error fetching table metadata:', err);
    throw err;
  }
}

/**
 * Display table metadata in a readable format
 * @param {string} schemaName - Schema name
 * @param {string} tableName - Table name
 */
async function displayTableMetadata(schemaName, tableName) {
  try {
    const metadata = await getTableMetadata(schemaName, tableName);
    
    console.log('\n' + '='.repeat(80));
    console.log(`TABLE: ${metadata.schema}.${metadata.table}`);
    console.log('='.repeat(80));
    
    console.log(`\nTotal Columns: ${metadata.columnCount}`);
    
    console.log('\nPRIMARY KEYS:');
    if (metadata.primaryKeys.length > 0) {
      metadata.primaryKeys.forEach(pk => console.log(`  - ${pk}`));
    } else {
      console.log('  (No primary key defined)');
    }
    
    console.log('\nCOLUMNS:');
    console.log('-'.repeat(80));
    console.log('Position | Column Name                    | Data Type          | Nullable');
    console.log('-'.repeat(80));
    
    metadata.columns.forEach(col => {
      const position = String(col.ordinal_position).padEnd(8);
      const name = col.column_name.padEnd(30);
      let dataType = col.data_type;
      
      if (col.character_maximum_length) {
        dataType += `(${col.character_maximum_length})`;
      } else if (col.numeric_precision) {
        dataType += `(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})`;
      }
      
      dataType = dataType.padEnd(18);
      const nullable = col.is_nullable === 'YES' ? 'YES' : 'NO';
      
      console.log(`${position} | ${name} | ${dataType} | ${nullable}`);
    });
    
    console.log('\nINDEXES:');
    if (metadata.indexes.length > 0) {
      const indexGroups = {};
      metadata.indexes.forEach(idx => {
        if (!indexGroups[idx.index_name]) {
          indexGroups[idx.index_name] = {
            columns: [],
            unique: idx.is_unique,
            primary: idx.is_primary,
          };
        }
        indexGroups[idx.index_name].columns.push(idx.column_name);
      });
      
      Object.entries(indexGroups).forEach(([name, info]) => {
        const type = info.primary ? '[PRIMARY]' : info.unique ? '[UNIQUE]' : '';
        console.log(`  - ${name} ${type}`);
        console.log(`    Columns: ${info.columns.join(', ')}`);
      });
    } else {
      console.log('  (No indexes found)');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    return metadata;
  } catch (err) {
    console.error('Error displaying table metadata:', err.message);
    throw err;
  }
}

/**
 * Get a list of all columns as an array of strings
 * @param {string} schemaName - Schema name
 * @param {string} tableName - Table name
 * @returns {Promise<string[]>} Array of column names
 */
async function getColumnNames(schemaName, tableName) {
  const metadata = await getTableMetadata(schemaName, tableName);
  return metadata.columns.map(col => col.column_name);
}

module.exports = {
  getTableMetadata,
  displayTableMetadata,
  getColumnNames,
};
