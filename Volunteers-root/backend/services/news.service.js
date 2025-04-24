const db = require('../models/db');

async function createNews({ title, body, userId }) {
    const { rows } = await db.query(
        `INSERT INTO news (title, body, user_id, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
        [title, body, userId]
    );
    return rows[0].id;
}

async function deleteNews(id) {
    await db.query(
        `UPDATE news SET deleted_at = NOW()
         WHERE id = $1`,
        [id]
    );
}

async function getAllNews({ limit = 10, page = 1 }) {
    const offset = (page - 1) * limit;

    const dataQuery = await db.query(
        `SELECT n.*, m.img_path, m.alt_text
         FROM news n
         LEFT JOIN media m
            ON m.entity_id = n.id
           AND m.entity_type = 'news'
           AND m.type = 'cover'
         WHERE n.deleted_at IS NULL
         ORDER BY n.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    const countQuery = await db.query(
        `SELECT COUNT(*) FROM news WHERE deleted_at IS NULL`
    );

    const total = parseInt(countQuery.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
        data: dataQuery.rows,
        pagination: { total, page, limit, totalPages }
    };
}



module.exports = { createNews, deleteNews, getAllNews };