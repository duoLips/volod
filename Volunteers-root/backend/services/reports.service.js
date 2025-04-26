const db = require('../models/db');

async function createReport({ title, body, userId, auctionId = null }) {
    const { rows } = await db.query(
        `INSERT INTO reports (title, body, user_id, auction_id, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id`,
        [title, body, userId, auctionId]
    );
    return rows[0].id;
}
async function getAllReports({ limit = 10, page = 1 }) {
    const offset = (page - 1) * limit;

    const dataQuery = await db.query(
        `SELECT r.*, m.img_path, m.alt_text, a.id AS auction_id
         FROM reports r
         LEFT JOIN media m 
           ON m.entity_id = r.id 
          AND m.entity_type = 'report' 
          AND m.type = 'cover'
         LEFT JOIN auctions a 
           ON a.id = r.auction_id
         WHERE r.deleted_at IS NULL
         ORDER BY r.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    const countQuery = await db.query(
        `SELECT COUNT(*) FROM reports WHERE deleted_at IS NULL`
    );

    const total = parseInt(countQuery.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
        data: dataQuery.rows,
        pagination: { total, page, limit, totalPages }
    };
}

async function getReportById(id) {
    const { rows } = await db.query(
        `SELECT r.*, m.img_path, m.alt_text, a.id AS auction_id
         FROM reports r
         LEFT JOIN media m 
           ON m.entity_id = r.id 
          AND m.entity_type = 'report' 
          AND m.type = 'cover'
         LEFT JOIN auctions a 
           ON a.id = r.auction_id
         WHERE r.id = $1 AND r.deleted_at IS NULL`,
        [id]
    );
    return rows[0] || null;
}

async function deleteReport(id) {
    await db.query(
        `UPDATE reports SET deleted_at = NOW()
         WHERE id = $1`,
        [id]
    );
}


module.exports = {
    createReport,
    getAllReports,
    getReportById,
    deleteReport
};

