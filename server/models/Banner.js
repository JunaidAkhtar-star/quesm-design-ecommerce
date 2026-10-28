const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    badge: {
      type: String,
      default: 'Handcrafted With Love'
    },
    image: {
      type: String,
      required: true
    },
    mobileImage: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: '/shop'
    },
    buttonText: {
      type: String,
      default: 'Shop Collection'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', BannerSchema);
