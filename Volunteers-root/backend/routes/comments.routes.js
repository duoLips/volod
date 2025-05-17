const router = require('express').Router();
const { createCommentEntry, listCommentsEntry, listUserComments, softDeleteCommentEntry, listAllComments } = require('../controllers/comment.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');

router.post('/', isAuthenticated, createCommentEntry);
router.get('/', listCommentsEntry);
router.delete('/:id', isAuthenticated, softDeleteCommentEntry);
router.get('/user/:userId', listUserComments);
router.get('/admin/all', isAdmin, listAllComments);



module.exports = router;
