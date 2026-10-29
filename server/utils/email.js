const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });
const nodemailer = require('nodemailer');


// Universal Email Dispatcher: Resend HTTPS (Port 443, never blocked) + SMTP fallback
const dispatchEmail = async ({ to, subject, html, text, replyTo, headers }) => {
  // 1. If RESEND_API_KEY exists, send via HTTPS on port 443 (100% works on Render & Vercel)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'QueS.M design <onboarding@resend.dev>',
          to: Array.isArray(to) ? to : [to],
          reply_to: replyTo,
          subject,
          html,
          text
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`[Email via Resend HTTPS] Delivered to ${to} (ID: ${data.id})`);
        return true;
      } else {
        console.warn('[Resend API Error]:', data);
      }
    } catch (err) {
      console.warn('[Resend API Exception]:', err.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  const transporter = createTransporter();
  if (transporter) {
    try {
      const storeEmail = process.env.STORE_EMAIL || 'contactquesmdesign@gmail.com';
      const cleanFrom = process.env.FROM_EMAIL
        ? process.env.FROM_EMAIL.trim().replace(/^["']|["']$/g, '')
        : `"QueS.M design" <${storeEmail}>`;

      const info = await transporter.sendMail({
        from: cleanFrom,
        to,
        replyTo: replyTo || storeEmail,
        subject,
        text,
        html,
        headers
      });
      console.log(`[Email via SMTP] Delivered to ${to} (MsgId: ${info.messageId})`);
      return true;
    } catch (smtpErr) {
      console.warn('[SMTP Error]:', smtpErr.message);
    }
  }

  console.warn(`[Email Simulated] No active mail provider. Ready for ${to} | "${subject}"`);
  return false;
};

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT) || 587;
    const cleanUser = process.env.SMTP_USER.trim();
    const cleanPass = process.env.SMTP_PASS.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: port === 465,
      connectionTimeout: 5000,
      greetingTimeout: 4000,
      socketTimeout: 6000,
      auth: {
        user: cleanUser,
        pass: cleanPass
      }
    });
  }
  return null;
};

