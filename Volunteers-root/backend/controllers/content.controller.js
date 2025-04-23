const { createNews, deleteNews, getAllNews } = require('../services/news.service');
const db = require('../models/db');

async function createNewsEntry(req, res, next) {
    const { title, body, img_url } = req.body;
    const userId = req.session?.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!title || !body) return res.status(400).json({ message: 'Missing title or body' });

    try {
        const newsId = await createNews({ title, body, userId });

        if (img_url) {
            await db.query(
                `INSERT INTO media (entity_id, entity_type, img_path)
                 VALUES ($1, $2, $3)`,
                [newsId, 'news', img_url]
            );
        }

        res.status(201).json({ message: 'News created', id: newsId });
    } catch (err) {
        next(err);
    }
}
async function listNews(req, res, next) {
    try {
        const news = await getAllNews();
        res.json(news);
    } catch (err) {
        next(err);
    }
}

async function softDeleteNews(req, res, next) {
    const { id } = req.params;
    const userId = req.session?.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        await deleteNews(id, userId);
        res.json({ message: 'News deleted (soft)' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createNewsEntry,
    listNews,
    softDeleteNews
};