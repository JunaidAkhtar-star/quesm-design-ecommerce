const express = require('express');
const router = express.Router();
const {
  submitReview,
  getProductReviews,
  getAdminReviews,
  updateReviewStatus,
  deleteReview
} = require('../controllers/reviewController');
const { protectAdmin } = require('../middleware/auth');

// Public
router.post('/', submitReview);
router.get('/product/:productId', getProductReviews);

// Admin
router.get('/admin', protectAdmin, getAdminReviews);
router.put('/admin/:id/status', protectAdmin, updateReviewStatus);
router.delete('/admin/:id', protectAdmin, deleteReview);

module.exports = router;
