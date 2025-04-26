const router = require('express').Router();
const {isAdmin} = require('../middleware/auth.middleware')

const { createReportEntry, listReports, getReportEntry, softDeleteReport } = require('../controllers/content.controller');

router.post('/new', createReportEntry);
router.get('/', listReports);
router.get('/:id', getReportEntry);
router.delete('/:id', isAdmin, softDeleteReport);

module.exports = router;
