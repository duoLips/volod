const { usernameExists } = require('../services/user.service');

async function checkUsername(req, res, next) {
    try {
        const exists = await usernameExists(req.params.username);
        res.json({ exists });
    } catch (err) {
        next(err);
    }
}

module.exports = { checkUsername };
