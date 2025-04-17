const { usernameExists } = require('../services/user.service');
const { isValidUsername } = require('../utils/helpers');

async function checkUsername(req, res, next) {
    const { username } = req.params;

    if (!isValidUsername(username))
        return res.status(400).json({ message: 'Username must be 5‑20 letters, numbers, ".", "_" and no "@"' });

    try {
        const exists = await usernameExists(username);
        res.json({ exists });
    } catch (err) {
        next(err);
    }
}

module.exports = { checkUsername };
