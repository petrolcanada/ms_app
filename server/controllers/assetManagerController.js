const {
  queryAllAssetManagers,
  queryAssetManagerOverview,
} = require('../queries/assetManagerQueries');

const getAllAssetManagers = async (req, res, next) => {
  try {
    const managers = await queryAllAssetManagers();
    res.status(200).json({ data: managers });
  } catch (err) {
    console.error('Error fetching asset managers:', err);
    next(err);
  }
};

const getAssetManagerOverview = async (req, res, next) => {
  try {
    const { name } = req.params;
    const asofDate = req.asofDate || req.query.asofDate || '';
    const overview = await queryAssetManagerOverview(name, asofDate || undefined);
    res.status(200).json({ data: overview });
  } catch (err) {
    console.error('Error fetching asset manager overview:', err);
    next(err);
  }
};

module.exports = {
  getAllAssetManagers,
  getAssetManagerOverview,
};
