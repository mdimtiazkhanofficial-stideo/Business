import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Star,
  ShoppingBag,
  Zap,
  Truck,
  CheckCircle2,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCheckoutOpen, reviews } = useStore();

  if (!product) return null;

  const [activeImage, setActiveImage] = useState<string>(
    product.main_image || (product.gallery_images && product.gallery_images[0]) || ''
  );

  const availableSizes = Array.from(
    new Set([
      ...(product.sizes || []),
      ...(product.variants || []).map((v) => v.size).filter(Boolean) as string[]
    ])
  ).filter((s) => !/^\d+\s*(g|kg|gm)$/i.test(s));

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );

  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'material' | 'delivery' | 'reviews'>('desc');

  const activeSizeExtra = (() => {
    if (!product || !selectedSize) return 0;
    const list = product.sizeVariants || product.size_variants || [];
    const match = list.find((sv) => sv.size.toLowerCase() === selectedSize.toLowerCase());
    return match ? Number(match.extraPrice ?? match.extra_price ?? 0) : 0;
  })();

  const currentPrice = product.selling_price + activeSizeExtra;
  const originalPrice = product.discount_price ? product.discount_price + activeSizeExtra : currentPrice;
  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

  const allImages = Array.from(
    new Set([product.main_image, ...(product.gallery_images || [])].filter(Boolean))
  );

  const productReviews = reviews.filter((r) => r.product_id === product.id);

  const handleAddToCart = () => {
    const variant: ProductVariant = {
      id: `var-${product.id}-${selectedSize || 'std'}-${selectedColor || 'std'}`,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      price: currentPrice,
      original_price: originalPrice,
      stock: product.stock
    };
    addToCart(product, variant, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div className="bg-[#FFFDF7] w-full max-w-4xl overflow-hidden border border-stone-300 shadow-2xl relative my-auto rounded-xs">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 hover:bg-white text-stone-700 hover:text-black flex items-center justify-center border border-stone-300 shadow-2xs transition-colors rounded-xs cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="max-h-[85vh] overflow-y-auto p-4 sm:p-6 lg:p-7">
          
          {/* Top Grid: Gallery & Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-8 items-start">
            
            {/* Left: Gallery Images */}
            <div className="md:col-span-6 space-y-2.5">
              <div className="relative aspect-square w-full bg-stone-100 border border-stone-200 overflow-hidden rounded-xs">
                <img
                  src={activeImage || product.main_image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {discountPercent && discountPercent > 0 && (
                  <span className="absolute top-2.5 left-2.5 bg-[#E86A17] text-white text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider rounded-2xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 border overflow-hidden rounded-2xs transition-all cursor-pointer ${
                        activeImage === img ? 'border-2 border-[#1B4332]' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Purchase Controls */}
            <div className="md:col-span-6 space-y-3.5">
              <div className="flex items-center justify-between text-[11px] text-[#8D5B4C] font-semibold uppercase tracking-wider">
                <span>{product.category_name || 'Clothing & Apparel'}</span>
                <span className="text-stone-400 font-mono">SKU: {product.sku || 'SHAD-SODAI'}</span>
              </div>

              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-stone-900 font-serif leading-tight uppercase">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-stone-900">{(product.rating || 5).toFixed(1)}</span>
                  <span className="text-stone-400 font-normal text-[11px]">
                    ({product.review_count || productReviews.length || 24} reviews)
                  </span>
                </div>
                <span className="text-stone-300">|</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {product.stock > 0 ? `In Stock (${product.stock} items)` : 'Out of Stock'}
                </span>
              </div>

              <div className="p-3 bg-stone-100/80 border border-stone-200 flex items-baseline gap-2.5 rounded-xs">
                <span className="text-2xl sm:text-3xl font-black text-[#1B4332] font-mono">
                  ৳{currentPrice.toLocaleString('en-US')}
                </span>
                {originalPrice > currentPrice && (
                  <span className="text-xs sm:text-sm text-stone-400 line-through font-mono">
                    ৳{originalPrice.toLocaleString('en-US')}
                  </span>
                )}
                {discountPercent && discountPercent > 0 && (
                  <span className="text-[11px] font-bold text-[#E86A17] bg-orange-100 px-2 py-0.5 rounded-2xs">
                    Save ৳{(originalPrice - currentPrice).toLocaleString('en-US')}
                  </span>
                )}
              </div>

              {product.short_description && (
                <p className="text-xs text-stone-600 leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Size Selector */}
              {availableSizes.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px] block">
                    SELECT SIZE:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 border text-xs font-bold uppercase transition-all rounded-xs cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs'
                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px] block">
                    SELECT COLOR:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`px-3 py-1 border text-xs font-bold transition-all rounded-xs cursor-pointer flex items-center gap-1.5 ${
                          selectedColor === c.name
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-stone-300 inline-block"
                          style={{ backgroundColor: c.hex || '#333' }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Quantity:
                </span>
                <div className="flex items-center border border-stone-300 bg-white rounded-xs">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-600">
                  Total: <strong className="text-stone-900 font-mono">৳{(currentPrice * quantity).toLocaleString('en-US')}</strong>
                </span>
              </div>

              {/* Vertically stacked buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-2.5 px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors rounded-xs shadow-2xs cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>ADD TO CART</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#E86A17] hover:bg-[#d55e12] text-white py-2.5 px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors rounded-xs shadow-2xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>BUY NOW / ORDER NOW</span>
                </button>
              </div>

              {/* Trust highlights */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100 text-[10px] text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Fast Delivery in Bangladesh</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>7-Day Easy Exchange</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>100% Authentic Apparel</span>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Tabs */}
          <div className="mt-8 border-t border-stone-200 pt-5">
            <div className="flex border-b border-stone-200 gap-2 sm:gap-4 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActiveTab('desc')}
                className={`px-3 py-1.5 uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'desc'
                    ? 'border-b-2 border-[#1B4332] text-[#1B4332]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1.5 uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'specs'
                    ? 'border-b-2 border-[#1B4332] text-[#1B4332]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('material')}
                className={`px-3 py-1.5 uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'material'
                    ? 'border-b-2 border-[#1B4332] text-[#1B4332]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Material & Care
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`px-3 py-1.5 uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'delivery'
                    ? 'border-b-2 border-[#1B4332] text-[#1B4332]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Shipping & Delivery
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-3 py-1.5 uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-[#1B4332] text-[#1B4332]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Reviews ({productReviews.length})
              </button>
            </div>

            <div className="py-4 text-stone-700 text-xs leading-relaxed">
              {activeTab === 'desc' && (
                <div className="space-y-3">
                  <p className="whitespace-pre-line">{product.long_description || product.short_description}</p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Garment Specifications</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-stone-50 border border-stone-200 rounded-xs">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Brand</span>
                      <span className="font-semibold text-stone-900">{product.brand || 'SHAD SODAI'}</span>
                    </div>
                    <div className="p-2 bg-stone-50 border border-stone-200 rounded-xs">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Fabric</span>
                      <span className="font-semibold text-stone-900">{product.fabric || '100% Combed Cotton'}</span>
                    </div>
                    <div className="p-2 bg-stone-50 border border-stone-200 rounded-xs">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Fit</span>
                      <span className="font-semibold text-stone-900">{product.fit || 'Regular Fit'}</span>
                    </div>
                    <div className="p-2 bg-stone-50 border border-stone-200 rounded-xs">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Origin</span>
                      <span className="font-semibold text-stone-900">{product.origin || 'Bangladesh'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'material' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2">Fabric & Wash Care:</h4>
                  <p>{product.care_instructions || 'Machine wash cold with similar colors. Gentle cycle. Do not bleach. Tumble dry low or air dry in shade. Warm iron if needed.'}</p>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-3">
                  <p>{product.delivery_info || 'Fast doorstep delivery with secure apparel packaging.'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="border border-stone-200 p-2.5 rounded-xs bg-stone-50">
                      <span className="font-bold text-stone-900 block mb-0.5 text-xs">Dhaka Metro Express</span>
                      <span className="text-[11px] text-stone-600">24 to 48 hours delivery time.</span>
                    </div>
                    <div className="border border-stone-200 p-2.5 rounded-xs bg-stone-50">
                      <span className="font-bold text-stone-900 block mb-0.5 text-xs">Nationwide Bangladesh</span>
                      <span className="text-[11px] text-stone-600">3 to 5 business days via courier with cash on delivery.</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  {productReviews.length === 0 ? (
                    <p className="text-stone-500 italic">No reviews yet for this product.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {productReviews.map((rev) => (
                        <div key={rev.id} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-stone-900 text-xs">{rev.author}</span>
                            <div className="flex text-amber-500">
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-stone-600">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
