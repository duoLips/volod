const db = require('../models/db');

async function createPoll({ entityType, entityId, question, options }) {
    const pollRes = await db.query(
        `INSERT INTO polls (entity_type, entity_id, question, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
        [entityType, entityId, question]
    );
    const pollId = pollRes.rows[0].id;

    const insertOptions = options.map((opt, i) => `($1, $${i + 2})`).join(', ');
    const values = [pollId, ...options];

    const placeholders = options.map((_, i) => `($1, $${i + 2})`).join(', ');
    await db.query(
        `INSERT INTO poll_options (poll_id, text)
         VALUES ${placeholders}`,
        values
    );

    return { message: 'Poll created', pollId };
}

async function vote(pollId, userId, optionId) {
    const existing = await db.query(
        `SELECT 1 FROM poll_votes WHERE poll_id = $1 AND user_id = $2`,
        [pollId, userId]
    );
    if (existing.rowCount) {
        throw new Error('User has already voted');
    }

    await db.query(
        `INSERT INTO poll_votes (poll_id, option_id, user_id)
         VALUES ($1, $2, $3)`,
        [pollId, optionId, userId]
    );

    return { message: 'Vote recorded' };
}

async function getPollByArticle(entityType, entityId, userId) {
    const pollRes = await db.query(
        `SELECT * FROM polls WHERE entity_type = $1 AND entity_id = $2`,
        [entityType, entityId]
    );

    if (!pollRes.rows.length) return null;
    const poll = pollRes.rows[0];

    const optionsRes = await db.query(
        `SELECT po.id, po.text, COUNT(v.id)::int AS votes
         FROM poll_options po
         LEFT JOIN poll_votes v ON po.id = v.option_id
         WHERE po.poll_id = $1
         GROUP BY po.id`,
        [poll.id]
    );

    let userVote = null;
    if (userId) {
        const userVoteRes = await db.query(
            `SELECT option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2`,
            [poll.id, userId]
        );
        userVote = userVoteRes.rows[0]?.option_id || null;
    }

    return {
        id: poll.id,
        question: poll.question,
        options: optionsRes.rows,
        userVote
    };
}

module.exports = {
    createPoll,
    vote,
    getPollByArticle
};
