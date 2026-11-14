import React, { useState } from 'react';
import { Sparkles, Star, Plus, Check, Filter, Heart, Tag, ShieldCheck, Flame, ArrowRight } from 'lucide-react';

export default function CrazyCatalog({ products, banners, onAddToCart, onSelectCustomizer }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  const categories = [
    { id: 'all', label: 'All Confections' },
    { id: 'signature-boxes', label: 'Signature Boxes' },
    { id: 'bonbons', label: 'Gourmet Bonbons' },
    { id: 'bars', label: 'Bean-to-Bar' },
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleAdd = (product) => {
    onAddToCart(product);
    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1400);
  };

  return (
    <section id="catalog-section" className="relative py-20 overflow-hidden chocolate-crazy-bg min-h-screen">
      
      {/* Crazy Background Dynamic Layer: Cocoa Swirls, Gold Flecks, Bokeh Orbs */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-rose-900/30 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-cocoa-700/20 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading with Luxury Touch */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-400/30 px-3.5 py-1 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Artisan Catalog</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Sensory Creations & <span className="gold-foil-text italic">Gourmet Collections</span>
          </h2>

          <p className="text-zinc-300 text-sm sm:text-base font-light">
            Every Melvi chocolate is small-batch conched, hand-tempered, and enrobed with single-origin cocoa beans from Madagascar and Ghana.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-gold-400 to-amber-600 text-cocoa-950 shadow-lg shadow-gold-500/20 scale-105'
                    : 'bg-cocoa-900/80 text-gold-200/80 border border-gold-500/20 hover:border-gold-500/40 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Embedded Featured Promotional Banner Strip */}
        {banners.length > 0 && (
          <div className="mb-14">
            <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${banners[0].bgGradient || 'from-cocoa-900 via-velvet-950 to-amber-950'} border border-gold-500/40 shadow-2xl relative overflow-hidden`}>
              <div className="absolute right-0 top-0 w-80 h-full bg-radial-gradient from-gold-400/10 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold-300 bg-gold-400/20 border border-gold-400/30 px-3 py-1 rounded-full">
                    {banners[0].highlight}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    {banners[0].title}
                  </h3>
                  <p className="text-sm text-gold-100/80 max-w-xl">
                    {banners[0].subtitle}
                  </p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={onSelectCustomizer}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-gold-400 to-amber-500 text-cocoa-950 font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-md flex items-center space-x-2"
                  >
                    <span>{banners[0].ctaText || 'Customize Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map(product => {
            const isJustAdded = recentlyAddedId === product.id;

            return (
              <div
                key={product.id}
                className="group relative rounded-2xl bg-cocoa-900/60 backdrop-blur-md border border-gold-500/20 hover:border-gold-400/60 transition-all duration-500 flex flex-col justify-between overflow-hidden hover:shadow-2xl hover:shadow-gold-500/10 chocolate-card-reflection"
              >
                {/* Product Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-gradient-to-r from-gold-500 to-amber-600 text-cocoa-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Cocoa Percentage Tag */}
                {product.cocoaPercentage && (
                  <div className="absolute top-3 right-3 z-20 bg-cocoa-950/80 backdrop-blur-sm border border-gold-500/30 text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {product.cocoaPercentage}% Cocoa
                  </div>
                )}

                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-cocoa-950/80">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950 via-transparent to-transparent opacity-80" />
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Rating & Reviews */}
                    <div className="flex items-center space-x-1 text-gold-400 text-xs mb-1.5">
                      <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                      <span className="font-bold text-white">{product.rating}</span>
                      <span className="text-zinc-400 text-[11px]">({product.reviewsCount})</span>
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-gold-200 transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs text-gold-300/80 font-medium line-clamp-1 mb-2">
                      {product.tagline}
                    </p>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Tags Pills */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {product.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-cocoa-950 border border-gold-500/20 text-gold-300/90 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Add to Cart Action */}
                  <div className="pt-3 border-t border-gold-500/15 flex items-center justify-between">
                    <div>
                      {product.originalPrice && (
                        <span className="text-xs text-zinc-500 line-through mr-1.5">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="font-serif font-black text-lg text-gold-300">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAdd(product)}
                      disabled={isJustAdded}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-cocoa-950 hover:shadow-gold-500/20'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
