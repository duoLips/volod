// routes/auth.routes.js
const router = require('express').Router();
const { checkUsername } = require('../controllers/user.controller');
const { register, loginPassword, requestLoginOTP, verifyLoginOTP, sessionInfo, logout } = require('../controllers/auth.controller');


router.get('/available/:username', checkUsername);
router.post('/register', register);
router.post('/login', loginPassword);
router.post('/login-otp/start', requestLoginOTP);
router.post('/login-otp/verify', verifyLoginOTP);
router.get('/session', sessionInfo);
router.post('/logout', logout)

module.exports = router;
