require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Setting = require('../models/Setting');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');

const seedDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ques_m_design';
      await mongoose.connect(mongoUri);
      console.log('[Seed] Connected to MongoDB...');
    }

    // Clear existing collections
    await AdminUser.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    await Setting.deleteMany({});
    await Coupon.deleteMany({});
    await Review.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // 1. Seed Owner Admin User
    const ownerEmail = process.env.OWNER_EMAIL || 'contactquesmdesign@gmail.com';
    const ownerPassword = process.env.OWNER_PASSWORD || 'Owner@QueSM2026!';
    const ownerName = process.env.OWNER_NAME || 'Que S.M Owner';

    const owner = await AdminUser.create({
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      isTwoFactorEnabled: false
    });
    console.log(`[Seed] Owner account created: ${owner.email}`);

    // 2. Seed Store Settings
    const settings = await Setting.create({
      storeName: 'QueS.M design',
      tagline: 'Artisanal Elegance • Handmade With Love',
      storeEmail: 'contactquesmdesign@gmail.com',
      storePhone: process.env.STORE_PHONE || '+917978201960',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '917978201960',
      storeAddress: 'QueS.M design Studio Khan Manzil, Odisha, India',
      announcementBarText: '✨ Special Festive Offer: Free Express Shipping above ₹799! Use code WELCOME10 for 10% off',
      announcementBarActive: true,
      currency: 'INR',
      currencySymbol: '₹',
      shippingCharge: 70,
      freeShippingThreshold: 799,
      giftWrapCharge: 49,
      socialLinks: {
        instagram: 'https://www.instagram.com/ques.m_dgn91?xtok=MW83eHF4ejYxcWlm',
        facebook: 'https://facebook.com/quesmdesign',
        youtube: 'https://youtube.com/@quesmdesign',
        whatsapp: 'https://wa.me/917978201960'
      },
      seoDefaults: {
        title: 'QueS.M design | Handmade Accessories & Luxury Bridal Jewellery',
        description: 'Shop artisanal silk thread bangles, bridal flower jewellery, handmade earrings, designer phone charms, and custom cases handcrafted with love.',
        keywords: 'handmade accessories, silk thread bangles, bridal flower jewellery, phone charms, bag charms, QueSM design'
      },
      enableCod: true,
      enableRazorpay: true,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key123'
    });
    console.log('[Seed] Store settings created.');

    // 3. Seed Categories
    const categoriesData = [
      {
        name: 'Silk Thread Bangles',
        slug: 'silk-thread-bangles',
        description: 'Exquisite silk wrapped bangles adorned with Kundan, Zircon, and golden filigree beadwork.',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
        order: 1
      },
      {
        name: 'Bracelets',
        slug: 'bracelets',
        description: 'Delicate wristwear woven with cultured pearls, crystal beads, and gold charms.',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        order: 2
      },
      {
        name: 'Earrings',
        slug: 'earrings',
        description: 'Statement handmade jhumkas, chandbalis, studs, and lightweight tassel drops.',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
        order: 3
      },
      {
        name: 'Flower Jewellery',
        slug: 'flower-jewellery',
        description: 'Ethereal handcrafted floral sets for Haldi, Mehendi, Baby Showers, and festivities.',
        image: 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=800&q=80',
        order: 4
      },
      {
        name: 'Hair Accessories',
        slug: 'hair-accessories',
        description: 'Handmade hairpins, floral venis, embellished scrunchies, and pearl hair combs.',
        image: 'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=800&q=80',
        order: 5
      },
      {
        name: 'Phone Charms / Bag Charms',
        slug: 'phone-charms-bag-charms',
        description: 'Playful yet luxurious beaded charms, evil-eye amulets, and floral wrist straps.',
        image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
        order: 6
      },
      {
        name: 'Phone Covers',
        slug: 'phone-covers',
        description: 'Custom aesthetic phone cases crafted with resin, real pressed flowers, and gold foil.',
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
        order: 7
      }
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`[Seed] ${createdCategories.length} categories created.`);

    const catMap = {};
    createdCategories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    // 4. Seed Products (At least 3-4 per category = 24 products)
    const productsData = [
      // 1. Silk Thread Bangles
      {
        name: 'Royal Kundan Silk Thread Bangle Set',
        slug: 'royal-kundan-silk-thread-bangle-set',
        category: catMap['silk-thread-bangles'],
        categorySlug: 'silk-thread-bangles',
        price: 1299,
        discountedPrice: 999,
        description: 'Handcrafted luxury silk thread bangles embellished with authentic Kundan stones and delicate pearl ball borders. Created meticulously over 8 hours by master artisans.',
        shortDescription: 'Bridal Kundan silk thread bangles in regal maroon and antique gold.',
        images: [
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
        ],
        stockQuantity: 18,
        variants: [
          { name: 'Size', value: '2.4', priceAdjustment: 0, stock: 6 },
          { name: 'Size', value: '2.6', priceAdjustment: 0, stock: 8 },
          { name: 'Size', value: '2.8', priceAdjustment: 50, stock: 4 }
        ],
        tags: ['bangles', 'silk thread', 'bridal', 'kundan', 'festive'],
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        rating: 4.9,
        numReviews: 24,
        materials: 'Pure Raw Silk Thread, Brass Base, Gold Plated Kundan, Seed Pearls'
      },
      {
        name: 'Peacock Motif Emerald Silk Kada Pair',
        slug: 'peacock-motif-emerald-silk-kada-pair',
        category: catMap['silk-thread-bangles'],
        categorySlug: 'silk-thread-bangles',
        price: 849,
        discountedPrice: 699,
        description: 'Rich emerald green silk wrapped kada featuring antique brass peacock motifs and sparkling micro-zircon highlights. Perfect for festivals and traditional celebrations.',
        shortDescription: 'Emerald green silk thread kada with antique peacock metal charms.',
        images: [
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
        ],
        stockQuantity: 12,
        variants: [
          { name: 'Size', value: '2.4', priceAdjustment: 0, stock: 4 },
          { name: 'Size', value: '2.6', priceAdjustment: 0, stock: 5 },
          { name: 'Size', value: '2.8', priceAdjustment: 0, stock: 3 }
        ],
        tags: ['bangles', 'emerald', 'peacock', 'silk thread', 'traditional'],
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        rating: 4.8,
        numReviews: 14,
        materials: 'Silk Thread, Micro Zircon Crystals, Brass Charms'
      },
      {
        name: 'Pastel Blush Pink & Gold Ghungroo Bangles',
        slug: 'pastel-blush-pink-gold-ghungroo-bangles',
        category: catMap['silk-thread-bangles'],
        categorySlug: 'silk-thread-bangles',
        price: 699,
        discountedPrice: 549,
        description: 'Soft baby pink silk thread wrapped bangles accented with miniature brass ghungroos that emit a gentle musical chime. Subtle, feminine, and charming.',
        shortDescription: 'Soft blush pink silk bangles with gentle melodic ghungroos.',
        images: [
          'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
        ],
        stockQuantity: 20,
        variants: [
          { name: 'Size', value: '2.4', priceAdjustment: 0, stock: 8 },
          { name: 'Size', value: '2.6', priceAdjustment: 0, stock: 7 },
          { name: 'Size', value: '2.8', priceAdjustment: 0, stock: 5 }
        ],
        tags: ['bangles', 'pink', 'ghungroo', 'pastel', 'everyday luxury'],
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: true,
        rating: 4.7,
        numReviews: 19
      },

      // 2. Bracelets
      {
        name: 'Freshwater Pearl & Celestial Charm Bracelet',
        slug: 'freshwater-pearl-celestial-charm-bracelet',
        category: catMap['bracelets'],
        categorySlug: 'bracelets',
        price: 899,
        discountedPrice: 699,
        description: 'Natural baroque freshwater pearls strung with 18k gold-dipped moon and star charms. Adjustable toggle clasp ensures a comfortable fit on any wrist.',
        shortDescription: 'Organic baroque freshwater pearls with 18k gold-plated celestial charms.',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
        ],
        stockQuantity: 15,
        variants: [
          { name: 'Finish', value: '18k Gold Plated', priceAdjustment: 0, stock: 10 },
          { name: 'Finish', value: 'Rose Gold Plated', priceAdjustment: 50, stock: 5 }
        ],
        tags: ['bracelet', 'pearls', 'gold charms', 'celestial', 'gift'],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        rating: 5.0,
        numReviews: 31,
        materials: 'Genuine Freshwater Pearls, 18k Gold Plated Brass, Anti-Tarnish Coating'
      },
      {
        name: 'Boho Beaded Evil Eye Nazar Wristlet',
        slug: 'boho-beaded-evil-eye-nazar-wristlet',
        category: catMap['bracelets'],
        categorySlug: 'bracelets',
        price: 499,
        discountedPrice: 399,
        description: 'Handmade protective evil eye bracelet combining deep cobalt glass evil eye beads, turquoise stone accents, and gold spacers. Designed for everyday warding and style.',
        shortDescription: 'Artisan evil eye charm bracelet with turquoise and gold spacers.',
        images: [
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
        ],
        stockQuantity: 25,
        variants: [
          { name: 'Color', value: 'Classic Cobalt Blue', priceAdjustment: 0, stock: 15 },
          { name: 'Color', value: 'Rose Gold & White', priceAdjustment: 0, stock: 10 }
        ],
        tags: ['bracelet', 'evil eye', 'nazar', 'boho', 'amulet'],
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: true,
        rating: 4.8,
        numReviews: 18
      },
      {
        name: 'Gold Filigree Rose Quartz Adjustable Cuff',
        slug: 'gold-filigree-rose-quartz-adjustable-cuff',
        category: catMap['bracelets'],
        categorySlug: 'bracelets',
        price: 799,
        discountedPrice: 649,
        description: 'An open-ended adjustable brass cuff wrapped in fine gold filigree wire and anchored by two raw polished rose quartz crystals.',
        shortDescription: 'Flexible open cuff bracelet adorned with glowing rose quartz stones.',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
        ],
        stockQuantity: 10,
        variants: [
          { name: 'Stone', value: 'Rose Quartz', priceAdjustment: 0, stock: 6 },
          { name: 'Stone', value: 'Amethyst', priceAdjustment: 30, stock: 4 }
        ],
        tags: ['bracelet', 'cuff', 'gemstone', 'rose quartz', 'adjustable'],
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: false,
        rating: 4.9,
        numReviews: 12
      },

      // 3. Earrings
      {
        name: 'Handcrafted Meenakari & Pearl Jhumkas',
        slug: 'handcrafted-meenakari-pearl-jhumkas',
        category: catMap['earrings'],
        categorySlug: 'earrings',
        price: 999,
        discountedPrice: 799,
        description: 'Intricately hand-painted meenakari dome jhumkas decorated with micro seed pearls, ruby accents, and lightweight brass hooks for pain-free elegance.',
        shortDescription: 'Traditional floral meenakari jhumkas fringed with delicate pearls.',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
        ],
        stockQuantity: 14,
        variants: [
          { name: 'Color', value: 'Ruby Red & Gold', priceAdjustment: 0, stock: 7 },
          { name: 'Color', value: 'Pastel Mint Green', priceAdjustment: 0, stock: 7 }
        ],
        tags: ['earrings', 'jhumkas', 'meenakari', 'pearls', 'ethnic'],
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        rating: 4.9,
        numReviews: 42
      },
      {
        name: 'Silk Thread Chandelier Drops with Zari Lace',
        slug: 'silk-thread-chandelier-drops-with-zari-lace',
        category: catMap['earrings'],
        categorySlug: 'earrings',
        price: 599,
        discountedPrice: 449,
        description: 'Feather-light chandelier statement earrings wrapped in lustrous metallic gold silk thread with zari picot edges and teardrop stone pendants.',
        shortDescription: 'Lightweight gold silk thread chandelier earrings for parties.',
        images: [
          'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
        ],
        stockQuantity: 16,
        variants: [
          { name: 'Color', value: 'Champagne Gold', priceAdjustment: 0, stock: 8 },
          { name: 'Color', value: 'Midnight Black', priceAdjustment: 0, stock: 8 }
        ],
        tags: ['earrings', 'chandeliers', 'silk thread', 'gold', 'lightweight'],
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        rating: 4.7,
        numReviews: 15
      },
      {
        name: 'Kundan Floral Chandbali Statement Studs',
        slug: 'kundan-floral-chandbali-statement-studs',
        category: catMap['earrings'],
        categorySlug: 'earrings',
        price: 899,
        discountedPrice: 749,
        description: 'Crescent moon chandbalis encrusted with uncut glass kundan stones and finished with clusters of emerald green droplets.',
        shortDescription: 'Regal crescent chandbalis with kundan stones and green drops.',
        images: [
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
        ],
        stockQuantity: 9,
        variants: [
          { name: 'Drops Color', value: 'Emerald Green', priceAdjustment: 0, stock: 5 },
          { name: 'Drops Color', value: 'Deep Maroon', priceAdjustment: 0, stock: 4 }
        ],
        tags: ['earrings', 'chandbali', 'kundan', 'bridal', 'statement'],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
        rating: 4.8,
        numReviews: 20
      },

      // 4. Flower Jewellery
      {
        name: 'Complete Bridal Haldi Flower Jewellery Set',
        slug: 'complete-bridal-haldi-flower-jewellery-set',
        category: catMap['flower-jewellery'],
        categorySlug: 'flower-jewellery',
        price: 2499,
        discountedPrice: 1899,
        description: 'Complete 7-piece bridal ensemble including Floral Choker Necklace, Matha Patti / Maang Tikka, Pair of Hathphool bracelets, and Floral Jhumkas crafted with lifelike yellow and ivory fabric blooms, pollen grains, and pearl strings.',
        shortDescription: '7-piece yellow and ivory handmade floral set for Haldi ceremonies.',
        images: [
          'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=800&q=80',
          'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80'
        ],
        stockQuantity: 8,
        variants: [
          { name: 'Color Combination', value: 'Sunshine Yellow & White', priceAdjustment: 0, stock: 5 },
          { name: 'Color Combination', value: 'Baby Pink & Peach', priceAdjustment: 100, stock: 3 }
        ],
        tags: ['flower jewellery', 'haldi', 'mehendi', 'bridal set', 'hathphool'],
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        rating: 5.0,
        numReviews: 38,
        materials: 'Fabric Petals, Floral Pollens, Faux Pearls, Gota Patti Lace'
      },
      {
        name: 'Floral Hathphool Hand Harness Pair',
        slug: 'floral-hathphool-hand-harness-pair',
        category: catMap['flower-jewellery'],
        categorySlug: 'flower-jewellery',
        price: 799,
        discountedPrice: 599,
        description: 'Delicate pair of hathphool bracelets connecting wrist bands to floral ring loops through cascading micro-pearl strings and miniature fabric roses.',
        shortDescription: 'Pair of floral wrist-to-finger bracelets for bridesmaids and brides.',
        images: [
          'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=800&q=80',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
        ],
        stockQuantity: 15,
        variants: [
          { name: 'Color', value: 'Pastel Lilac & White', priceAdjustment: 0, stock: 8 },
          { name: 'Color', value: 'Marigold Yellow', priceAdjustment: 0, stock: 7 }
        ],
        tags: ['flower jewellery', 'hathphool', 'mehendi', 'hand harness'],
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: true,
        rating: 4.8,
        numReviews: 19
      },
      {
        name: 'Floral Maang Tikka & Earring Duo',
        slug: 'floral-maang-tikka-earring-duo',
        category: catMap['flower-jewellery'],
        categorySlug: 'flower-jewellery',
        price: 649,
        discountedPrice: 499,
        description: 'Lightweight floral forehead maang tikka paired with matching floral button earrings. Ideal for baby showers (Godh Bharai), pre-wedding shoots, and poojas.',
        shortDescription: 'Charming floral forehead jewelry and stud earrings set.',
        images: [
          'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=800&q=80',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
        ],
        stockQuantity: 20,
        variants: [
          { name: 'Color', value: 'Magenta & Golden Ochre', priceAdjustment: 0, stock: 10 },
          { name: 'Color', value: 'Ivory & Mint', priceAdjustment: 0, stock: 10 }
        ],
        tags: ['flower jewellery', 'maang tikka', 'baby shower', 'haldi', 'earrings'],
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        rating: 4.7,
        numReviews: 11
      },

      // 5. Hair Accessories
      {
        name: 'Bridal Pearl & Crystal Floral Hair Vine',
        slug: 'bridal-pearl-crystal-floral-hair-vine',
        category: catMap['hair-accessories'],
        categorySlug: 'hair-accessories',
        price: 1199,
        discountedPrice: 899,
        description: 'Flexible 14-inch hair vine woven with freshwater pearls, Swarovski crystal drops, and hand-molded golden floral petals. Can be braided into hair, pinned as a crown, or wrapped around a bun.',
        shortDescription: 'Flexible 14-inch bridal hair vine with pearls and golden petals.',
        images: [
          'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=800&q=80',
          'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80'
        ],
        stockQuantity: 11,
        variants: [
          { name: 'Metal Tone', value: 'Warm Champagne Gold', priceAdjustment: 0, stock: 7 },
          { name: 'Metal Tone', value: 'Silver Plated', priceAdjustment: 0, stock: 4 }
        ],
        tags: ['hair accessories', 'hair vine', 'bridal hair', 'pearls', 'crystals'],
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        rating: 4.9,
        numReviews: 28
      },
      {
        name: 'Handmade Silk Scrunchie & Bow Gift Duo',
        slug: 'handmade-silk-scrunchie-bow-gift-duo',
        category: catMap['hair-accessories'],
        categorySlug: 'hair-accessories',
        price: 399,
        discountedPrice: 299,
        description: 'Pure mulberry silk oversized scrunchie paired with an interchangeable tailored bow tie. Anti-frizz, anti-breakage, and gentle on delicate tresses.',
        shortDescription: '100% Mulberry silk cloud scrunchie with detachable bow.',
        images: [
          'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=800&q=80',
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80'
        ],
        stockQuantity: 30,
        variants: [
          { name: 'Color', value: 'Champagne Beige', priceAdjustment: 0, stock: 15 },
          { name: 'Color', value: 'Blush Rose', priceAdjustment: 0, stock: 15 }
        ],
        tags: ['hair accessories', 'silk scrunchie', 'anti frizz', 'bow', 'gift'],
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: true,
        rating: 4.8,
        numReviews: 22
      },
      {
        name: 'Gota Patti & Mogra Hair Veni Bun Accessory',
        slug: 'gota-patti-mogra-hair-veni-bun-accessory',
        category: catMap['hair-accessories'],
        categorySlug: 'hair-accessories',
        price: 499,
        discountedPrice: 389,
        description: 'Traditional reusable hair veni ring adorned with faux fragrant mogra buds, gota patti petals, and golden bead drops to wrap around your classic Indian hair bun.',
        shortDescription: 'Reusable mogra bud and gota patti hair bun gajra / veni.',
        images: [
          'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=800&q=80',
          'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=800&q=80'
        ],
        stockQuantity: 18,
        variants: [
          { name: 'Style', value: 'White Mogra with Gold Beads', priceAdjustment: 0, stock: 10 },
          { name: 'Style', value: 'Red Rose & Mogra Duo', priceAdjustment: 0, stock: 8 }
        ],
        tags: ['hair accessories', 'gajra', 'veni', 'bun accessory', 'traditional'],
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        rating: 4.6,
        numReviews: 9
      },

      // 6. Phone Charms / Bag Charms
      {
        name: 'Aesthetic Pastel Pearl Phone Charm Wristlet',
        slug: 'aesthetic-pastel-pearl-phone-charm-wristlet',
        category: catMap['phone-charms-bag-charms'],
        categorySlug: 'phone-charms-bag-charms',
        price: 449,
        discountedPrice: 349,
        description: 'Durable nylon cord wrist strap embellished with natural baroque pearls, pastel rainbow acrylic candy beads, and a gold heart locket charm. Secures your phone with charm and style.',
        shortDescription: 'Beaded phone wrist strap with pearls and gold heart charm.',
        images: [
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
          'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80'
        ],
        stockQuantity: 22,
        variants: [
          { name: 'Style', value: 'Sweet Lavender & Pearl', priceAdjustment: 0, stock: 11 },
          { name: 'Style', value: 'Buttercup Yellow & Cream', priceAdjustment: 0, stock: 11 }
        ],
        tags: ['phone charm', 'wrist strap', 'bag charm', 'pearls', 'aesthetic'],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        rating: 4.9,
        numReviews: 35
      },
      {
        name: 'Evil Eye & Chunky Crystal Bag Keyring Charm',
        slug: 'evil-eye-chunky-crystal-bag-keyring-charm',
        category: catMap['phone-charms-bag-charms'],
        categorySlug: 'phone-charms-bag-charms',
        price: 549,
        discountedPrice: 399,
        description: 'Luxury heavyweight bag pendant featuring a faceted raw crystal quartz point, Turkish evil eye glass bead, and golden lobster clasp to elevate any tote or handbag.',
        shortDescription: 'Crystal quartz and evil eye luxury handbag charm keychain.',
        images: [
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
        ],
        stockQuantity: 14,
        variants: [
          { name: 'Metal', value: 'Gold Finish', priceAdjustment: 0, stock: 8 },
          { name: 'Metal', value: 'Silver Finish', priceAdjustment: 0, stock: 6 }
        ],
        tags: ['bag charm', 'keychain', 'evil eye', 'crystal', 'accessories'],
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        rating: 4.8,
        numReviews: 13
      },
      {
        name: 'Personalized Initial Letter Phone Lanyard',
        slug: 'personalized-initial-letter-phone-lanyard',
        category: catMap['phone-charms-bag-charms'],
        categorySlug: 'phone-charms-bag-charms',
        price: 499,
        discountedPrice: 379,
        description: 'Custom beaded phone charm featuring your choice of initial letter bead surrounded by iridescent glass seed beads, freshwater mini pearls, and golden stars.',
        shortDescription: 'Custom initial beaded phone charm with iridescent pearls.',
        images: [
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
          'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80'
        ],
        stockQuantity: 28,
        variants: [
          { name: 'Letter', value: 'A - G (Custom specify in notes)', priceAdjustment: 0, stock: 10 },
          { name: 'Letter', value: 'H - N (Custom specify in notes)', priceAdjustment: 0, stock: 10 },
          { name: 'Letter', value: 'O - Z (Custom specify in notes)', priceAdjustment: 0, stock: 8 }
        ],
        tags: ['phone charm', 'personalized', 'initial', 'custom jewelry', 'gift'],
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: true,
        rating: 4.9,
        numReviews: 29
      },

      // 7. Phone Covers
      {
        name: 'Real Pressed Botanical Flower Resin Phone Case',
        slug: 'real-pressed-botanical-flower-resin-phone-case',
        category: catMap['phone-covers'],
        categorySlug: 'phone-covers',
        price: 899,
        discountedPrice: 699,
        description: 'Clear shockproof TPU phone case embedded with genuine dried pressed meadow flowers and 24k gold leaf flakes, preserved forever under crystal-clear UV resin.',
        shortDescription: 'Real dried meadow flowers & gold foil encased in crystal resin.',
        images: [
          'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80'
        ],
        stockQuantity: 18,
        variants: [
          { name: 'Phone Model', value: 'iPhone 13 / 14', priceAdjustment: 0, stock: 6 },
          { name: 'Phone Model', value: 'iPhone 15 / 15 Pro', priceAdjustment: 50, stock: 7 },
          { name: 'Phone Model', value: 'Samsung S23 / S24', priceAdjustment: 50, stock: 5 }
        ],
        tags: ['phone cover', 'pressed flowers', 'resin case', 'gold leaf', 'botanical'],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        rating: 4.9,
        numReviews: 36,
        materials: 'Anti-Yellowing Clear TPU, Crystal UV Resin, Dried Natural Botanicals, Gold Flakes'
      },
      {
        name: 'Golden Marble Swirl & Pearl MagSafe Cover',
        slug: 'golden-marble-swirl-pearl-magsafe-cover',
        category: catMap['phone-covers'],
        categorySlug: 'phone-covers',
        price: 999,
        discountedPrice: 799,
        description: 'Opulent white and champagne gold marble swirl case featuring integrated MagSafe magnetic ring and raised camera bezel for full drop defense.',
        shortDescription: 'Champagne gold marble swirl MagSafe case with camera protector.',
        images: [
          'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
        ],
        stockQuantity: 15,
        variants: [
          { name: 'Phone Model', value: 'iPhone 14 Pro / Pro Max', priceAdjustment: 0, stock: 5 },
          { name: 'Phone Model', value: 'iPhone 15 Pro / Pro Max', priceAdjustment: 0, stock: 6 },
          { name: 'Phone Model', value: 'Samsung S24 Ultra', priceAdjustment: 50, stock: 4 }
        ],
        tags: ['phone cover', 'marble', 'gold swirl', 'magsafe', 'luxury case'],
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        rating: 4.7,
        numReviews: 16
      },
      {
        name: 'Hand-Embellished Pearl & Ribbon Bow Case',
        slug: 'hand-embellished-pearl-ribbon-bow-case',
        category: catMap['phone-covers'],
        categorySlug: 'phone-covers',
        price: 849,
        discountedPrice: 649,
        description: 'Boutique coquette aesthetic clear case hand-embellished with flatback micro-pearls, 3D acrylic satin bow accents, and protective corner air-cushions.',
        shortDescription: 'Coquette aesthetic clear case with 3D satin bow and pearl accents.',
        images: [
          'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
          'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=800&q=80'
        ],
        stockQuantity: 20,
        variants: [
          { name: 'Phone Model', value: 'iPhone 13 / 14', priceAdjustment: 0, stock: 6 },
          { name: 'Phone Model', value: 'iPhone 15 / 15 Plus', priceAdjustment: 0, stock: 8 },
          { name: 'Phone Model', value: 'OnePlus 11 / 12', priceAdjustment: 0, stock: 6 }
        ],
        tags: ['phone cover', 'coquette', 'pearl case', 'bow', 'aesthetic'],
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: true,
        rating: 4.8,
        numReviews: 23
      }
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`[Seed] ${createdProducts.length} products created.`);

    // 5. Seed Hero Banners
    const bannersData = [
      {
        title: 'Timeless Artisanal Elegance',
        subtitle: 'Handcrafted with Love, Created for You',
        badge: 'New Collection 2026',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80',
        link: '/shop',
        buttonText: 'Explore Collection',
        order: 1,
        isActive: true
      },
      {
        title: 'Regal Silk Thread Bangles & Kundan Jewels',
        subtitle: 'Bespoke Craftsmanship for Every Celebration',
        badge: 'Bridal & Festive Edit',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1600&q=80',
        link: '/category/silk-thread-bangles',
        buttonText: 'Shop Silk Bangles',
        order: 2,
        isActive: true
      },
      {
        title: 'Botanical Flower & Pearl Keepsakes',
        subtitle: 'Haldi Sets, Aesthetic Charms & Custom Resin Cases',
        badge: 'Artisanal Keepsakes',
        image: 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=1600&q=80',
        link: '/category/flower-jewellery',
        buttonText: 'Discover Floral Magic',
        order: 3,
        isActive: true
      }
    ];

    await Banner.insertMany(bannersData);
    console.log('[Seed] Hero banners seeded.');

    // 6. Seed Coupons
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 2);

    const couponsData = [
      {
        code: 'WELCOME10',
        description: '10% discount on orders above ₹499',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 499,
        maxDiscountAmount: 300,
        expiryDate: nextYear,
        isActive: true
      },
      {
        code: 'FESTIVE20',
        description: '20% discount on festive orders above ₹999',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 999,
        maxDiscountAmount: 500,
        expiryDate: nextYear,
        isActive: true
      },
      {
        code: 'HANDMADE100',
        description: 'Flat ₹100 off on orders above ₹699',
        discountType: 'fixed',
        discountValue: 100,
        minOrderAmount: 699,
        expiryDate: nextYear,
        isActive: true
      }
    ];

    await Coupon.insertMany(couponsData);
    console.log('[Seed] Coupons seeded.');

    // 7. Seed Sample Reviews
    const firstProduct = createdProducts[0];
    const secondProduct = createdProducts[3];

    const reviewsData = [
      {
        product: firstProduct._id,
        customerName: 'Priya Sharma',
        customerEmail: 'priya.s@example.com',
        rating: 5,
        comment: 'Absolutely stunning bangles! The silk thread work is so neat and the kundan stones sparkle brilliantly. Received so many compliments at my cousin\'s wedding!',
        isApproved: true
      },
      {
        product: firstProduct._id,
        customerName: 'Ananya Verma',
        customerEmail: 'ananya@example.com',
        rating: 5,
        comment: 'The packaging with dried flower petals and gold ribbon was heartwarming. It truly feels like a boutique gift made with love.',
        isApproved: true
      },
      {
        product: secondProduct._id,
        customerName: 'Meera Kapoor',
        customerEmail: 'meera@example.com',
        rating: 5,
        comment: 'The baroque pearls look so premium and luxurious. Perfect everyday elegant accessory. Very fast delivery too!',
        isApproved: true
      }
    ];

    await Review.insertMany(reviewsData);
    console.log('[Seed] Sample reviews seeded.');

    console.log('\n===========================================');
    console.log('🎉 SEEDING COMPLETE FOR QueS.M design!');
    console.log(`Owner Login Email:    ${ownerEmail}`);
    console.log(`Owner Login Password: ${ownerPassword}`);
    console.log('===========================================\n');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error]:', error);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { seedDB };
