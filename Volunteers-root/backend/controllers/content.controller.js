const { createNews, deleteNews, getAllNews } = require('../services/news.service');
const { createAuction, getAllAuctions,  getAuctionId, deleteAuction, assignAuctionWinner } = require('../services/auction.service');
const { createReport, getAllReports, getReportById, deleteReport } = require('../services/reports.service');
const  {attachMedia, updateOrInsertMedia} = require('../services/media.service')
const { uploadImageFromBuffer } = require('../utils/cloudinary.helper');


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
    const search = req.query.q || '';

    try {
        const result = await getAllNews({ limit, page, search });
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

async function updateNewsEntry(req, res, next) {
    const id = req.params.id;
    const { title, body } = req.body;

    if (!title || !body)
        return res.status(400).json({ message: 'Title and body are required' });

    try {
        await db.query(
            `UPDATE news
             SET title = $1, body = $2, edited_at = NOW()
             WHERE id = $3`,
            [title, body, id]
        );

        res.json({ message: 'News updated.' });
    } catch (err) {
        next(err);
    }
}

async function updateNewsCover(req, res, next) {
    const id = req.params.id;

    try {
        const result = await uploadImageFromBuffer(req.file.buffer);
        const img_path = result.secure_url;

        await updateOrInsertMedia({
            entity_id: id,
            entity_type: 'news',
            img_path,
            type: 'cover',
            alt_text: req.body.alt_text
        });

        res.json({ message: 'Cover image updated (file).' });
    } catch (err) {
        next(err);
    }
}

async function updateNewsCoverFromUrl(req, res, next) {
    const id = req.params.id;
    const { img_path, alt_text } = req.body;

    if (!img_path) return res.status(400).json({ message: 'Image URL required' });

    try {
        await updateOrInsertMedia({
            entity_id: id,
            entity_type: 'news',
            img_path,
            type: 'cover',
            alt_text
        });

        res.json({ message: 'Cover image updated (URL).' });
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
    const search = req.query.q || '';
    const status = req.query.status || 'all'; // open | closed | all

    try {
        const result = await getAllAuctions({ limit, page, search, status });
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

async function updateAuctionEntry(req, res, next) {
    const id = req.params.id;
    const { title, body, prize, jar_id } = req.body;

    if (!title || !body || !prize || !jar_id)
        return res.status(400).json({ message: 'Missing required fields' });

    try {
        await db.query(
            `UPDATE auctions
             SET title = $1,
                 body = $2,
                 prize = $3,
                 jar_id = $4,
                 edited_at = NOW()
             WHERE id = $5`,
            [title, body, prize, jar_id, id]
        );

        res.json({ message: 'Auction updated.' });
    } catch (err) {
        next(err);
    }
}

async function updateAuctionCover(req, res, next) {
    const id = req.params.id;

    try {
        const result = await uploadImageFromBuffer(req.file.buffer);
        const img_path = result.secure_url;

        await updateOrInsertMedia({
            entity_id: id,
            entity_type: 'auction',
            img_path,
            type: 'cover',
            alt_text: req.body.alt_text
        });

        res.json({ message: 'Auction cover image updated (file).' });
    } catch (err) {
        next(err);
    }
}

async function updateAuctionCoverFromUrl(req, res, next) {
    const id = req.params.id;
    const { img_path, alt_text } = req.body;

    if (!img_path) return res.status(400).json({ message: 'Image URL required' });

    try {
        await updateOrInsertMedia({
            entity_id: id,
            entity_type: 'auction',
            img_path,
            type: 'cover',
            alt_text
        });

        res.json({ message: 'Auction cover image updated (URL).' });
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
    const search = req.query.q || '';

    try {
        const result = await getAllReports({ limit, page, search });
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


async function assignAuctionWinnerEntry(req, res, next) {
    const auctionId = req.params.id;
    const { userId, label } = req.body;

    if (!label || typeof label !== 'string')
        return res.status(400).json({ message: 'Winner label is required.' });

    try {
        await assignAuctionWinner(auctionId, userId || null, label);
        res.json({ message: 'Winner assigned successfully.' });
    } catch (err) {
        next(err);
    }
}

async function updateReportEntry(req, res, next) {
    const id = req.params.id;
    const { title, body } = req.body;

    if (!title || !body) {
        return res.status(400).json({ message: 'Title and body are required' });
    }

    try {
        await db.query(
            `UPDATE reports
             SET title = $1, body = $2, edited_at = NOW()
             WHERE id = $3`,
            [title, body, id]
        );

        res.json({ message: 'Report updated.' });
    } catch (err) {
        next(err);
    }
}

async function updateReportCover(req, res, next) {
    const id = req.params.id;
    try {
        const result = await uploadImageFromBuffer(req.file.buffer);
        const img_path = result.secure_url;

        await updateOrInsertMedia({
            entity_id: id,
            entity_type: 'report',
            img_path,
            type: 'cover',
            alt_text: req.body.alt_text
        });

        res.json({ message: 'Cover image updated (file).' });
    } catch (err) {
        next(err);
    }
}

    async function updateReportCoverFromUrl(req, res, next) {
        const id = req.params.id;
        const { img_path, alt_text } = req.body;

        if (!img_path) return res.status(400).json({ message: 'Image URL required' });

        try {
            await updateOrInsertMedia({
                entity_id: id,
                entity_type: 'report',
                img_path,
                type: 'cover',
                alt_text
            });

            res.json({ message: 'Cover image updated (url).' });
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
    softDeleteReport,
    assignAuctionWinnerEntry,
    updateNewsCover,
    updateNewsCoverFromUrl,
    updateNewsEntry,
    updateReportCover,
    updateReportEntry,
    updateReportCoverFromUrl,
    updateAuctionEntry,
    updateAuctionCover,
    updateAuctionCoverFromUrl
};