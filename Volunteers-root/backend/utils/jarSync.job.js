const cron = require('node-cron');
const { updateJarsInDB } = require('../services/monobank.service');

function scheduleJarSync() {
    cron.schedule('*/10 * * * *', async () => {
        try {
            const updated = await updateJarsInDB();
            console.log(`[Monobank Sync] Updated ${updated} jars`);
        } catch (err) {
            console.error('[Monobank Sync] Failed:', err.message);
        }
    });
}

module.exports = { scheduleJarSync };
