const express = require('express');
const router = express.Router();
const {
  createGuestOrder,
  trackOrder,
  getPublicOrderDetails,
  getCustomerOrders,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  getDashboardStats,
  exportOrdersCsv
} = require('../controllers/orderController');
const { protectAdmin } = require('../middleware/auth');

// Public guest checkout & tracking
router.post('/', createGuestOrder);
router.post('/track', trackOrder);
router.post('/my-orders', getCustomerOrders);
router.get('/details/:orderNumber', getPublicOrderDetails);

// Admin orders management & statistics
router.get('/admin', protectAdmin, getAdminOrders);
router.get('/admin/stats', protectAdmin, getDashboardStats);
router.get('/admin/export-csv', protectAdmin, exportOrdersCsv);
router.get('/admin/:id', protectAdmin, getAdminOrderById);
router.put('/admin/:id/status', protectAdmin, updateOrderStatus);

module.exports = router;