// Send Order Confirmation to Customer
const sendCustomerOrderEmail = async (order) => {
  try {
    if (!order || !order.customer || !order.customer.email) {
      console.log(`[Email Notice] No customer email provided for order #${order?.orderNumber || 'unknown'}`);
      return;
    }

    const transporter = createTransporter();
    const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const isLocal = rawClientUrl.includes('localhost') || rawClientUrl.includes('127.0.0.1');
    const storeEmail = process.env.STORE_EMAIL || 'contactquesmdesign@gmail.com';
    const whatsappNum = process.env.WHATSAPP_NUMBER || '917978201960';

    // In local development, avoid linking to non-existent domains which trigger Google Safe Browsing spam flags
    const trackOrderUrl = isLocal
      ? `https://wa.me/${whatsappNum}?text=Hello%20QueS.M%20Design,%20please%20update%20me%20on%20my%20Order%20${encodeURIComponent(order.orderNumber)}`
      : `${rawClientUrl}/track-order?orderId=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customer.phone || '')}`;

    const itemsListHtml = order.items
      .map(
        item => `
        <tr style="border-bottom: 1px solid #f0ede6;">
          <td style="padding: 12px 8px; font-size: 14px; color: #1a1a1a;">
            <strong>${item.name}</strong>
            ${item.variant ? `<br><span style="color: #888; font-size: 12px;">Variant: ${item.variant}</span>` : ''}
          </td>
          <td style="padding: 12px 8px; text-align: center; font-size: 14px; color: #555;">${item.quantity}</td>
          <td style="padding: 12px 8px; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">₹${item.total.toLocaleString('en-IN')}</td>
        </tr>`
      )
      .join('');

    const isPaid = order.paymentStatus === 'paid';
    const paymentLabel = order.paymentMethod === 'cod'
      ? 'Cash on Delivery (Pay at doorstep)'
      : (isPaid ? 'Online Payment (Verified & Paid ✅)' : 'Online Payment (Pending)');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${order.orderNumber}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #faf8f5; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #ede7db;">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" style="background: #111114; padding: 28px 20px; border-bottom: 3px solid #d4af37;">
                    <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 26px; margin: 0; letter-spacing: 1.5px;">QueS.M design</h1>
                    <p style="color: #d4af37; margin: 4px 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Handcrafted Luxury • Artisanal Accessories</p>
                  </td>
                </tr>

                <!-- Hero Order Box -->
                <tr>
                  <td style="padding: 30px 28px 20px;">
                    <div style="text-align: center; margin-bottom: 22px;">
                      <span style="display: inline-block; background: #eef8ee; color: #2e7d32; border: 1px solid #c8e6c9; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                        Order Placed Successfully
                      </span>
                      <h2 style="color: #111; font-family: Georgia, serif; font-size: 22px; margin: 12px 0 6px;">Thank You, ${order.customer.name}!</h2>
                      <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">We have received your order. Our master artisans are preparing your handmade pieces with love.</p>
                    </div>

                    <!-- Order ID Highlight Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fbf9f4; border: 1px solid #e8dec8; border-radius: 10px; margin: 18px 0; text-align: center;">
                      <tr>
                        <td style="padding: 16px;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #88723a; font-weight: bold; margin-bottom: 4px;">YOUR ORDER ID</div>
                          <div style="font-size: 22px; font-weight: bold; color: #111; font-family: 'Courier New', monospace; letter-spacing: 1px;">#${order.orderNumber}</div>
                          <div style="font-size: 12px; color: #777; margin-top: 4px;">Placed on: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Track Order CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td align="center">
                          <a href="${trackOrderUrl}" style="display: inline-block; background-color: #b89742; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                            ${isLocal ? 'Track & Support on WhatsApp' : 'Track Your Order Live'}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Order Summary Table -->
                    <div style="margin-top: 26px;">
                      <h3 style="color: #111; font-size: 16px; margin: 0 0 12px; border-bottom: 2px solid #ede7db; padding-bottom: 8px;">Order Summary</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                        <thead>
                          <tr style="border-bottom: 1px solid #ddd; background: #faf8f5;">
                            <th align="left" style="padding: 8px; font-size: 12px; color: #666; text-transform: uppercase;">Item</th>
                            <th align="center" style="padding: 8px; font-size: 12px; color: #666; text-transform: uppercase;">Qty</th>
                            <th align="right" style="padding: 8px; font-size: 12px; color: #666; text-transform: uppercase;">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsListHtml}
                        </tbody>
                      </table>

                      <!-- Price Breakdown -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 14px; font-size: 14px; color: #555;">
                        <tr>
                          <td style="padding: 4px 8px;" align="right">Subtotal:</td>
                          <td style="padding: 4px 8px; width: 120px;" align="right">₹${order.subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 8px;" align="right">Shipping:</td>
                          <td style="padding: 4px 8px; color: #2e7d32; font-weight: 600;" align="right">${order.shippingFee === 0 ? 'Complimentary' : `₹${order.shippingFee}`}</td>
                        </tr>
                        ${order.discount > 0 ? `
                        <tr>
                          <td style="padding: 4px 8px; color: #2e7d32;" align="right">Discount (${order.couponApplied?.code || 'Coupon'}):</td>
                          <td style="padding: 4px 8px; color: #2e7d32; font-weight:bold;" align="right">-₹${order.discount.toLocaleString('en-IN')}</td>
                        </tr>` : ''}
                        ${order.giftWrap ? `
                        <tr>
                          <td style="padding: 4px 8px; color: #b89742;" align="right">Luxury Gift Wrap:</td>
                          <td style="padding: 4px 8px;" align="right">₹${order.giftWrapFee}</td>
                        </tr>` : ''}
                        <tr style="border-top: 2px solid #ede7db;">
                          <td style="padding: 10px 8px 4px; font-size: 16px; font-weight: bold; color: #111;" align="right">Grand Total:</td>
                          <td style="padding: 10px 8px 4px; font-size: 17px; font-weight: bold; color: #111;" align="right">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Shipping & Payment Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; background: #faf8f5; border: 1px solid #eee; border-radius: 8px;">
                      <tr>
                        <td style="padding: 16px; font-size: 13px; line-height: 1.6; color: #444; width: 50%; vertical-align: top; border-right: 1px solid #eee;">
                          <strong style="color: #111; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Delivery Address:</strong>
                          <strong>${order.customer.name}</strong><br>
                          ${order.customer.address}<br>
                          ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}<br>
                          Phone: ${order.customer.phone}
                        </td>
                        <td style="padding: 16px; font-size: 13px; line-height: 1.6; color: #444; width: 50%; vertical-align: top;">
                          <strong style="color: #111; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Payment Details:</strong>
                          <span>${paymentLabel}</span><br>
                          <span style="font-size: 12px; color: #777;">Delivery timeline: 3–7 business days</span><br>
                          ${order.giftWrap && order.giftMessage ? `<div style="margin-top: 6px; font-style: italic; color: #aa820a; font-size: 12px;">Gift Note: "${order.giftMessage}"</div>` : ''}
                        </td>
                      </tr>
                    </table>

                    ${!isLocal ? `
                    <!-- Customer Portal Navigation -->
                    <div style="text-align: center; margin-top: 26px; padding-top: 20px; border-top: 1px dashed #ddd;">
                      <a href="${rawClientUrl}/my-orders" style="color: #b89742; font-size: 13px; text-decoration: none; font-weight: bold; margin: 0 12px;">
                        View All My Orders
                      </a>
                      <span style="color: #ccc;">•</span>
                      <a href="${rawClientUrl}/shop" style="color: #b89742; font-size: 13px; text-decoration: none; font-weight: bold; margin: 0 12px;">
                        Continue Shopping
                      </a>
                    </div>` : ''}
                  </td>
                </tr>

                <!-- Footer Support Note -->
                <tr>
                  <td style="background: #fbf9f4; padding: 22px 20px; text-align: center; border-top: 1px solid #ede7db; font-size: 12px; color: #777;">
                    <p style="margin: 0 0 6px;">Need assistance with your order? We are always here to help.</p>
                    <p style="margin: 0;">
                      WhatsApp: <a href="https://wa.me/${whatsappNum}" style="color: #25D366; font-weight: bold; text-decoration: none;">+${whatsappNum}</a>
                      &nbsp;|&nbsp;
                      Email: <a href="mailto:${storeEmail}" style="color: #aa820a; text-decoration: none; font-weight: bold;">${storeEmail}</a>
                    </p>
                    <p style="margin: 12px 0 0; color: #aaa; font-size: 11px;">
                      © ${new Date().getFullYear()} QueS.M design. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const plainText = [
      `QueS.M design - Order Confirmation #${order.orderNumber}`,
      `Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}`,
      ``,
      `Dear ${order.customer.name},`,
      `Thank you for shopping with QueS.M design. We have received your order and our master artisans are preparing your handcrafted pieces.`,
      ``,
      `--- Order Summary ---`,
      ...order.items.map(i => `• ${i.name}${i.variant ? ` (${i.variant})` : ''} x ${i.quantity} - ₹${i.total.toLocaleString('en-IN')}`),
      ``,
      `Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}`,
      `Shipping: ${order.shippingFee === 0 ? 'Complimentary' : '₹' + order.shippingFee}`,
      order.discount > 0 ? `Discount (${order.couponApplied?.code || 'Coupon'}): -₹${order.discount.toLocaleString('en-IN')}` : '',
      `Total Amount: ₹${order.totalAmount.toLocaleString('en-IN')}`,
      `Payment: ${paymentLabel}`,
      ``,
      `--- Delivery Address ---`,
      `${order.customer.name}`,
      `${order.customer.address}`,
      `${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`,
      `Phone: ${order.customer.phone}`,
      ``,
      `--- Track Your Order ---`,
      `Track live delivery status: ${trackOrderUrl}`,
      ``,
      `Need help? Email: ${storeEmail} | WhatsApp: +${whatsappNum}`,
      `QueS.M design • Handcrafted Luxury Boutique`
    ].filter(Boolean).join('\n');

    if (transporter) {
      const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || `"QueS.M design" <${storeEmail}>`,
        to: order.customer.email,
        replyTo: storeEmail,
        subject: `Order Confirmation #${order.orderNumber} | QueS.M design`,
        text: plainText,
        html,
        headers: {
          'X-Entity-Ref-ID': order.orderNumber,
          'X-Auto-Response-Suppress': 'All'
        }
      });
      console.log(`[Email] Customer order confirmation sent to ${order.customer.email} (Order #${order.orderNumber}, MsgId: ${info.messageId})`);
    } else {
      console.log(`[Email Simulated] Order confirmation ready for ${order.customer.email} (Order #${order.orderNumber}, Total: ₹${order.totalAmount})`);
    }
  } catch (err) {
    console.warn('[Email Warning] Could not send customer order confirmation email:', err.message);
  }
};

