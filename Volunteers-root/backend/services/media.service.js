const db = require('../models/db');

async function attachMedia({ entity_id, entity_type, img_path, type, alt_text }) {
    const alt = alt_text?.trim() || `${entity_type} ${type}`;

    await db.query(
        `INSERT INTO media (entity_id, entity_type, img_path, type, alt_text)
         VALUES ($1, $2, $3, $4, $5)`,
        [entity_id, entity_type, img_path, type, alt]
    );
}

module.exports = { attachMedia };
