const Setting = require('../models/Setting');
const ActivityLog = require('../models/ActivityLog');
const { formatGoogleMapsEmbedUrl } = require('../utils/mapHelper');

// Helper to get or create settings
const getOrCreateSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  return settings;
};

// @desc    Get public settings for storefront
// @route   GET /api/settings/public
// @access  Public
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    // Exclude sensitive keys from public response
    res.status(200).json({
      success: true,
      settings: {
        storeName: settings.storeName,
        tagline: settings.tagline,
        storeEmail: settings.storeEmail,
        storePhone: settings.storePhone,
        whatsappNumber: settings.whatsappNumber,
        storeAddress: settings.storeAddress,
        googleMapsUrl: formatGoogleMapsEmbedUrl(settings.googleMapsUrl || settings.storeAddress),
        announcementBarText: settings.announcementBarText,
        announcementBarActive: settings.announcementBarActive,
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        shippingCharge: settings.shippingCharge,
        freeShippingThreshold: settings.freeShippingThreshold,
        giftWrapCharge: settings.giftWrapCharge,
        socialLinks: settings.socialLinks,
        seoDefaults: settings.seoDefaults,
        enableCod: settings.enableCod,
        enableRazorpay: settings.enableRazorpay,
        razorpayKeyId: settings.razorpayKeyId,
        googleAnalyticsId: settings.googleAnalyticsId,
        metaPixelId: settings.metaPixelId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all settings (Admin)
// @route   GET /api/settings/admin
// @access  Private (Admin)
exports.getAdminSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update settings
// @route   PUT /api/settings/admin
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
  try {
    if (req.body.googleMapsUrl) {
      let mapUrl = req.body.googleMapsUrl.trim();
      if (mapUrl.includes('maps.app.goo.gl') || mapUrl.includes('goo.gl/maps')) {
        try {
          const resp = await fetch(mapUrl, { redirect: 'follow' });
          if (resp && resp.url) {
            mapUrl = resp.url;
          }
        } catch (e) {
          console.warn('Maps short URL expansion note:', e.message);
        }
      }
      req.body.googleMapsUrl = formatGoogleMapsEmbedUrl(mapUrl);
    }

    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true
      });
    }

    await ActivityLog.create({
      action: 'SETTINGS_UPDATED',
      details: 'Store settings updated by owner',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(200).json({
      success: true,
      message: 'Store settings updated successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
