const express = require('express');
const { requestOTP, verifyOTP } = require('../controllers/otp.controller');
const { createRateLimiter } = require('../middleware/rateLimit');
const router = express.Router();

const otpRequestLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many OTP requests. Try again later.'
});

router.post('/new', otpRequestLimiter, requestOTP);
router.post('/verify', verifyOTP);

module.exports = router;