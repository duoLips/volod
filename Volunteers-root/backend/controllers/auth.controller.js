
const bcrypt = require('bcrypt');
const { generateOTP, validateOTP } = require('../services/otp.service')
const {emailExists, createUser, findByIdentifier } = require('../services/user.service');
const {isValidUsername, isValidEmail, isValidPassword} = require('../utils/validation.helper');
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

        req.session.user = { id: user.id, username: user.username, role: user.role_id }; // instant login
        res.status(201).json({ user });
    } catch (err) {
        next(err);
    }
}
async function loginPassword(req, res, next) {
    const { identifier, password } = req.body;          // one field for user / e‑mail
    try {
        const user = await findByIdentifier(identifier);
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        if (!isValidPassword(password))
            return res.status(400).json({ message: 'Invalid password format' });

        const ok = await bcrypt.compare(String(password), user.passhash);
        if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

        req.session.user = { id: user.id, username: user.username, role: user.role_id };
        res.json({ message: 'Logged in', user: { id: user.id, username: user.username, role: user.role_id} });
    } catch (err) { next(err); }
}

async function requestLoginOTP(req, res, next) {
    const { identifier } = req.body;
    try {
        const user = await findByIdentifier(identifier);
        if (!user) return res.status(400).json({ message: 'User not found' });

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

        req.session.user = { id: user.id, username: user.username, role: user.role_id };
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

async function logout (req,res) {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // clears session cookie
        res.status(200).json({ message: 'Logged out' });
    });
}

module.exports = {
    register,
    loginPassword,
    requestLoginOTP,
    verifyLoginOTP,
    sessionInfo,
    logout
};
