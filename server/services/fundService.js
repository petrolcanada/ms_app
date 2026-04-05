const { AppError } = require('../middleware/errorHandler');
const { queryFundList, queryFundCount, queryFundById } = require('../queries/fundQueries');

const listFunds = async ({ page = 1, limit = 20, search = '', type = '', category = '', asofDate }) => {
  const offset = (page - 1) * limit;

  const [result, total] = await Promise.all([
    queryFundList({ search, type, category, limit, offset, asofDate }),
    queryFundCount({ search, type, category, asofDate }),
  ]);

  return {
    data: result.rows,
    meta: {
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      ...(asofDate ? { asofDate } : {}),
    },
  };
};

const getFundDetail = async (id) => {
  const result = await queryFundById(id);

  if (result.rows.length === 0) {
    throw new AppError(`Fund with ID ${id} not found`, 404);
  }

  return result.rows[0];
};

module.exports = {
  listFunds,
  getFundDetail,
};
