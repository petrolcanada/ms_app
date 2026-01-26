const { pool } = require('../db/config/db');

/**
 * Get all distinct category names
 * @route GET /api/categories
 */
const getAllCategories = async (req, res, next) => {
  try {
    const queryText = `
      SELECT DISTINCT categoryname
      FROM ms.mv_fund_share_class_basic_info_ca_openend_latest
      ORDER BY categoryname ASC
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

module.exports = {
  getAllCategories,
};
