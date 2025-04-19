const { getAllJarsFromDB, updateJarsInDB } = require('../services/monobank.service');

async function getJars(req, res, next) {
    try {
        const jars = await getAllJarsFromDB();
        res.json(jars);
    } catch (err) {
        next(err);
    }
}
async function refreshJars(req, res, next) {
    try {
        const updated = await updateJarsInDB();
        res.json({ message: `Manually refreshed ${updated} jars` });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getJars,
    refreshJars
};
