import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Star, Award, Gift, Snowflake } from 'lucide-react';

export default function HeroSection({ onExploreCatalog, onOpenCustomizer, onOpenTracking }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-600/15 via-gold-500/10 to-rose-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-gold-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-velvet-900/30 rounded-full blur-[110px] pointer-events-none" />

      {/* Floating decorative cocoa beans & gold spark particles */}
      <div className="absolute top-24 left-[10%] w-4 h-4 rounded-full bg-gold-400/40 blur-[1px] animate-float pointer-events-none" />
      <div className="absolute top-48 right-[15%] w-6 h-6 rounded-full bg-amber-500/30 blur-[2px] animate-float-reverse pointer-events-none" />
      <div className="absolute bottom-32 left-[18%] w-3 h-3 rounded-full bg-gold-300/50 animate-float-slow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Crown Sub-Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-gold-500/20 via-amber-500/15 to-transparent border border-gold-400/30 px-4 py-1.5 rounded-full shadow-inner">
              <Sparkles className="w-4 h-4 text-gold-400 animate-spin-slow" />
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-200">
                A Touch of Elegance • Temptingly Crafted
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-[1.1]">
              Artisanal Luxury{' '}
              <span className="block italic font-normal gold-foil-text font-serif">
                Chocolates by Melvi
              </span>
            </h1>

            {/* Subtitle description */}
            <p className="text-base sm:text-lg text-gold-100/80 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
              Experience the sensory artistry of master-tempered single-origin cocoa, edible 24K gold foil, French candied orange peels, and bespoke customizable ballotin boxes designed for unforgettable moments.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenCustomizer}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-cocoa-950 font-bold text-sm tracking-wider uppercase hover:shadow-xl hover:shadow-gold-500/25 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 group"
              >
                <Sparkles className="w-4 h-4 text-cocoa-950 group-hover:rotate-12 transition-transform" />
                <span>Customize Your Box</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreCatalog}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-cocoa-900/90 hover:bg-cocoa-800/90 text-gold-200 font-semibold text-sm tracking-wider border border-gold-500/40 hover:border-gold-400 hover:text-white transition-all flex items-center justify-center space-x-2"
              >
                <span>Explore Catalog</span>
              </button>

              <button
                onClick={onOpenTracking}
                className="w-full sm:w-auto px-6 py-4 rounded-full text-zinc-300 hover:text-gold-300 text-sm font-medium transition-colors flex items-center justify-center space-x-1.5"
              >
                <Snowflake className="w-4 h-4 text-cyan-400" />
                <span>Track Package</span>
              </button>
            </div>

            {/* Trust Highlights Strip */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gold-500/15 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gold-100 uppercase tracking-wider">100% Origin</h4>
                  <p className="text-[11px] text-zinc-400">Madagascar & Ghana</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400">
                  <Snowflake className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gold-100 uppercase tracking-wider">16°C Cold Chain</h4>
                  <p className="text-[11px] text-zinc-400">Melt-Proof Transit</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400">
                  <Gift className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gold-100 uppercase tracking-wider">Bespoke Notes</h4>
                  <p className="text-[11px] text-zinc-400">Custom Wax & Ribbon</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Showcase (Real Melvi Imagery + Floating Bonbon Cards) */}
          <div className="lg:col-span-5 relative">
            
            {/* Main Founder & Presentation Box Image Card */}
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden p-2 bg-gradient-to-b from-gold-500/40 via-gold-500/10 to-transparent border border-gold-500/40 shadow-2xl shadow-cocoa-950/80 group">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-cocoa-900">
                <img
                  src="/images/melvi-founder-box.jpg"
                  alt="Melvi Master Chocolatier presenting the 12-piece custom box"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950 via-cocoa-950/20 to-transparent" />

                {/* Overlaid Badge on Image */}
                <div className="absolute bottom-4 left-4 right-4 bg-cocoa-950/80 backdrop-blur-md p-4 rounded-xl border border-gold-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gold-400 font-bold">Featured Creation</p>
                      <h3 className="font-serif text-lg font-bold text-white">The Signature 12-Piece Box</h3>
                      <p className="text-[11px] text-zinc-300">Embossed & Hand-Tied with Silk Ribbon</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs line-through text-zinc-500">₹2,299</p>
                      <p className="text-lg font-serif font-black text-gold-300">₹1,899</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Candied Orange Bonbon Card (From User Upload Image 1) */}
            <div className="hidden sm:block absolute -top-8 -left-10 w-48 rounded-2xl p-1 bg-gradient-to-br from-amber-400/40 to-cocoa-900/60 backdrop-blur-md border border-gold-400/40 shadow-xl shadow-black/60 animate-float">
              <div className="bg-cocoa-950/90 p-2.5 rounded-xl">
                <div className="w-full h-24 rounded-lg overflow-hidden mb-2">
                  <img
                    src="/images/melvi-bonbons.jpg"
                    alt="Melvi Artisan Candied Orange Bonbon"
                    className="w-full h-full object-cover hover:scale-110 transition-transform"
                  />
                </div>
                <div className="flex items-center space-x-1 text-gold-400 text-[10px]">
                  <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                  <span className="font-bold text-white">5.0</span>
                  <span className="text-zinc-400">(64 Reviews)</span>
                </div>
                <p className="text-xs font-semibold text-gold-100 truncate mt-0.5">
                  Candied Orange & Gold
                </p>
                <p className="text-[10px] text-amber-300 font-serif">₹349 / Piece</p>
              </div>
            </div>

            {/* Floating Live Cold-Chain Tracker Badge */}
            <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-cocoa-900 to-velvet-950 p-3.5 rounded-2xl border border-gold-400/30 backdrop-blur-md shadow-2xl animate-float-reverse">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
                  <Snowflake className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">Cold-Chain Active</p>
                  </div>
                  <p className="text-[10px] text-zinc-300">Chilled Transit & Melt-Proof Seal</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
