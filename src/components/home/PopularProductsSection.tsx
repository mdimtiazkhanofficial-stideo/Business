import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ProductGrid } from './ProductGrid';
import { ArrowRight, Sparkles } from 'lucide-react';

export const PopularProductsSection: React.FC = () => {
  const { products, loading } = useStore();

  const popular = products.filter((p) => p.is_featured || p.is_popular);
  const displayProducts = popular.length > 0 ? popular : products.slice(0, 4);

  return (
    <section className="py-6 sm:py-10 bg-[#FFFDF7] border-b border-stone-200 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-4 sm:mb-6 border-b border-stone-200 pb-3">
          <div>
            <div className="flex items-center gap-1 text-[#1B4332] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3 text-[#E86A17]" />
              <span>HANDPICKED ESSENTIALS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-tight uppercase">
              POPULAR PRODUCTS
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Our customers' everyday favorites
            </p>
          </div>

          <Link
            to="/shop"
            className="text-[11px] sm:text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1 uppercase tracking-wider transition-colors shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-column mobile, 4-column desktop */}
        <ProductGrid products={displayProducts} loading={loading} />

      </div>
    </section>
  );
};
