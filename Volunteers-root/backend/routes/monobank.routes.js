const router = require('express').Router();
const { getJars, refreshJars } = require('../controllers/monobank.controller');
const { isAdmin } = require('../middleware/auth.middleware');

router.get('/jars', getJars);
router.post('/jars/refresh', isAdmin, refreshJars);

module.exports = router;
