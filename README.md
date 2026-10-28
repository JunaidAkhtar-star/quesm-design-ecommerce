# QueS.M design — Production-Ready Handmade Accessories E-Commerce Website

A luxury, boutique e-commerce platform built for the artisanal handmade accessories brand **QueS.M design**. Features a high-converting, mobile-first guest storefront and an owner-only admin panel for full store management.

---

## 🌟 Brand Theme & Visual Identity
- **Logo Integration:** Authentic circular badge with metallic gold script and botanical floral accents (`/logo.png`, `/favicon.png`).
- **Color Palette:**
  - Obsidian Luxury Black (`#0F0F12`)
  - Warm Champagne & Radiant Gold (`#D4AF37`, `#F0D58C`, `#AA820A`)
  - Warm Cream & Soft Ivory (`#FAF9F5`, `#F4F0E6`)
  - Forest Emerald & Ruby Accents
- **Typography:** Google Fonts *Playfair Display* & *Cormorant Garamond* (headings) + *Plus Jakarta Sans* (body).
- **Aesthetic:** Artisanal luxury boutique feel with soft golden shadows, rounded pill buttons, micro-interactions, and glassmorphism.

---

## 🛍️ Features Summary

### 1. Public Storefront (No Customer Login Required)
- **Home:** Hero banner slider, 7 category tiles, featured pieces, new arrivals, best sellers, customer testimonials, Instagram community strip, and WhatsApp VIP club box.
- **Shop & Catalog:** Full filtering (Category, Price Slider ₹200–₹3,000, In-Stock only, Special Offers, 4★+ rating), sorting (Price low-high, high-low, newest, popular), pagination.
- **Product Detail:** Interactive image gallery with hover zoom, variants (sizes 2.4/2.6/2.8, colors, phone models), dynamic price calculation, Add to Bag, Buy Now, Add to Wishlist, WhatsApp "Order on WhatsApp" prefilled button, out-of-stock "Notify me on WhatsApp", materials & care guides, and customer reviews.
- **Shopping Bag & Cart Drawer:** Slide-out drawer with free shipping progress bar, quantity editing, coupon code validation, and gift wrapping option with personalized message.
- **Guest Checkout:** Direct checkout with Name, Phone, Email, Address, PIN code. Choose between Cash on Delivery (COD) or Online Razorpay (UPI, Cards, NetBanking).
- **Order Success:** Order confirmation screen with celebratory confetti and unique Order ID (`QSM-YYYYMMDD-XXXX`).
- **Real-Time Order Tracking:** Customer enters Order ID + Phone Number to see 5-stage progression (`Placed` ➔ `Confirmed` ➔ `Packed` ➔ `Shipped` ➔ `Delivered`), courier AWB, and event timeline.
- **Wishlist:** Stored in browser `localStorage`.
- **Live Search:** Instant modal search with debounced autocomplete by product name, category, or tag.
- **Languages (i18n):** Instant one-click switch between **English** and **Hindi (हिन्दी)**.
- **Recently Viewed Products:** Automatically tracked in `localStorage`.
- **Abandoned-Cart Reminder:** Browser-based gentle reminder if customer leaves pieces in bag.
- **Floating WhatsApp:** Fixed button on every page with prefilled assistance message.

---

### 2. Owner-Only Admin Panel (`/studio-vault` & `/admin/*`)
- **Single Owner Architecture:** Exactly ONE administrator account; no customer registration.
- **Hidden Secret Login Route:** `/studio-vault` (disallowed from search engines in `robots.txt` and removed from public footer).
- **Security Features:**
  - Password hashed with `bcryptjs` (salt rounds: 12)
  - JWT token stored in httpOnly, secure, sameSite cookie + Bearer header fallback
  - Brute-force rate limiting with 15-minute lockout after 5 failed attempts
  - Optional Two-Factor Authentication (TOTP via Google Authenticator with QR code generation)
  - Automatic session logout after 30 minutes of inactivity
  - Real-time audit activity log tracking IP address, user-agent device, action, and timestamp
  - Security headers via Helmet, input sanitization, and CORS restrictions
- **Admin Capabilities:**
  - **Dashboard:** Lifetime revenue, today's sales, weekly sales, pending dispatch orders count, low-stock inventory alerts (<5 units), and recent order activity.
  - **Orders Management:** Search by Order ID, filter by status, update status with courier AWB tracking number & timeline note, export CSV, and print invoice/packing slip.
  - **Products & Inventory:** Add/edit/delete products, manage variants, upload multiple photos, toggle featured/new flags, and bulk actions.
  - **Categories:** Manage the 7 categories and custom image banners.
  - **Coupons:** Create percentage or fixed-amount discounts with minimum spend and expiry dates.
  - **Hero Banners:** Create and toggle carousel slides on homepage.
  - **Reviews Moderation:** Approve, hide, or delete customer reviews before they appear publicly.
  - **Contact Inquiries:** View customer inquiries submitted from contact page.
  - **Store Settings:** Configure WhatsApp number, social URLs, free shipping threshold (default ₹799), shipping fee (default ₹70), announcement bar text, and change master password.

---

## 🗂️ Project Directory Structure

