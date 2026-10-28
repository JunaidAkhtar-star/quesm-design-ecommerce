const Review = require('../models/Review');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

// Helper to recalculate product rating
const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, isApproved: true });
  const numReviews = reviews.length;
  let rating = 5.0;

  if (numReviews > 0) {
    const total = reviews.reduce((sum, item) => sum + item.rating, 0);
    rating = Number((total / numReviews).toFixed(1));
  }

  await Product.findByIdAndUpdate(productId, { rating, numReviews });
};

// @desc    Submit a review (Guest, requires owner approval)
// @route   POST /api/reviews
// @access  Public
exports.submitReview = async (req, res) => {
  try {
    const { productId, customerName, customerEmail, rating, comment, photoUrl } = req.body;

    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide all review fields' });
    }

    const review = await Review.create({
      product: productId,
      customerName,
      customerEmail: customerEmail || '',
      rating: Number(rating),
      comment,
      photoUrl: photoUrl || '',
      isApproved: false
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted and will appear once approved by our team.',
      review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get approved reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for moderation (Admin)
// @route   GET /api/reviews/admin
// @access  Private (Admin)
exports.getAdminReviews = async (req, res) => {
  try {
    const { status } = req.query; // 'pending', 'approved', 'all'
    const query = {};

    if (status === 'pending') query.isApproved = false;
    else if (status === 'approved') query.isApproved = true;

    const reviews = await Review.find(query)
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject review
// @route   PUT /api/reviews/admin/:id/status
// @access  Private (Admin)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: !!isApproved },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Recalculate rating
    await recalculateProductRating(review.product);

    await ActivityLog.create({
      action: 'REVIEW_STATUS_UPDATED',
      details: `${isApproved ? 'Approved' : 'Unapproved'} review from ${review.customerName}`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(200).json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'hidden'} successfully`,
      review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/admin/:id
// @access  Private (Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.product;
    await review.deleteOne();
    await recalculateProductRating(productId);

    await ActivityLog.create({
      action: 'REVIEW_DELETED',
      details: `Deleted review from ${review.customerName}`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
