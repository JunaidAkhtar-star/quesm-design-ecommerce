const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const protectAdmin = async (req, res, next) => {
  let token;

  // Check httpOnly cookie first, then Authorization Bearer header
  if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access owner admin area. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quesm_secret_2026');
    const admin = await AdminUser.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or has been revoked.'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token expired or invalid. Please re-authenticate.'
    });
  }
};

module.exports = { protectAdmin };
