import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductGrid } from './ProductGrid';
import { Gift } from 'lucide-react';

export const ComboPacks: React.FC = () => {
  const { products } = useStore();

  const comboProducts = products.filter(
    (p) => p.is_combo || p.category_id === 'cat-combo-packs' || p.category_name?.toLowerCase().includes('combo')
  );

  if (comboProducts.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#FFFDF7] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-[#E86A17]/10 flex items-center justify-center text-[#E86A17]">
            <Gift className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#E86A17] uppercase tracking-wider">
            Curated Gift Boxes
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif tracking-tight">
              Special Combo Packs
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Save up to 20% on curated bundles and premium natural gift boxes.
            </p>
          </div>
        </div>

        {/* 2-column mobile layout, 4-column desktop */}
        <ProductGrid products={comboProducts} />

      </div>
    </section>
  );
};
