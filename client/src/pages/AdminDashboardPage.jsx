import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Image,
  Star,
  MessageSquare,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  X,
  Menu,
  Truck,
  Eye,
  AlertTriangle,
  Key,
  UploadCloud,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import InvoiceModal from '../components/InvoiceModal';
import SEOMeta from '../components/SEOMeta';
import { fetchWithRetry, getCachedData, setCachedData, BOUTIQUE_DEFAULT_CATEGORIES } from '../utils/api';
import '../styles/admin.css';

const AdminDashboardPage = () => {
  const { admin, token, isAuthenticated, logout, getAuthHeaders } = useAuth();
  const { formatPrice, refreshSettings } = useSettings();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  // Overview Stats
  const [stats, setStats] = useState(null);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [statusUpdateModalOrder, setStatusUpdateModalOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCourier, setTrackingCourier] = useState('');

  // Products State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(() => getCachedData('categories', BOUTIQUE_DEFAULT_CATEGORIES));
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: '',
    price: '',
    discountedPrice: '',
    description: '',
    shortDescription: '',
    images: '',
    stockQuantity: 15,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    materials: '',
    careInstructions: ''
  });

  // Categories State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catFormData, setCatFormData] = useState({ name: '', description: '', image: '', order: 0 });
  const [catUploading, setCatUploading] = useState(false);

  // Upload States
  const [productUploading, setProductUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);

  // Banners State
  const [banners, setBanners] = useState([]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'Handcrafted With Love',
    image: '',
    link: '/shop',
    buttonText: 'Shop Collection'
  });

  // Reviews State
  const [reviews, setReviews] = useState([]);

  // Messages State
  const [messages, setMessages] = useState([]);

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState(null);

  // Security / Password & 2FA State
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [passMessage, setPassMessage] = useState('');

  // Activity Logs
  const [logs, setLogs] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/studio-vault');
    }
  }, [isAuthenticated, navigate]);

  // Load active tab data
  useEffect(() => {
    if (!token) return;

    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'products') { fetchProducts(); fetchCategories(); }
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'banners') fetchBanners();
    if (activeTab === 'reviews') fetchReviews();
    if (activeTab === 'messages') fetchMessages();
    if (activeTab === 'settings') fetchAdminSettings();
    if (activeTab === 'activity') fetchLogs();
  }, [activeTab, token, orderFilter, orderSearch]);

  // API Fetch Functions
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/orders/admin/stats', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) { console.warn(err); }
  };

  const fetchOrders = async () => {
    try {
      const url = `/api/orders/admin?status=${orderFilter}&search=${encodeURIComponent(orderSearch)}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
    } catch (err) { console.warn(err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
    } catch (err) { console.warn(err); }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setCategoriesError(false);
      const res = await fetchWithRetry('/api/categories', {}, 2, 1000);
      if (res?.data?.success && res.data.categories?.length > 0) {
        setCategories(res.data.categories);
        setCachedData('categories', res.data.categories);
      }
    } catch (err) {
      console.warn('Categories fetch note:', err);
      if (!categories || categories.length === 0) {
        setCategoriesError(true);
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners/admin', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setBanners(data.banners || []);
    } catch (err) { console.warn(err); }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews/admin', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setReviews(data.reviews || []);
    } catch (err) { console.warn(err); }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact/admin', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setMessages(data.messages || []);
    } catch (err) { console.warn(err); }
  };

  const fetchAdminSettings = async () => {
    try {
      const res = await fetch('/api/settings/admin', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setStoreSettings(data.settings);
    } catch (err) { console.warn(err); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/activity-logs', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setLogs(data.logs || []);
    } catch (err) { console.warn(err); }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (e) => {
    e.preventDefault();
    if (!statusUpdateModalOrder) return;

    try {
      const res = await fetch(`/api/orders/admin/${statusUpdateModalOrder._id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          orderStatus: newStatus || statusUpdateModalOrder.orderStatus,
          note: statusNote,
          trackingNumber,
          trackingCourier
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusUpdateModalOrder(null);
        fetchOrders();
      }
    } catch (err) { alert('Error updating order'); }
  };

  // Upload Helpers
  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload/single', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Image upload failed');
    return data.url;
  };

  const uploadMultipleImageFiles = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('images', file));
    const res = await fetch('/api/upload/multiple', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Images upload failed');
    return data.urls;
  };

  // Category Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catFormData.name.trim()) {
      alert('Please enter a category name');
      return;
    }
    try {
      const url = editingCatId ? `/api/categories/${editingCatId}` : '/api/categories';
      const method = editingCatId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(catFormData)
      });
      const data = await res.json();
      if (data.success) {
        setIsCatModalOpen(false);
        setEditingCatId(null);
        setCatFormData({ name: '', description: '', image: '', order: 0 });
        fetchCategories();
      } else {
        alert(data.message || 'Error saving category');
      }
    } catch (err) {
      alert('Error saving category: ' + err.message);
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCatId(cat._id);
    setCatFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
      order: cat.order || 0
    });
    setIsCatModalOpen(true);
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Products in this category will remain intact.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (err) {
      alert('Error deleting category: ' + err.message);
    }
  };

  // Product Actions
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const imagesArr = Array.isArray(productFormData.images)
        ? productFormData.images
        : (typeof productFormData.images === 'string'
            ? productFormData.images.split(',').map(s => s.trim()).filter(Boolean)
            : []);

      const payload = {
        ...productFormData,
        price: Number(productFormData.price),
        discountedPrice: productFormData.discountedPrice ? Number(productFormData.discountedPrice) : null,
        stockQuantity: Number(productFormData.stockQuantity),
        images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80']
      };

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        setProductFormData({
          name: '',
          category: categories[0]?._id || '',
          price: '',
          discountedPrice: '',
          description: '',
          shortDescription: '',
          images: [],
          stockQuantity: 15,
          isFeatured: false,
          isNewArrival: false,
          isBestSeller: false,
          materials: '',
          careInstructions: ''
        });
        fetchProducts();
      } else {
        alert(data.message);
      }
    } catch (err) { alert('Error saving product'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) fetchProducts();
    } catch (err) { alert('Error deleting product'); }
  };

  // Review Moderation
  const handleToggleReviewStatus = async (id, isApproved) => {
    try {
      const res = await fetch(`/api/reviews/admin/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isApproved })
      });
      if (res.ok) fetchReviews();
    } catch (err) { alert('Error updating review'); }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await fetch(`/api/reviews/admin/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      fetchReviews();
    } catch (err) { alert('Error deleting review'); }
  };

  // Banner Actions
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bannerFormData)
      });
      const data = await res.json();
      if (data.success) {
        setIsBannerModalOpen(false);
        setBannerFormData({
          title: '',
          subtitle: '',
          badge: 'New Collection 2026',
          image: '',
          link: '/shop',
          buttonText: 'Explore Collection'
        });
        fetchBanners();
      } else {
        alert(data.message);
      }
    } catch (err) { alert('Error saving banner'); }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this hero banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) fetchBanners();
    } catch (err) { alert('Error deleting banner'); }
  };

  const handleToggleBanner = async (id, currentActive) => {
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: !currentActive })
      });
      if (res.ok) fetchBanners();
    } catch (err) { alert('Error updating banner'); }
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings/admin', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(storeSettings)
      });
      const data = await res.json();
      if (data.success) {
        alert('Settings updated successfully!');
        refreshSettings();
      }
    } catch (err) { alert('Error saving settings'); }
  };

  // Password Update
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMessage('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(passData)
      });
      const data = await res.json();
      if (data.success) {
        setPassMessage('Master password updated successfully!');
        setPassData({ currentPassword: '', newPassword: '' });
      } else {
        setPassMessage(data.message);
      }
    } catch (err) { setPassMessage('Error updating password'); }
  };

  // 2FA Setup
  const handleInitiate2FA = async () => {
    try {
      const res = await fetch('/api/auth/setup-2fa', { method: 'POST', headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setTwoFactorData(data);
    } catch (err) { alert('Could not initiate 2FA'); }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code: twoFactorCode })
      });
      const data = await res.json();
      if (data.success) {
        alert('2FA successfully enabled!');
        setTwoFactorData(null);
        setTwoFactorCode('');
      } else {
        alert(data.message);
      }
    } catch (err) { alert('Error verifying 2FA'); }
  };

  return (
    <div className="admin-layout">
      <SEOMeta title="Owner Administration Panel" />

      {/* Mobile Sticky Header Bar */}
      <header className="admin-mobile-header">
        <div className="brand-wrap">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="toggle-btn"
            aria-label="Open menu drawer"
          >
            <Menu size={20} />
          </button>
          <img
            src="/logo.png"
            alt="QueS.M design"
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--primary-gold)' }}
          />
          <h2 className="brand-title">QueS.M Owner</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            to="/"
            target="_blank"
            style={{
              fontSize: '0.78rem',
              color: '#f7e7b4',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(212,175,55,0.15)',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(212,175,55,0.3)'
            }}
          >
            <ExternalLink size={12} />
            <span>Store</span>
          </Link>
          <button
            onClick={() => logout()}
            style={{ background: 'none', color: '#ff6b6b', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Mobile Quick Horizontal Tab Strip */}
      <nav className="admin-mobile-tabs-strip">
        {[
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'categories', label: 'Categories', icon: Layers },
          { id: 'banners', label: 'Banners', icon: Image },
          { id: 'reviews', label: 'Reviews', icon: Star },
          { id: 'messages', label: 'Inquiries', icon: MessageSquare },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'activity', label: 'Logs', icon: ShieldAlert }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              className={`mobile-tab-pill ${isActive ? 'active' : ''}`}
            >
              <Icon size={13} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div className="admin-drawer-backdrop" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'drawer-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="QueS.M design" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid var(--primary-gold)' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#f7e7b4', fontFamily: 'var(--font-heading)' }}>QueS.M Owner</h3>
              <span style={{ fontSize: '0.72rem', color: '#888' }}>Proprietor Control</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="admin-sidebar-close-btn"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, overflowY: 'auto' }}>
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag },
            { id: 'products', label: 'Products & Inventory', icon: Package },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'banners', label: 'Hero Banners', icon: Image },
            { id: 'reviews', label: 'Customer Reviews', icon: Star },
            { id: 'messages', label: 'Contact Inquiries', icon: MessageSquare },
            { id: 'settings', label: 'Store Settings', icon: Settings },
            { id: 'activity', label: 'Activity Logs', icon: ShieldAlert }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 'bold' : '500',
                  background: isActive ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                  color: isActive ? '#f7e7b4' : '#a09d94',
                  border: isActive ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <Icon size={17} color={isActive ? 'var(--primary-gold)' : '#777'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              color: '#bbb',
              padding: '6px 0'
            }}
          >
            <ExternalLink size={15} />
            <span>View Live Storefront</span>
          </Link>
          <button
            onClick={() => logout()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              color: '#d32f2f',
              fontSize: '0.82rem',
              cursor: 'pointer',
              padding: '6px 0'
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Bar */}
        <div className="admin-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', textTransform: 'capitalize' }}>
              {activeTab.replace('-', ' ')}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Logged in as <strong>{admin?.email}</strong> • Session secure
            </p>
          </div>

          <Link to="/" target="_blank" className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            <ExternalLink size={14} />
            <span>Open Store</span>
          </Link>
        </div>

        {/* Tab 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div>
            {/* Metric KPI Cards */}
            <div className="admin-kpi-grid">
              <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Sales (Lifetime)</span>
                <h3 className="gold-text" style={{ fontSize: '1.9rem', margin: '8px 0 4px', fontWeight: 'bold' }}>
                  {formatPrice(stats?.totalRevenue || 0)}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#2e7d32' }}>{stats?.totalOrders || 0} total orders</span>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Today's Sales</span>
                <h3 style={{ fontSize: '1.9rem', margin: '8px 0 4px', fontWeight: 'bold', color: 'var(--luxury-black)' }}>
                  {formatPrice(stats?.todaySales || 0)}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#666' }}>{stats?.todayOrders || 0} orders today</span>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Last 7 Days Sales</span>
                <h3 style={{ fontSize: '1.9rem', margin: '8px 0 4px', fontWeight: 'bold', color: 'var(--luxury-black)' }}>
                  {formatPrice(stats?.weekSales || 0)}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#666' }}>Weekly performance</span>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Pending Orders to Dispatch</span>
                <h3 style={{ fontSize: '1.9rem', margin: '8px 0 4px', fontWeight: 'bold', color: stats?.pendingOrdersCount > 0 ? '#e65100' : '#2e7d32' }}>
                  {stats?.pendingOrdersCount || 0}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#666' }}>Requires packing / shipping</span>
              </div>
            </div>

            {/* Low Stock Alerts & Recent Orders */}
            <div className="admin-dual-grid">
              {/* Low Stock Products */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <AlertTriangle size={18} color="#e65100" />
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Low Stock Inventory Alert</h3>
                </div>

                {stats?.lowStockProducts?.length === 0 ? (
                  <p style={{ color: '#2e7d32', fontSize: '0.88rem' }}>✓ All products have adequate stock levels.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stats?.lowStockProducts?.map(p => (
                      <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fff9f0', borderRadius: 'var(--radius-sm)', border: '1px solid #ffe0b2' }}>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '0.9rem', margin: 0 }}>{p.name}</p>
                          <span style={{ fontSize: '0.78rem', color: '#e65100', fontWeight: 'bold' }}>Only {p.stockQuantity} remaining!</span>
                        </div>
                        <button
                          onClick={() => { setActiveTab('products'); }}
                          className="btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders List */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} style={{ background: 'none', color: 'var(--primary-gold-dark)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    View All &rarr;
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stats?.recentOrders?.map(o => (
                    <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#faf9f5', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', fontSize: '0.88rem' }}>#{o.orderNumber}</span>
                        <p style={{ fontSize: '0.78rem', color: '#666', margin: 0 }}>{o.customer.name}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{formatPrice(o.totalAmount)}</span>
                        <p style={{ fontSize: '0.72rem', color: '#888', margin: 0 }}>{o.orderStatus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div>
            <div className="admin-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '600px' }}>
                <input
                  type="text"
                  placeholder="Search by Order ID, name, phone..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.88rem', flex: '1 1 220px' }}
                />

                <select
                  value={orderFilter}
                  onChange={e => setOrderFilter(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: '#fff', fontSize: '0.88rem', flex: '0 1 160px' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="Placed">Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <a
                href={`/api/orders/admin/export-csv`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
                style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              >
                <Download size={16} />
                <span>Export CSV</span>
              </a>
            </div>

            {/* Orders Table */}
            <div className="admin-table-responsive">
              <div className="admin-swipe-hint">
                <span>👉 Swipe horizontally to view full order details, customer phone, items & actions</span>
              </div>
              <table className="admin-table-sticky-first" style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f5f0e6', borderBottom: '2px solid var(--primary-gold)', textAlign: 'left' }}>
                    <th style={{ padding: '14px 16px' }}>Order ID</th>
                    <th style={{ padding: '14px 16px' }}>Date</th>
                    <th style={{ padding: '14px 16px' }}>Customer</th>
                    <th style={{ padding: '14px 16px' }}>Items</th>
                    <th style={{ padding: '14px 16px' }}>Total</th>
                    <th style={{ padding: '14px 16px' }}>Payment</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                        #{order.orderNumber}
                        {order.giftWrap && <span style={{ display: 'block', fontSize: '0.72rem', color: '#aa820a' }}>🎁 Gift Wrap</span>}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#666', fontSize: '0.8rem' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <strong>{order.customer.name}</strong>
                        <div style={{ fontSize: '0.76rem', color: '#666' }}>{order.customer.phone}</div>
                        <div style={{ fontSize: '0.76rem', color: '#888' }}>{order.customer.city}, {order.customer.state}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.8rem' }}>
                        {order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 'bold', color: order.paymentStatus === 'paid' ? '#2e7d32' : '#e65100' }}>
                          {order.paymentMethod} ({order.paymentStatus})
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge-tag" style={{ background: '#f0ede4', color: '#333' }}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => {
                              setStatusUpdateModalOrder(order);
                              setNewStatus(order.orderStatus);
                              setTrackingNumber(order.trackingNumber || '');
                              setTrackingCourier(order.trackingCourier || '');
                            }}
                            className="btn-outline"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            title="Update status"
                          >
                            <Truck size={14} />
                            <span>Status</span>
                          </button>

                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="btn-dark"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            title="Print invoice / packing slip"
                          >
                            <Printer size={14} />
                            <span>Slip</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div>
            <div className="admin-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Manage catalog pieces, stock inventory, and variants.</p>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductFormData({
                    name: '',
                    category: categories[0]?._id || '',
                    price: '',
                    discountedPrice: '',
                    description: '',
                    shortDescription: '',
                    images: [],
                    stockQuantity: 15,
                    isFeatured: false,
                    isNewArrival: false,
                    isBestSeller: false,
                    materials: '',
                    careInstructions: ''
                  });
                  setIsProductModalOpen(true);
                }}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              >
                <Plus size={16} />
                <span>Add New Product</span>
              </button>
            </div>

            <div className="admin-table-responsive">
              <div className="admin-swipe-hint">
                <span>👉 Swipe horizontally to view stock inventory, flags & edit actions</span>
              </div>
              <table className="admin-table-sticky-first" style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f5f0e6', borderBottom: '2px solid var(--primary-gold)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>Image</th>
                    <th style={{ padding: '12px 16px' }}>Product Name</th>
                    <th style={{ padding: '12px 16px' }}>Category</th>
                    <th style={{ padding: '12px 16px' }}>Price</th>
                    <th style={{ padding: '12px 16px' }}>Stock</th>
                    <th style={{ padding: '12px 16px' }}>Flags</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <img src={p.images?.[0] || ''} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                        <Link to={`/product/${p.slug}`} target="_blank" style={{ color: 'var(--luxury-black)' }}>
                          {p.name}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                        {p.category?.name || p.categorySlug?.replace(/-/g, ' ')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <strong>{formatPrice(p.discountedPrice || p.price)}</strong>
                        {p.discountedPrice && <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', textDecoration: 'line-through' }}>{formatPrice(p.price)}</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 'bold', color: p.stockQuantity <= 5 ? '#d32f2f' : '#2e7d32' }}>
                          {p.stockQuantity} pcs
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {p.isFeatured && <span className="badge-tag" style={{ background: '#fff3e0', color: '#e65100', marginRight: '4px' }}>Featured</span>}
                        {p.isBestSeller && <span className="badge-tag" style={{ background: '#f3e5f5', color: '#7b1fa2' }}>Best Seller</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setProductFormData({
                                name: p.name,
                                category: p.category?._id || p.category,
                                price: p.price,
                                discountedPrice: p.discountedPrice || '',
                                description: p.description,
                                shortDescription: p.shortDescription || '',
                                images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
                                stockQuantity: p.stockQuantity,
                                isFeatured: p.isFeatured,
                                isNewArrival: p.isNewArrival,
                                isBestSeller: p.isBestSeller,
                                materials: p.materials || '',
                                careInstructions: p.careInstructions || ''
                              });
                              setIsProductModalOpen(true);
                            }}
                            className="btn-outline"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            style={{ background: 'none', color: '#d32f2f', padding: '6px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div>
            <div className="admin-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Organize your boutique collections and promotional category tiles.</p>
              <button
                onClick={() => {
                  setEditingCatId(null);
                  setCatFormData({ name: '', description: '', image: '', order: categories.length + 1 });
                  setIsCatModalOpen(true);
                }}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              >
                <Plus size={16} />
                <span>Add Category</span>
              </button>
            </div>

            {loadingCategories && categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <Loader2 size={36} color="var(--primary-gold)" className="spin" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 6px' }}>Connecting to Cloud Studio...</h3>
                <p style={{ color: '#666', fontSize: '0.88rem' }}>Loading boutique collections from cloud database</p>
              </div>
            ) : categoriesError && categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <AlertTriangle size={38} color="#e65100" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 6px' }}>Server Warming Up</h3>
                <p style={{ color: '#666', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 16px' }}>
                  The cloud backend is spinning up after inactivity. Please click below to refresh.
                </p>
                <button onClick={fetchCategories} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  Retry Connection
                </button>
              </div>
            ) : categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <Layers size={40} color="#b89742" style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 6px' }}>No Categories Created Yet</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>Create collections like Royal Potli Bags, Bridal Jewelry, or Silk Clutches.</p>
                <button
                  onClick={() => {
                    setEditingCatId(null);
                    setCatFormData({ name: '', description: '', image: '', order: 1 });
                    setIsCatModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ padding: '10px 22px' }}
                >
                  <Plus size={16} />
                  <span>Create First Category</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {categories.map(cat => (
                  <div key={cat._id} style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <div style={{ position: 'relative', height: '160px', background: '#f5f5f5' }}>
                      <img
                        src={cat.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'}
                        alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80';
                        }}
                      />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleEditCategory(cat)}
                          style={{ background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                          title="Edit Category"
                        >
                          <Edit size={14} color="#111" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          style={{ background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                          title="Delete Category"
                        >
                          <Trash2 size={14} color="#dc3545" />
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{cat.name}</h3>
                        <p style={{ color: '#666', fontSize: '0.82rem', lineHeight: '1.4', marginBottom: '12px' }}>
                          {cat.description || 'No description provided.'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f0ede6' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--primary-gold-dark)', fontWeight: 'bold' }}>
                          {cat.productCount !== undefined ? `${cat.productCount} pieces` : '0 pieces'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>
                          Order: {cat.order || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: HERO BANNERS */}
        {activeTab === 'banners' && (
          <div>
            <div className="admin-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Manage homepage carousel hero banners, promotions, and luxury photography.
              </p>
              <button
                onClick={() => {
                  setBannerFormData({
                    title: '',
                    subtitle: '',
                    badge: 'New Collection 2026',
                    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80',
                    link: '/shop',
                    buttonText: 'Explore Collection'
                  });
                  setIsBannerModalOpen(true);
                }}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              >
                <Plus size={16} />
                <span>Add Hero Banner</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {banners.map((b) => (
                <div
                  key={b._id}
                  style={{
                    background: '#fff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                    <img
                      src={b.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'}
                      alt={b.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80';
                      }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                      <span className="gold-badge" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                        {b.badge || 'Hero Slide'}
                      </span>
                    </div>
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span
                        className="badge-tag"
                        style={{
                          background: b.isActive ? '#e8f5e9' : '#ffebee',
                          color: b.isActive ? '#2e7d32' : '#c62828',
                          fontWeight: 'bold'
                        }}
                      >
                        {b.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                        {b.title}
                      </h3>
                      <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '12px' }}>
                        {b.subtitle}
                      </p>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '16px' }}>
                        <p>Link: <code style={{ color: 'var(--primary-gold-dark)' }}>{b.link}</code></p>
                        <p>Button: <strong>{b.buttonText || 'Shop Now'}</strong></p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
                      <button
                        onClick={() => handleToggleBanner(b._id, b.isActive)}
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', flexGrow: 1 }}
                      >
                        {b.isActive ? 'Disable' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b._id)}
                        style={{ background: 'none', border: 'none', color: '#d32f2f', padding: '6px 10px', cursor: 'pointer' }}
                        title="Delete Banner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Guest reviews appear on product pages only after your approval.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map(rev => (
                <div key={rev._id} style={{ background: '#fff', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ flex: '1 1 260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <strong>{rev.customerName}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>({rev.customerEmail || 'Guest'})</span>
                      <span style={{ fontSize: '0.85rem', color: '#ff9800' }}>★ {rev.rating}</span>
                      <span className="badge-tag" style={{ background: rev.isApproved ? '#e8f5e9' : '#fff3e0', color: rev.isApproved ? '#2e7d32' : '#e65100' }}>
                        {rev.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#444', margin: '4px 0' }}>"{rev.comment}"</p>
                    <span style={{ fontSize: '0.75rem', color: '#999' }}>Product: {rev.product?.name}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    {rev.isApproved ? (
                      <button onClick={() => handleToggleReviewStatus(rev._id, false)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                        Hide
                      </button>
                    ) : (
                      <button onClick={() => handleToggleReviewStatus(rev._id, true)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleDeleteReview(rev._id)} style={{ background: 'none', color: '#d32f2f', padding: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: MESSAGES */}
        {activeTab === 'messages' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map(msg => (
                <div key={msg._id} style={{ background: '#fff', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', margin: 0 }}>{msg.name}</h4>
                      <span style={{ fontSize: '0.78rem', color: '#777' }}>{msg.email} • {msg.phone}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#999' }}>
                      {new Date(msg.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p style={{ fontWeight: 'bold', fontSize: '0.88rem', margin: '4px 0', color: 'var(--primary-gold-dark)' }}>{msg.subject}</p>
                  <p style={{ fontSize: '0.9rem', color: '#444' }}>{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 9: SETTINGS & SECURITY */}
        {activeTab === 'settings' && storeSettings && (
          <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <form onSubmit={handleSaveSettings} style={{ background: '#fff', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>Store & Shipping Parameters</h3>

              <div className="admin-form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Store Name</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={e => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Brand Contact Email</label>
                  <input
                    type="email"
                    value={storeSettings.storeEmail || ''}
                    onChange={e => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>WhatsApp Number (with country code)</label>
                  <input
                    type="text"
                    value={storeSettings.whatsappNumber}
                    onChange={e => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Store Phone</label>
                  <input
                    type="text"
                    value={storeSettings.storePhone || ''}
                    onChange={e => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="admin-form-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Shipping Fee (INR)</label>
                  <input
                    type="number"
                    value={storeSettings.shippingCharge}
                    onChange={e => setStoreSettings({ ...storeSettings, shippingCharge: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Free Shipping Threshold</label>
                  <input
                    type="number"
                    value={storeSettings.freeShippingThreshold}
                    onChange={e => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Gift Wrap Fee</label>
                  <input
                    type="number"
                    value={storeSettings.giftWrapCharge}
                    onChange={e => setStoreSettings({ ...storeSettings, giftWrapCharge: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  Studio Physical Address (Shown on Storefront & Invoices)
                </label>
                <input
                  type="text"
                  value={storeSettings.storeAddress || ''}
                  onChange={e => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                  placeholder="QueS.M design Studio Khan Manzil, Odisha, India"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  Google Maps Location / Embed URL (Contact Us Section)
                </label>
                <input
                  type="text"
                  value={storeSettings.googleMapsUrl || ''}
                  onChange={e => setStoreSettings({ ...storeSettings, googleMapsUrl: e.target.value })}
                  placeholder="Paste Google Maps Embed URL or iframe (e.g. https://www.google.com/maps/embed?pb=...)"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
                <span style={{ fontSize: '0.74rem', color: '#777', marginTop: '4px', display: 'block' }}>
                  Optional: Paste a custom Google Maps Embed URL or iframe code. If left blank, Google Maps will automatically display the Studio Physical Address above.
                </span>
              </div>

              <div className="admin-form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                    Instagram Profile Link
                  </label>
                  <input
                    type="url"
                    value={storeSettings.socialLinks?.instagram || ''}
                    onChange={e => setStoreSettings({
                      ...storeSettings,
                      socialLinks: { ...(storeSettings.socialLinks || {}), instagram: e.target.value }
                    })}
                    placeholder="https://www.instagram.com/ques.m_dgn91?xtok=MW83eHF4ejYxcWlm"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                    WhatsApp Chat URL
                  </label>
                  <input
                    type="url"
                    value={storeSettings.socialLinks?.whatsapp || ''}
                    onChange={e => setStoreSettings({
                      ...storeSettings,
                      socialLinks: { ...(storeSettings.socialLinks || {}), whatsapp: e.target.value }
                    })}
                    placeholder="https://wa.me/917978201960"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Announcement Banner Bar Text</label>
                <input
                  type="text"
                  value={storeSettings.announcementBarText}
                  onChange={e => setStoreSettings({ ...storeSettings, announcementBarText: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
                Save Store Settings
              </button>
            </form>

            {/* Change Password & 2FA Setup */}
            <div style={{ background: '#fff', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>Master Owner Password & 2FA Security</h3>

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '440px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Current Password</label>
                  <input
                    type="password"
                    required
                    value={passData.currentPassword}
                    onChange={e => setPassData({ ...passData, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>New Master Password (min 8 chars)</label>
                  <input
                    type="password"
                    required
                    value={passData.newPassword}
                    onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                {passMessage && <p style={{ fontSize: '0.82rem', color: 'var(--primary-gold-dark)' }}>{passMessage}</p>}

                <button type="submit" className="btn-dark" style={{ padding: '10px 20px', alignSelf: 'flex-start' }}>
                  Update Master Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 10: ACTIVITY LOG */}
        {activeTab === 'activity' && (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Full audit trail recording logins, order changes, product edits, and IP addresses.
            </p>

            <div className="admin-table-responsive">
              <div className="admin-swipe-hint">
                <span>👉 Swipe horizontally to view full audit logs, IP address & device info</span>
              </div>
              <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f5f0e6', borderBottom: '2px solid var(--primary-gold)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                    <th style={{ padding: '12px 16px' }}>Details</th>
                    <th style={{ padding: '12px 16px' }}>IP Address</th>
                    <th style={{ padding: '12px 16px' }}>Device</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 16px', color: '#666' }}>
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--primary-gold-dark)' }}>
                        {log.action}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{log.details}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{log.ipAddress}</td>
                      <td style={{ padding: '12px 16px', color: '#888', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.userAgent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Invoice Printable Modal */}
      <InvoiceModal
        isOpen={!!selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
        order={selectedOrderForInvoice}
      />

      {/* Update Order Status Modal */}
      {statusUpdateModalOrder && (
        <div className="admin-modal-overlay" onClick={() => setStatusUpdateModalOrder(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                Update Order #{statusUpdateModalOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setStatusUpdateModalOrder(null)}
                className="admin-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <form onSubmit={handleUpdateOrderStatus} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Order Status</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: '#fff' }}
                  >
                    <option value="Placed">Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Tracking Number / AWB</label>
                  <input
                    type="text"
                    placeholder="e.g. DELH12345678"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Courier Partner</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhivery, Speed Post, Bluedart"
                    value={trackingCourier}
                    onChange={e => setTrackingCourier(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Status Note (timeline update)</label>
                  <input
                    type="text"
                    placeholder="e.g. Package handed over to courier"
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setStatusUpdateModalOrder(null)} className="btn-outline">Cancel</button>
                  <button type="submit" className="btn-primary">Update Order</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '660px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                {editingProduct ? 'Edit Product' : 'Add Handcrafted Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="admin-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={productFormData.name}
                  onChange={e => setProductFormData({ ...productFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div className="admin-form-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Category *</label>
                  <select
                    value={productFormData.category}
                    onChange={e => setProductFormData({ ...productFormData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: '#fff' }}
                  >
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={productFormData.price}
                    onChange={e => setProductFormData({ ...productFormData, price: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Discounted Price</label>
                  <input
                    type="number"
                    value={productFormData.discountedPrice}
                    onChange={e => setProductFormData({ ...productFormData, discountedPrice: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productFormData.stockQuantity}
                    onChange={e => setProductFormData({ ...productFormData, stockQuantity: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>SKU / Identifier (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. QSM-BAG-001"
                    value={productFormData.sku || ''}
                    onChange={e => setProductFormData({ ...productFormData, sku: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              {/* Product Images Upload Dropzone & Gallery */}
              <div style={{ border: '1px solid #ede7db', borderRadius: 'var(--radius-sm)', padding: '16px', background: '#fbf9f4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#111', margin: 0 }}>
                    Product Photos ({Array.isArray(productFormData.images) ? productFormData.images.length : 0})
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#88723a', fontWeight: '600' }}>
                    First photo is the storefront cover
                  </span>
                </div>

                {/* Upload Button Box */}
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '22px 14px',
                    border: '2px dashed #d4af37',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ffffff',
                    cursor: productUploading ? 'wait' : 'pointer',
                    transition: 'border 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={productUploading}
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      try {
                        setProductUploading(true);
                        const urls = await uploadMultipleImageFiles(files);
                        setProductFormData(prev => {
                          const current = Array.isArray(prev.images)
                            ? prev.images
                            : (typeof prev.images === 'string' ? prev.images.split(',').map(s => s.trim()).filter(Boolean) : []);
                          return { ...prev, images: [...current, ...urls] };
                        });
                      } catch (err) {
                        alert('Upload failed: ' + err.message);
                      } finally {
                        setProductUploading(false);
                      }
                    }}
                  />
                  {productUploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aa820a', fontWeight: 'bold' }}>
                      <Loader2 size={24} className="spin" />
                      <span>Uploading product photos to boutique storage...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={30} color="#b89742" style={{ marginBottom: '6px' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#111' }}>
                        Click to Upload Product Photos
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#777', marginTop: '3px' }}>
                        Select one or multiple photos from your device (JPG, PNG, WEBP up to 5MB each)
                      </span>
                    </>
                  )}
                </label>

                {/* Interactive Thumbnails Gallery */}
                {Array.isArray(productFormData.images) && productFormData.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px', marginTop: '14px' }}>
                    {productFormData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          height: '92px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: idx === 0 ? '2px solid #b89742' : '1px solid #ddd',
                          background: '#fff',
                          boxShadow: idx === 0 ? '0 2px 8px rgba(184, 151, 66, 0.3)' : 'none'
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Product thumbnail ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80';
                          }}
                        />
                        {/* Cover Indicator / Set Cover Button */}
                        {idx === 0 ? (
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '4px',
                              left: '4px',
                              background: '#b89742',
                              color: '#fff',
                              fontSize: '0.62rem',
                              fontWeight: 'bold',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              letterSpacing: '0.5px'
                            }}
                          >
                            COVER
                          </span>
                        ) : (
                          <button
                            type="button"
                            title="Make Main Cover Photo"
                            onClick={() => {
                              setProductFormData(prev => {
                                const arr = [...prev.images];
                                const [selected] = arr.splice(idx, 1);
                                return { ...prev, images: [selected, ...arr] };
                              });
                            }}
                            style={{
                              position: 'absolute',
                              bottom: '4px',
                              left: '4px',
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              fontSize: '0.6rem',
                              padding: '2px 5px',
                              borderRadius: '3px',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Set Cover
                          </button>
                        )}
                        {/* Delete Thumbnail Button */}
                        <button
                          type="button"
                          title="Remove Photo"
                          onClick={() => {
                            setProductFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx)
                            }));
                          }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(220, 53, 69, 0.9)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional manual URL toggle */}
                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                  {!showManualUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowManualUrlInput(true)}
                      style={{ background: 'none', border: 'none', color: '#88723a', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      + Or add image via URL link
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <input
                        type="url"
                        placeholder="Paste image URL (https://...)"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        style={{ flex: 1, padding: '7px 10px', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        onClick={() => {
                          if (manualImageUrl.trim()) {
                            setProductFormData(prev => {
                              const curr = Array.isArray(prev.images) ? prev.images : [];
                              return { ...prev, images: [...curr, manualImageUrl.trim()] };
                            });
                            setManualImageUrl('');
                            setShowManualUrlInput(false);
                          }
                        }}
                      >
                        Add URL
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Short Tagline Description</label>
                <input
                  type="text"
                  value={productFormData.shortDescription}
                  onChange={e => setProductFormData({ ...productFormData, shortDescription: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>Full Description *</label>
                <textarea
                  rows={4}
                  required
                  value={productFormData.description}
                  onChange={e => setProductFormData({ ...productFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={productFormData.isFeatured}
                    onChange={e => setProductFormData({ ...productFormData, isFeatured: e.target.checked })}
                  />
                  <span>Featured Product</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={productFormData.isBestSeller}
                    onChange={e => setProductFormData({ ...productFormData, isBestSeller: e.target.checked })}
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
      {/* Add Hero Banner Modal */}
      {isBannerModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsBannerModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0 }}>Add Hero Banner</h2>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="admin-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  Badge Text
                </label>
                <input
                  type="text"
                  value={bannerFormData.badge}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, badge: e.target.value })}
                  placeholder="e.g. New Collection 2026"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  Banner Title *
                </label>
                <input
                  type="text"
                  value={bannerFormData.title}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                  placeholder="e.g. Timeless Artisanal Elegance"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={bannerFormData.subtitle}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                  placeholder="e.g. Handcrafted with Love, Created for You"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              {/* Hero Banner Image Upload Dropzone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Hero Banner Photograph *
                </label>

                {bannerFormData.image ? (
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '160px', border: '1px solid #ddd' }}>
                    <img
                      src={bannerFormData.image}
                      alt="Hero Banner Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setBannerFormData({ ...bannerFormData, image: '' })}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remove / Change Image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '28px 16px',
                      border: '2px dashed #d4af37',
                      borderRadius: 'var(--radius-sm)',
                      background: '#fbf9f4',
                      cursor: bannerUploading ? 'wait' : 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={bannerUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setBannerUploading(true);
                          const url = await uploadImageFile(file);
                          setBannerFormData(prev => ({ ...prev, image: url }));
                        } catch (err) {
                          alert('Upload failed: ' + err.message);
                        } finally {
                          setBannerUploading(false);
                        }
                      }}
                    />
                    {bannerUploading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aa820a', fontWeight: 'bold' }}>
                        <Loader2 size={24} className="spin" />
                        <span>Uploading high-resolution banner...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={32} color="#b89742" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.92rem', fontWeight: 'bold', color: '#111' }}>
                          Click to Upload Hero Banner Photograph
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#777', marginTop: '4px' }}>
                          Landscape ratio (1920x800 recommended), JPG, PNG, WEBP up to 5MB
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>

              <div className="admin-form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.link}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, link: e.target.value })}
                    placeholder="/shop"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.buttonText}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, buttonText: e.target.value })}
                    placeholder="Explore Collection"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsBannerModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={bannerUploading || !bannerFormData.image}>
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* Category Modal (Add / Edit) */}
      {isCatModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => {
            setIsCatModalOpen(false);
            setEditingCatId(null);
          }}
        >
          <div className="admin-modal-card" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                {editingCatId ? 'Edit Boutique Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCatModalOpen(false);
                  setEditingCatId(null);
                }}
                className="admin-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Potli Bags, Bridal Jewelry, Silk Clutches"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  Description (Tagline)
                </label>
                <textarea
                  rows="2"
                  placeholder="Short artisanal description for category headers"
                  value={catFormData.description}
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', resize: 'vertical' }}
                />
              </div>

              {/* Category Cover Image Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Category Cover Image
                </label>

                {catFormData.image ? (
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '160px', border: '1px solid #ddd' }}>
                    <img
                      src={catFormData.image}
                      alt="Category Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setCatFormData({ ...catFormData, image: '' })}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remove / Change Image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px 16px',
                      border: '2px dashed #d4af37',
                      borderRadius: 'var(--radius-sm)',
                      background: '#fbf9f4',
                      cursor: catUploading ? 'wait' : 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={catUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setCatUploading(true);
                          const url = await uploadImageFile(file);
                          setCatFormData(prev => ({ ...prev, image: url }));
                        } catch (err) {
                          alert('Upload failed: ' + err.message);
                        } finally {
                          setCatUploading(false);
                        }
                      }}
                    />
                    {catUploading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aa820a', fontWeight: 'bold' }}>
                        <Loader2 size={24} className="spin" />
                        <span>Uploading category image...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={30} color="#b89742" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#111' }}>
                          Click to Upload Category Image
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#777', marginTop: '2px' }}>
                          JPG, PNG, WEBP up to 5MB
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  Display Order
                </label>
                <input
                  type="number"
                  value={catFormData.order || 0}
                  onChange={(e) => setCatFormData({ ...catFormData, order: Number(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCatModalOpen(false);
                    setEditingCatId(null);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={catUploading}
                >
                  {editingCatId ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default AdminDashboardPage;
