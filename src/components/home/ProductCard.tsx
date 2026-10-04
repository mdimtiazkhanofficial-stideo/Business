import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, ProductVariant } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Star, Heart, ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    cart,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useStore();
  const navigate = useNavigate();

  const [isAddedFeedback, setIsAddedFeedback] = useState<boolean>(false);

  const availableSizes: string[] = Array.from(
    new Set([
      ...(product.sizes || []),
      ...(product.variants || []).map((v) => v.size).filter(Boolean) as string[]
    ])
  ).filter((s) => !/^\d+\s*(g|kg|gm)$/i.test(s));

  const safeMainImage =
    product.main_image ||
    (product as any).image ||
    (Array.isArray(product.gallery_images) && product.gallery_images[0]) ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80';

  const rawSellingPrice = product.selling_price ?? (product as any).price ?? 0;
  const numSellingPrice = Number(rawSellingPrice);
  const safeSellingPrice = !isNaN(numSellingPrice) && numSellingPrice > 0 ? numSellingPrice : 0;

  const rawDiscountPrice = product.discount_price ?? safeSellingPrice;
  const numDiscountPrice = Number(rawDiscountPrice);
  const safeDiscountPrice = !isNaN(numDiscountPrice) && numDiscountPrice > 0 ? numDiscountPrice : safeSellingPrice;

  const [selectedVariant] = useState<ProductVariant>(() => {
    if (product.variants && product.variants.length > 0) {
      const v = product.variants[0];
      return {
        ...v,
        price: Number(v.price) || safeSellingPrice,
        original_price: Number(v.original_price) || safeDiscountPrice,
        image: v.image || safeMainImage
      };
    }
    return {
      id: `var-${product.id}`,
      price: safeSellingPrice,
      original_price: safeDiscountPrice,
      stock: product.stock || 99,
      image: safeMainImage
    };
  });

  const isFavorite = isInWishlist(product.id);
  const currentPrice = Number(selectedVariant.price) || safeSellingPrice;
  const originalPrice = Number(selectedVariant.original_price) || safeDiscountPrice;
  const discountPercent =
    originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

  // Calculate total quantity of this product already in cart
  const inCartQty = cart
    .filter((item) => item.product_id === product.id || item.product?.id === product.id)
    .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  // Navigate to Product Details / View page on Card / Image / Title click
  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  // ONLY the Add to Cart button triggers cart addition (isolated with stopPropagation)
  const handleAddToCartButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // DO NOT trigger product view navigation

    addToCart(product, selectedVariant, 1);

    // Trigger visual confirmation on button
    setIsAddedFeedback(true);
    setTimeout(() => {
      setIsAddedFeedback(false);
    }, 1200);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white border border-stone-200 hover:border-[#1B4332] transition-all duration-200 flex flex-col justify-between cursor-pointer rounded-xs shadow-2xs hover:shadow-md overflow-hidden relative select-none w-full max-w-full min-w-0 box-border"
    >
      {/* Product Image Box (Clicking navigates to Product View) */}
      <div className="relative w-full aspect-square bg-stone-100 overflow-hidden">
        <img
          src={safeMainImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges: Discount & In Cart Indicator */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
          {discountPercent ? (
            <span className="bg-[#E86A17] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 tracking-wider uppercase rounded-2xs shadow-2xs">
              {discountPercent}% OFF
            </span>
          ) : (
            <span className="bg-[#1B4332]/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 tracking-wider uppercase rounded-2xs shadow-2xs">
              PREMIUM QUALITY
            </span>
          )}

          {inCartQty > 0 && (
            <span className="bg-[#1B4332] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 tracking-wider uppercase rounded-2xs shadow-2xs flex items-center gap-1">
              <ShoppingBag className="w-2.5 h-2.5" />
              <span>IN CART ({inCartQty})</span>
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon (isolated with stopPropagation) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="Toggle Wishlist"
          className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-red-500 rounded-full shadow-2xs transition-colors z-10 cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-500'
            }`}
          />
        </button>

        {/* Low Stock Indicator */}
        {product.stock <= 10 && product.stock > 0 && (
          <span className="absolute bottom-1.5 left-1.5 bg-stone-900/80 backdrop-blur-xs text-white text-[8px] sm:text-[9px] px-1 py-0.5 font-medium rounded-2xs z-10">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Info Container (Clicking navigates to Product View) */}
      <div className="p-2 sm:p-3 flex flex-col flex-grow justify-between text-left w-full min-w-0 overflow-hidden box-border">
        <div className="w-full min-w-0">
          {/* Category Tag */}
          <span className="text-[9px] sm:text-[10px] font-bold text-[#8D5B4C] uppercase tracking-wider block line-clamp-1 truncate">
            {product.category_name || 'Natural Food'}
          </span>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5 line-clamp-2 leading-snug group-hover:text-[#1B4332] transition-colors h-8 sm:h-9 break-words">
            {product.name}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1 mt-1 text-stone-600">
            <div className="flex text-amber-500">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-stone-900">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[9px] text-stone-400">
              ({product.review_count || 12})
            </span>
          </div>

          {/* Clothing Size / Weight Options */}
          {availableSizes.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1 items-center">
              <span className="text-[8px] sm:text-[9px] font-semibold text-stone-500 uppercase">Sizes:</span>
              {availableSizes.slice(0, 4).map((sz) => (
                <span
                  key={sz}
                  className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 bg-stone-100 text-stone-700 border border-stone-200 rounded-2xs"
                >
                  {sz}
                </span>
              ))}
              {availableSizes.length > 4 && (
                <span className="text-[8px] sm:text-[9px] text-stone-400 font-bold">
                  +{availableSizes.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm md:text-base font-extrabold text-[#1B4332]">
              ৳{currentPrice.toLocaleString('en-US')}
            </span>
            {originalPrice && originalPrice > currentPrice && (
              <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                ৳{originalPrice.toLocaleString('en-US')}
              </span>
            )}
          </div>
        </div>

        {/* Action Area */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-col gap-1.5">
          {/* ONLY THIS BUTTON TRIGGERS ADD TO CART (with stopPropagation) */}
          <button
            type="button"
            onClick={handleAddToCartButtonClick}
            className={`w-full py-2 px-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all rounded-xs shadow-2xs active:scale-[0.98] cursor-pointer ${
              isAddedFeedback
                ? 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                : 'bg-[#1B4332] hover:bg-[#2D6A4F] text-white'
            }`}
            title="Add to Cart"
          >
            {isAddedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                <span>ADDED {inCartQty > 0 ? `(${inCartQty})` : ''}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>{inCartQty > 0 ? `ADD MORE (${inCartQty})` : 'ADD TO CART'}</span>
              </>
            )}
          </button>

          {/* View Details Link (Navigates to Product View) */}
          <div
            onClick={handleCardClick}
            className="w-full text-center py-0.5 text-[10px] sm:text-[11px] font-bold text-stone-600 hover:text-[#1B4332] transition-colors uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1"
          >
            <span>VIEW DETAILS</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </div>
  );
};
