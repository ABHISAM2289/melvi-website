import React from 'react';
import { Sparkles, Snowflake, ShieldCheck, Gift, Truck } from 'lucide-react';

export default function PromoTicker({ banners = [] }) {
  if (!banners || banners.length === 0) return null;
  const items = banners;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-velvet-950 via-cocoa-900 to-amber-950 border-y border-gold-500/30 py-2.5 text-xs text-gold-200">
      <div className="flex w-max animate-marquee space-x-12 items-center">
        {/* Render repeated items for seamless infinite marquee scroll */}
        {[...items, ...items, ...items, ...items].map((banner, idx) => (
          <div key={idx} className="flex items-center space-x-3 shrink-0">
            <span className="inline-flex items-center space-x-1 bg-gold-400/20 text-gold-300 font-bold px-2 py-0.5 rounded text-[11px] tracking-wider uppercase border border-gold-400/30">
              <Sparkles className="w-3 h-3 text-gold-400 mr-1" />
              {banner.highlight || 'EXCLUSIVE'}
            </span>
            <span className="font-medium text-gold-100/90 tracking-wide">
              {banner.subtitle || banner.title}
            </span>
            {banner.code && (
              <span className="font-mono bg-cocoa-950/80 px-2 py-0.5 rounded text-amber-300 border border-gold-500/20 text-[10px]">
                CODE: {banner.code}
              </span>
            )}
            <span className="text-gold-500/40">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
