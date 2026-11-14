import React, { useState, useEffect } from 'react';
import AnimatedEntryLoginPage from './components/AnimatedEntryLoginPage';
import PlatformAdminDashboard from './components/PlatformAdminDashboard';
import BlinkitHeader from './components/BlinkitHeader';
import BlinkitBanners from './components/BlinkitBanners';
import BlinkitProductGrid from './components/BlinkitProductGrid';
import BlinkitCustomBoxSection from './components/BlinkitCustomBoxSection';
import BlinkitOrderTracker from './components/BlinkitOrderTracker';
import BlinkitFooter from './components/BlinkitFooter';
import CheckoutModal from './components/CheckoutModal';
import CartDrawer from './components/CartDrawer';
import OrderHistoryPage from './components/OrderHistoryPage';
import CustomerProfileModal from './components/CustomerProfileModal';
import CustomerProfilePage from './components/CustomerProfilePage';

export default function App() {
  const initialPath = window.location.pathname.toLowerCase();
  const isAdminRoute = initialPath.includes('admin');

  // Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('melvi_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState(isAdminRoute ? 'admin_dashboard' : 'store'); // 'store' | 'tracking' | 'admin_dashboard'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('melvi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTrackingCode, setActiveTrackingCode] = useState('MLV-8821-E');

  // Save cart
  useEffect(() => {
    localStorage.setItem('melvi_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('melvi_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('melvi_user');
      localStorage.removeItem('melvi_jwt');
    }
  }, [currentUser]);

  // Fetch catalog products from NestJS API (Live Real-Time Sync)
  const refreshProducts = async () => {
    try {
      const [prodRes, bannerRes] = await Promise.all([
        fetch('/api/catalog/products').catch(() => null),
        fetch('/api/catalog/banners').catch(() => null),
      ]);
      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json().catch(() => ({}));
        setProducts(prodData.products || []);
      }
      if (bannerRes && bannerRes.ok) {
        const bannerData = await bannerRes.json().catch(() => ({}));
        setBanners(bannerData.banners || []);
      }
    } catch (err) {
      console.warn('API fetch notice:', err);
    }
  };

  useEffect(() => {
    refreshProducts();
    const interval = setInterval(refreshProducts, 3500); // Live polling every 3.5s
    window.addEventListener('focus', refreshProducts);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refreshProducts);
    };
  }, []);

  const handleCustomerLogin = (user) => {
    setCurrentUser(user);
    setActiveView('store');
    window.history.pushState({}, '', '/store');
  };

  const handleAdminLogin = (user) => {
    setCurrentUser(user);
    setActiveView('admin_dashboard');
    window.history.pushState({}, '', '/admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('store');
    window.history.pushState({}, '', '/');
  };

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCartItems(prev => prev.map(item => (item.id === id ? { ...item, quantity } : item)));
    }
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleOrderSuccess = (order) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    setActiveTrackingCode(order.trackingNumber);
    setActiveView('tracking');
  };

  const searchedProducts = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.tagline?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const scrollToCustomizer = () => {
    setActiveView('store');
    const el = document.getElementById('custom-box-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. PLATFORM ADMIN ROUTE OR VIEW: When user navigates to /admin or clicks Admin
  if (activeView === 'admin_dashboard' || isAdminRoute) {
    if (currentUser && currentUser.role === 'admin') {
      return (
        <PlatformAdminDashboard
          onLogout={handleLogout}
          onSwitchToStore={() => {
            window.history.pushState({}, '', '/store');
            setActiveView('store');
          }}
        />
      );
    } else {
      // If customer is browsing and wants Admin, or unauthenticated, show Admin Login
      return (
        <AnimatedEntryLoginPage
          initialRole="admin"
          onCustomerLogin={handleCustomerLogin}
          onAdminLogin={handleAdminLogin}
        />
      );
    }
  }

  // 2. UNLOGGED CUSTOMER ENTRY: If user is not logged in, render entry login & registration
  if (!currentUser) {
    return (
      <AnimatedEntryLoginPage
        initialRole="customer"
        onCustomerLogin={handleCustomerLogin}
        onAdminLogin={handleAdminLogin}
      />
    );
  }

  // 3. CLEAN CUSTOMER STORE (Blinkit / Instamart style)
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-zinc-900 font-sans">
      
      {/* Header */}
      <BlinkitHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrderHistory={() => setActiveView('orders')}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAdmin={() => {
          window.history.pushState({}, '', '/admin');
          setActiveView('admin_dashboard');
        }}
        onOpenProfile={() => {
          setActiveView('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Store Body */}
      <main className="flex-1">
        {activeView === 'store' && (
          <>
            {/* Promo Banners (Sliding Blinkit Carousel) */}
            <BlinkitBanners 
              banners={banners} 
              onSelectCustomBox={scrollToCustomizer} 
              onNavigateTracking={() => setActiveView('tracking')}
            />

            {/* Catalog Grid */}
            <BlinkitProductGrid
              products={searchedProducts}
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            {/* Custom Boxes & Customer Note Space with Live Database Flavors */}
            <BlinkitCustomBoxSection 
              onAddCustomBoxToCart={handleAddToCart}
              availableProducts={products}
            />
          </>
        )}

        {activeView === 'orders' && (
          <OrderHistoryPage
            currentUser={currentUser}
            onSelectOrderToTrack={(code) => {
              setActiveTrackingCode(code);
              setActiveView('tracking');
            }}
            onBackToStore={() => setActiveView('store')}
          />
        )}

        {activeView === 'tracking' && (
          <BlinkitOrderTracker 
            initialTrackingNumber={activeTrackingCode}
            currentUser={currentUser}
            onSelectOrderToTrack={(code) => setActiveTrackingCode(code)}
          />
        )}

        {activeView === 'profile' && (
          <CustomerProfilePage
            currentUser={currentUser}
            onBackToStore={() => setActiveView('store')}
            onUserUpdated={(updatedUser) => {
              setCurrentUser(updatedUser);
              localStorage.setItem('melvi_user', JSON.stringify(updatedUser));
            }}
          />
        )}
      </main>

      {/* Clean Footer */}
      <BlinkitFooter
        onNavigate={(cat) => {
          if (cat === 'tracking') {
            setActiveView('tracking');
          } else if (cat === 'orders') {
            setActiveView('orders');
          } else if (cat === 'custom') {
            scrollToCustomizer();
          } else {
            setActiveView('store');
            setActiveCategory(cat || 'all');
          }
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal with Payment Gateway */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Customer Profile & Multiple Delivery Addresses Modal */}
      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem('melvi_user', JSON.stringify(updatedUser));
        }}
      />

    </div>
  );
}
