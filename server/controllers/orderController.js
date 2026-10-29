const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Setting = require('../models/Setting');
const ActivityLog = require('../models/ActivityLog');
const { sendCustomerOrderEmail, sendAdminNewOrderEmail, sendCustomerOrderStatusEmail } = require('../utils/email');

// Helper to generate human-readable order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `QSM-${dateStr}-${randomPart}`;
};

// @desc    Create new guest order
// @route   POST /api/orders
// @access  Public (Guest Checkout)
exports.createGuestOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      paymentMethod,
      couponCode,
      giftWrap,
      giftMessage,
      notes
    } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.pincode) {
      return res.status(400).json({ success: false, message: 'Please provide all required shipping details' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Fetch settings for shipping and gift wrap fees
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    // Verify products and calculate items subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product "${item.name}" is no longer available` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}`
        });
      }

      const effectivePrice = product.discountedPrice && product.discountedPrice > 0
        ? product.discountedPrice
        : product.price;

      const itemTotal = effectivePrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] || '',
        variant: item.variant || '',
        price: effectivePrice,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // Coupon discount calculation
    let discount = 0;
    let appliedCouponData = { code: null, discountAmount: 0 };

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
        expiryDate: { $gte: new Date() }
      });

      if (coupon) {
        if (subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
              discount = coupon.maxDiscountAmount;
            }
          } else {
            discount = coupon.discountValue;
          }
          appliedCouponData = {
            code: coupon.code,
            discountAmount: discount
          };
          // Increment coupon usage
          await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
        }
      }
    }

    // Shipping fee calculation
    let shippingFee = 0;
    if (subtotal < settings.freeShippingThreshold) {
      shippingFee = settings.shippingCharge;
    }

    // Gift wrap fee
    let giftWrapFee = 0;
    if (giftWrap) {
      giftWrapFee = settings.giftWrapCharge || 49;
    }

    const totalAmount = Math.max(0, subtotal + shippingFee + giftWrapFee - discount);
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer,
      items: validatedItems,
      subtotal,
      shippingFee,
      discount,
      giftWrapFee,
      giftWrap: !!giftWrap,
      giftMessage: giftMessage || '',
      couponApplied: appliedCouponData,
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'Placed',
      notes: notes || '',
      timeline: [
        {
          status: 'Placed',
          timestamp: new Date(),
          note: 'Order successfully placed via guest checkout'
        }
      ]
    });

    // Deduct stock for each product
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // Send notifications concurrently and await delivery before returning
    try {
      const emailResults = await Promise.allSettled([
        sendCustomerOrderEmail(order),
        sendAdminNewOrderEmail(order)
      ]);
      console.log(`[Order Notifications] Email results for #${order.orderNumber}:`, emailResults.map(r => r.status));
    } catch (emailErr) {
      console.error(`[Order Notifications Error] Order #${order.orderNumber}:`, emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track order by Order Number and Phone Number
// @route   POST /api/orders/track
// @access  Public
exports.trackOrder = async (req, res) => {
  try {
    const { orderNumber, phone } = req.body;

    if (!orderNumber || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Order ID and Phone Number'
      });
    }

    // Normalize phone (strip spaces/dashes)
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    const order = await Order.findOne({
      orderNumber: orderNumber.trim().toUpperCase()
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found with this Order ID.'
      });
    }

    const orderPhoneClean = order.customer.phone.replace(/\D/g, '').slice(-10);
    if (orderPhoneClean !== cleanPhone) {
      return res.status(401).json({
        success: false,
        message: 'Phone number does not match this order.'
      });
    }

    res.status(200).json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        trackingNumber: order.trackingNumber,
        trackingCourier: order.trackingCourier,
        timeline: order.timeline,
        items: order.items,
        customerName: order.customer.name,
        city: order.customer.city,
        state: order.customer.state
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details by orderNumber (for order success page)
// @route   GET /api/orders/details/:orderNumber
// @access  Public
exports.getPublicOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber.toUpperCase() });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders for a customer (by phone, email, or stored order IDs)
// @route   POST /api/orders/my-orders
// @access  Public
exports.getCustomerOrders = async (req, res) => {
  try {
    const { identifier, orderNumbers } = req.body;
    let query = {};

    if (Array.isArray(orderNumbers) && orderNumbers.length > 0) {
      const cleanList = orderNumbers.map(n => String(n).trim().toUpperCase());
      query.orderNumber = { $in: cleanList };
    } else if (identifier && typeof identifier === 'string') {
      const clean = identifier.trim();
      if (clean.includes('@')) {
        query['customer.email'] = clean.toLowerCase();
      } else {
        const cleanPhone = clean.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length >= 6) {
          query['customer.phone'] = { $regex: cleanPhone };
        } else {
          return res.status(400).json({ success: false, message: 'Please enter at least 6 digits of your phone number.' });
        }
      }
    } else {
      return res.status(400).json({ success: false, message: 'Please enter your phone number or email to view your orders.' });
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .select('orderNumber items totalAmount paymentMethod paymentStatus orderStatus trackingNumber trackingCourier createdAt customer.name customer.city customer.state');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin
// @access  Private (Admin)
exports.getAdminOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.phone': searchRegex },
        { 'customer.email': searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      orders,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order details for admin (e.g. invoice/packing slip)
// @route   GET /api/orders/admin/:id
// @access  Private (Admin)
exports.getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status & add tracking
// @route   PUT /api/orders/admin/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, note, trackingNumber, trackingCourier, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updates = {};
    if (orderStatus && orderStatus !== order.orderStatus) {
      updates.orderStatus = orderStatus;
      updates.$push = {
        timeline: {
          status: orderStatus,
          timestamp: new Date(),
          note: note || `Status updated to ${orderStatus}`
        }
      };
    }

    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
    if (trackingCourier !== undefined) updates.trackingCourier = trackingCourier;
    if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (orderStatus && orderStatus !== order.orderStatus) {
      sendCustomerOrderStatusEmail(updatedOrder, orderStatus, trackingCourier, trackingNumber, note);
    }

    await ActivityLog.create({
      action: 'ORDER_STATUS_UPDATED',
      details: `Order #${order.orderNumber} updated to ${orderStatus || order.orderStatus}`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      adminEmail: req.admin.email
    });

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard analytics & statistics
// @route   GET /api/orders/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Sales metrics
    const totalSalesAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    const todaySalesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    const weekSalesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    const monthSalesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    // Pending orders count
    const pendingOrdersCount = await Order.countDocuments({
      orderStatus: { $in: ['Placed', 'Confirmed', 'Packed'] }
    });

    // Low stock products (< 5)
    const lowStockProducts = await Product.find({ stockQuantity: { $lte: 5 } })
      .select('name stockQuantity price images slug')
      .limit(6);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customer totalAmount orderStatus paymentMethod createdAt');

    // Sales trend (last 7 days)
    const salesLast7Days = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: totalSalesAgg[0]?.total || 0,
        totalOrders: totalSalesAgg[0]?.count || 0,
        todaySales: todaySalesAgg[0]?.total || 0,
        todayOrders: todaySalesAgg[0]?.count || 0,
        weekSales: weekSalesAgg[0]?.total || 0,
        monthSales: monthSalesAgg[0]?.total || 0,
        pendingOrdersCount,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        recentOrders,
        salesLast7Days
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export orders to CSV
// @route   GET /api/orders/admin/export-csv
// @access  Private (Admin)
exports.exportOrdersCsv = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    let csv = 'Order ID,Date,Customer Name,Phone,Email,City,State,Pincode,Items,Total Amount,Payment Method,Payment Status,Order Status,Tracking Number\n';

    orders.forEach((o) => {
      const itemsSummary = o.items.map(i => `${i.name} (x${i.quantity})`).join('; ').replace(/"/g, '""');
      const date = new Date(o.createdAt).toLocaleDateString('en-IN');
      csv += `"${o.orderNumber}","${date}","${o.customer.name}","${o.customer.phone}","${o.customer.email}","${o.customer.city}","${o.customer.state}","${o.customer.pincode}","${itemsSummary}",${o.totalAmount},"${o.paymentMethod}","${o.paymentStatus}","${o.orderStatus}","${o.trackingNumber || ''}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=QueSM_orders_${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
