const router = require('express').Router();
const {isAdmin} = require('../middleware/auth.middleware')
const { createAuctionEntry, listAuctions, getAuctionById, softDeleteAuction } = require('../controllers/content.controller');

router.post('/new', createAuctionEntry);
router.get('/', listAuctions)
router.get('/:id', getAuctionById);
router.delete('/:id', isAdmin, softDeleteAuction);

module.exports = router;
