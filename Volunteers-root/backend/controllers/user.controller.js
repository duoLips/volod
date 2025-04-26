const { usernameExists, getUserById, updateUserProfile, getAllUsers, banUser, unbanUser,
    softDeleteUser, changeUserPassword } = require('../services/user.service');
const { isValidUsername, isValidPassword, isValidEmail } = require('../utils/validation.helper');
const {  uploadImageFromBuffer  } = require('../utils/cloudinary.helper')
const db = require('../models/db');
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

async function getCurrentUser(req, res, next) {
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const user = await getUserById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        next(err);
    }
}
async function updateAvatar(req, res, next) {
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        if (!req.file) return res.status(400).json({ message: 'No file provided' });

        const result = await uploadImageFromBuffer(req.file.buffer, 'avatars');

        await db.query(
            `UPDATE users SET avatar_url = $1 WHERE id = $2`,
            [result.secure_url, userId]
        );

        res.status(200).json({ message: 'Avatar updated', url: result.secure_url });
    } catch (err) {
        next(err);
    }
}

async function updateAvatarFromUrl(req, res, next) {
    const userId = req.session?.user?.id;
    const { imageUrl } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!imageUrl) return res.status(400).json({ message: 'Missing image URL' });

    try {
        await db.query(
            `UPDATE users SET avatar_url = $1 WHERE id = $2`,
            [imageUrl, userId]
        );

        res.status(200).json({ message: 'Avatar updated via external link', url: imageUrl });
    } catch (err) {
        next(err);
    }
}

async function updateProfile(req, res, next) {
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { firstName, lastName, username, phone, address } = req.body;

    try {
        const updatedUser = await updateUserProfile(userId, {
            firstName, lastName, username, phone, address
        });

        res.json({ message: 'Profile updated', user: updatedUser });
    } catch (err) {
        if (err.message.includes('Username already taken') || err.message.includes('Invalid')) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
}

async function listUsers(req, res, next) {
    const role = req.session?.user?.role;
    if (role !== 1) return res.status(403).json({ message: 'Forbidden' });

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.q || '';

    try {
        const result = await getAllUsers({ limit, page, search });
        res.json(result);
    } catch (err) {
        next(err);
    }
}
async function banUserEntry(req, res, next) {
    try {
        await banUser(req.params.id);
        res.json({ message: 'User banned' });
    } catch (err) {
        next(err);
    }
}

async function unbanUserEntry(req, res, next) {
    try {
        await unbanUser(req.params.id);
        res.json({ message: 'User unbanned' });
    } catch (err) {
        next(err);
    }
}

async function deleteOwnProfile(req, res, next) {
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        await softDeleteUser(userId);
        req.session.destroy(() => {});
        res.clearCookie('connect.sid');
        res.json({ message: 'Profile deleted (soft)' });
    } catch (err) {
        next(err);
    }
}

async function adminDeleteUser(req, res, next) {
    try {
        await softDeleteUser(req.params.id);
        res.json({ message: 'User deleted (soft)' });
    } catch (err) {
        next(err);
    }
}

async function changePassword(req, res, next) {
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;

    if (!isValidPassword(newPassword))
        return res.status(400).json({ message: 'Invalid new password format' });

    try {
        await changeUserPassword(userId, currentPassword, newPassword);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
}
async function requestChangeEmail(req, res, next) {
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { newEmail } = req.body;

    if (!isValidEmail(newEmail))
        return res.status(400).json({ message: 'Invalid new email format.' });

    try {
        await generateOTP(newEmail, 'change-email');
        res.json({ message: 'OTP sent to new email address.' });
    } catch (err) {
        next(err);
    }
}
async function confirmChangeEmail(req, res, next) {
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { newEmail, code } = req.body;

    if (!isValidEmail(newEmail))
        return res.status(400).json({ message: 'Invalid new email format.' });

    try {
        const result = await validateOTP(newEmail, code);
        if (!result.valid) return res.status(400).json({ message: result.reason });

        await db.query(`UPDATE users SET email = $1 WHERE id = $2`, [newEmail, userId]);
        res.json({ message: 'Email updated successfully.' });
    } catch (err) {
        next(err);
    }
}

module.exports = { checkUsername,
    getCurrentUser,
    updateAvatar,
    updateAvatarFromUrl,
    updateProfile,
    listUsers,
    banUserEntry,
    unbanUserEntry,
    deleteOwnProfile,
    adminDeleteUser,
    changePassword,
    requestChangeEmail,
    confirmChangeEmail
    };
