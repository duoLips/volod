const router = require('express').Router();
const { createPoll, getPollByArticle, voteInPoll } = require('../controllers/poll.controller');
const { isAdmin } = require('../middleware/auth.middleware');

router.post('/create', isAdmin, createPoll);
router.get('/', getPollByArticle);
router.post('/vote', voteInPoll);

module.exports = router;
