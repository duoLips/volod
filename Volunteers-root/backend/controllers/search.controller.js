const { globalSearch } = require('../services/search.service');

async function handleGlobalSearch(req, res, next) {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Missing search query' });

    try {
        const results = await globalSearch(q);
        res.json(results);
    } catch (err) {
        next(err);
    }
}

module.exports = { handleGlobalSearch };
