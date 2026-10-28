const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const AdminUser = require('../models/AdminUser');
const ActivityLog = require('../models/ActivityLog');
const { sendAdminLoginAlert } = require('../utils/email');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'quesm_secret_2026', {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// Set token in httpOnly cookie
const sendTokenResponse = (admin, statusCode, res, message = 'Authenticated successfully') => {
  const token = generateToken(admin._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res
    .status(statusCode)
    .cookie('adminToken', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isTwoFactorEnabled: admin.isTwoFactorEnabled,
        lastLogin: admin.lastLogin
      }
    });
};

// @desc    Owner Login
// @route   POST /api/auth/login
// @access  Public (Hidden URL)
exports.login = async (req, res) => {
  try {
    const { email, password, totpCode } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password'
      });
    }

    const loginIdentifier = (email || '').trim().toLowerCase();
    const admin = await AdminUser.findOne({
      $or: [
        { email: loginIdentifier },
        { email: 'contactquesmdesign@gmail.com' },
        { email: 'owner@quesmdesign.com' },
        { email: loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier}@quesmdesign.com` },
        { name: new RegExp(`^${loginIdentifier}$`, 'i') },
        { name: /owner|admin|que\s*s\.?m/i }
      ]
    }).select('+password +twoFactorSecret');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Access restricted to store owner.'
      });
    }

    // Check account lockout
    if (admin.isLocked) {
      const waitMinutes = Math.ceil((admin.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked due to repeated failed attempts. Please retry in ${waitMinutes} minutes.`
      });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      await admin.incLoginAttempts();
      await ActivityLog.create({
        action: 'FAILED_LOGIN',
        details: `Failed login attempt for ${email}`,
        ipAddress: ip,
        userAgent,
        adminEmail: email
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid owner credentials.'
      });
    }

    // Check 2FA if enabled
    if (admin.isTwoFactorEnabled) {
      if (!totpCode) {
        return res.status(200).json({
          success: false,
          requires2FA: true,
          message: 'Two-factor authentication code required'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: admin.twoFactorSecret,
        encoding: 'base32',
        token: totpCode,
        window: 1
      });

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid 2FA authentication code. Please check your authenticator app.'
        });
      }
    }

    // Reset login attempts and record login
    await admin.resetLoginAttempts(ip);

    // Audit log
    await ActivityLog.create({
      action: 'LOGIN',
      details: `Successful owner login from ${ip}`,
      ipAddress: ip,
      userAgent,
      adminEmail: admin.email
    });

    // Send email alert to owner
    sendAdminLoginAlert({
      email: admin.email,
      ip,
      userAgent,
      time: new Date()
    });

    sendTokenResponse(admin, 200, res, 'Welcome back, Owner!');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Logged In Admin Profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    admin: req.admin
  });
};

// @desc    Logout Owner
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    if (req.admin) {
      await ActivityLog.create({
        action: 'LOGOUT',
        details: 'Owner logged out successfully',
        ipAddress: ip,
        userAgent,
        adminEmail: req.admin.email
      });
    }

    res.cookie('adminToken', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change Admin Password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const admin = await AdminUser.findById(req.admin._id).select('+password');
    const isMatch = await admin.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    admin.password = newPassword;
    await admin.save();

    await ActivityLog.create({
      action: 'PASSWORD_CHANGED',
      details: 'Master password updated',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: admin.email
    });

    res.status(200).json({
      success: true,
      message: 'Master password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Setup 2FA (Generate Secret and QR code)
// @route   POST /api/auth/setup-2fa
// @access  Private
exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `QueS.M design Owner (${req.admin.email})`
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save temporary secret to admin
    await AdminUser.findByIdAndUpdate(req.admin._id, {
      twoFactorSecret: secret.base32
    });

    res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCodeUrl,
      message: 'Scan the QR code with Google Authenticator or enter the secret code'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify and Activate 2FA
// @route   POST /api/auth/verify-2fa
// @access  Private
exports.verify2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const admin = await AdminUser.findById(req.admin._id).select('+twoFactorSecret');

    if (!admin.twoFactorSecret) {
      return res.status(400).json({ success: false, message: '2FA setup was not initiated' });
    }

    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid code. Try again.' });
    }

    admin.isTwoFactorEnabled = true;
    await admin.save();

    await ActivityLog.create({
      action: '2FA_ENABLED',
      details: 'Two-factor authentication activated',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: admin.email
    });

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication successfully enabled!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/disable-2fa
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    const admin = await AdminUser.findById(req.admin._id).select('+password');

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password is required to disable 2FA' });
    }

    admin.isTwoFactorEnabled = false;
    admin.twoFactorSecret = null;
    await admin.save();

    await ActivityLog.create({
      action: '2FA_DISABLED',
      details: 'Two-factor authentication disabled',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: admin.email
    });

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication disabled'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
