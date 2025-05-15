const db = require('../models/db');

async function createAuction({ title, body, prize, ends_at, user_id, jar_id }) {
    const { rows } = await db.query(
        `INSERT INTO auctions (title, body, prize, ends_at, status, created_at, winner_id, user_id, jar_id)
         VALUES ($1, $2, $3, $4, true, NOW(), NULL, $5, $6)
         RETURNING id`,
        [title, body, prize, ends_at, user_id, jar_id]
    );
    return rows[0].id;
}

async function getAllAuctions({ limit = 10, page = 1, search = '', status = 'all' }) {
    const offset = (page - 1) * limit;
    const keyword = `%${search.toLowerCase()}%`;

    const params = [];
    let paramIndex = 1;

    let whereClauses = [`a.deleted_at IS NULL`];

    if (search) {
        whereClauses.push(`(LOWER(a.title) LIKE $${++paramIndex} OR LOWER(a.body) LIKE $${paramIndex} OR LOWER(a.prize) LIKE $${paramIndex})`);
        params.push(keyword);
    }

    if (status === 'open') {
        whereClauses.push(`a.status = true`);
    } else if (status === 'closed') {
        whereClauses.push(`a.status = false`);
    }

    const whereSQL = whereClauses.join(' AND ');

    const finalParams = [limit, offset, ...params];

    const dataQuery = await db.query(
        `SELECT a.*, m.img_path, m.alt_text, j.title AS jar_title,
                u.username, u.first_name, u.last_name
         FROM auctions a
                  LEFT JOIN media m ON m.entity_id = a.id AND m.entity_type = 'auction' AND m.type = 'cover'
                  LEFT JOIN jars j ON j.id = a.jar_id
                  LEFT JOIN users u ON u.id = a.user_id
         WHERE ${whereSQL}
         ORDER BY a.created_at DESC
             LIMIT $1 OFFSET $2`,
        finalParams
    );

    const countQuery = await db.query(
        `SELECT COUNT(*) FROM auctions a
         WHERE ${whereSQL}`,
        params
    );

    const total = parseInt(countQuery.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return { data: dataQuery.rows, pagination: { total, page, limit, totalPages } };
}




async function getAuctionId(id) {
    const { rows } = await db.query(
        `SELECT a.*, m.img_path, m.alt_text, j.title AS jar_title,
                u.username, u.first_name, u.last_name
         FROM auctions a
         LEFT JOIN media m ON m.entity_id = a.id AND m.entity_type = 'auction' AND m.type = 'cover'
         LEFT JOIN jars j ON j.id = a.jar_id
         LEFT JOIN users u ON u.id = a.user_id
         WHERE a.id = $1 AND a.deleted_at IS NULL`,
        [id]
    );
    return rows[0] || null;
}

async function deleteAuction(id) {
    await db.query(`UPDATE auctions SET deleted_at = NOW() WHERE id = $1`, [id]);
}

async function assignAuctionWinner(auctionId, userId, label) {
    if (userId) {
        await db.query(
            `UPDATE auctions SET winner_id = $1, winner_label = $2, status = false WHERE id = $3`,
            [userId, label, auctionId]
        );
    } else {
        await db.query(
            `UPDATE auctions SET winner_id = NULL, winner_label = $1, status = false WHERE id = $2`,
            [label, auctionId]
        );
    }
}


module.exports = { createAuction, getAllAuctions, getAuctionId,deleteAuction, assignAuctionWinner };
