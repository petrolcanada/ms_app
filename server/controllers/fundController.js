const { pool } = require('../config/db');

/**
 * Get all funds with pagination, search, and filtering
 * @route GET /api/funds
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} search - Search term for fund name or ticker
 * @query {string} type - Filter by fund type
 * @query {string} category - Filter by fund category
 */
const getAllFunds = async (req, res, next) => {
  try {
    // Extract query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const type = req.query.type || '';
    const category = req.query.category || '';
    
    const offset = (page - 1) * limit;
    
    // Build dynamic query - selecting key columns from the table
    let queryText = `
      SELECT 
        _id,
        _name,
        fundname,
        legalname,
        ticker,
        categoryname,
        globalcategoryname,
        broadassetclass,
        currency,
        domicile,
        inceptiondate,
        providercompanyname,
        legalstructure,
        securitytype
      FROM ms.fund_share_class_basic_info_ca_openend
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Add search filter (search in fund name, legal name, and ticker)
    if (search) {
      queryText += ` AND (
        fundname ILIKE $${paramCount} 
        OR legalname ILIKE $${paramCount}
        OR ticker ILIKE $${paramCount}
        OR _name ILIKE $${paramCount}
      )`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }
    
    // Add type filter (using securitytype or legalstructure)
    if (type) {
      queryText += ` AND (securitytype = $${paramCount} OR legalstructure = $${paramCount})`;
      queryParams.push(type);
      paramCount++;
    }
    
    // Add category filter
    if (category) {
      queryText += ` AND categoryname = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }
    
    // Add ordering and pagination
    queryText += ` ORDER BY fundname ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const result = await pool.query(queryText, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM ms.fund_share_class_basic_info_ca_openend
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamNum = 1;
    
    if (search) {
      countQuery += ` AND (
        fundname ILIKE $${countParamNum} 
        OR legalname ILIKE $${countParamNum}
        OR ticker ILIKE $${countParamNum}
        OR _name ILIKE $${countParamNum}
      )`;
      countParams.push(`%${search}%`);
      countParamNum++;
    }
    
    if (type) {
      countQuery += ` AND (securitytype = $${countParamNum} OR legalstructure = $${countParamNum})`;
      countParams.push(type);
      countParamNum++;
    }
    
    if (category) {
      countQuery += ` AND categoryname = $${countParamNum}`;
      countParams.push(category);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Send response
    res.status(200).json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching funds:', err);
    next(err);
  }
};

/**
 * Get single fund by ID
 * @route GET /api/funds/:id
 * @param {string} id - Fund _id
 */
const getFundById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const queryText = `
      SELECT *
      FROM ms.fund_share_class_basic_info_ca_openend
      WHERE _id = $1
    `;
    
    const result = await pool.query(queryText, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Fund not found',
        },
      });
    }
    
    res.status(200).json({
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error fetching fund:', err);
    next(err);
  }
};

module.exports = {
  getAllFunds,
  getFundById,
};
