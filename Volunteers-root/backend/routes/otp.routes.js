const express = require('express');
const { requestOTP, verifyOTP } = require('../controllers/otp.controller');
const { otpRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/new', otpRateLimiter, requestOTP);
router.post('/verify', verifyOTP);

module.exports = router;