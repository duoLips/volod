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

async function deleteNews(id, userId) {
    await db.query(
        `UPDATE news SET deleted_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );
}

async function getAllNews() {
    const { rows } = await db.query(
        `SELECT * FROM news WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
    return rows;
}


module.exports = { createNews, deleteNews, getAllNews };