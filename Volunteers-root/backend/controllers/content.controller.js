const { createNews, deleteNews, getAllNews } = require('../services/news.service');
const { createAuction, getAllAuctions,  getAuctionId, deleteAuction } = require('../services/auction.service');
const { createReport, getAllReports, getReportById, deleteReport } = require('../services/reports.service');

const  {attachMedia} = require('../services/media.service')
const db = require('../models/db');

async function createNewsEntry(req, res, next) {
    const { title, body, img_url, alt_text } = req.body;
    const userId = req.session?.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!title || !body) return res.status(400).json({ message: 'Missing title or body' });

    try {
        const newsId = await createNews({ title, body, userId });

        if (img_url) {
            await attachMedia({
                entity_id: newsId,
                entity_type: 'news',
                img_path: img_url,
                type: 'cover',
                alt_text
            });
        }

        res.status(201).json({ message: 'News created', id: newsId });
    } catch (err) {
        next(err);
    }
}

async function listNews(req, res, next) {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    try {
        const result = await getAllNews({ limit, page });
        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function softDeleteNews(req, res, next) {
    const { id } = req.params;
    const userId = req.session?.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        await deleteNews(id);
        res.json({ message: 'News deleted (soft)' });
    } catch (err) {
        next(err);
    }
}

async function getNewsById(req, res, next) {
    const { id } = req.params;

    try {
        const { rows } = await db.query(
            `SELECT n.*, m.img_path, m.alt_text
             FROM news n
             LEFT JOIN media m ON m.entity_id = n.id AND m.entity_type = 'news' AND m.type = 'cover'
             WHERE n.id = $1 AND n.deleted_at IS NULL`,
            [id]
        );

        if (!rows.length) return res.status(404).json({ message: 'News not found' });

        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
}

async function createAuctionEntry(req, res, next) {
    const { title, body, prize, ends_at, img_url, alt_text, jar_id } = req.body;
    const userId = req.session?.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!title || !body || !prize || !ends_at || !jar_id)
        return res.status(400).json({ message: 'Missing required fields' });

    const endsAtDate = new Date(ends_at);
    if (isNaN(endsAtDate) || endsAtDate <= new Date()) {
        return res.status(400).json({ message: 'End date must be in the future' });
    }

    try {
        const auctionId = await createAuction({
            title,
            body,
            prize,
            ends_at: endsAtDate,
            user_id: userId,
            jar_id
        });

        if (img_url) {
            await attachMedia({
                entity_id: auctionId,
                entity_type: 'auction',
                img_path: img_url,
                type: 'cover',
                alt_text
            });
        }

        res.status(201).json({ message: 'Auction created', id: auctionId });
    } catch (err) {
        next(err);
    }
}

async function listAuctions(req, res, next) {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    try {
        const result = await getAllAuctions({ limit, page });
        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function getAuctionById(req, res, next) {
    try {
        const auction = await getAuctionId(req.params.id);
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.json(auction);
    } catch (err) {
        next(err);
    }
}

async function softDeleteAuction(req, res, next) {
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    try {
        await deleteAuction(req.params.id);
        res.json({ message: 'Auction deleted (soft)' });
    } catch (err) {
        next(err);
    }
}

async function createReportEntry(req, res, next) {
    const { title, body, auction_id, img_url, alt_text } = req.body;
    const userId = req.session?.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!title || !body)
        return res.status(400).json({ message: 'Missing title or body' });

    try {
        const reportId = await createReport({
            title,
            body,
            userId,
            auctionId: auction_id || null
        });

        if (img_url) {
            await attachMedia({
                entity_id: reportId,
                entity_type: 'report',
                img_path: img_url,
                type: 'cover',
                alt_text
            });
        }

        res.status(201).json({ message: 'Report created', id: reportId });
    } catch (err) {
        next(err);
    }
}
async function listReports(req, res, next) {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    try {
        const result = await getAllReports({ limit, page });
        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function getReportEntry(req, res, next) {
    try {
        const report = await getReportById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err) {
        next(err);
    }
}

async function softDeleteReport(req, res, next) {
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        await deleteReport(req.params.id);
        res.json({ message: 'Report deleted (soft)' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createNewsEntry,
    listNews,
    softDeleteNews,
    getNewsById,
    createAuctionEntry,
    listAuctions,
    getAuctionById,
    softDeleteAuction,
    createReportEntry,
    listReports,
    getReportEntry,
    softDeleteReport
};