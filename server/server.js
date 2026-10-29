require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const contactRoutes = require('./routes/contactRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const settingRoutes = require('./routes/settingRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Models for sitemap
const Product = require('./models/Product');
const Category = require('./models/Category');

const app = express();

// Connect to Database
connectDB();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false // Allows loading local images in dev
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev flexible
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'quesm_cookie_secret'));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve static assets from server public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// SEO: Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /studio-vault
Disallow: /studio-portal
Disallow: /owner-login
Disallow: /api/

Sitemap: ${clientUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// SEO: Dynamic sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const products = await Product.find().select('slug updatedAt');
    const categories = await Category.find().select('slug updatedAt');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${clientUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${clientUrl}/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${clientUrl}/about</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${clientUrl}/contact</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${clientUrl}/track-order</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    categories.forEach((cat) => {
      xml += `  <url>
    <loc>${clientUrl}/category/${cat.slug}</loc>
    <lastmod>${(cat.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    products.forEach((prod) => {
      xml += `  <url>
    <loc>${clientUrl}/product/${prod.slug}</loc>
    <lastmod>${(prod.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

// Apply API general limiter to /api
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    brand: 'QueS.M design',
    time: new Date().toISOString()
  });
});

// Test send live email endpoint
app.get('/api/health/send-test-email', async (req, res) => {
  const to = req.query.to || 'contactquesmdesign@gmail.com';
  try {
    const { sendCustomerOrderEmail } = require('./utils/email');
    const mockOrder = {
      orderNumber: 'TEST-' + Date.now().toString().slice(-4),
      customer: { name: 'Junaid Akhtar', email: to, phone: '7978201960' },
      items: [{ name: 'Silk Thread Royal Bangle', quantity: 1, total: 499 }],
      subtotal: 499,
      shippingFee: 0,
      totalAmount: 499,
      paymentMethod: 'cod',
      paymentStatus: 'pending'
    };
    
    // Direct call to Resend to inspect exact response
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'No RESEND_API_KEY set' });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'QueS.M design <onboarding@resend.dev>',
        to: [to],
        subject: 'QueS.M design - Live Test Email',
        html: '<h2>Order Confirmation Test</h2><p>Your email system on Render is connected!</p>'
      })
    });

    const data = await resendRes.json();
    return res.status(resendRes.ok ? 200 : 400).json({
      resendStatus: resendRes.status,
      resendOk: resendRes.ok,
      data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
  const hasResend = !!process.env.RESEND_API_KEY;
  const hasUser = !!process.env.SMTP_USER;
  const hasPass = !!process.env.SMTP_PASS;

  if (hasResend) {
    try {
      const resendRes = await fetch('https://api.resend.com/api-keys', {
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}` }
      });
      if (resendRes.ok) {
        return res.status(200).json({
          status: 'ok',
          provider: 'Resend (HTTPS Port 443 - Fully Unblocked)',
          message: 'Email service is 100% operational on Render! Order emails will deliver instantly.'
        });
      }
    } catch (e) {
      // Continue to SMTP check
    }
  }

  const host = req.query.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = req.query.port || process.env.SMTP_PORT || '587';
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '(not set)';

  if (!hasUser || !hasPass) {
    return res.status(200).json({
      status: 'error',
      message: 'SMTP credentials missing from environment variables on Render',
      hasUser,
      hasPass,
      host,
      port,
      user
    });
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      connectionTimeout: 3000,
      greetingTimeout: 3000,
      socketTimeout: 3000,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '')
      }
    });
    await transporter.verify();
    return res.status(200).json({
      status: 'ok',
      message: 'Google SMTP Connected & Ready! Emails will deliver.',
      host,
      port,
      user
    });
  } catch (err) {
    return res.status(200).json({
      status: 'smtp_failed',
      error: err.message,
      code: err.code,
      host,
      port,
      user
    });
  }
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[QueS.M design Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
