/**
 * Resilient API Client with Auto-Retry, Cold-Start Handling, and Local Caching
 * Ensures the QueS.M design storefront and dashboard never show empty screens
 * during Render server cold starts or temporary network interruptions.
 */

export const BOUTIQUE_DEFAULT_CATEGORIES = [
  {
    _id: 'default-cat-1',
    name: 'Silk Thread Bangles',
    slug: 'silk-thread-bangles',
    description: 'Exquisite silk wrapped bangles adorned with Kundan, Zircon, and golden filigree beadwork.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    order: 1,
    isActive: true,
    productCount: 3
  },
  {
    _id: 'default-cat-2',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Delicate wristwear woven with cultured pearls, crystal beads, and gold charms.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    order: 2,
    isActive: true,
    productCount: 3
  },
  {
    _id: 'default-cat-3',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Statement handmade jhumkas, chandbalis, studs, and lightweight tassel drops.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
    order: 3,
    isActive: true,
    productCount: 3
  },
  {
    _id: 'default-cat-4',
    name: 'Flower Jewellery',
    slug: 'flower-jewellery',
    description: 'Ethereal handcrafted floral sets for Haldi, Mehendi, Baby Showers, and festivities.',
    image: 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=800&q=80',
    order: 4,
    isActive: true,
    productCount: 3
  },
  {
    _id: 'default-cat-5',
    name: 'Hair Accessories',
    slug: 'hair-accessories',
    description: 'Handmade hairpins, floral venis, embellished scrunchies, and pearl hair combs.',
    image: 'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=800&q=80',
    order: 5,
    isActive: true,
    productCount: 3
  },
  {
    _id: 'default-cat-6',
    name: 'Phone Charms / Bag Charms',
    slug: 'phone-charms-bag-charms',
    description: 'Playful yet luxurious beaded charms, evil-eye amulets, and floral wrist straps.',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
    order: 6,
    isActive: true,
    productCount: 3
  },
  {
    _id: 'default-cat-7',
    name: 'Phone Covers',
    slug: 'phone-covers',
    description: 'Custom aesthetic phone cases crafted with resin, real pressed flowers, and gold foil.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
    order: 7,
    isActive: true,
    productCount: 3
  }
];

// Helper to safely get cached data
export const getCachedData = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(`quesm_cache_${key}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed?.data || fallback;
  } catch (e) {
    return fallback;
  }
};

// Helper to safely set cached data
export const setCachedData = (key, data) => {
  try {
    localStorage.setItem(
      `quesm_cache_${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (e) {
    // Ignore storage quota errors
  }
};

/**
 * Fetch wrapper with retry capability for Render cold starts (502 / 504 / network drop)
 */
export const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1500) => {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await fetch(url, options);

      // If server returns gateway timeout or bad gateway (cold start in progress), retry
      if ([502, 503, 504].includes(res.status) && attempt < retries) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        continue;
      }

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        // If response is HTML error page (gateway) and retries remain, retry
        if (attempt < retries) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
          continue;
        }
        throw new Error('Invalid JSON response from server');
      }

      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      if (attempt < retries) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      } else {
        throw err;
      }
    }
  }
};

/**
 * Wake up server ping on initial page load
 */
export const wakeUpServer = () => {
  fetch('/api/health').catch(() => {});
};

