import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SEOMeta from '../components/SEOMeta';
import { Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ShopPage = () => {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const searchQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || 'all');
  const [priceRange, setPriceRange] = useState(3000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Update selectedCategory if URL param changes
  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
  }, [categorySlug]);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.categories);
      })
      .catch(err => console.warn('Categories error:', err));
  }, []);

  // Fetch filtered products
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
          sort: sortBy
        });

        if (selectedCategory && selectedCategory !== 'all') {
          queryParams.append('categorySlug', selectedCategory);
        }

        if (priceRange < 3000) {
          queryParams.append('maxPrice', priceRange.toString());
        }

        if (inStockOnly) {
          queryParams.append('inStock', 'true');
        }

        if (onSaleOnly) {
          queryParams.append('onSale', 'true');
        }

        if (selectedRating > 0) {
          queryParams.append('minRating', selectedRating.toString());
        }

        if (searchQuery) {
          queryParams.append('q', searchQuery);
        }

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();

        if (data.success) {
          setProducts(data.products || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.warn('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, priceRange, inStockOnly, onSaleOnly, selectedRating, sortBy, currentPage, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setPriceRange(3000);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSelectedRating(0);
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const currentCategoryName = categories.find(c => c.slug === selectedCategory)?.name || 'All Collections';

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <SEOMeta
        title={`${currentCategoryName} | Handmade Accessories`}
        description={`Explore our bespoke collection of ${currentCategoryName.toLowerCase()} handcrafted with premium silk threads, floral blooms, and kundan stones.`}
      />

      {/* Page Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={16} className="gold-text" />
          <span className="gold-badge">Artisanal Catalog</span>
        </div>
        <h1 style={{ fontSize: '2.6rem', fontFamily: 'var(--font-heading)' }}>
          {searchQuery ? `Search Results for "${searchQuery}"` : currentCategoryName}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Showing {total} handcrafted treasures available for express delivery.
        </p>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="shop-mobile-filter-bar">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
        >
          <SlidersHorizontal size={16} />
          <span>Filter & Sort ({total})</span>
        </button>

        {/* Quick Sorting dropdown */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            background: '#fff',
            fontSize: '0.86rem'
          }}
        >
          <option value="newest">Newest Arrivals</option>
          <option value="popular">Best Sellers</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="shop-layout-grid">
        {/* Desktop Sidebar (Auto-hidden on mobile/tablet) */}
        <aside className="shop-desktop-sidebar">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={cat => { setSelectedCategory(cat); setCurrentPage(1); }}
            priceRange={priceRange}
            onPriceChange={val => { setPriceRange(val); setCurrentPage(1); }}
            inStockOnly={inStockOnly}
            onToggleInStock={val => { setInStockOnly(val); setCurrentPage(1); }}
            onSaleOnly={onSaleOnly}
            onToggleOnSale={val => { setOnSaleOnly(val); setCurrentPage(1); }}
            selectedRating={selectedRating}
            onSelectRating={val => { setSelectedRating(val); setCurrentPage(1); }}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Product Grid Area */}
        <main>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: '360px', background: '#f0ede4', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Sparkles size={40} className="gold-text" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No pieces match your filters</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Try widening your price range or clearing some filters.</p>
              <button onClick={handleResetFilters} className="btn-primary">
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div
                className="home-products-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '24px'
                }}
              >
                {products.map(prod => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '50px' }}>
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          border: '1px solid var(--border-color)',
                          background: currentPage === pageNum ? 'var(--gold-gradient)' : '#fff',
                          color: currentPage === pageNum ? '#121214' : 'var(--text-main)',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 105,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '340px',
              height: '100%',
              background: '#fff',
              overflowY: 'auto',
              padding: '20px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={cat => { setSelectedCategory(cat); setShowMobileFilters(false); }}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              inStockOnly={inStockOnly}
              onToggleInStock={setInStockOnly}
              onSaleOnly={onSaleOnly}
              onToggleOnSale={setOnSaleOnly}
              selectedRating={selectedRating}
              onSelectRating={setSelectedRating}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onReset={() => { handleResetFilters(); setShowMobileFilters(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
