const express = require('express');
const { requestOTP, verifyOTP } = require('../controllers/otp.controller');
const { otpRateLimiter } = require('../middlewares/rateLimit');

const router = express.Router();

router.post('/otp/new', otpRateLimiter, requestOTP);
router.post('/otp/verify', verifyOTP);

module.exports = router;
