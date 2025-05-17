const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/admin.controller');

router.get('/stats', getAdminStats);

module.exports = router;
