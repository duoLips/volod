const db = require('../models/db');

async function createComment({ entityType, entityId, userId, body, parentId = null }) {
    const { rows } = await db.query(
        `INSERT INTO comms (entity_type, entity_id, user_id, body, parent_id, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id`,
        [entityType, entityId, userId, body, parentId]
    );
    return rows[0].id;
}

async function listComments(entityType, entityId) {
    const { rows } = await db.query(
        `SELECT c.id, c.body, c.parent_id, c.created_at,
                u.username, u.avatar_url
         FROM comms c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.entity_type = $1
           AND c.entity_id = $2
           AND c.deleted_at IS NULL
         ORDER BY c.created_at ASC`,
        [entityType, entityId]
    );

    return rows;
}
async function softDeleteComment(commentId, userId, isAdmin) {
    let result;

    if (isAdmin) {
        result = await db.query(
            `UPDATE comms
             SET deleted_at = NOW()
             WHERE id = $1
             AND deleted_at IS NULL`,
            [commentId]
        );
    } else {
        result = await db.query(
            `UPDATE comms
             SET deleted_at = NOW()
             WHERE id = $1
             AND user_id = $2
             AND deleted_at IS NULL`,
            [commentId, userId]
        );
    }

    return result.rowCount; // Number of rows updated
}



module.exports = {
    createComment,
    listComments,
    softDeleteComment
};

