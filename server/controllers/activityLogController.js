const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs (Admin audit trail)
// @route   GET /api/activity-logs
// @access  Private (Admin)
exports.getActivityLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await ActivityLog.countDocuments();
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      logs,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
