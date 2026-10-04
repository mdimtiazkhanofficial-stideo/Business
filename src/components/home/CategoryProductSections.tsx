import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';

export const CategoryProductSections: React.FC = () => {
  const { categories, products, loading, setSelectedCategoryId } = useStore();

  // If loading and no categories yet, render placeholder skeletons
  if (loading && categories.length === 0) {
    return (
      <section className="py-6 sm:py-10 bg-[#FFFDF7] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-6 bg-stone-200 w-48 animate-pulse rounded-xs" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3.5 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 p-2.5 animate-pulse space-y-2 rounded-xs">
                <div className="aspect-square bg-stone-200 w-full rounded-xs" />
                <div className="h-2.5 bg-stone-200 w-1/3" />
                <div className="h-3.5 bg-stone-200 w-3/4" />
                <div className="h-4 bg-stone-200 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Filter only active categories, sorted by display_order
  const activeCategories = categories
    .filter((c) => c.is_active !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  // Determine categories that actually have active products
  const categorySections = activeCategories
    .map((category) => {
      // Find active products belonging to this category
      const categoryProducts = products.filter((p) => {
        const matchesCategory =
          p.category_id === category.id ||
          (p.category_name && p.category_name.toLowerCase() === category.name.toLowerCase());
        const isActive = p.status ? p.status === 'active' : true;
        return matchesCategory && isActive;
      });

      return {
        category,
        totalCount: categoryProducts.length,
        displayedProducts: categoryProducts.slice(0, 6)
      };
    })
    // Only create a category section if it has active products (Requirement 3)
    .filter((sec) => sec.totalCount > 0);

  if (categorySections.length === 0) {
    return null;
  }

  return (
    <>
      {categorySections.map(({ category, totalCount, displayedProducts }) => {
        const hasMoreThan6 = totalCount > 6;

        return (
          <section
            key={category.id}
            className="py-6 sm:py-10 bg-[#FFFDF7] border-b border-stone-200 w-full max-w-full overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
              {/* Section Header */}
              <div className="flex items-end justify-between mb-4 sm:mb-6 border-b border-stone-200 pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-tight uppercase">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-xs sm:text-sm text-stone-600 mt-0.5 line-clamp-1">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Show VIEW ALL button only when category has more than 6 products (Requirement 4 & 6) */}
                {hasMoreThan6 && (
                  <Link
                    to={`/shop?category=${category.id}`}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="text-[11px] sm:text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1 uppercase tracking-wider transition-colors shrink-0"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Product Grid: 2-column on mobile, responsive on tablet/desktop (Requirement 4 & 7) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3.5 md:gap-4">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
};
