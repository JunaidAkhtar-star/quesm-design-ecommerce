const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const { protectAdmin } = require('../middleware/auth');

// Public checkout validation
router.post('/validate', validateCoupon);

// Admin management
router.get('/', protectAdmin, getAdminCoupons);
router.post('/', protectAdmin, createCoupon);
router.put('/:id', protectAdmin, updateCoupon);
router.delete('/:id', protectAdmin, deleteCoupon);

module.exports = router;