// Send New Order Notification to Admin
const sendAdminNewOrderEmail = async (order) => {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.OWNER_EMAIL || 'contactquesmdesign@gmail.com';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #d4af37; border-radius: 8px;">
        <h2 style="color: #aa820a;">🛍️ New Order Received: #${order.orderNumber}</h2>
        <p><strong>Customer:</strong> ${order.customer.name} (${order.customer.phone})</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})</p>
        <p><strong>Items:</strong> ${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
        ${order.giftWrap ? `<p><strong>🎁 Gift Wrap Requested!</strong> Message: "${order.giftMessage}"</p>` : ''}
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders" style="display:inline-block; padding: 10px 18px; background: #121212; color: #d4af37; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">Open Order in Admin Panel</a>
      </div>
    `;

    if (transporter) {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || '"QueS.M design Store" <contactquesmdesign@gmail.com>',
        to: adminEmail,
        subject: `[New Order] #${order.orderNumber} - ₹${order.totalAmount} from ${order.customer.name}`,
        html
      });
    } else {
      console.log(`[Email Simulated] Owner notified of new Order #${order.orderNumber} (₹${order.totalAmount})`);
    }
  } catch (err) {
    console.warn('[Email Warning] Could not send admin notification:', err.message);
  }
};

// Send Login Alert to Owner
const sendAdminLoginAlert = async ({ email, ip, userAgent, time }) => {
  try {
    const transporter = createTransporter();
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #121212; border-radius: 8px;">
        <h2 style="color: #d4af37;">🔒 Owner Login Alert - QueS.M design</h2>
        <p>A new admin login to your store occurred on:</p>
        <ul>
          <li><strong>Time:</strong> ${new Date(time).toLocaleString()}</li>
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Device/Browser:</strong> ${userAgent}</li>
        </ul>
        <p style="color: #666;">If this was you, you can safely ignore this alert. If not, log in immediately and update your master password.</p>
      </div>
    `;

    if (transporter) {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || '"QueS.M Security" <contactquesmdesign@gmail.com>',
        to: email,
        subject: `[Security Alert] QueS.M Admin Login from ${ip}`,
        html
      });
    } else {
      console.log(`[Security Alert Simulated] Admin login alert for ${email} from ${ip}`);
    }
  } catch (err) {
    console.warn('[Email Warning] Could not send login alert:', err.message);
  }
};

// Send Order Status Update Email (e.g. Shipped with Tracking Number)
const sendCustomerOrderStatusEmail = async (order, status, trackingCourier, trackingNumber, note) => {
  try {
    if (!order || !order.customer || !order.customer.email) return;

    const transporter = createTransporter();
    const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const isLocal = rawClientUrl.includes('localhost') || rawClientUrl.includes('127.0.0.1');
    const publicBaseUrl = isLocal ? 'https://ques-m-design.vercel.app' : rawClientUrl;
    const trackOrderUrl = `${publicBaseUrl}/track-order?orderId=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customer.phone || '')}`;
    const storeEmail = process.env.STORE_EMAIL || 'contactquesmdesign@gmail.com';
    const whatsappNum = process.env.WHATSAPP_NUMBER || '917978201960';

    const statusTitleMap = {
      Shipped: 'Your Order Has Been Dispatched',
      Delivered: 'Your Order Has Been Delivered',
      Processing: 'Your Order is in Production',
      Cancelled: 'Order Cancellation Notice'
    };

    const statusTitle = statusTitleMap[status] || `Order Update: ${status}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 30px 10px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #ede7db;">
                <tr>
                  <td align="center" style="background: #111114; padding: 24px 20px; border-bottom: 3px solid #d4af37;">
                    <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 24px; margin: 0;">QueS.M design</h1>
                    <p style="color: #d4af37; margin: 4px 0 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Handcrafted Luxury</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 28px;">
                    <h2 style="color: #111; font-family: Georgia, serif; font-size: 20px; margin: 0 0 10px;">${statusTitle}</h2>
                    <p style="color: #555; font-size: 14px; line-height: 1.6;">
                      Dear <strong>${order.customer.name}</strong>, your order <strong>#${order.orderNumber}</strong> has been updated to <strong>${status}</strong>.
                    </p>

                    ${(trackingNumber || order.trackingNumber) ? `
                    <div style="background: #fbf9f4; border: 1px solid #e8dec8; border-radius: 8px; padding: 16px; margin: 20px 0;">
                      <div style="font-size: 11px; text-transform: uppercase; color: #88723a; font-weight: bold;">Courier Tracking Details</div>
                      <div style="font-size: 15px; margin-top: 4px; color: #111;">
                        <strong>Courier:</strong> ${trackingCourier || order.trackingCourier || 'Express Partner'}<br>
                        <strong>Tracking #:</strong> <span style="font-family: monospace; font-weight: bold; color: #aa820a;">${trackingNumber || order.trackingNumber}</span>
                      </div>
                    </div>` : ''}

                    ${note ? `<p style="font-size: 13px; color: #666; font-style: italic; background: #faf8f5; padding: 10px 14px; border-left: 3px solid #d4af37;">Note: ${note}</p>` : ''}

                    <div style="text-align: center; margin: 24px 0;">
                      <a href="${trackOrderUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #aa820a 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                        Track Package Live
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background: #fbf9f4; padding: 18px; text-align: center; border-top: 1px solid #ede7db; font-size: 12px; color: #777;">
                    Questions? WhatsApp <a href="https://wa.me/${whatsappNum}" style="color: #25D366; font-weight: bold;">+${whatsappNum}</a> | Email <a href="mailto:${storeEmail}" style="color: #aa820a;">${storeEmail}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const plainText = [
      `QueS.M design - Order Status Update`,
      `Order ID: #${order.orderNumber}`,
      `Status: ${status}`,
      ``,
      `Dear ${order.customer.name},`,
      `Your order #${order.orderNumber} status has been updated to: ${status}.`,
      (trackingNumber || order.trackingNumber) ? `Courier: ${trackingCourier || order.trackingCourier || 'Express Partner'}\nTracking Number: ${trackingNumber || order.trackingNumber}` : '',
      note ? `Note: ${note}` : '',
      ``,
      `Track your package live: ${trackOrderUrl}`,
      ``,
      `Need assistance? WhatsApp: +${whatsappNum} | Email: ${storeEmail}`,
      `QueS.M design • Handcrafted Luxury Boutique`
    ].filter(Boolean).join('\n');

    if (transporter) {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || `"QueS.M design" <${storeEmail}>`,
        to: order.customer.email,
        replyTo: storeEmail,
        subject: `Order Update #${order.orderNumber}: ${status} | QueS.M design`,
        text: plainText,
        html,
        headers: {
          'X-Entity-Ref-ID': order.orderNumber,
          'X-Auto-Response-Suppress': 'All'
        }
      });
      console.log(`[Email] Order status update (${status}) sent to ${order.customer.email}`);
    }
  } catch (err) {
    console.warn('[Email Warning] Could not send status update email:', err.message);
  }
};

module.exports = {
  sendCustomerOrderEmail,
  sendCustomerOrderStatusEmail,
  sendAdminNewOrderEmail,
  sendAdminLoginAlert
};
