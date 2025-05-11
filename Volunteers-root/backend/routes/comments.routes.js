const router = require('express').Router();
const { createCommentEntry, listCommentsEntry, listUserComments, softDeleteCommentEntry } = require('../controllers/comment.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.post('/', isAuthenticated, createCommentEntry);
router.get('/', listCommentsEntry);
router.delete('/:id', isAuthenticated, softDeleteCommentEntry);
router.get('/user/:userId', listUserComments);


module.exports = router;
