const { createComment, listComments, softDeleteComment, getCommentsByUser } = require('../services/comment.service');

async function createCommentEntry(req, res, next) {
    const { entityType, entityId, body, parentId } = req.body;
    const userId = req.session?.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!entityType || !entityId || !body)
        return res.status(400).json({ message: 'Missing required fields' });

    try {
        const commentId = await createComment({
            entityType,
            entityId,
            userId,
            body,
            parentId: parentId || null
        });

        res.status(201).json({ message: 'Comment created', id: commentId });
    } catch (err) {
        next(err);
    }
}

async function listCommentsEntry(req, res, next) {
    const { entityType, entityId } = req.query;

    if (!entityType || !entityId)
        return res.status(400).json({ message: 'Missing entityType or entityId' });

    try {
        const comments = await listComments(entityType, entityId);
        res.json({ comments });
    } catch (err) {
        next(err);
    }
}
async function listUserComments(req, res, next) {
    const userId = req.params.userId || req.query.userId;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    try {
        const comments = await getCommentsByUser(userId);
        res.json({ comments });
    } catch (err) {
        next(err);
    }
}
async function softDeleteCommentEntry(req, res, next) {
    const commentId = req.params.id;
    const userId = req.session?.user?.id;
    const role = req.session?.user?.role;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const updatedRows = await softDeleteComment(commentId, userId, role === 1);
        if (updatedRows === 0) {
            if (role === 1) {
                return res.status(404).json({ message: 'Comment not found or already deleted.' });
            } else {
                return res.status(403).json({ message: 'Forbidden: cannot delete this comment.' });
            }
        }

        res.json({ message: 'Comment deleted (soft)' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createCommentEntry,
    listCommentsEntry,
    softDeleteCommentEntry,
    listUserComments
}