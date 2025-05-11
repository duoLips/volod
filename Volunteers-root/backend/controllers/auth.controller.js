const db = require('../models/db');
const bcrypt = require('bcrypt');

const { generateOTP, validateOTP } = require('../services/otp.service')
const {emailExists, createUser, findByIdentifier, resetUserPasswordByEmail, getUserMe } = require('../services/user.service');
const {isValidUsername, isValidEmail, isValidPassword} = require('../utils/validation.helper');

const loginFailures = {};
async function register(req, res, next) {
    const {
        firstName,
        lastName,
        username,
        email,
        password,
        address
    } = req.body;

    if (!isValidUsername(username))
        return res.status(400).json({ message: 'Invalid username format' });

    if (!isValidEmail(email))
        return res.status(400).json({ message: 'Invalid e‑mail format' });

    if (!isValidPassword(password))
        return res.status(400).json({ message: 'Password too long (max 100 chars)' });

    try {
        if (req.session.verifiedEmail !== email)
            return res.status(400).json({ message: 'E‑mail not verified' });

        if (await emailExists(email))
            return res.status(409).json({ message: 'E‑mail already in use' });

        const user = await createUser({
            firstName,
            lastName,
            username,
            email,
            password,
            address
        });

        req.session.user = {
            id: user.id,
            username: user.username || null,
            firstName: user.first_name || null,
            lastName: user.last_name || null,
            role: user.role_id,
            avatar_url: user.avatar_url || null
        };

        res.status(201).json({ user });
    } catch (err) {
        next(err);
    }
}
async function loginPassword(req, res, next) {
    const { identifier, password } = req.body;

    try {
        const user = await findByIdentifier(identifier);
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        if (user.banned_at)
            return res.status(403).json({ message: 'Account is banned.' });

        if (user.deleted_at)
            return res.status(403).json({ message: 'Account is deleted.' });

        const ok = await bcrypt.compare(String(password), user.passhash);
        if (!ok) {
            loginFailures[identifier] = (loginFailures[identifier] || 0) + 1;

            if (loginFailures[identifier] >= MAX_LOGIN_ATTEMPTS) {
                await banUser(user.id); // Use your existing service
                return res.status(403).json({ message: 'Too many failed attempts. Account locked.' });
            }

            return res.status(400).json({ message: 'Invalid credentials' });
        }

        delete loginFailures[identifier];

        req.session.user = {
            id: user.id,
            username: user.username,
            firstName: user.first_name || null,
            lastName: user.last_name || null,
            role: user.role_id,
            avatar_url: user.avatar_url || null
        };

        res.json({ message: 'Logged in', user: req.session.user });
    } catch (err) {
        next(err);
    }
}


async function requestLoginOTP(req, res, next) {
    const { identifier } = req.body;
    try {
        const user = await findByIdentifier(identifier);
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.deleted_at) {
            return res.status(403).json({ message: 'Account is deleted. Please reactivate.' });
        }

        if (user.banned_at)
            return res.status(403).json({ message: 'Account is banned' });

        await generateOTP(user.email, 'login');
        res.json({ message: 'OTP sent' });
    } catch (err) { next(err); }
}

async function verifyLoginOTP(req, res, next) {
    const { identifier, code } = req.body;
    try {
        const user = await findByIdentifier(identifier);
        if (!user) return res.status(400).json({ message: 'User not found' });


        const result = await validateOTP(user.email, code);
        if (!result.valid) return res.status(400).json({ message: result.reason });

        req.session.user = {
            id: user.id,
            username: user.username || null,
            firstName: user.first_name || null,
            lastName: user.last_name || null,
            role: user.role_id,
            avatar_url: user.avatar_url || null
        };
        res.json({ message: 'Logged in', user: { id: user.id, username: user.username, role: user.role_id } });
    } catch (err) { next(err); }
}

async function sessionInfo(req, res) {
    if (!req.session.user)
        return res.status(401).json({ authenticated: false });

    res.json({
        authenticated: true,
        user: req.session.user
    });
}
async function refreshSession(req, res) {
    const user = await getUserMe(req.session.user.id);

    req.session.user = {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatar_url: user.avatar_url
    };

    res.json({ message: 'Session refreshed', user: req.session.user });
}

async function logout (req,res) {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // clears session cookie
        res.status(200).json({ message: 'Logged out' });
    });
}

async function requestRestoreOTP(req, res, next) {
    const { email } = req.body;

    try {
        const user = await findByIdentifier(email);
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (!user.deleted_at)
            return res.status(400).json({ message: 'Account is already active.' });

        await generateOTP(email, 'restore-account');
        res.json({ message: 'OTP sent for account restoration.' });
    } catch (err) {
        next(err);
    }
}
async function restoreProfile(req, res, next) {
    const { email, code } = req.body;

    try {
        const result = await validateOTP(email, code);
        if (!result.valid) return res.status(400).json({ message: result.reason });

        const { rows } = await db.query(
            `UPDATE users
             SET deleted_at = NULL
             WHERE email = $1
                 RETURNING id, username, first_name, last_name, role_id, avatar_url`,
            [email]
        );


        if (!rows.length) return res.status(400).json({ message: 'Account not found' });

        const user = rows[0];

        req.session.user = {
            id: user.id,
            username: user.username || null,
            firstName: user.first_name || null,
            lastName: user.last_name || null,
            role: user.role_id,
            avatar_url: user.avatar_url || null
        };

        res.json({ message: 'Account restored and logged in', user });
    } catch (err) {
        next(err);
    }
}
async function requestPasswordReset(req, res, next) {
    const { email } = req.body;

    if (!isValidEmail(email))
        return res.status(400).json({ message: 'Invalid email format' });

    try {
        const user = await findByIdentifier(email);
        if (!user) return res.status(400).json({ message: 'Email not found' });

        await generateOTP(email, 'reset-password');
        res.json({ message: 'OTP sent to reset password' });
    } catch (err) {
        next(err);
    }
}
async function resetPassword(req, res, next) {
    const { email, code, newPassword } = req.body;

    if (!isValidEmail(email))
        return res.status(400).json({ message: 'Invalid email format' });

    if (!isValidPassword(newPassword))
        return res.status(400).json({ message: 'Invalid new password format' });

    try {
        const otpResult = await validateOTP(email, code);
        if (!otpResult.valid) return res.status(400).json({ message: otpResult.reason });

        await resetUserPasswordByEmail(email, newPassword);
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        next(err);
    }
}
module.exports = {
    register,
    loginPassword,
    requestLoginOTP,
    verifyLoginOTP,
    sessionInfo,
    logout,
    requestRestoreOTP,
    restoreProfile,
    requestPasswordReset,
    resetPassword,
    refreshSession
};
