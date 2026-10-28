const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getAdminContactMessages,
  updateMessageStatus,
  deleteMessage
} = require('../controllers/contactController');
const { protectAdmin } = require('../middleware/auth');

// Public contact submission
router.post('/', submitContactMessage);

// Admin review
router.get('/admin', protectAdmin, getAdminContactMessages);
router.put('/admin/:id', protectAdmin, updateMessageStatus);
router.delete('/admin/:id', protectAdmin, deleteMessage);

module.exports = router;
