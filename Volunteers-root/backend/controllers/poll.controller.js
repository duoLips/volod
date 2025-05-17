const pollService = require('../services/poll.service');

async function createPoll(req, res, next) {
    try {
        const result = await pollService.createPoll(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function voteInPoll(req, res, next) {
    try {
        const { pollId, optionId } = req.body;
        const userId = req.session?.user?.id;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const result = await pollService.vote(pollId, userId, optionId);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function getPollByArticle(req, res, next) {
    try {
        const { entityType, entityId } = req.query;
        const userId = req.session?.user?.id || null;
        const poll = await pollService.getPollByArticle(entityType, entityId, userId);
        res.json(poll);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createPoll,
    voteInPoll,
    getPollByArticle
};
