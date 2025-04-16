const db = require('../models/db');
const cron = require('node-cron');

function scheduleOTPCleanup() {
    cron.schedule('0 0 * * *', async () => {
        await db.query(`DELETE FROM otp WHERE created_at < NOW() - INTERVAL '24 hours'`);
        console.log('[Cron] Old OTPs cleaned up');
    });
}

module.exports = { scheduleOTPCleanup };
