import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ProductGrid } from '../home/ProductGrid';
import { ArrowUpDown, Search } from 'lucide-react';
import { Category } from '../../types';

export const ShopPage: React.FC = () => {
  const { products, categories, selectedCategoryId, setSelectedCategoryId, searchQuery, setSearchQuery } = useStore();
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync with URL query parameters
  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('q');
    if (cat !== null) {
      setSelectedCategoryId(cat || null);
    }
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams, setSelectedCategoryId, setSearchQuery]);

  const uniqueCategories: Category[] = Array.from(new Map<string, Category>((categories || []).map((c) => [c.id, c])).values());
  const activeCategory = uniqueCategories.find((c) => c.id === selectedCategoryId);

  const handleCategoryClick = (catId: string | null) => {
    setSelectedCategoryId(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId) {
      newParams.set('category', catId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategoryId || p.category_id === selectedCategoryId;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.short_description && p.short_description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.selling_price - b.selling_price;
    if (sortBy === 'price-high') return b.selling_price - a.selling_price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured
  });

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-6 sm:py-10 pb-20 md:pb-12 w-full max-w-full overflow-hidden box-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full max-w-full box-border">
        
        {/* Page Header */}
        <div className="border-b border-stone-200 pb-4 mb-5 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-[#8D5B4C] uppercase tracking-wider block">
                SHAD SODAI COLLECTION
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-stone-900 font-serif tracking-tight mt-0.5 uppercase">
                {activeCategory ? activeCategory.name : 'ALL NATURAL PRODUCTS'}
              </h1>
            </div>

            <div className="text-xs text-stone-500 font-medium">
              Showing {sortedProducts.length} of {products.length} items
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar w-full max-w-full overscroll-x-contain touch-pan-x box-border">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border rounded-xs ${
                selectedCategoryId === null
                  ? 'bg-[#1B4332] text-white border-[#1B4332]'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
              }`}
            >
              All Products
            </button>
            {uniqueCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCategoryClick(c.id)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border rounded-xs ${
                  selectedCategoryId === c.id
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar: Sort & Search info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 bg-white border border-stone-200 p-2.5 rounded-xs">
          <div className="text-xs text-stone-600">
            {searchQuery && (
              <span>
                Search results for "<strong className="text-stone-900">{searchQuery}</strong>"
                <button
                  onClick={() => {
                    setSearchQuery('');
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('q');
                    setSearchParams(newParams);
                  }}
                  className="ml-2 text-xs font-bold text-red-600 hover:underline"
                >
                  Clear search
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FFFDF7] border border-stone-300 p-1 text-xs text-stone-800 font-semibold focus:outline-hidden focus:border-[#1B4332] rounded-xs"
            >
              <option value="featured">Featured / Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid (2-columns on mobile, 4 on desktop) */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-stone-200 p-6 rounded-xs">
            <Search className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-800">No products found matching your criteria</p>
            <p className="text-xs text-stone-500 mt-1">Try selecting a different category or clearing search terms.</p>
            <button
              onClick={() => {
                handleCategoryClick(null);
                setSearchQuery('');
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('category');
                newParams.delete('q');
                setSearchParams(newParams);
              }}
              className="mt-4 bg-[#1B4332] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#2D6A4F]"
            >
              View All Products
            </button>
          </div>
        ) : (
          <ProductGrid products={sortedProducts} />
        )}

      </div>
    </div>
  );
};
