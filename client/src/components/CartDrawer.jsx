import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  if (!isOpen) return null;

  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const clean = coupon.trim().toUpperCase();
    if (!clean) return;

    setIsValidatingCoupon(true);
    setCouponMessage('');

    try {
      const res = await apiFetch('/api/catalog/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, subtotal }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedDiscount(data.discountAmount || 0);
        setCouponMessage(data.message || `Promo code "${clean}" applied!`);
      } else {
        setAppliedDiscount(0);
        setCouponMessage(data.message || `Code "${clean}" is invalid or does not meet minimum order requirements.`);
      }
    } catch {
      setAppliedDiscount(0);
      setCouponMessage(`Promo code "${clean}" could not be verified.`);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-cocoa-950 border-l border-gold-500/30 h-full flex flex-col shadow-2xl animate-slideLeft">
        
        {/* Drawer Header */}
        <div className="p-6 bg-cocoa-900 border-b border-gold-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gold-500/20 text-gold-300 flex items-center justify-center border border-gold-500/30">
              <ShoppingBag className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Your Chocolate Bag</h3>
              <p className="text-xs text-zinc-400">{items.length} confections selected</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-cocoa-950 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-zinc-600" />
              <p className="text-sm font-serif text-zinc-400">Your bag is currently empty.</p>
              <p className="text-xs text-zinc-500">Explore our signature boxes or design a bespoke box.</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl bg-cocoa-900/60 border border-zinc-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    {item.image && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-700">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-gold-300/80">{item.tagline}</p>
                      <p className="text-xs font-serif font-bold text-gold-300 mt-1">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Custom Box Specifications & Notes Display */}
                {item.customNotes && (
                  <div className="p-2.5 rounded-xl bg-cocoa-950/80 border border-gold-500/20 text-[11px]">
                    <span className="font-bold text-gold-400 block mb-0.5">Custom Notes:</span>
                    <p className="text-zinc-300 italic">"{item.customNotes}"</p>
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <div className="flex items-center space-x-2 bg-cocoa-950 px-2.5 py-1 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-white px-2 font-mono">{item.quantity || 1}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-serif font-bold text-sm text-gold-200">
                    ₹{((item.price) * (item.quantity || 1)).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-6 bg-cocoa-900 border-t border-gold-500/20 space-y-4">
            
            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 bg-cocoa-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-gold-400 uppercase font-mono"
              />
              <button
                type="submit"
                disabled={isValidatingCoupon}
                className="px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/40 text-gold-300 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isValidatingCoupon ? 'Validating...' : 'Apply'}
              </button>
            </form>

            {couponMessage && (
              <p className="text-[11px] text-amber-300 bg-cocoa-950 p-2 rounded-lg border border-gold-500/20">
                {couponMessage}
              </p>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">₹{subtotal.toLocaleString()}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Artisan Discount:</span>
                  <span className="font-mono">- ₹{appliedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>16°C Cold-Chain Packaging:</span>
                <span className="text-cyan-400 font-semibold">FREE (Promotion)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-bold text-white">
                <span>Grand Total:</span>
                <span className="font-serif text-xl font-black text-gold-300">
                  ₹{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={onCheckout}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-cocoa-950 font-bold text-sm uppercase tracking-wider hover:scale-[1.01] transition-all shadow-xl flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
