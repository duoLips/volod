const rateLimit = require('express-rate-limit');

const otpRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many OTP requests from this IP. Try again in an hour.'
});

module.exports = { otpRateLimiter };
