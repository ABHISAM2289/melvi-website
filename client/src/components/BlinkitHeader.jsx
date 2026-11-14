import React from 'react';
import { ShoppingBag, Search, MapPin, User, ShieldCheck, Package, Clock, LogOut } from 'lucide-react';

export default function BlinkitHeader({
  searchQuery,
  setSearchQuery,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenOrderHistory,
  currentUser,
  onLogout,
  onOpenAdmin,
  onOpenProfile,
  activeView,
  setActiveView,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
          
          {/* Official Brand Logo */}
          <div 
            onClick={() => setActiveView('store')}
            className="flex items-center space-x-3 cursor-pointer shrink-0"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/50 shadow-xs p-1 bg-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
              <img src="/images/melvi-logo-square.png" alt="Melvi Official Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif text-2xl font-black tracking-wider text-amber-950 uppercase">
                MELVI
              </span>
              <span className="block text-[9px] font-bold text-amber-700 tracking-widest uppercase -mt-1">
                Haute Chocolaterie
              </span>
            </div>
          </div>

          {/* Delivery Location Pill (Blinkit style - Clickable to edit addresses) */}
          <button 
            type="button"
            onClick={onOpenProfile}
            className={`flex items-center space-x-2 border px-3 py-1.5 rounded-2xl text-xs transition-colors cursor-pointer text-left shrink-0 ${
              activeView === 'profile'
                ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-400/40'
                : 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-200/60'
            }`}
            title="View or Change Saved Delivery Addresses"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-800 shrink-0">
              <MapPin className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-left">
              <p className="font-bold text-zinc-900 leading-tight">Delivery in Cold-Pack</p>
              <p className="text-[11px] text-amber-800 font-semibold truncate max-w-[140px]">Edit Addresses ▾</p>
            </div>
          </button>

          {/* Search Bar (Blinkit style) */}
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 'dark chocolate', 'custom box', 'orange truffle'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-100 border border-zinc-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm text-zinc-900 placeholder-zinc-500 outline-none transition-all"
            />
          </div>

          {/* Actions: Order History, Track, Admin, User, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Customer Order History Button */}
            {currentUser && (
              <button
                onClick={() => {
                  if (onOpenOrderHistory) onOpenOrderHistory();
                  else setActiveView('orders');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeView === 'orders'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
                title="View My Past Orders"
              >
                <Clock className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">My Orders</span>
              </button>
            )}

            {/* Quick Track Button */}
            <button
              onClick={() => setActiveView('tracking')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeView === 'tracking'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Package className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Track Package</span>
            </button>

            {/* Admin Switcher */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 text-zinc-600 hover:text-amber-800 hover:border-amber-400 transition-all cursor-pointer"
              title="Store Owner Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin</span>
            </button>

            {/* User Profile & Saved Addresses Pill */}
            {currentUser ? (
              <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-colors border ${
                activeView === 'profile'
                  ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-400/30'
                  : 'bg-zinc-100 hover:bg-zinc-200/80 border-transparent'
              }`}>
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="text-left flex items-center space-x-1.5 cursor-pointer"
                  title="Edit Profile & Saved Addresses"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 block truncate max-w-[85px] leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-amber-800 font-semibold block -mt-0.5">
                      Profile &amp; Addresses ▾
                    </span>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="text-zinc-400 hover:text-rose-600 ml-1 p-0.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            {/* Blinkit Green/Amber Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {cartCount > 0 ? `${cartCount} items • ₹${cartTotal.toLocaleString()}` : 'My Cart'}
              </span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
