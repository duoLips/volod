const db = require('../models/db');

async function getAdminStatsData() {
    const usersRes = await db.query('SELECT COUNT(*) FROM users');
    const commentsRes = await db.query('SELECT COUNT(*) FROM comms');
    const reportsRes = await db.query('SELECT COUNT(*) FROM reports');

    return {
        users: parseInt(usersRes.rows[0].count),
        comments: parseInt(commentsRes.rows[0].count),
        reports: parseInt(reportsRes.rows[0].count)
    };
}

module.exports = { getAdminStatsData };
