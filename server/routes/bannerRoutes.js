const express = require('express');
const router = express.Router();
const {
  getBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const { protectAdmin } = require('../middleware/auth');

// Public
router.get('/', getBanners);

// Admin
router.get('/admin', protectAdmin, getAdminBanners);
router.post('/', protectAdmin, createBanner);
router.put('/:id', protectAdmin, updateBanner);
router.delete('/:id', protectAdmin, deleteBanner);

module.exports = router;
