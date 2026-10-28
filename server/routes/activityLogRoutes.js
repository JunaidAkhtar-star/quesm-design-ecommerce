const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const { protectAdmin } = require('../middleware/auth');

router.get('/', protectAdmin, getActivityLogs);

module.exports = router;
