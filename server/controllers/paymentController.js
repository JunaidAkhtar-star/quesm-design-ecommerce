const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { sendCustomerOrderEmail, sendAdminNewOrderEmail } = require('../utils/email');

// Initialize Razorpay instance safely
const getRazorpayInstance = () => {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    } catch (err) {
      console.warn('[Razorpay] Init warning:', err.message);
    }
  }
  return null;
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/order
// @access  Public
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const razorpay = getRazorpayInstance();

    // If Razorpay keys are configured and valid
    if (razorpay && !process.env.RAZORPAY_KEY_ID.includes('placeholder')) {
      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`
      };

      const razorpayOrder = await razorpay.orders.create(options);
      return res.status(200).json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    }

    // Seamless Mock / Sandbox fallback for development / test keys
    const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    res.status(200).json({
      success: true,
      orderId: mockOrderId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      isSandboxMock: true,
      message: 'Razorpay simulated environment ready'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Signature
// @route   POST /api/payments/razorpay/verify
// @access  Public
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber
    } = req.body;

    // Check if mock order
    if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
      const order = await Order.findOneAndUpdate(
        { orderNumber },
        {
          paymentStatus: 'paid',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_signature_verified'
        },
        { new: true }
      );

      // Respond to client immediately so payment completion never hangs
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully (Mock)',
        order
      });

      // Dispatch notifications in background
      if (order) {
        setImmediate(async () => {
          try {
            await Promise.allSettled([
              sendCustomerOrderEmail(order),
              sendAdminNewOrderEmail(order)
            ]);
          } catch (emailErr) {
            console.warn(`[Payment Notification Error] Order #${order.orderNumber}:`, emailErr.message);
          }
        });
      }
      return;
    }

    // Server-side HMAC SHA-256 signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: invalid signature.'
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderNumber },
      {
        paymentStatus: 'paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature
      },
      { new: true }
    );

    if (order) {
      sendCustomerOrderEmail(order);
      sendAdminNewOrderEmail(order);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
