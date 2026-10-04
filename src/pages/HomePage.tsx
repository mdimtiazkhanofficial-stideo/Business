import React from 'react';
import { PromoBanner16x9 } from '../components/home/PromoBanner16x9';
import { CategorySection } from '../components/home/CategorySection';
import { PopularProductsSection } from '../components/home/PopularProductsSection';
import { BestSellingSection } from '../components/home/BestSellingSection';
import { CategoryProductSections } from '../components/home/CategoryProductSections';
import { CustomerReviews } from '../components/home/CustomerReviews';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0 w-full max-w-full overflow-x-hidden">
      {/* 1. Full-Width Hero Banner */}
      <PromoBanner16x9 />

      {/* 2. Popular Categories */}
      <CategorySection />

      {/* 3. Popular Products */}
      <PopularProductsSection />

      {/* 4. Best Sellers */}
      <BestSellingSection />

      {/* 5. Dynamic Category-Wise Product Sections */}
      <CategoryProductSections />

      {/* 6. Customer Reviews */}
      <CustomerReviews />
    </div>
  );
};
