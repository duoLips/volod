const db = require('../models/db');
const { sendOTPEmail } = require('../utils/mailer');

const MAX_EMAIL_ATTEMPTS = 3;
const MAX_CODE_ATTEMPTS = 3;

async function hasEmailExceededAttempts(email) {
    const { rows } = await db.query(`
    SELECT COUNT(*) FROM otp 
    WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'
  `, [email]);
    return parseInt(rows[0].count) >= MAX_EMAIL_ATTEMPTS;
}

async function generateOTP(email, subject) {
    const code = Math.floor(100000 + Math.random() * 900000);
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(`UPDATE otp SET status = false WHERE email = $1 AND status = true`, [email]);

    await db.query(`
    INSERT INTO otp (code, email, created_at, expires_at, status) 
    VALUES ($1, $2, $3, $4, true)
  `, [code, email, createdAt, expiresAt]);

    await sendOTPEmail(email, code, subject);
}

async function validateOTP(email, code) {
    const { rows } = await db.query(`
    SELECT * FROM otp WHERE email = $1 AND code = $2 ORDER BY created_at DESC LIMIT 1
  `, [email, code]);

    if (!rows.length) return { valid: false, reason: 'Invalid code' };

    const otp = rows[0];
    const now = new Date();

    if (!otp.status) return { valid: false, reason: 'OTP inactive' };
    if (otp.expires_at < now) {
        await db.query(`UPDATE otp SET status = false WHERE id = $1`, [otp.id]);
        return { valid: false, reason: 'OTP expired' };
    }

    if (otp.attempts >= MAX_CODE_ATTEMPTS) {
        await db.query(`UPDATE otp SET status = false WHERE id = $1`, [otp.id]);
        return { valid: false, reason: 'Too many attempts' };
    }

    if (parseInt(code) !== otp.code) {
        await db.query(`UPDATE otp SET attempts = attempts + 1 WHERE id = $1`, [otp.id]);
        return { valid: false, reason: 'Incorrect code' };
    }

    await db.query(`UPDATE otp SET status = false WHERE id = $1`, [otp.id]);
    return { valid: true };
}

module.exports = {
    hasEmailExceededAttempts,
    generateOTP,
    validateOTP
};
