import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { wakeUpServer } from './utils/api';

// Context Providers
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Components
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import CartDrawer from './components/CartDrawer';
import LiveSearchModal from './components/LiveSearchModal';
import CookieBanner from './components/CookieBanner';
import AbandonedCartReminder from './components/AbandonedCartReminder';
import MobileBottomNav from './components/MobileBottomNav';
import NetworkSlowIndicator from './components/NetworkSlowIndicator';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage from './pages/MyOrdersPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PolicyPage from './pages/PolicyPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Styles
import './styles/index.css';
import './styles/boutique.css';

const AppLayout = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') ||
    location.pathname === '/studio-vault' ||
    location.pathname === '/studio-portal' ||
    location.pathname === '/owner-login';
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    wakeUpServer();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NetworkSlowIndicator />
      {!isAdminPath && <AnnouncementBar />}
      {!isAdminPath && <Navbar onOpenSearch={() => setIsSearchOpen(true)} />}

      <div style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/category/:categorySlug" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
          <Route path="/track-order" element={<OrderTrackingPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping-policy" element={<PolicyPage />} />
          <Route path="/return-policy" element={<PolicyPage />} />
          <Route path="/privacy-policy" element={<PolicyPage />} />
          <Route path="/terms" element={<PolicyPage />} />

          {/* Secret Owner Portal Routes */}
          <Route path="/studio-vault" element={<AdminLoginPage />} />
          <Route path="/studio-portal" element={<AdminLoginPage />} />
          <Route path="/owner-login" element={<AdminLoginPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />

          {/* Custom 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {!isAdminPath && <Footer />}
      {!isAdminPath && <FloatingWhatsApp />}
      {!isAdminPath && <CartDrawer />}
      {!isAdminPath && <LiveSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
      {!isAdminPath && <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />}
      {!isAdminPath && <CookieBanner />}
      {!isAdminPath && <AbandonedCartReminder />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <SettingsProvider>
          <WishlistProvider>
            <CartProvider>
              <AuthProvider>
                <ErrorBoundary>
                  <AppLayout />
                </ErrorBoundary>
              </AuthProvider>
            </CartProvider>
          </WishlistProvider>
        </SettingsProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
