const router = require('express').Router();
const {isAdmin} = require('../middleware/auth.middleware')
const multer = require("multer");
const { createReportEntry, listReports, getReportEntry, softDeleteReport, updateReportEntry, updateReportCover, updateReportCoverFromUrl } = require('../controllers/content.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/new', createReportEntry);
router.get('/', listReports);
router.get('/:id', getReportEntry);
router.delete('/:id', isAdmin, softDeleteReport);
router.patch('/:id', isAdmin, updateReportEntry);
router.patch('/:id/cover', isAdmin, upload.single('cover'), updateReportCover);
router.patch('/:id/cover/url', isAdmin, updateReportCoverFromUrl);
module.exports = router;
