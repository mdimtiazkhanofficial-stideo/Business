import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant } from '../types';
import {
  Star,
  ShoppingBag,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Ruler,
  Clock,
  Sparkles,
  Share2
} from 'lucide-react';
import { ProductCard } from '../components/home/ProductCard';
import {
  getRelatedProducts,
  recordRecentlyViewed,
  getRecentlyViewedProducts
} from '../utils/relatedProducts';

interface ColorOption {
  name: string;
  hex?: string;
  image?: string;
}

// Fashion color swatch hex fallback
const getColorHex = (name: string, explicitHex?: string): string => {
  if (explicitHex && explicitHex.startsWith('#')) return explicitHex;
  const n = name.toLowerCase().trim();
  const fashionColors: Record<string, string> = {
    'black': '#111111',
    'jet black': '#0a0a0a',
    'pure black': '#111111',
    'charcoal black': '#1a1a1a',
    'white': '#ffffff',
    'pure white': '#ffffff',
    'off white': '#f8f8f2',
    'cream': '#fffdd0',
    'navy': '#001f3f',
    'navy blue': '#1b365d',
    'deep navy': '#0d1b2a',
    'blue': '#2563eb',
    'sky blue': '#87ceeb',
    'royal blue': '#4169e1',
    'washed blue': '#4682b4',
    'washed indigo': '#4682b4',
    'deep indigo': '#191970',
    'raw indigo': '#0d1b2a',
    'raw deep indigo': '#0d1b2a',
    'indigo': '#3f51b5',
    'grey': '#6b7280',
    'gray': '#6b7280',
    'heather grey': '#9ca3af',
    'charcoal': '#374151',
    'olive': '#556b2f',
    'olive green': '#4b5320',
    'dusty olive': '#556b2f',
    'military green': '#4b5320',
    'green': '#1b4332',
    'forest green': '#143628',
    'sage green': '#9caf88',
    'red': '#dc2626',
    'maroon': '#800000',
    'burgundy': '#6b1426',
    'brown': '#78350f',
    'chocolate': '#3e2723',
    'khaki': '#c3b091',
    'beige': '#f5f5dc',
    'tan': '#d2b48c',
    'yellow': '#eab308',
    'mustard': '#d97706',
    'orange': '#ea580c',
    'pink': '#ec4899',
    'dusty rose': '#dcae96',
    'lavender': '#e6e6fa',
    'purple': '#7c3aed'
  };
  return fashionColors[n] || '#4b5563';
};

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, addToCart, toggleWishlist, isInWishlist, reviews, addReview, showToast } = useStore();

  const product = products.find(
    (p) => p.slug === id || p.id === id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id
  );

  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>('');
  const [isSizeGuideModalOpen, setIsSizeGuideModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'size_guide' | 'material' | 'shipping' | 'reviews'>('desc');

  // Review submission state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Horizontal carousel refs for mobile
  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const recentlyViewedScrollRef = useRef<HTMLDivElement>(null);

  // Record product in browsing history
  useEffect(() => {
    if (product?.id) {
      recordRecentlyViewed(product.id);
    }
  }, [product?.id]);

  // 1. Dynamic Sizes configured for this garment
  const availableSizes: string[] = useMemo(() => {
    if (!product) return [];
    const fromSizes = product.sizes || [];
    const fromVariants = (product.variants || [])
      .map((v) => v.size)
      .filter(Boolean) as string[];
    const combined = Array.from(new Set([...fromSizes, ...fromVariants]));
    // Strip any food weight artifacts if legacy items exist
    return combined.filter((s) => !/^\d+\s*(g|kg|gm)$/i.test(s));
  }, [product]);

  // 2. Dynamic Colors configured for this garment
  const availableColors: ColorOption[] = useMemo(() => {
    if (!product) return [];
    const map = new Map<string, ColorOption>();

    if (product.colors && Array.isArray(product.colors)) {
      product.colors.forEach((c) => {
        if (c && c.name) {
          map.set(c.name.trim().toLowerCase(), {
            name: c.name.trim(),
            hex: c.hex,
            image: c.image
          });
        }
      });
    }

    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (v.color && v.color.trim()) {
          const key = v.color.trim().toLowerCase();
          if (!map.has(key)) {
            map.set(key, {
              name: v.color.trim(),
              hex: v.color_code,
              image: v.image
            });
          } else {
            const existing = map.get(key)!;
            if (!existing.image && v.image) existing.image = v.image;
            if (!existing.hex && v.color_code) existing.hex = v.color_code;
          }
        }
      });
    }

    return Array.from(map.values());
  }, [product]);

  // 3. Dynamic Variant Lookup (Size + Color matching)
  const activeVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) return null;

    if (selectedSize && selectedColor) {
      const exact = product.variants.find(
        (v) =>
          v.size?.toLowerCase() === selectedSize.toLowerCase() &&
          v.color?.toLowerCase() === selectedColor.toLowerCase()
      );
      if (exact) return exact;
    }

    if (selectedSize) {
      const match = product.variants.find(
        (v) => v.size?.toLowerCase() === selectedSize.toLowerCase()
      );
      if (match) return match;
    }

    if (selectedColor) {
      const match = product.variants.find(
        (v) => v.color?.toLowerCase() === selectedColor.toLowerCase()
      );
      if (match) return match;
    }

    return product.variants[0];
  }, [product, selectedSize, selectedColor]);

  // Helper to get size extra price for any size
  const getSizeExtraPrice = (sizeName: string): number => {
    if (!product || !sizeName) return 0;
    const list = product.sizeVariants || product.size_variants || [];
    const match = list.find((sv) => sv.size.toLowerCase() === sizeName.toLowerCase());
    if (match) {
      return Number(match.extraPrice ?? match.extra_price ?? 0);
    }
    if (product.variants && product.variants.length > 0) {
      const vMatch = product.variants.find((v) => v.size?.toLowerCase() === sizeName.toLowerCase());
      if (vMatch?.price && product.selling_price && vMatch.price > product.selling_price) {
        return vMatch.price - product.selling_price;
      }
    }
    return 0;
  };

  // Currently selected size extra price (Requirement 3 & 6)
  const activeSizeExtra = useMemo(() => {
    return getSizeExtraPrice(selectedSize);
  }, [product, selectedSize]);

  // Pricing calculation
  const baseSellingPrice = product?.selling_price || 0;
  const baseDiscountPrice = product?.discount_price && product.discount_price > product.selling_price
    ? product.discount_price
    : 0;

  const currentPrice = baseSellingPrice + activeSizeExtra;
  const originalPrice = baseDiscountPrice > 0
    ? baseDiscountPrice + activeSizeExtra
    : (activeVariant?.original_price && activeVariant.original_price > currentPrice ? activeVariant.original_price : currentPrice);

  const currentStock = activeVariant?.stock !== undefined ? activeVariant.stock : (product?.stock || 0);
  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

  // Collect all gallery images
  const allImages = useMemo(() => {
    if (!product) return [];
    const list: string[] = [product.main_image, ...(product.gallery_images || [])];
    (product.variants || []).forEach((v) => {
      if (v.image && !list.includes(v.image)) list.push(v.image);
    });
    availableColors.forEach((c) => {
      if (c.image && !list.includes(c.image)) list.push(c.image);
    });
    return Array.from(new Set(list.filter(Boolean)));
  }, [product, availableColors]);

  // Reset states on product change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setActiveImage(product.main_image || (product.gallery_images && product.gallery_images[0]) || '');
      setSelectedSize('');
      setSelectedColor('');
      setQuantity(1);
      setValidationError('');
      setReviewSubmitted(false);
    }
  }, [product, id]);

  // Automatically derive category info for breadcrumb
  const category = useMemo(() => {
    if (!product) return null;
    return categories.find((c) => c.id === product.category_id);
  }, [product, categories]);

  // Priority-based related products (max 8)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return getRelatedProducts(product, products, 8);
  }, [product, products]);

  // Recently viewed products from browsing history (max 6)
  const recentlyViewedProducts = useMemo(() => {
    if (!product) return [];
    return getRecentlyViewedProducts(product.id, products, 6);
  }, [product, products]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-stone-900 uppercase">Product Not Found</h2>
        <p className="text-stone-600 text-sm">The clothing item you are looking for might have been updated or moved.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#2D6A4F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shop</span>
        </Link>
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);

  // Selection handlers
  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    setValidationError('');
  };

  const handleColorClick = (color: ColorOption) => {
    setSelectedColor(color.name);
    setValidationError('');
    if (color.image) {
      setActiveImage(color.image);
    }
  };

  // Validate variant selections
  const validateSelection = (): boolean => {
    if (availableSizes.length > 0 && !selectedSize) {
      setValidationError('Please select a size.');
      return false;
    }
    if (availableColors.length > 0 && !selectedColor) {
      setValidationError('Please select a color.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    const variantToUse: ProductVariant = activeVariant || {
      id: `var-${product.id}-${selectedSize || 'std'}-${selectedColor || 'std'}`,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      price: currentPrice,
      original_price: originalPrice,
      stock: currentStock
    };

    addToCart(product, variantToUse, quantity);
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;

    const variantToUse: ProductVariant = activeVariant || {
      id: `var-${product.id}-${selectedSize || 'std'}-${selectedColor || 'std'}`,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      price: currentPrice,
      original_price: originalPrice,
      stock: currentStock
    };

    addToCart(product, variantToUse, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await addReview({
        id: `rev-${Date.now()}`,
        product_id: product.id,
        author: reviewAuthor,
        rating: reviewRating,
        comment: reviewComment,
        status: 'approved',
        created_at: new Date().toISOString()
      });
      setReviewSubmitted(true);
      setReviewAuthor('');
      setReviewComment('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const productReviews = reviews.filter((r) => r.product_id === product.id && r.status === 'approved');

  // Carousel scroll helpers for mobile
  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Structured specification entries (only non-empty fields)
  const specifications: { label: string; value: string | undefined }[] = [
    { label: 'Brand', value: product.brand || 'SHAD SODAI' },
    { label: 'Category', value: product.category_name || category?.name },
    { label: 'SKU Code', value: product.sku },
    { label: 'Fabric Composition', value: product.fabric },
    { label: 'Material', value: product.material },
    { label: 'Fit Profile', value: product.fit },
    { label: 'Pattern', value: product.pattern },
    { label: 'Sleeve', value: product.sleeve },
    { label: 'Neck / Collar', value: product.neck_collar },
    { label: 'Gender', value: product.gender },
    { label: 'Season', value: product.season },
    { label: 'Country of Origin', value: product.origin || 'Bangladesh' }
  ].filter((spec) => Boolean(spec.value && spec.value.trim()));

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-4 sm:py-8 pb-28 lg:pb-16 text-stone-800 w-full max-w-full overflow-hidden box-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 w-full max-w-full box-border">
        
        {/* ==================================================
            12. BREADCRUMB: Home / Category / Product Name
            ================================================== */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
          <Link to="/" className="hover:text-[#1B4332] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <Link
            to={category?.slug ? `/categories` : '/shop'}
            className="hover:text-[#1B4332] transition-colors capitalize"
          >
            {product.category_name || category?.name || 'Clothing'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* ==================================================
            1. PRODUCT HERO / MAIN TWO-COLUMN SECTION
            ================================================== */}
        <div className="bg-white border border-stone-200 p-4 sm:p-7 lg:p-8 rounded-xs shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* Left Column: 2. IMAGE GALLERY */}
          <div className="lg:col-span-6 space-y-3">
            {/* Main Product Image */}
            <div className="relative aspect-square w-full bg-stone-100 overflow-hidden border border-stone-200 rounded-xs shadow-2xs group">
              <img
                src={activeImage || product.main_image}
                alt={product.name}
                loading="eager"
                className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Discount / Badge */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                {discountPercent && discountPercent > 0 && (
                  <span className="bg-[#E86A17] text-white text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-2xs shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.is_bestseller && (
                  <span className="bg-[#1B4332] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-2xs shadow-xs">
                    BEST SELLER
                  </span>
                )}
              </div>

              {/* Wishlist / Favorite Icon */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-xs transition-colors cursor-pointer ${
                  isFavorite ? 'text-red-500' : 'text-stone-400 hover:text-stone-700'
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Gallery (thumbnails below) */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 border overflow-hidden rounded-xs transition-all cursor-pointer ${
                      activeImage === img
                        ? 'border-[#1B4332] ring-2 ring-[#1B4332] shadow-xs scale-102'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: PRODUCT INFORMATION (Order per requirement) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              
              {/* 1. CATEGORY */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8D5B4C]">
                  {product.category_name || category?.name || 'Clothing & Apparel'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono">
                  {product.brand || 'SHAD SODAI'}
                </span>
              </div>

              {/* 2. PRODUCT NAME */}
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 font-serif tracking-tight uppercase leading-tight">
                  {product.name}
                </h1>
                {product.bn_name && (
                  <p className="text-stone-500 text-xs sm:text-sm font-medium mt-0.5">
                    {product.bn_name}
                  </p>
                )}
              </div>

              {/* 3. SHORT DESCRIPTION */}
              {product.short_description && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* 4. RATING + REVIEW COUNT + STOCK STATUS */}
              <div className="flex items-center gap-2.5 sm:gap-3 text-xs border-y border-stone-100 py-2.5 flex-wrap">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-stone-300'
                      }`}
                    />
                  ))}
                  <span className="font-bold text-stone-900 ml-1">
                    {(product.rating || 5.0).toFixed(1)}
                  </span>
                </div>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500">
                  {productReviews.length} Review{productReviews.length !== 1 ? 's' : ''}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {currentStock > 0 ? `In Stock (${currentStock} items)` : 'Out of Stock'}
                </span>
              </div>

              {/* 5. CURRENT PRICE + ORIGINAL PRICE + DISCOUNT */}
              <div className="bg-[#FFFDF7] p-3 sm:p-3.5 border border-stone-200 rounded-xs space-y-1.5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-[#1B4332] font-mono">
                    ৳{currentPrice.toLocaleString('en-US')}
                  </span>
                  {originalPrice > currentPrice && (
                    <span className="text-sm sm:text-base text-stone-400 line-through font-mono">
                      ৳{originalPrice.toLocaleString('en-US')}
                    </span>
                  )}
                  {discountPercent && (
                    <span className="text-xs font-bold text-[#E86A17] bg-[#E86A17]/10 px-2 py-0.5 rounded-2xs">
                      SAVE {discountPercent}%
                    </span>
                  )}
                </div>

                {/* Calculation breakdown when Extra Price is active (Requirement 6) */}
                {selectedSize && activeSizeExtra > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] text-stone-600 font-medium pt-1 border-t border-stone-100">
                    <span>Base Price: <strong className="font-mono text-stone-800 font-bold">৳{baseSellingPrice.toLocaleString('en-US')}</strong></span>
                    <span className="text-stone-300">•</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 rounded-2xs">
                      {selectedSize} Size Extra: +৳{activeSizeExtra}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span>Current Price: <strong className="font-mono text-[#1B4332] font-bold">৳{currentPrice.toLocaleString('en-US')}</strong></span>
                  </div>
                )}
              </div>

              {/* 6. SELECT SIZE (Sizes appear before Color per requirement 3) */}
              {availableSizes.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>SELECT SIZE:</span>
                      {selectedSize && (
                        <span className="text-[#1B4332] font-black font-mono">[{selectedSize}]</span>
                      )}
                    </label>
                    {/* SIZE GUIDE LINK */}
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideModalOpen(true)}
                      className="text-[11px] text-[#1B4332] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5 text-[#1B4332]" />
                      <span>Size Guide</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      const extra = getSizeExtraPrice(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeClick(size)}
                          className={`min-w-11 sm:min-w-12 h-10 px-3 text-xs font-bold uppercase tracking-wider rounded-xs border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs scale-102 ring-2 ring-[#1B4332]/30'
                              : 'bg-white text-stone-800 border-stone-300 hover:border-stone-500 hover:bg-stone-50'
                          }`}
                        >
                          <span>{size}</span>
                          {extra > 0 && (
                            <span className={`text-[9px] font-mono px-1 py-0.5 rounded-2xs font-bold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              +৳{extra}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7. SELECT COLOR (Color appears directly below Size) */}
              {availableColors.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>SELECT COLOR:</span>
                    {selectedColor && (
                      <span className="text-[#1B4332] font-black">[{selectedColor}]</span>
                    )}
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                      const isSelected = selectedColor.toLowerCase() === color.name.toLowerCase();
                      const swatchColor = getColorHex(color.name, color.hex);

                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => handleColorClick(color)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xs border transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xs ring-2 ring-stone-900/30'
                              : 'bg-white text-stone-800 border-stone-300 hover:border-stone-500 hover:bg-stone-50'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0"
                            style={{ backgroundColor: swatchColor }}
                          />
                          <span>{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Purchase Validation Warning */}
              {validationError && (
                <div className="flex items-center gap-1.5 p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xs text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* 8. QUANTITY [-] [1] [+] with Total calculated beside it */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  QUANTITY:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 bg-white rounded-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-1.5 text-stone-700 hover:bg-stone-100 font-bold text-sm cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-stone-900 font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(currentStock || 99, quantity + 1))}
                      className="px-3.5 py-1.5 text-stone-700 hover:bg-stone-100 font-bold text-sm cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-stone-600 font-medium">
                    Total: <strong className="text-stone-900 font-mono font-bold">৳{(currentPrice * quantity).toLocaleString('en-US')}</strong>
                  </span>
                </div>
              </div>

              {/* 9. PURCHASE BUTTONS (Vertically stacked on both desktop and mobile) */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xs shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full bg-[#E86A17] hover:bg-[#d05c10] text-white py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xs shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>BUY NOW / ORDER NOW</span>
                </button>
              </div>

              {/* 6. TRUST / SERVICE HIGHLIGHTS (Directly below purchase section) */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100 text-[11px] text-stone-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#1B4332] shrink-0" />
                  <span>Fast Delivery Across Bangladesh</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#1B4332] shrink-0" />
                  <span>7-Day Easy Exchange</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0" />
                  <span>100% Authentic Quality</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ==================================================
            7. PRODUCT DETAILS SECTION (Tabbed Professional Experience)
            ================================================== */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          {/* Tabs Navigation Header */}
          <div className="flex border-b border-stone-200 overflow-x-auto bg-stone-50 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveTab('desc')}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'desc'
                  ? 'border-[#1B4332] text-[#1B4332] bg-white'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              Description & Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('size_guide')}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'size_guide'
                  ? 'border-[#1B4332] text-[#1B4332] bg-white'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              Size Guide
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('material')}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'material'
                  ? 'border-[#1B4332] text-[#1B4332] bg-white'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              Material & Care
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'shipping'
                  ? 'border-[#1B4332] text-[#1B4332] bg-white'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              Shipping & Returns
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-[#1B4332] text-[#1B4332] bg-white'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              Customer Reviews ({productReviews.length})
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="p-5 sm:p-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
            
            {/* TAB 1: DESCRIPTION & DETAILS (With 8. Product Specifications) */}
            {activeTab === 'desc' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif uppercase tracking-wide mb-2">
                    Product Description
                  </h3>
                  <p className="whitespace-pre-line text-stone-600 leading-relaxed">
                    {product.long_description || product.short_description}
                  </p>
                </div>

                {/* 8. PRODUCT SPECIFICATIONS (Only non-empty fields) */}
                {specifications.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B4332] border-b pb-1">
                      Product Specifications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {specifications.map((spec) => (
                        <div
                          key={spec.label}
                          className="p-2.5 bg-stone-50 border border-stone-200 rounded-xs"
                        >
                          <span className="text-[10px] font-bold text-stone-500 uppercase block">
                            {spec.label}
                          </span>
                          <span className="text-xs font-semibold text-stone-900">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SIZE GUIDE */}
            {activeTab === 'size_guide' && (
              <div className="space-y-4 max-w-3xl">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif uppercase tracking-wide">
                    Clothing Size & Measurement Chart
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Measurements are in inches. Compare with your favourite well-fitting garment for best accuracy.
                  </p>
                </div>

                <div className="border border-stone-200 rounded-xs overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-200 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Chest (in)</th>
                        <th className="py-2.5 px-3">Length (in)</th>
                        <th className="py-2.5 px-3">Sleeve (in)</th>
                        <th className="py-2.5 px-3">Shoulder (in)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {product.size_chart && product.size_chart.length > 0 ? (
                        product.size_chart.map((row) => (
                          <tr key={row.size} className="hover:bg-stone-50">
                            <td className="py-2 px-3 font-bold">{row.size}</td>
                            <td className="py-2 px-3 font-mono">{row.chest || '—'}</td>
                            <td className="py-2 px-3 font-mono">{row.length || '—'}</td>
                            <td className="py-2 px-3 font-mono">{row.sleeve || '—'}</td>
                            <td className="py-2 px-3 font-mono">{row.shoulder || '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr className="hover:bg-stone-50">
                            <td className="py-2 px-3 font-bold">S</td>
                            <td className="py-2 px-3 font-mono">38"</td>
                            <td className="py-2 px-3 font-mono">27"</td>
                            <td className="py-2 px-3 font-mono">8"</td>
                            <td className="py-2 px-3 font-mono">17"</td>
                          </tr>
                          <tr className="hover:bg-stone-50">
                            <td className="py-2 px-3 font-bold">M</td>
                            <td className="py-2 px-3 font-mono">40"</td>
                            <td className="py-2 px-3 font-mono">28"</td>
                            <td className="py-2 px-3 font-mono">8.5"</td>
                            <td className="py-2 px-3 font-mono">18"</td>
                          </tr>
                          <tr className="hover:bg-stone-50">
                            <td className="py-2 px-3 font-bold">L</td>
                            <td className="py-2 px-3 font-mono">42"</td>
                            <td className="py-2 px-3 font-mono">29"</td>
                            <td className="py-2 px-3 font-mono">9"</td>
                            <td className="py-2 px-3 font-mono">19"</td>
                          </tr>
                          <tr className="hover:bg-stone-50">
                            <td className="py-2 px-3 font-bold">XL</td>
                            <td className="py-2 px-3 font-mono">44"</td>
                            <td className="py-2 px-3 font-mono">30"</td>
                            <td className="py-2 px-3 font-mono">9.5"</td>
                            <td className="py-2 px-3 font-mono">20"</td>
                          </tr>
                          <tr className="hover:bg-stone-50">
                            <td className="py-2 px-3 font-bold">XXL</td>
                            <td className="py-2 px-3 font-mono">46"</td>
                            <td className="py-2 px-3 font-mono">31"</td>
                            <td className="py-2 px-3 font-mono">10"</td>
                            <td className="py-2 px-3 font-mono">21"</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: MATERIAL & CARE */}
            {activeTab === 'material' && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="text-base font-bold text-stone-900 font-serif uppercase tracking-wide">
                  Material & Wash Care Instructions
                </h3>
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-3">
                  {product.fabric && (
                    <div>
                      <strong className="text-stone-900 block font-semibold mb-0.5">Fabric Composition:</strong>
                      <p className="text-stone-700">{product.fabric}</p>
                    </div>
                  )}
                  {product.material && (
                    <div>
                      <strong className="text-stone-900 block font-semibold mb-0.5">Material:</strong>
                      <p className="text-stone-700">{product.material}</p>
                    </div>
                  )}
                  <div>
                    <strong className="text-stone-900 block font-semibold mb-0.5">Care Instructions:</strong>
                    <p className="text-stone-700">
                      {product.care_instructions ||
                        'Machine wash cold inside out with like colors. Do not bleach. Tumble dry on low or hang dry in shade. Warm iron inside out if needed.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SHIPPING & RETURNS */}
            {activeTab === 'shipping' && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="text-base font-bold text-stone-900 font-serif uppercase tracking-wide">
                  Shipping & Exchange Policy
                </h3>
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-2.5 text-xs">
                  <div>
                    <strong className="text-stone-900 block font-semibold mb-0.5">Delivery Timeline:</strong>
                    <p className="text-stone-700">
                      {product.delivery_info ||
                        'Dhaka City: 24 to 48 hours. Outside Dhaka: 3 to 5 business days via express courier.'}
                    </p>
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-semibold mb-0.5">7-Day Easy Exchange Policy:</strong>
                    <p className="text-stone-700">
                      {product.exchange_policy ||
                        'If the size does not fit or you want an alternate color, simply reach out to our team within 7 days of delivery for a prompt exchange.'}
                    </p>
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-semibold mb-0.5">Cash on Delivery:</strong>
                    <p className="text-stone-700">
                      Supported nationwide across all 64 districts in Bangladesh with open-box verification support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CUSTOMER REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 font-serif uppercase tracking-wide">
                      Customer Reviews & Feedback
                    </h3>
                    <p className="text-xs text-stone-500">
                      Average Rating: {(product.rating || 5.0).toFixed(1)} / 5 ({productReviews.length} verified ratings)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewSubmitted(false)}
                    className="self-start sm:self-auto bg-[#1B4332] text-white px-4 py-2 text-xs font-bold uppercase rounded-xs hover:bg-[#2D6A4F] cursor-pointer"
                  >
                    Write a Review
                  </button>
                </div>

                {/* Review Form */}
                {!reviewSubmitted ? (
                  <form onSubmit={handleReviewSubmit} className="bg-stone-50 p-4 border border-stone-200 rounded-xs space-y-3 max-w-lg">
                    <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Leave a Review</h4>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700 block">Your Name</label>
                      <input
                        type="text"
                        required
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        placeholder="e.g. Asif Mahmud"
                        className="w-full bg-white border border-stone-300 p-2 text-xs rounded-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700 block">Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="bg-white border border-stone-300 p-1.5 text-xs rounded-xs"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional Quality & Fit)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value={3}>⭐⭐⭐ (3 - Average)</option>
                        <option value={2}>⭐⭐ (2 - Below Expectations)</option>
                        <option value={1}>⭐ (1 - Disappointed)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700 block">Your Comments</label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience on fabric comfort, fit, stitching, and color quality."
                        className="w-full bg-white border border-stone-300 p-2 text-xs rounded-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-[#1B4332] text-white px-4 py-2 text-xs font-bold uppercase rounded-xs hover:bg-[#2D6A4F] transition-colors cursor-pointer"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs text-xs font-medium">
                    Thank you! Your verified review has been recorded.
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {productReviews.length === 0 ? (
                    <p className="text-stone-400 text-xs">No reviews yet for this product. Be the first to review!</p>
                  ) : (
                    productReviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-xs">{rev.author}</span>
                          <span className="text-[10px] text-stone-400">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Verified Buyer'}
                          </span>
                        </div>
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-stone-700 text-xs">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ==================================================
            9. YOU MAY ALSO LIKE / RELATED PRODUCTS
            (Automatically generated, priority logic, max 8, excludes current)
            ================================================== */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[#1B4332] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E86A17]" />
                  <span>YOU MAY ALSO LIKE</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-stone-900 font-serif uppercase tracking-tight">
                  Related Products
                </h2>
                <p className="text-xs text-stone-500">
                  Carefully curated to match your selected style and collection
                </p>
              </div>

              {/* Mobile Carousel Navigation Arrows */}
              <div className="flex items-center gap-1.5 sm:hidden">
                <button
                  type="button"
                  onClick={() => scrollCarousel(relatedScrollRef, 'left')}
                  className="p-1.5 border border-stone-300 bg-white rounded-xs text-stone-700 hover:bg-stone-50"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel(relatedScrollRef, 'right')}
                  className="p-1.5 border border-stone-300 bg-white rounded-xs text-stone-700 hover:bg-stone-50"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop Grid & Mobile Scroll Carousel */}
            <div
              ref={relatedScrollRef}
              className="grid grid-flow-col auto-cols-[72%] xs:auto-cols-[55%] sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scroll-smooth snap-x snap-mandatory"
            >
              {relatedProducts.map((p) => (
                <div key={p.id} className="snap-start h-full">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================================================
            11. RECENTLY VIEWED (Browsing History)
            (Only rendered if history exists, excludes current product)
            ================================================== */}
        {recentlyViewedProducts.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-stone-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-stone-600" />
                  <span>BROWSING HISTORY</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-stone-900 font-serif uppercase tracking-tight">
                  Recently Viewed
                </h2>
              </div>

              {/* Mobile Carousel Navigation Arrows */}
              <div className="flex items-center gap-1.5 sm:hidden">
                <button
                  type="button"
                  onClick={() => scrollCarousel(recentlyViewedScrollRef, 'left')}
                  className="p-1.5 border border-stone-300 bg-white rounded-xs text-stone-700 hover:bg-stone-50"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel(recentlyViewedScrollRef, 'right')}
                  className="p-1.5 border border-stone-300 bg-white rounded-xs text-stone-700 hover:bg-stone-50"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop Grid & Mobile Scroll Carousel */}
            <div
              ref={recentlyViewedScrollRef}
              className="grid grid-flow-col auto-cols-[72%] xs:auto-cols-[55%] sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scroll-smooth snap-x snap-mandatory"
            >
              {recentlyViewedProducts.map((p) => (
                <div key={p.id} className="snap-start h-full">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ==================================================
          SIZE GUIDE MODAL (Accessible directly from Size selector)
          ================================================== */}
      {isSizeGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-lg w-full p-5 sm:p-6 rounded-xs shadow-2xl space-y-4 border border-stone-300 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#1B4332]" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-serif">
                  Apparel Size Measurement Guide (Inches)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Standard body measurements for {product.name}. Measure around the fullest part of your chest with tape level.
            </p>

            <div className="border border-stone-200 rounded-xs overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-200 uppercase">
                  <tr>
                    <th className="py-2 px-3">Size</th>
                    <th className="py-2 px-3">Chest (in)</th>
                    <th className="py-2 px-3">Length (in)</th>
                    <th className="py-2 px-3">Sleeve (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold">S</td>
                    <td className="py-2 px-3 font-mono">38"</td>
                    <td className="py-2 px-3 font-mono">27"</td>
                    <td className="py-2 px-3 font-mono">8"</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold">M</td>
                    <td className="py-2 px-3 font-mono">40"</td>
                    <td className="py-2 px-3 font-mono">28"</td>
                    <td className="py-2 px-3 font-mono">8.5"</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold">L</td>
                    <td className="py-2 px-3 font-mono">42"</td>
                    <td className="py-2 px-3 font-mono">29"</td>
                    <td className="py-2 px-3 font-mono">9"</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold">XL</td>
                    <td className="py-2 px-3 font-mono">44"</td>
                    <td className="py-2 px-3 font-mono">30"</td>
                    <td className="py-2 px-3 font-mono">9.5"</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold">XXL</td>
                    <td className="py-2 px-3 font-mono">46"</td>
                    <td className="py-2 px-3 font-mono">31"</td>
                    <td className="py-2 px-3 font-mono">10"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsSizeGuideModalOpen(false)}
                className="px-4 py-2 bg-[#1B4332] text-white text-xs font-bold uppercase rounded-xs hover:bg-[#2D6A4F] cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
