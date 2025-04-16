const { hasEmailExceededAttempts, generateOTP, validateOTP } = require('../services/otp.service');

async function requestOTP(req, res, next) {
    const { email, subject } = req.body;

    try {
        if (await hasEmailExceededAttempts(email)) {
            return res.status(429).json({ message: 'Too many requests for this email' });
        }
        await generateOTP(email, subject);
        res.status(200).json({ message: 'OTP sent' });
    } catch (err) {
        next(err);
    }
}

async function verifyOTP(req, res, next) {
    const { email, code } = req.body;
    try {
        const result = await validateOTP(email, code);
        if (!result.valid) return res.status(400).json({ message: result.reason });

        req.session.verifiedEmail = email;
        res.status(200).json({ message: 'OTP verified', email });
    } catch (err) {
        next(err);
    }
}

module.exports = { requestOTP, verifyOTP };