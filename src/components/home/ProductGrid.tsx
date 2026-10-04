import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  emptyMessage = 'No products found in this collection.'
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full max-w-full box-border">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-stone-200 p-2.5 animate-pulse space-y-2 rounded-xs">
            <div className="aspect-square bg-stone-200 w-full rounded-xs" />
            <div className="h-2.5 bg-stone-200 w-1/3" />
            <div className="h-3.5 bg-stone-200 w-3/4" />
            <div className="h-4 bg-stone-200 w-1/2" />
            <div className="h-7 bg-stone-200 w-full mt-2 rounded-xs" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white border border-dashed border-stone-300 rounded-xs w-full max-w-full box-border">
        <PackageOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-stone-800 mb-1">No Products Found</h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 md:gap-4 w-full max-w-full box-border">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
