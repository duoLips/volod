const router = require('express').Router();
const {isAdmin} = require('../middleware/auth.middleware')

const { createNewsEntry, listNews, softDeleteNews, getNewsById } = require('../controllers/content.controller');

router.post('/new', createNewsEntry);
router.get('/', listNews);
router.delete('/:id', isAdmin, softDeleteNews);
router.get('/:id', getNewsById);


module.exports = router;