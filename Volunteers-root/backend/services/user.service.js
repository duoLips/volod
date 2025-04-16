const db = require('../models/db');

async function createUser({ firstName, lastName, username, email, passhash, roleId, address }) {
    const result = await db.query(
        `INSERT INTO users (first_name, last_name, username, email, passhash, role_id, address, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id`,
        [firstName, lastName, username, email, passhash, roleId, address]
    );
    return result.rows[0];
}

async function userExistsByEmail(email) {
    const result = await db.query(
        `SELECT id FROM users WHERE email = $1`,
        [email]
    );
    return result.rowCount > 0;
}

async function userExistsByUsername(username) {
    const result = await db.query(
        `SELECT id FROM users WHERE username = $1`,
        [username]
    );
    return result.rowCount > 0;
}

module.exports = {
    createUser,
    userExistsByEmail,
    userExistsByUsername,
};
