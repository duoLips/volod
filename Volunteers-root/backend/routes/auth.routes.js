const express = require('express');
const router = express.Router();
const { verifyEmail, register, checkUsername, signin, passwordlessLogin, getSession, logout } = require('../controllers/auth.controller');

// Email is already verified by OTP system
router.post('/verify-email', verifyEmail);
router.post('/register', register);
router.post('/check-username', checkUsername);
router.post('/signin', signin);
router.post('/passwordlessLogin', passwordlessLogin);
router.get('/session', getSession)
router.post('/logout', logout)

module.exports = router;
