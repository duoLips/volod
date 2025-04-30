const router = require('express').Router();
const {isAdmin} = require('../middleware/auth.middleware')
const {
    createNewsEntry,
    listNews,
    softDeleteNews,
    getNewsById,
    updateNewsCoverFromUrl,
    updateNewsEntry,
    updateNewsCover
} = require('../controllers/content.controller');
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });


router.post('/new', createNewsEntry);
router.get('/', listNews);
router.delete('/:id', isAdmin, softDeleteNews);
router.get('/:id', getNewsById);
router.patch('/:id', isAdmin, updateNewsEntry);
router.patch('/:id/cover', isAdmin, upload.single('cover'), updateNewsCover);
router.patch('/:id/cover/url', isAdmin, updateNewsCoverFromUrl);


module.exports = router;