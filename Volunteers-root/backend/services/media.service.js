const db = require('../models/db');

async function attachMedia({ entity_id, entity_type, img_path, type, alt_text }) {
    const alt = alt_text?.trim() || `${entity_type} ${type}`;

    await db.query(
        `INSERT INTO media (entity_id, entity_type, img_path, type, alt_text)
         VALUES ($1, $2, $3, $4, $5)`,
        [entity_id, entity_type, img_path, type, alt]
    );
}

async function updateOrInsertMedia({ entity_id, entity_type, img_path, type = 'cover', alt_text }) {
    const alt = alt_text?.trim() || `${entity_type} ${type}`;

    const { rows } = await db.query(
        `SELECT id FROM media
         WHERE entity_id = $1 AND entity_type = $2 AND type = $3
         LIMIT 1`,
        [entity_id, entity_type, type]
    );

    if (rows.length) {
        await db.query(
            `UPDATE media
             SET img_path = $1, alt_text = $2
             WHERE id = $3`,
            [img_path, alt, rows[0].id]
        );
    } else {
        await db.query(
            `INSERT INTO media (entity_id, entity_type, img_path, type, alt_text)
             VALUES ($1, $2, $3, $4, $5)`,
            [entity_id, entity_type, img_path, type, alt]
        );
    }
}

async function listAllMedia() {
    const { rows } = await db.query(`
        SELECT id, entity_type, entity_id, img_path, alt_text
        FROM media
        ORDER BY id DESC
    `);
    return rows;
}


module.exports = {
    attachMedia,
    updateOrInsertMedia,
    listAllMedia
};
