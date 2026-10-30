import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, Package, Search } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const MobileBottomNav = ({ onOpenSearch }) => {
  const { wishlistCount } = useWishlist();
  const { totalItemsCount, openCart } = useCart();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `mob-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/shop"
        className={({ isActive }) => `mob-nav-item ${isActive ? 'active' : ''}`}
      >
        <Compass size={20} />
        <span>Shop</span>
      </NavLink>

      <button
        onClick={onOpenSearch}
        className="mob-nav-item mob-nav-btn"
        aria-label="Search Collection"
      >
        <Search size={20} />
        <span>Search</span>
      </button>

      <NavLink
        to="/wishlist"
        className={({ isActive }) => `mob-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="mob-nav-icon-box">
          <Heart size={20} />
          {wishlistCount > 0 && <span className="mob-nav-badge">{wishlistCount}</span>}
        </div>
        <span>Wishlist</span>
      </NavLink>

      <button
        onClick={openCart}
        className="mob-nav-item mob-nav-btn"
        aria-label="Shopping Bag"
      >
        <div className="mob-nav-icon-box">
          <ShoppingBag size={20} />
          {totalItemsCount > 0 && <span className="mob-nav-badge">{totalItemsCount}</span>}
        </div>
        <span>Bag</span>
      </button>

      <NavLink
        to="/my-orders"
        className={({ isActive }) => `mob-nav-item ${isActive ? 'active' : ''}`}
      >
        <Package size={20} />
        <span>Orders</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;
