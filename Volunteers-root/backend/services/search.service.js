const db = require('../models/db');

async function globalSearch(keyword) {
    const q = `%${keyword.toLowerCase()}%`;

    const [news, reports, auctions] = await Promise.all([
        db.query(`SELECT id, title, body, 'news' AS type FROM news WHERE deleted_at IS NULL AND (LOWER(title) LIKE $1 OR LOWER(body) LIKE $1)`, [q]),
        db.query(`SELECT id, title, body, 'report' AS type FROM reports WHERE deleted_at IS NULL AND (LOWER(title) LIKE $1 OR LOWER(body) LIKE $1)`, [q]),
        db.query(`SELECT id, title, prize AS body, 'auction' AS type FROM auctions WHERE deleted_at IS NULL AND (LOWER(title) LIKE $1 OR LOWER(prize) LIKE $1)`, [q])
    ]);

    return [...news.rows, ...reports.rows, ...auctions.rows];
}

module.exports = { globalSearch };
