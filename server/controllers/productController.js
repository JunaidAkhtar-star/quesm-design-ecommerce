const Product = require('../models/Product');
const Category = require('../models/Category');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all products with filters, sorting, search, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      categorySlug,
      minPrice,
      maxPrice,
      tag,
      inStock,
      onSale,
      minRating,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Search query
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { categorySlug: searchRegex }
      ];
    }

    // Category filter
    if (categorySlug && categorySlug !== 'all') {
      query.categorySlug = categorySlug.toLowerCase();
    } else if (category && category !== 'all') {
      query.category = category;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Tag filter
    if (tag) {
      query.tags = tag;
    }

    // In stock only
    if (inStock === 'true') {
      query.stockQuantity = { $gt: 0 };
    }

    // On sale (has discountedPrice)
    if (onSale === 'true') {
      query.discountedPrice = { $ne: null, $gt: 0 };
    }

    // Rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { isBestSeller: -1, rating: -1, numReviews: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Live search suggestions for instant autocomplete
// @route   GET /api/products/suggestions
// @access  Public
exports.getLiveSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({
      $or: [{ name: regex }, { tags: regex }, { categorySlug: regex }]
    })
      .select('name slug price discountedPrice images categorySlug')
      .limit(6);

    res.status(200).json({
      success: true,
      suggestions: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug.toLowerCase() })
      .populate('category', 'name slug description');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch related products from same category
    const relatedProducts = await Product.find({
      categorySlug: product.categorySlug,
      _id: { $ne: product._id }
    })
      .limit(4)
      .select('name slug price discountedPrice images rating numReviews categorySlug');

    res.status(200).json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .limit(8)
      .populate('category', 'name slug');
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('category', 'name slug');
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
exports.getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({ isBestSeller: true })
      .sort({ rating: -1, numReviews: -1 })
      .limit(8)
      .populate('category', 'name slug');
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    let {
      name,
      slug,
      category,
      price,
      discountedPrice,
      description,
      shortDescription,
      images,
      stockQuantity,
      variants,
      tags,
      isFeatured,
      isNewArrival,
      isBestSeller,
      seoTitle,
      seoDescription,
      materials,
      careInstructions
    } = req.body;

    // Generate slug if not provided
    if (!slug && name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Check slug collision
    let existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const catObj = await Category.findById(category);
    if (!catObj) {
      return res.status(400).json({ success: false, message: 'Invalid category specified' });
    }

    const product = await Product.create({
      name,
      slug,
      category,
      categorySlug: catObj.slug,
      price,
      discountedPrice: discountedPrice || null,
      description,
      shortDescription,
      images: Array.isArray(images) ? images : [images],
      stockQuantity: stockQuantity || 0,
      variants: variants || [],
      tags: tags || [],
      isFeatured: !!isFeatured,
      isNewArrival: !!isNewArrival,
      isBestSeller: !!isBestSeller,
      seoTitle: seoTitle || `${name} | QueS.M design`,
      seoDescription: seoDescription || shortDescription || description.slice(0, 150),
      materials,
      careInstructions
    });

    await ActivityLog.create({
      action: 'PRODUCT_CREATED',
      details: `Created product "${name}" (₹${price})`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.category && req.body.category !== product.category.toString()) {
      const catObj = await Category.findById(req.body.category);
      if (catObj) {
        req.body.categorySlug = catObj.slug;
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    await ActivityLog.create({
      action: 'PRODUCT_UPDATED',
      details: `Updated product "${product.name}"`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();

    await ActivityLog.create({
      action: 'PRODUCT_DELETED',
      details: `Deleted product "${product.name}"`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk update products (e.g., delete, toggle featured)
// @route   POST /api/products/bulk-action
// @access  Private (Admin)
exports.bulkAction = async (req, res) => {
  try {
    const { action, ids } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ success: false, message: 'No products selected' });
    }

    if (action === 'delete') {
      await Product.deleteMany({ _id: { $in: ids } });
    } else if (action === 'feature') {
      await Product.updateMany({ _id: { $in: ids } }, { isFeatured: true });
    } else if (action === 'unfeature') {
      await Product.updateMany({ _id: { $in: ids } }, { isFeatured: false });
    } else if (action === 'mark_out_of_stock') {
      await Product.updateMany({ _id: { $in: ids } }, { stockQuantity: 0 });
    }

    await ActivityLog.create({
      action: 'PRODUCT_BULK_ACTION',
      details: `Bulk ${action} on ${ids.length} products`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(200).json({
      success: true,
      message: `Successfully executed ${action} on ${ids.length} products`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
