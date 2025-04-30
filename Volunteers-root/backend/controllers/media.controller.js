const { uploadImageFromBuffer } = require('../utils/cloudinary.helper');
const {listAllMedia} = require('../services/media.service')
async function uploadImage(req, res, next) {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file provided' });
        console.log('req.file:', req.file);

        const result = await uploadImageFromBuffer(req.file.buffer);
        res.status(200).json({ url: result.secure_url });
    } catch (err) {
        next(err);
    }
}

async function listGallery(req, res, next) {
    try {
        const media = await listAllMedia();
        res.json(media);
    } catch (err) {
        next(err);
    }
}

module.exports = { uploadImage, listGallery };