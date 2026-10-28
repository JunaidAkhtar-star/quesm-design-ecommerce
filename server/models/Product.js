const mongoose = require('mongoose');

const VariantOptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Color', 'Size', 'Phone Model'
  value: { type: String, required: true }, // e.g., 'Royal Gold & Maroon', '2.4', 'iPhone 15'
  priceAdjustment: { type: Number, default: 0 },
  stock: { type: Number, default: 10 }
}, { _id: false });

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify category']
    },
    categorySlug: {
      type: String,
      required: true,
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Please enter product regular price'],
      min: 0
    },
    discountedPrice: {
      type: Number,
      default: null,
      min: 0
    },
    description: {
      type: String,
      required: [true, 'Please enter product description']
    },
    shortDescription: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one product image'],
      validate: [val => val.length > 0, 'At least one image is required']
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 15,
      min: 0
    },
    variants: [VariantOptionSchema],
    tags: {
      type: [String],
      default: [],
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isNewArrival: {
      type: Boolean,
      default: false,
      index: true
    },
    isBestSeller: {
      type: Boolean,
      default: false,
      index: true
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    seoTitle: {
      type: String,
      default: ''
    },
    seoDescription: {
      type: String,
      default: ''
    },
    materials: {
      type: String,
      default: 'Handmade Silk Thread, Gold Zari, Kundan Stones, Premium Base'
    },
    careInstructions: {
      type: String,
      default: 'Keep away from moisture, perfume and harsh chemicals. Store in an airtight box or pouch.'
    }
  },
  { timestamps: true }
);

// Text index for live search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
