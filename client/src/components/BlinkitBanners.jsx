import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Snowflake, ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react';

export const getBannerStyle = (bgGradient) => {
  const map = {
    'from-amber-500 to-amber-600': 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    'from-rose-900 to-amber-950': 'linear-gradient(135deg, #881337 0%, #451a03 100%)',
    'from-cyan-900 to-blue-950': 'linear-gradient(135deg, #164e63 0%, #172554 100%)',
    'from-emerald-900 to-teal-950': 'linear-gradient(135deg, #064e3b 0%, #042f2e 100%)',
    'from-stone-900 to-amber-950': 'linear-gradient(135deg, #1c1917 0%, #451a03 100%)',
    'from-stone-900 via-amber-950 to-cocoa-950': 'linear-gradient(135deg, #1c1917 0%, #451a03 50%, #1c0d07 100%)',
    'from-velvet-900 via-cocoa-900 to-amber-950': 'linear-gradient(135deg, #4a0d24 0%, #251209 50%, #451a03 100%)',
    'from-amber-900/90 via-cocoa-900 to-amber-950': 'linear-gradient(135deg, #78350f 0%, #1c0d07 50%, #451a03 100%)',
    'from-cocoa-900 via-rose-950 to-cocoa-950': 'linear-gradient(135deg, #251209 0%, #4c0519 50%, #1c0d07 100%)',
    'from-orange-600 to-rose-700': 'linear-gradient(135deg, #ea580c 0%, #be123c 100%)',
  };

  let bg = 'linear-gradient(135deg, #78350f 0%, #251209 100%)';

  if (bgGradient && map[bgGradient]) {
    bg = map[bgGradient];
  } else if (bgGradient && (bgGradient.includes('gradient') || bgGradient.startsWith('#') || bgGradient.startsWith('rgb'))) {
    bg = bgGradient;
  } else if (bgGradient?.includes('amber')) {
    bg = 'linear-gradient(135deg, #d97706 0%, #92400e 100%)';
  } else if (bgGradient?.includes('rose') || bgGradient?.includes('velvet') || bgGradient?.includes('red')) {
    bg = 'linear-gradient(135deg, #881337 0%, #451a03 100%)';
  } else if (bgGradient?.includes('cyan') || bgGradient?.includes('blue')) {
    bg = 'linear-gradient(135deg, #164e63 0%, #172554 100%)';
  } else if (bgGradient?.includes('emerald') || bgGradient?.includes('teal') || bgGradient?.includes('green')) {
    bg = 'linear-gradient(135deg, #064e3b 0%, #042f2e 100%)';
  }

  return { 
    background: bg,
    backgroundColor: '#251209',
    color: '#ffffff'
  };
};

export default function BlinkitBanners({ 
  banners = [], 
  onSelectCustomBox,
  onNavigateTracking 
}) {
  const activeBanners = (banners && banners.length > 0)
    ? banners.filter(b => b.isActive !== false)
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-advance slider every 3.8 seconds like Blinkit
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    } else if (touchEndX.current - touchStartX.current > 50) {
      handlePrev();
    }
  };

  const handleBannerClick = (banner) => {
    if (banner.code && banner.code !== 'CUSTOM' && banner.code !== 'COLDPACK') {
      navigator.clipboard?.writeText(banner.code);
      setCopiedCode(banner.code);
      setTimeout(() => setCopiedCode(null), 2500);
    }

    if (banner.linkType === 'custom_box' || banner.title?.toLowerCase().includes('custom')) {
      onSelectCustomBox?.();
    } else if (banner.linkType === 'tracking' || banner.title?.toLowerCase().includes('transit') || banner.title?.toLowerCase().includes('track')) {
      onNavigateTracking?.();
    }
  };

  if (!activeBanners || activeBanners.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
      <div 
        className="relative overflow-hidden rounded-3xl group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding Track */}
        <div 
          className="flex transition-transform duration-600 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {activeBanners.map((banner) => (
            <div
              key={banner.id}
              className="w-full shrink-0 px-0.5 sm:px-1"
            >
              {banner.image ? (
                /* 1. FULL POSTER MODE (Blinkit / Instamart style designed artwork) */
                <div
                  onClick={() => handleBannerClick(banner)}
                  className="cursor-pointer bg-[#251209] rounded-3xl overflow-hidden shadow-md relative w-full h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] transition-all duration-300 hover:shadow-xl group/poster"
                >
                  <img 
                    src={banner.image} 
                    alt={banner.title || 'Promotional Poster'} 
                    className="w-full h-full object-cover rounded-3xl transition-transform duration-500 group-hover/poster:scale-[1.01]" 
                  />

                  {/* Optional Discreet Tap Hint or Promo Code Tag */}
                  {banner.code && (
                    <div className="absolute top-3 right-3 sm:right-4 z-10 pointer-events-none">
                      <span className="bg-black/70 backdrop-blur-md text-amber-200 border border-amber-400/30 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full shadow-md">
                        Code: {banner.code} (Tap to Copy)
                      </span>
                    </div>
                  )}

                  {/* Feedback on copy */}
                  {copiedCode === banner.code && (
                    <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-20">
                      <span className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-amber-200 bg-black/90 px-4 py-2.5 rounded-xl shadow-xl border border-amber-400/50 animate-bounce">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Promo Code "{banner.code}" Copied to Clipboard!</span>
                      </span>
                    </div>
                  )}

                  {/* Subtle luxury vignette hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                </div>
              ) : (
                /* 2. GRADIENT TEXT FALLBACK (If no poster photo uploaded) */
                <div
                  onClick={() => handleBannerClick(banner)}
                  style={getBannerStyle(banner.bgGradient)}
                  className="cursor-pointer bg-[#251209] rounded-3xl p-5 sm:p-6 text-white shadow-md flex items-center justify-between min-h-[140px] sm:min-h-[180px] relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  {/* Subtle Luxury Pattern Overlay */}
                  <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-[0.5px] pointer-events-none" />

                  {/* Content */}
                  <div className="space-y-1.5 z-10 max-w-[70%] sm:max-w-[75%]">
                    {banner.highlight && (
                      <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/25 shadow-2xs">
                        {banner.highlight.includes('16°C') ? (
                          <Snowflake className="w-3 h-3 text-cyan-200" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-amber-200" />
                        )}
                        <span>{banner.highlight}</span>
                      </div>
                    )}

                    <h3 className="font-serif font-black text-xl sm:text-2xl lg:text-3xl text-white tracking-wide leading-tight">
                      {banner.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-white/90 line-clamp-1 font-medium">
                      {banner.subtitle}
                    </p>

                    {/* Feedback on copy or click CTA */}
                    {copiedCode === banner.code ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-200 bg-black/40 px-2 py-0.5 rounded-md mt-1 animate-bounce">
                        <Check className="w-3 h-3" />
                        <span>Code "{banner.code}" Copied to Clipboard!</span>
                      </span>
                    ) : banner.ctaText ? (
                      <div className="pt-1 flex items-center space-x-1 text-[11px] font-bold text-white/80 hover:text-white uppercase tracking-wider">
                        <span>{banner.ctaText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    ) : null}
                  </div>

                  {/* Right Themed Icon */}
                  <div className="z-10 shrink-0 pl-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/25 flex items-center justify-center text-white shadow-md">
                      <Snowflake className="w-9 h-9 animate-pulse text-cyan-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Previous Chevron Button */}
        {activeBanners.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Chevron Button */}
        {activeBanners.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Pagination Dots (Blinkit style pill indicator) */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20 bg-black/25 backdrop-blur-md px-2.5 py-1 rounded-full">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 h-2 bg-white shadow-xs'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
