const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protectAdmin } = require('../middleware/auth');

// Single image upload
router.post('/single', protectAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image to upload' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Multiple images upload
router.post('/multiple', protectAdmin, upload.array('images', 8), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select images to upload' });
    }

    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({
      success: true,
      message: `${urls.length} images uploaded successfully`,
      urls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
