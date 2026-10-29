const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protectAdmin } = require('../middleware/auth');

// Single image upload
router.post('/single', protectAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Image upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileUrl
    });
  });
});

// Multiple images upload
router.post('/multiple', protectAdmin, (req, res) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Images upload failed' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select images to upload' });
    }

    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({
      success: true,
      message: `${urls.length} images uploaded successfully`,
      urls
    });
  });
});

module.exports = router;
