const router = require('express').Router();
const { handleGlobalSearch } = require('../controllers/search.controller');

router.get('/', handleGlobalSearch);

module.exports = router;
