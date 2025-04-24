const db = require('../models/db');
const cron = require('node-cron');

function scheduleAuctionAutoClose() {
    cron.schedule('0 * * * *', async () => {
        await db.query(`
            UPDATE auctions
            SET status = 'closed'
            WHERE ends_at < NOW() AND status = 'open'
        `);
        console.log('[Cron] Closed expired auctions');
    });
}

module.exports = { scheduleAuctionAutoClose };
