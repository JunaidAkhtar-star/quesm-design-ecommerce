const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  logout,
  changePassword,
  setup2FA,
  verify2FA,
  disable2FA
} = require('../controllers/authController');
const { protectAdmin } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Owner login endpoint (rate-limited)
router.post('/login', loginLimiter, login);
router.post('/logout', protectAdmin, logout);
router.get('/me', protectAdmin, getMe);
router.put('/change-password', protectAdmin, changePassword);
router.post('/setup-2fa', protectAdmin, setup2FA);
router.post('/verify-2fa', protectAdmin, verify2FA);
router.post('/disable-2fa', protectAdmin, disable2FA);

module.exports = router;
