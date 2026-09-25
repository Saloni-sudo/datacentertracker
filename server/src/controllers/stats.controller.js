const statsService = require('../services/stats.service');
const { DISCLAIMER } = require('../constants');

async function getStats(req, res, next) {
  try {
    const stats = await statsService.getStats();

    res.status(200).json({ disclaimer: DISCLAIMER, data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
