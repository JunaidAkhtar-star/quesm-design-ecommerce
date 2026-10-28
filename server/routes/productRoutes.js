const express = require('express');
const router = express.Router();
const {
  getProducts,
  getLiveSuggestions,
  getProductBySlug,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkAction
} = require('../controllers/productController');
const { protectAdmin } = require('../middleware/auth');

// Public catalog routes
router.get('/', getProducts);
router.get('/suggestions', getLiveSuggestions);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/slug/:slug', getProductBySlug);

// Admin-only product routes
router.post('/', protectAdmin, createProduct);
router.put('/:id', protectAdmin, updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);
router.post('/bulk-action', protectAdmin, bulkAction);

module.exports = router;
