import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const SpecialCollectionBanner: React.FC = () => {
  return (
    <section className="py-10 bg-[#FFFDF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-[#1B4332] text-white border border-[#2D6A4F] shadow-md">
          {/* Background image overlay */}
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src="https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1600&q=80"
              alt="Dry food banner"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 px-6 py-10 sm:py-16 sm:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-[#2D6A4F] text-amber-200 text-xs px-3 py-1 font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Special Handpicked Collection</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-white">
                Healthy Snacking Starts Here
              </h2>
              <p className="text-xs sm:text-sm text-stone-200 tracking-wide font-medium">
                Natural • Delicious • Carefully Packed • No Added Sugar
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to="/shop"
                className="bg-[#E86A17] hover:bg-[#d55e12] text-white px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105 shadow-md"
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
