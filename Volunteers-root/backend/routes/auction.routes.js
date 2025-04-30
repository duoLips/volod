const router = require('express').Router();
const {isAdmin} = require('../middleware/auth.middleware')
const { createAuctionEntry, listAuctions, getAuctionById, softDeleteAuction, assignAuctionWinnerEntry, updateAuctionEntry, updateAuctionCover, updateAuctionCoverFromUrl } = require('../controllers/content.controller');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post('/new', createAuctionEntry);
router.get('/', listAuctions)
router.get('/:id', getAuctionById);
router.delete('/:id', isAdmin, softDeleteAuction);
router.patch('/:id/winner', isAdmin, assignAuctionWinnerEntry);

router.patch('/:id', isAdmin, updateAuctionEntry);
router.patch('/:id/cover', isAdmin, upload.single('cover'), updateAuctionCover);
router.patch('/:id/cover/url', isAdmin, updateAuctionCoverFromUrl);

module.exports = router;
