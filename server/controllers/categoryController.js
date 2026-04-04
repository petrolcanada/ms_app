const { queryAllCategories } = require('../queries/categoryQueries');

/**
 * @route GET /api/categories
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await queryAllCategories();

    res.status(200).json({ data: categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    next(err);
  }
};

module.exports = {
  getAllCategories,
};
