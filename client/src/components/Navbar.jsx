import React from 'react';
import { ShoppingBag, Search, Sparkles, User, Package, ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenAuth,
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenAdmin,
}) {
  return (
    <header className="sticky top-0 z-40 bg-cocoa-950/85 backdrop-blur-md border-b border-gold-500/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Luxury Brandmark */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-amber-700 p-[1.5px] shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-cocoa-950 rounded-full flex items-center justify-center">
                <span className="text-xl font-serif font-black text-gold-300">M</span>
              </div>
            </div>
            <div>
              <span className="font-serif text-2xl tracking-[0.25em] font-bold text-gold-200 group-hover:text-gold-100 transition-colors uppercase">
                MELVI
              </span>
              <p className="text-[10px] tracking-[0.35em] text-gold-400/80 uppercase font-sans -mt-1">
                Haute Chocolaterie
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeTab === 'home'
                  ? 'text-gold-300 bg-gold-500/10 border border-gold-500/30 font-semibold'
                  : 'text-gold-100/70 hover:text-gold-200'
              }`}
            >
              Atelier Home
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeTab === 'catalog'
                  ? 'text-gold-300 bg-gold-500/10 border border-gold-500/30 font-semibold'
                  : 'text-gold-100/70 hover:text-gold-200'
              }`}
            >
              Chocolate Catalog
            </button>
            <button
              onClick={() => setActiveTab('customizer')}
              className={`px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-all ${
                activeTab === 'customizer'
                  ? 'text-gold-300 bg-gold-500/10 border border-gold-500/30 font-semibold'
                  : 'text-gold-100/70 hover:text-gold-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Bespoke Boxes</span>
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-all ${
                activeTab === 'tracking'
                  ? 'text-gold-300 bg-gold-500/10 border border-gold-500/30 font-semibold'
                  : 'text-gold-100/70 hover:text-gold-200'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-gold-400" />
              <span>Track Order</span>
            </button>
          </nav>

          {/* Right Action Icons: Admin, User Login, Cart */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Admin Portal Toggle Button */}
            <button
              onClick={onOpenAdmin}
              className={`hidden sm:flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                currentUser?.role === 'admin'
                  ? 'border-gold-400 text-gold-300 bg-gold-500/20 shadow-sm shadow-gold-500/20'
                  : 'border-zinc-700/80 text-zinc-400 hover:text-gold-300 hover:border-gold-500/40'
              }`}
              title="Open Store Owner Tracking Manager"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>Admin Portal</span>
            </button>

            {/* User Login / Profile */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-cocoa-900/90 border border-gold-500/30 rounded-full py-1 px-3">
                <div className="w-6 h-6 rounded-full bg-gold-500/30 flex items-center justify-center text-xs font-serif text-gold-300 font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-gold-100 truncate max-w-[100px]">
                    {currentUser.name.split(' ')[0]}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-gold-400 font-bold">
                    {currentUser.role}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="text-zinc-400 hover:text-rose-400 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 text-xs text-gold-200 hover:text-white bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 px-3 py-1.5 rounded-full transition-all"
              >
                <User className="w-3.5 h-3.5 text-gold-400" />
                <span>Sign In</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-gradient-to-b from-cocoa-800 to-cocoa-900 border border-gold-500/40 text-gold-300 hover:text-gold-100 hover:border-gold-400 transition-all shadow-md group"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-cocoa-950 animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
