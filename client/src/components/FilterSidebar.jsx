import React from 'react';
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

const FilterSidebar = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceChange,
  inStockOnly,
  onToggleInStock,
  onSaleOnly,
  onToggleOnSale,
  selectedRating,
  onSelectRating,
  sortBy,
  onSortChange,
  onReset
}) => {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      {/* Title & Reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <SlidersHorizontal size={18} className="gold-text" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          style={{
            background: 'none',
            color: 'var(--primary-gold-dark)',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By (useful on mobile or sidebar) */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
          Sort Collection
        </label>
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-alt)',
            fontSize: '0.88rem'
          }}
        >
          <option value="newest">Newest Additions</option>
          <option value="popular">Most Popular / Best Sellers</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      <hr style={{ borderColor: 'var(--border-subtle)' }} />

      {/* Category Filter */}
      <div>
        <h4 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '12px' }}>Categories</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => onSelectCategory('all')}
            style={{
              textAlign: 'left',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.86rem',
              fontWeight: selectedCategory === 'all' || !selectedCategory ? 'bold' : 'normal',
              background: selectedCategory === 'all' || !selectedCategory ? 'var(--primary-gold-subtle)' : 'transparent',
              color: selectedCategory === 'all' || !selectedCategory ? 'var(--primary-gold-dark)' : 'var(--text-main)'
            }}
          >
            All Collections
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat.slug)}
              style={{
                textAlign: 'left',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.86rem',
                fontWeight: selectedCategory === cat.slug ? 'bold' : 'normal',
                background: selectedCategory === cat.slug ? 'var(--primary-gold-subtle)' : 'transparent',
                color: selectedCategory === cat.slug ? 'var(--primary-gold-dark)' : 'var(--text-main)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-subtle)' }} />

      {/* Price Range */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700', marginBottom: '10px' }}>
          <span>Max Price</span>
          <span style={{ color: 'var(--primary-gold-dark)' }}>₹{priceRange}</span>
        </div>
        <input
          type="range"
          min="200"
          max="3000"
          step="50"
          value={priceRange}
          onChange={e => onPriceChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary-gold)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>₹200</span>
          <span>₹3,000</span>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-subtle)' }} />

      {/* Availability & Offers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={e => onToggleInStock(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary-gold)' }}
          />
          <span>In Stock Only</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={e => onToggleOnSale(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary-gold)' }}
          />
          <span>Special Offers / On Sale</span>
        </label>
      </div>

      <hr style={{ borderColor: 'var(--border-subtle)' }} />

      {/* Ratings */}
      <div>
        <h4 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px' }}>Customer Rating</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0, 4, 4.5].map(rating => (
            <button
              key={rating}
              onClick={() => onSelectRating(rating)}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: '600',
                border: '1px solid var(--border-color)',
                background: selectedRating === rating ? 'var(--primary-gold-subtle)' : '#fff',
                borderColor: selectedRating === rating ? 'var(--primary-gold)' : 'var(--border-color)',
                color: selectedRating === rating ? 'var(--primary-gold-dark)' : 'var(--text-main)'
              }}
            >
              {rating === 0 ? 'All' : `${rating}★ +`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
