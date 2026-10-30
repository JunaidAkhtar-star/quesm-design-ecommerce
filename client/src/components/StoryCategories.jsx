import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { BOUTIQUE_DEFAULT_CATEGORIES } from '../utils/api';

const StoryCategories = ({ categories = [] }) => {
  const displayCategories = categories && categories.length > 0 ? categories : BOUTIQUE_DEFAULT_CATEGORIES;

  const getBadge = (index) => {
    if (index === 0) return 'Bestseller';
    if (index === 2) return 'Trending';
    if (index === 3) return 'Festive';
    if (index === 5) return 'New';
    return null;
  };

  return (
    <div className="story-strip-container">
      <div className="container">
        <div className="story-strip-header">
          <span className="story-strip-title">
            <Sparkles size={13} className="gold-text" />
            <span>Trending Collections • Tap to Explore</span>
          </span>
          <Link to="/shop" className="story-strip-viewall">
            View All Pieces &rarr;
          </Link>
        </div>

        <div className="story-scroll-row">
          {displayCategories.map((cat, idx) => {
            const badge = getBadge(idx);
            return (
              <Link
                key={cat._id || cat.slug || idx}
                to={`/category/${cat.slug}`}
                className="story-circle-item"
              >
                <div className="story-avatar-ring">
                  <div className="story-avatar-inner">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80'}
                      alt={cat.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80';
                      }}
                    />
                  </div>
                  {badge && <span className="story-badge">{badge}</span>}
                </div>
                <span className="story-label">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoryCategories;

