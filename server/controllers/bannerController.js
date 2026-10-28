const Banner = require('../models/Banner');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get active banners for storefront
// @route   GET /api/banners
// @access  Public
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all banners (Admin)
// @route   GET /api/banners/admin
// @access  Private (Admin)
exports.getAdminBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create banner
// @route   POST /api/banners
// @access  Private (Admin)
exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);

    await ActivityLog.create({
      action: 'BANNER_CREATED',
      details: `Created banner "${banner.title}"`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(201).json({ success: true, message: 'Banner created successfully', banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private (Admin)
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await ActivityLog.create({
      action: 'BANNER_UPDATED',
      details: `Updated banner "${banner.title}"`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(200).json({ success: true, message: 'Banner updated successfully', banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private (Admin)
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await banner.deleteOne();

    await ActivityLog.create({
      action: 'BANNER_DELETED',
      details: `Deleted banner "${banner.title}"`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