```
E-Commerce/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # Owner auth, lockout, 2FA, JWT
│   │   ├── productController.js  # Catalog search, filter, pagination, CRUD
│   │   ├── categoryController.js # Category management & product counts
│   │   ├── orderController.js    # Guest checkout, tracking, CSV, invoice data
│   │   ├── paymentController.js  # Razorpay order & HMAC SHA-256 signature verify
│   │   ├── reviewController.js   # Customer review submission & moderation
│   │   ├── couponController.js   # Coupon validation & management
│   │   ├── contactController.js  # Contact inquiry inbox
│   │   ├── bannerController.js   # Hero carousel slides
│   │   ├── settingController.js  # Public & private store settings
│   │   └── activityLogController.js # Security audit logs
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & admin guard
│   │   ├── errorHandler.js       # Centralized error handler
│   │   ├── rateLimiter.js        # Login & API rate limiters
│   │   └── upload.js             # Multer image upload
│   ├── models/
│   │   ├── AdminUser.js          # Owner account & 2FA schema
│   │   ├── Product.js            # Product & variant schema
│   │   ├── Category.js           # Category schema
│   │   ├── Order.js              # Order, customer, & timeline schema
│   │   ├── Review.js             # Review & rating schema
│   │   ├── Coupon.js             # Coupon discount schema
│   │   ├── ContactMessage.js     # Customer inquiry schema
│   │   ├── Banner.js             # Hero banner schema
│   │   ├── Setting.js            # Store configuration schema
│   │   └── ActivityLog.js        # Security audit log schema
│   ├── routes/                   # API endpoint routers
│   ├── utils/
│   │   ├── email.js              # Nodemailer order & security alerts
│   │   └── seed.js               # Database seeding script (21+ products)
│   ├── public/                   # Uploaded images, logo, favicon
│   ├── server.js                 # Main Express server entry point
│   ├── .env                      # Active environment variables
│   └── package.json
│
└── client/
    ├── public/
    │   ├── logo.png              # Brand logo
    │   └── favicon.png           # Brand favicon
    ├── src/
    │   ├── components/           # Navbar, Footer, Cards, Modals, Gallery
    │   ├── context/              # Language, Settings, Wishlist, Cart, Auth
    │   ├── pages/                # Home, Shop, ProductDetail, Cart, Checkout, etc.
    │   ├── styles/               # index.css & boutique.css design system
    │   ├── translations/         # en.js and hi.js translation dictionaries
    │   ├── App.jsx               # Main router & provider wrapper
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017 or a MongoDB Atlas connection string

### Step 1: Clone & Configure Server
```bash
cd server
npm install
```
Review `server/.env` to customize settings or MongoDB URI if necessary.

### Step 2: Seed the Database
Populates the 7 categories, 21+ initial handcrafted products, sample hero banners, coupons (`WELCOME10`, `FESTIVE20`, `HANDMADE100`), store settings, and the default owner account:
```bash
npm run seed
```
> **Default Owner Credentials:**
> - Email: `owner@quesmdesign.com`
> - Password: `Owner@QueSM2026!`

### Step 3: Start the Backend Server
```bash
npm start
# Server runs on http://localhost:5000
```

### Step 4: Install & Start Frontend Client
In a new terminal:
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🚢 Deployment Steps

### 1. Database: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Whitelist all IPs (`0.0.0.0/0`) in Network Access.
3. Obtain connection URI and set in server environment as `MONGO_URI`.
4. Run `npm run seed` once to populate initial products.

### 2. Backend: Render or Railway
1. Push repository to GitHub.
2. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service** pointing to `/server`.
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=<your-mongodb-atlas-uri>`
   - `CLIENT_URL=<your-frontend-domain>`
   - `JWT_SECRET=<strong-random-key>`
   - `RAZORPAY_KEY_ID=<your-razorpay-key>`
   - `RAZORPAY_KEY_SECRET=<your-razorpay-secret>`
   - `SMTP_USER` & `SMTP_PASS` (for transactional emails)

### 3. Frontend: Vercel or Netlify
1. In [Vercel](https://vercel.com) or [Netlify](https://netlify.com), import the repository and set Root Directory to `client`.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add rewrite rule for client-side routing in `vercel.json` or `_redirects` (`/* /index.html 200`).
6. Point Vite proxy / API base to your deployed backend URL.

---

## 📋 Owner Handoff Checklist
To launch the store for live commercial transactions, provide:

- [ ] **Custom Domain Name:** (e.g. `quesmdesign.com` or `quesm.in`)
- [ ] **Live Razorpay Account:** Activate account on [razorpay.com](https://razorpay.com) and obtain live `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`.
- [ ] **Business WhatsApp Number:** Set active WhatsApp number in admin store settings for floating chat and "Order on WhatsApp" buttons.
- [ ] **Official Social Media Links:** Instagram handle (`@quesmdesign`), Facebook page, YouTube channel.
- [ ] **Transactional Email SMTP:** (Gmail App Password or SendGrid / Amazon SES) to send automated order confirmation emails.
- [ ] **Product Photos & Prices:** Replace placeholder images in Admin Panel (`/studio-vault`) with authentic studio photos of your creations.
- [ ] **Courier Partner Account:** (Shiprocket, Delhivery, or India Post) for generating dispatch tracking numbers.
