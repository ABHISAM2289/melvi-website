import React from 'react';
import { Star, Plus, Minus, Check } from 'lucide-react';

export default function BlinkitProductGrid({
  products,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  activeCategory,
  setActiveCategory,
}) {
  const categories = [
    { id: 'all', label: 'All Confections' },
    { id: 'chocolate-bites', label: 'Chocolate Bites' },
    { id: 'chocolate-bars', label: 'Chocolate Bars' },
    { id: 'surprise', label: 'Surprise' },
    { id: 'limited-editions', label: 'Limited Editions' },
  ];

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const getCartQuantity = (id) => {
    const item = cartItems.find(c => c.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Category Pills (Blinkit style horizontal scroll) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-2">
        {filtered.map(product => {
          const qty = getCartQuantity(product.id);
          const discountPercent = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : null;

          const isOutOfStock = product.inStock === false;

          return (
            <div
              key={product.id}
              className={`bg-white rounded-3xl p-3 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                isOutOfStock ? 'border-zinc-200 opacity-90' : 'border-zinc-200/90'
              }`}
            >
              <div>
                {/* Image Container with Discount Badge & Out of Stock Overlay */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 mb-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isOutOfStock ? 'grayscale-[40%] opacity-80' : 'hover:scale-105'
                    }`}
                    loading="lazy"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] flex items-center justify-center">
                      <span className="bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md border border-rose-400">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {!isOutOfStock && discountPercent && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {product.cocoaPercentage && (
                    <span className="absolute bottom-2 left-2 bg-amber-950/80 text-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      {product.cocoaPercentage}% Cocoa
                    </span>
                  )}
                </div>

                {/* Rating & Quantity Specs */}
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                  <span>
                    {product.category === 'signature-boxes' ? '12 Pieces Box' : 'Artisan Handcrafted'}
                  </span>
                  <div className="flex items-center space-x-0.5 text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{product.rating}</span>
                  </div>
                </div>

                {/* Product Name & Tagline */}
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                  {product.tagline}
                </p>
              </div>

              {/* Price & Blinkit style ADD Button */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100">
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="font-bold text-sm text-zinc-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-zinc-400 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Blinkit Add / Quantity / Sold Out Button */}
                {isOutOfStock ? (
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                ) : qty > 0 ? (
                  <div className="flex items-center space-x-1.5 bg-emerald-600 text-white rounded-xl px-2 py-1 shadow-xs">
                    <button
                      onClick={() => onUpdateQuantity(product.id, qty - 1)}
                      className="hover:opacity-80 p-0.5 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black px-1 font-mono">{qty}</span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, qty + 1)}
                      className="hover:opacity-80 p-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onAddToCart(product)}
                    className="btn-blinkit-add px-3.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs cursor-pointer"
                  >
                    + ADD
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
