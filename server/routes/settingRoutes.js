const express = require('express');
const router = express.Router();
const {
  getPublicSettings,
  getAdminSettings,
  updateSettings
} = require('../controllers/settingController');
const { protectAdmin } = require('../middleware/auth');

// Public settings
router.get('/public', getPublicSettings);

// Admin settings
router.get('/admin', protectAdmin, getAdminSettings);
router.put('/admin', protectAdmin, updateSettings);

module.exports = router;
