// routes/auth.routes.js
const router = require('express').Router();
const { checkUsername } = require('../controllers/user.controller');
const { register } = require('../controllers/auth.controller');


router.get('/available/:username', checkUsername);
router.post('/register', register);

module.exports = router;
