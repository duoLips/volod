const router = require('express').Router();
const multer = require('multer');
const { uploadImage, listGallery } = require('../controllers/media.controller');


const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('image'), uploadImage);
router.get('/gallery', listGallery);

module.exports = router;