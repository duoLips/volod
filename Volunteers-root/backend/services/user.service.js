// services/user.service.js
const db = require('../models/db');
const bcrypt = require('bcrypt');
const USER = 2;
async function usernameExists(username) {
    const { rows } = await db.query(
        'SELECT 1 FROM users WHERE username = $1 LIMIT 1',
        [username]
    );
    return rows.length > 0;
}

async function emailExists(email) {
    const { rows } = await db.query(
        'SELECT 1 FROM users WHERE email = $1 LIMIT 1',
        [email]
    );
    return rows.length > 0;
}

async function createUser({
                              firstName,
                              lastName,
                              username,
                              email,
                              password,
                              address = null
                          }) {
    const passhash = await bcrypt.hash(String(password), 12);

    const { rows } = await db.query(
        `INSERT INTO users
     (first_name, last_name, username, passhash, email, role_id, address, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
     RETURNING id, first_name AS "firstName", last_name AS "lastName", username, email`,
        [firstName, lastName, username, passhash, email, USER, address]
    );
    return rows[0];
}

module.exports = {
    usernameExists,
    emailExists,
    createUser
};
