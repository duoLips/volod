// services/user.service.js
const db = require('../models/db');
const bcrypt = require('bcrypt');
const { isValidUsername } = require('../utils/validation.helper');

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
         (first_name, last_name, username, passhash, email, role_id, address, created_at, avatar_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8)
             RETURNING id, first_name AS "firstName", last_name AS "lastName", username, email`,
        [firstName, lastName, username, passhash, email, USER, address, process.env.DEFAULT_AVATAR_URL]
    );

    return rows[0];
}

async function findByIdentifier(identifier) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const { rows } = await db.query(
        `SELECT * FROM users WHERE ${isEmail ? 'email' : 'username'} = $1 LIMIT 1`,
        [identifier]
    );
    return rows[0] || null;
}
async function getUserById(id) {
    const { rows } = await db.query(
        `SELECT id, username, email, role_id AS role, avatar_url
         FROM users
         WHERE id = $1`,
        [id]
    );
    return rows[0] || null;
}
async function updateUserProfile(id, updates) {
    const allowedFields = ['first_name', 'last_name', 'username', 'phone', 'address'];
    const values = [];
    const setClauses = [];

    // Validate username if updated
    if (updates.username !== undefined) {
        if (!isValidUsername(updates.username)) {
            throw new Error('Invalid username format. Must be 5-20 chars: letters, numbers, ".", "_"');
        }
        const exists = await usernameExists(updates.username);
        if (exists) {
            throw new Error('Username already taken.');
        }
    }

    // Validate phone if updated (simple regex)
    if (updates.phone !== undefined) {
        const phoneRegex = /^\+?\d{7,15}$/;
        if (!phoneRegex.test(updates.phone)) {
            throw new Error('Invalid phone number format.');
        }
    }

    allowedFields.forEach((field, idx) => {
        const jsField = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        if (updates[jsField] !== undefined) {
            values.push(updates[jsField]);
            setClauses.push(`${field} = $${values.length}`);
        }
    });

    if (values.length === 0) {
        throw new Error('No valid fields provided for update.');
    }

    const query = `
        UPDATE users SET ${setClauses.join(', ')}
        WHERE id = $${values.length + 1}
            RETURNING id, first_name AS "firstName", last_name AS "lastName", username, email, phone, address
    `;

    values.push(id);

    const { rows } = await db.query(query, values);
    return rows[0];
}

async function getAllUsers({ limit = 10, page = 1, search = '' }) {
    const offset = (page - 1) * limit;

    const searchQuery = `%${search.toLowerCase()}%`;

    const dataQuery = await db.query(
        `SELECT id, username, email, role_id AS role, first_name AS "firstName", last_name AS "lastName", phone, address, created_at, banned_at
         FROM users
         WHERE LOWER(username) LIKE $1 OR LOWER(email) LIKE $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [searchQuery, limit, offset]
    );

    const countQuery = await db.query(
        `SELECT COUNT(*) FROM users WHERE LOWER(username) LIKE $1 OR LOWER(email) LIKE $1`,
        [searchQuery]
    );

    const total = parseInt(countQuery.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
        data: dataQuery.rows,
        pagination: { total, page, limit, totalPages }
    };
}

async function banUser(userId) {
    await db.query(
        `UPDATE users SET banned_at = NOW()
         WHERE id = $1`,
        [userId]
    );
}

async function unbanUser(userId) {
    await db.query(
        `UPDATE users SET banned_at = NULL
         WHERE id = $1`,
        [userId]
    );
}
async function softDeleteUser(userId) {
    await db.query(
        `UPDATE users
         SET deleted_at = NOW()
         WHERE id = $1`,
        [userId]
    );
}
async function changeUserPassword(userId, currentPassword, newPassword) {
    const { rows } = await db.query(`SELECT passhash FROM users WHERE id = $1`, [userId]);
    if (!rows.length) throw new Error('User not found');

    const user = rows[0];

    const match = await bcrypt.compare(String(currentPassword), user.passhash);
    if (!match) throw new Error('Current password is incorrect');

    const newHash = await bcrypt.hash(String(newPassword), 12);

    await db.query(`UPDATE users SET passhash = $1 WHERE id = $2`, [newHash, userId]);
}
async function resetUserPasswordByEmail(email, newPassword) {
    const newHash = await bcrypt.hash(String(newPassword), 12);

    await db.query(`UPDATE users SET passhash = $1 WHERE email = $2`, [newHash, email]);
}

module.exports = {
    usernameExists,
    emailExists,
    createUser,
    findByIdentifier,
    getUserById,
    updateUserProfile,
    getAllUsers,
    banUser,
    unbanUser,
    softDeleteUser,
    changeUserPassword,
    resetUserPasswordByEmail
};