import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ArrowRight } from 'lucide-react';
import { Category } from '../../types';

export const CategoriesPage: React.FC = () => {
  const { categories, products } = useStore();

  const uniqueCategories: Category[] = Array.from(new Map<string, Category>((categories || []).map((c) => [c.id, c])).values());

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-stone-200 pb-5 mb-8 text-center sm:text-left">
          <span className="text-xs font-bold text-[#8D5B4C] uppercase tracking-wider">
            All Collections
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif tracking-tight mt-1 uppercase">
            Browse By Category
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Pure natural dried fruits, nutrient-rich whole nuts, super seeds, and wholesome artisanal snack blends.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {uniqueCategories.map((category) => {
            const count = products.filter((p) => p.category_id === category.id).length;

            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group block cursor-pointer bg-white border border-stone-200 hover:border-[#1B4332] transition-all duration-200 overflow-hidden shadow-2xs rounded-xs"
              >
                <div className="aspect-16/9 w-full overflow-hidden bg-stone-100 relative">
                  <img
                    src={category.image || 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80'}
                    alt={category.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      {count} Products Available
                    </span>
                    <h3 className="text-base sm:text-lg font-bold font-serif leading-tight">
                      {category.name}
                    </h3>
                  </div>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-stone-600 line-clamp-1">
                      {category.description}
                    </p>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-[#1B4332] group-hover:text-white flex items-center justify-center transition-colors shrink-0 ml-2">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
};
