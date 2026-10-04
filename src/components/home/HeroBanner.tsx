import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { setActiveTab, setSelectedCategoryId } = useStore();

  const handleShopNow = () => {
    setActiveTab('shop');
    setSelectedCategoryId(null);
  };

  const handleExplore = () => {
    setActiveTab('categories');
  };

  return (
    <section className="relative overflow-hidden bg-[#FBF9F4] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Compact Hero Copy */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-center lg:text-left">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[#1B4332]/10 border border-[#1B4332]/20 text-[#1B4332] text-[11px] sm:text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-[#E86A17]" />
              <span>STREETWEAR COLLECTION</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight font-serif uppercase">
              Drop Shoulder, <br className="hidden sm:inline" />
              <span className="text-[#1B4332]">Everyday Comfort</span>
            </h1>

            {/* Short Description */}
            <p className="text-stone-600 text-xs sm:text-sm lg:text-base max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
              Heavyweight 220+ GSM combed organic cotton t-shirts and apparel, crafted for modern streetwear aesthetics.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
              <button
                onClick={handleShopNow}
                className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExplore}
                className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-stone-400 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                EXPLORE
              </button>
            </div>

            {/* Trust Proofs */}
            <div className="pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-stone-700 text-[11px] sm:text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332] shrink-0" />
                <span>100% Combed Cotton</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332] shrink-0" />
                <span>Relaxed Fit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E86A17] shrink-0" />
                <span>7-Day Exchange</span>
              </div>
            </div>
          </div>

          {/* Right Column: Imagery */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              <div className="relative aspect-16/10 sm:aspect-4/3 overflow-hidden border border-stone-200 shadow-sm bg-white">
                <img
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80"
                  alt="SHAD SODAI Fashion Apparel"
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-3 py-1.5 border border-stone-200 shadow-xs">
                  <p className="text-[10px] text-[#8D5B4C] uppercase font-bold tracking-wider">
                    SHAD SODAI Apparel
                  </p>
                  <p className="text-xs font-bold text-[#1B4332]">
                    Drop Shoulder Essentials
                  </p>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute -top-3 -right-2 bg-[#1B4332] text-white px-3 py-2 shadow-md hidden sm:block">
                <p className="text-lg font-black text-amber-300 font-serif">240</p>
                <p className="text-[9px] uppercase font-bold tracking-wider">GSM Cotton</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
