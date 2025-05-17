const { getAdminStatsData } = require('../services/admin.service');

async function getAdminStats(req, res, next) {
    try {
        const stats = await getAdminStatsData();
        res.json(stats);
    } catch (err) {
        next(err);
    }
}

module.exports = { getAdminStats };
