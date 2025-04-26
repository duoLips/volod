const rateLimit = require('express-rate-limit');

function createRateLimiter({ windowMs, max, message }) {
    return rateLimit({
        windowMs,
        max,
        message,
        standardHeaders: true,  // Adds RateLimit-* headers to responses
        legacyHeaders: false    // Disables X-RateLimit-* headers (old format)
    });
}
module.exports = { createRateLimiter };
