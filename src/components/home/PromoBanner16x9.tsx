import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PromoBanner16x9: React.FC = () => {
  const { banners } = useStore();

  // Get all active banners for homepage sorted by display_order
  const activeBanners = banners
    .filter((b) => (b.homepage_enabled !== false) && (b.is_active !== false))
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  // Auto-slide effect (All hooks defined at top before any returns)
  useEffect(() => {
    if (activeBanners.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanners.length, isHovered]);

  // Adjust index if banners length changed
  useEffect(() => {
    if (currentIndex >= activeBanners.length && activeBanners.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeBanners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeBanners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || activeBanners.length === 0) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (diff > 50) {
      // Swiped left -> next slide
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    } else if (diff < -50) {
      // Swiped right -> prev slide
      setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    }
    touchStartXRef.current = null;
  };

  // If no banners uploaded or enabled, do not display hero banner
  if (activeBanners.length === 0) {
    return null;
  }

  const safeIndex = currentIndex < activeBanners.length ? currentIndex : 0;
  const currentBanner = activeBanners[safeIndex] || activeBanners[0];
  const targetLink = currentBanner.product_id
    ? `/product/${currentBanner.product_id}`
    : currentBanner.button_link || '/shop';
  const imgUrl = currentBanner.image_url || currentBanner.image || '';

  if (!imgUrl) {
    return null;
  }

  return (
    <section
      className="w-full max-w-full m-0 p-0 overflow-hidden relative select-none"
      style={{ touchAction: 'pan-y' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full max-w-none m-0 p-0">
        <Link
          to={targetLink}
          className="relative block w-full cursor-pointer overflow-hidden border-b border-stone-200 group"
          style={{ aspectRatio: '1920 / 650' }}
        >
          {/* Main Hero Image with 1920 x 650 fixed aspect ratio */}
          <img
            key={currentBanner.id || safeIndex}
            src={imgUrl}
            alt={currentBanner.title || 'SHAD SODAI Exclusive'}
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.015]"
          />

          {/* Vignette Overlay for rich contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/30 pointer-events-none" />

          {/* Optional Text Overlay (Only if banner has explicit title) */}
          {currentBanner.title ? (
            <div className="absolute top-3 left-3 sm:top-6 sm:left-6 md:top-8 md:left-8 max-w-[85%] sm:max-w-xl text-white text-left pointer-events-none">
              <span className="inline-block text-[9px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#F4A261] bg-black/50 backdrop-blur-xs px-2 py-0.5 mb-1 sm:mb-1.5 border border-white/20">
                SHAD SODAI EXCLUSIVE
              </span>
              <h2 className="text-sm sm:text-2xl md:text-3xl lg:text-4xl font-black font-serif tracking-tight drop-shadow-sm uppercase line-clamp-1">
                {currentBanner.title}
              </h2>
              {currentBanner.subtitle && (
                <p className="text-[10px] sm:text-xs md:text-sm text-white/90 font-medium tracking-wide mt-0.5 sm:mt-1 drop-shadow-xs line-clamp-1 hidden xs:block">
                  {currentBanner.subtitle}
                </p>
              )}
            </div>
          ) : null}

          {/* Dynamic Corner Button */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/95 text-[#1B4332] text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-3.5 py-1 sm:py-1.5 border border-stone-300 shadow-2xs group-hover:bg-[#1B4332] group-hover:text-white transition-colors">
            {currentBanner.button_text || 'SHOP NOW'} →
          </div>
        </Link>
      </div>

      {/* Slider Controls (Prev / Next Buttons) */}
      {activeBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-colors shadow-2xs cursor-pointer z-10"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-colors shadow-2xs cursor-pointer z-10"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-auto">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  safeIndex === idx
                    ? 'w-6 bg-white shadow-2xs'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
