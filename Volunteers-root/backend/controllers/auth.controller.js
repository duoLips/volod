const {emailExists, createUser } = require('../services/user.service')

async function register(req, res, next) {
    const {
        firstName,
        lastName,
        username,
        email,
        password,
        address
    } = req.body;

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
            roleId,
            address
        });

        req.session.user = { id: user.id, username: user.username }; // instant login
        res.status(201).json({ user });
    } catch (err) {
        next(err);
    }
}

module.exports = { register };