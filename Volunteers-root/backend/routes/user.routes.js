const router = require('express').Router();
const multer = require('multer');
const {isAdmin} = require('../middleware/auth.middleware')
const { getCurrentUser,
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
    } = require('../controllers/user.controller');
const upload = multer();
const { createRateLimiter } = require('../middleware/rateLimit');

const avatarChangeLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2,
    message: 'Too many avatar updates. Try again in an hour.'
});
const emailChangeLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many email updates. Try again in an hour.'
});

router.get('/me', getCurrentUser);
router.patch('/me/avatar', avatarChangeLimiter, upload.single('avatar'), updateAvatar);
router.patch('/me/avatar/url', avatarChangeLimiter, updateAvatarFromUrl);
router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);
router.get('/', isAdmin, listUsers);
router.patch('/:id/ban', isAdmin, banUserEntry);
router.patch('/:id/unban', isAdmin, unbanUserEntry);
router.delete('/me', deleteOwnProfile);
router.delete('/:id', isAdmin, adminDeleteUser);
router.post('/request-change-email',emailChangeLimiter,  requestChangeEmail);
router.post('/confirm-change-email', emailChangeLimiter, confirmChangeEmail);


module.exports = router;
