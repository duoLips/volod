const router = require('express').Router();
const { createNewsEntry, listNews, softDeleteNews } = require('../controllers/content.controller');

router.post('/new', createNewsEntry);
router.get('/', listNews);
router.delete('/:id', softDeleteNews);

module.exports = router;