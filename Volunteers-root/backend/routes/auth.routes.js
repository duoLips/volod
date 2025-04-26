// routes/auth.routes.js
const router = require('express').Router();
const {createRateLimiter} = require('../middleware/rateLimit')
const { checkUsername } = require('../controllers/user.controller');
const { register, loginPassword, requestLoginOTP, verifyLoginOTP,
    sessionInfo, logout, restoreProfile, requestRestoreOTP,
requestPasswordReset, resetPassword} = require('../controllers/auth.controller');

const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts. Try again later.'
});

const loginOTPStartLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many OTP login requests. Try again in an hour.'
});

const loginOTPVerifyLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: 'Too many OTP code attempts. Try again later.'
});
const passwordResetRequestLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many password reset requests. Try again later.'
});
const passwordResetLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: 'Too many password reset attempts. Try again later.'
});

router.get('/available/:username', checkUsername);
router.post('/register', register);
router.post('/login', loginLimiter, loginPassword);
router.post('/login-otp/start', loginOTPStartLimiter, requestLoginOTP);
router.post('/login-otp/verify', loginOTPVerifyLimiter, verifyLoginOTP);
router.get('/session', sessionInfo);
router.post('/logout', logout)
router.post('/restore', restoreProfile);
router.post('/request-restore-otp', requestRestoreOTP);
router.post('/request-reset-password', passwordResetRequestLimiter, requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, resetPassword);
module.exports = router;
