const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'QueS.M design'
    },
    tagline: {
      type: String,
      default: 'Handcrafted Elegance & Artisanal Accessories'
    },
    storeEmail: {
      type: String,
      default: 'contactquesmdesign@gmail.com'
    },
    storePhone: {
      type: String,
      default: '+917978201960'
    },
    whatsappNumber: {
      type: String,
      default: '917978201960'
    },
    storeAddress: {
      type: String,
      default: 'QueS.M design Studio Khan Manzil, Odisha, India'
    },
    announcementBarText: {
      type: String,
      default: '✨ Special Launch Offer: Free Express Shipping on orders above ₹799! Code: WELCOME10 for 10% off'
    },
    announcementBarActive: {
      type: Boolean,
      default: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    currencySymbol: {
      type: String,
      default: '₹'
    },
    shippingCharge: {
      type: Number,
      default: 70
    },
    freeShippingThreshold: {
      type: Number,
      default: 799
    },
    giftWrapCharge: {
      type: Number,
      default: 49
    },
    socialLinks: {
      instagram: { type: String, default: 'https://www.instagram.com/ques.m_dgn91?xtok=MW83eHF4ejYxcWlm' },
      facebook: { type: String, default: 'https://facebook.com/quesmdesign' },
      youtube: { type: String, default: 'https://youtube.com/@quesmdesign' },
      whatsapp: { type: String, default: 'https://wa.me/917978201960' }
    },
    seoDefaults: {
      title: { type: String, default: 'QueS.M design | Luxury Handmade Accessories & Jewelry' },
      description: { type: String, default: 'Discover exquisite handmade silk thread bangles, bridal flower jewellery, earrings, bag charms, and custom phone covers.' },
      keywords: { type: String, default: 'handmade accessories, silk thread bangles, flower jewellery, handmade earrings, phone charms, QueSM design' }
    },
    enableCod: {
      type: Boolean,
      default: true
    },
    enableRazorpay: {
      type: Boolean,
      default: true
    },
    razorpayKeyId: {
      type: String,
      default: 'rzp_test_placeholder_key123'
    },
    googleAnalyticsId: {
      type: String,
      default: ''
    },
    metaPixelId: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', SettingSchema);
