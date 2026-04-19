const { fetchPublicDashboard, fetchPublicAvailableDates } = require('../services/publicService');

const getPublicDashboard = async (req, res, next) => {
  try {
    const result = await fetchPublicDashboard();
    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching public dashboard snapshot:', err);
    next(err);
  }
};

const getPublicAvailableDates = async (req, res, next) => {
  try {
    const result = await fetchPublicAvailableDates();
    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching public available dates snapshot:', err);
    next(err);
  }
};

module.exports = {
  getPublicDashboard,
  getPublicAvailableDates,
};
