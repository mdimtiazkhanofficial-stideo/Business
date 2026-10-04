import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const CategorySection: React.FC = () => {
  const { categories, setSelectedCategoryId } = useStore();
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeCategories = categories.filter((c) => c.is_active && c.show_on_homepage);
  const categoryList = activeCategories.length > 0 ? activeCategories : categories.filter((c) => c.is_active);

  // Pause movement for 5 seconds on user touch / swipe / click / drag
  const triggerPause = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  // Continuous smooth auto-slider moving from right to left
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || categoryList.length === 0) return;

    let animationFrameId: number;
    const speed = 0.6;

    const step = () => {
      if (!isPaused && slider) {
        slider.scrollLeft += speed;
        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft -= slider.scrollWidth / 2;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, categoryList.length]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    navigate(`/shop?category=${categoryId}`);
  };

  if (categoryList.length === 0) {
    return null;
  }

  // Duplicate list to create infinite seamless scrolling illusion
  const loopedCategories = [...categoryList, ...categoryList, ...categoryList];

  return (
    <section className="py-5 sm:py-7 bg-[#FFFDF7] border-b border-stone-200 overflow-hidden w-full max-w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-4 border-b border-stone-200 pb-2.5">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#8D5B4C] uppercase tracking-wider block">
              DISCOVER BY TYPE
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-stone-900 font-serif tracking-tight uppercase">
              POPULAR CATEGORIES
            </h2>
          </div>

          <Link
            to="/categories"
            className="text-[11px] sm:text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1 uppercase tracking-wider transition-colors shrink-0"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Automatic Category Slider (Small Square Cards) */}
        <div
          ref={sliderRef}
          onPointerDown={triggerPause}
          onTouchStart={triggerPause}
          onWheel={triggerPause}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
            pauseTimerRef.current = setTimeout(() => setIsPaused(false), 2000);
          }}
          className="flex gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 cursor-grab active:cursor-grabbing select-none w-full max-w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehaviorX: 'contain' }}
        >
          {loopedCategories.map((cat, index) => (
            <div
              key={`${cat.id}-${index}`}
              onClick={() => handleSelectCategory(cat.id)}
              className="flex-shrink-0 w-24 sm:w-28 md:w-32 bg-white border border-stone-200 hover:border-[#1B4332] transition-all p-2 rounded-xs group cursor-pointer shadow-2xs text-center flex flex-col items-center justify-between"
            >
              {/* Small Square Image Container */}
              <div className="w-full aspect-square bg-stone-100 overflow-hidden rounded-xs relative mb-1.5">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80'}
                  alt={cat.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Category Name & subtle arrow */}
              <div className="w-full">
                <h3 className="text-[11px] sm:text-xs font-bold text-stone-900 group-hover:text-[#1B4332] transition-colors line-clamp-1 leading-tight">
                  {cat.name}
                </h3>
                <div className="flex items-center justify-center gap-0.5 text-[9px] font-semibold text-[#8D5B4C] mt-0.5 opacity-80 group-hover:opacity-100">
                  <span>Explore</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
