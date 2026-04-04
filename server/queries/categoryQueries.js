const { pool } = require('../config/db');

const queryAllCategories = async () => {
  const queryText = `
    SELECT DISTINCT categoryname
    FROM ms.mv_fund_share_class_basic_info_ca_openend_latest
    ORDER BY categoryname ASC
  `;

  const result = await pool.query(queryText);
  return result.rows.map(row => row.categoryname);
};

module.exports = {
  queryAllCategories,
};
