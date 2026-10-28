const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    customerName: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment'],
      trim: true
    },
    photoUrl: {
      type: String,
      default: ''
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', ReviewSchema);
