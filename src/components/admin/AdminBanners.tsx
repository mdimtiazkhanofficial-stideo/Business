import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Banner, Product } from '../../types';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Search,
  X,
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  ShoppingBag,
  Eye
} from 'lucide-react';

export const AdminBanners: React.FC = () => {
  const { banners, products, saveBanner, deleteBanner, showToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View state: 'list' | 'form'
  const [isFormMode, setIsFormMode] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form states (No Title or Description)
  const [buttonText, setButtonText] = useState<string>('');
  const [buttonLink, setButtonLink] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [bannerType, setBannerType] = useState<'hero' | 'promo'>('hero');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [homepageEnabled, setHomepageEnabled] = useState<boolean>(true);
  const [displayOrder, setDisplayOrder] = useState<number | string>('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Product Selection Mode within the form
  const [isProductPickerOpen, setIsProductPickerOpen] = useState<boolean>(false);
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');

  const openCreateForm = () => {
    setEditingBanner(null);
    setButtonText('');
    setButtonLink('');
    setImageUrl('');
    setBannerType('hero');
    setIsActive(true);
    setHomepageEnabled(true);
    setDisplayOrder('');
    setSelectedProductId(null);
    setIsProductPickerOpen(false);
    setIsFormMode(true);
  };

  const openEditForm = (banner: Banner) => {
    setEditingBanner(banner);
    setButtonText(banner.button_text || '');
    setButtonLink(banner.button_link || '');
    setImageUrl(banner.image_url || banner.image || '');
    setBannerType(banner.type || 'hero');
    setIsActive(banner.is_active ?? true);
    setHomepageEnabled(banner.homepage_enabled ?? true);
    setDisplayOrder(banner.display_order || 1);
    setSelectedProductId(banner.product_id || null);
    setIsProductPickerOpen(false);
    setIsFormMode(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Image size should be less than 8MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setImageUrl(result);
          showToast('Banner image uploaded successfully!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleProduct = (product: Product) => {
    if (selectedProductId === product.id) {
      setSelectedProductId(null);
      showToast(`Unlinked "${product.name}" from banner`, 'info');
    } else {
      setSelectedProductId(product.id);
      showToast(`Linked "${product.name}" to banner`, 'success');
      setIsProductPickerOpen(false);
    }
  };

  const handleRemoveProduct = () => {
    setSelectedProductId(null);
    showToast('Removed connected product', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      showToast('Please upload a Banner Image (1920 × 650 px)', 'error');
      return;
    }

    const newBanner: Banner = {
      id: editingBanner ? editingBanner.id : `ban-${Date.now()}`,
      title: editingBanner?.title || '',
      subtitle: editingBanner?.subtitle || '',
      button_text: buttonText.trim() || 'SHOP NOW',
      button_link: selectedProductId ? `/product/${selectedProductId}` : buttonLink || '/shop',
      image_url: imageUrl.trim(),
      image: imageUrl.trim(),
      type: bannerType,
      is_active: isActive,
      homepage_enabled: homepageEnabled,
      product_id: selectedProductId || undefined,
      display_order: Number(displayOrder) || banners.length + 1,
      created_at: editingBanner?.created_at || new Date().toISOString()
    };

    await saveBanner(newBanner);
    setIsFormMode(false);
    showToast(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!', 'success');
  };

  const handleDelete = async (bannerId: string) => {
    if (confirm('Are you sure you want to permanently delete this banner?')) {
      await deleteBanner(bannerId);
      setIsFormMode(false);
      showToast('Banner deleted successfully', 'info');
    }
  };

  const linkedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;

  const filteredProducts = products.filter(p =>
    !productSearchTerm ||
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(productSearchTerm.toLowerCase()))
  );

  // -------------------------------------------------------------
  // FULL-PAGE PRODUCT SELECTION SCREEN (NO POPUP)
  // -------------------------------------------------------------
  if (isFormMode && isProductPickerOpen) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto pb-20">
        <div className="bg-white border border-stone-200 p-4 sm:p-5 flex items-center justify-between shadow-2xs rounded-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProductPickerOpen(false)}
              className="p-2 border border-stone-200 bg-white hover:bg-stone-100 rounded-xs text-stone-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-stone-900 font-serif uppercase tracking-tight">
                Select Product for Banner Connection
              </h1>
              <p className="text-xs text-stone-500">
                Choose 1 product. Clicking this banner on the homepage will directly open this product details page.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsProductPickerOpen(false)}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs uppercase rounded-xs cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-stone-200 p-3 shadow-2xs rounded-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              placeholder="Search products by title or SKU..."
              className="w-full bg-[#FFFDF7] border border-stone-200 pl-9 pr-3 py-2 text-xs text-stone-800 rounded-xs focus:outline-none focus:border-[#1B4332]"
            />
          </div>
        </div>

        {/* 2-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredProducts.map((prod) => {
            const isSelected = selectedProductId === prod.id;

            return (
              <div
                key={prod.id}
                className={`bg-white border rounded-xs p-3.5 shadow-2xs flex items-center justify-between gap-3 transition-all ${
                  isSelected ? 'border-purple-600 bg-purple-50/30 ring-1 ring-purple-600' : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.main_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80'}
                    alt=""
                    className="w-14 h-14 object-cover rounded-xs border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                      {prod.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                      ৳{prod.selling_price} • Stock: {prod.stock}
                    </p>
                    {prod.sku && (
                      <span className="text-[10px] text-stone-400 font-mono">
                        SKU: {prod.sku}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleProduct(prod)}
                  className={`px-3 py-1.5 font-bold uppercase text-[11px] rounded-xs tracking-wider transition-colors shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-2xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                  }`}
                >
                  {isSelected ? 'SELECTED' : 'ADD'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CREATE / EDIT BANNER SCREEN (NO TITLE, NO DESCRIPTION)
  // -------------------------------------------------------------
  if (isFormMode) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto pb-20">
        {/* Top Header */}
        <div className="bg-white border border-stone-200 p-4 sm:p-5 flex items-center justify-between shadow-2xs rounded-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFormMode(false)}
              className="p-2 border border-stone-200 bg-white hover:bg-stone-100 rounded-xs text-stone-600 transition-colors cursor-pointer"
              title="Back to Banners"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-stone-900 font-serif uppercase tracking-tight">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. BANNER IMAGE: Clickable Upload Area (1920 x 650 px Ratio) */}
          <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-xs block">
                1. Banner Image (1920 × 650 px) *
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                Aspect Ratio 1920 / 650
              </span>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Clickable Upload Area in 1920 x 650 aspect ratio */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full border-2 border-dashed border-stone-300 hover:border-purple-600 rounded-xs overflow-hidden cursor-pointer group bg-stone-50 hover:bg-purple-50/20 transition-all"
              style={{ aspectRatio: '1920 / 650' }}
            >
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Banner Preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                  {/* Dynamic Button Preview overlay */}
                  <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/95 text-[#1B4332] text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1 border border-stone-300 shadow-2xs pointer-events-none">
                    {buttonText || 'SHOP NOW'} →
                  </div>

                  {/* Hover overlay to change */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Click to Change Banner Image</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-600 gap-2 p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-700 group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider text-stone-800 block">
                      UPLOAD BANNER
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono font-semibold block mt-0.5">
                      1920 × 650 px
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Secondary URL input */}
            <div className="pt-1 flex items-center gap-2 text-xs">
              <span className="text-stone-500 shrink-0 font-bold">Or Image URL:</span>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter banner image URL"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-1.5 text-xs font-mono rounded-xs"
              />
            </div>
          </div>

          {/* 2. BUTTON TEXT */}
          <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-5 space-y-3 text-xs">
            <h2 className="font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2.5">
              2. Button Text
            </h2>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Action Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Enter action button text"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-semibold uppercase"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['SHOP NOW', 'BUY NOW', 'VIEW PRODUCT', 'ORDER NOW', 'EXPLORE COLLECTION'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setButtonText(preset)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold uppercase rounded-xs transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. SELECT PRODUCT */}
          <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-purple-700" />
                <h2 className="font-bold text-stone-900 uppercase tracking-wider">
                  3. Select Product (Optional)
                </h2>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                Max 1 Product Connected
              </span>
            </div>

            <p className="text-stone-500 text-xs">
              When a product is linked, clicking this banner on the homepage will immediately open that product details page.
            </p>

            {linkedProduct ? (
              /* Selected Product Slim Horizontal Card */
              <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={linkedProduct.main_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80'}
                    alt=""
                    className="w-12 h-12 object-cover rounded-xs border border-purple-300 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                      Connected Product:
                    </span>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                      {linkedProduct.name}
                    </h4>
                    <span className="text-[11px] text-stone-600 font-mono">
                      ৳{linkedProduct.selling_price} • In Stock ({linkedProduct.stock})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductPickerOpen(true)}
                    className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-purple-300 text-purple-800 font-bold uppercase text-[10px] rounded-xs transition-colors cursor-pointer"
                  >
                    Change Product
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveProduct}
                    className="p-1.5 hover:bg-red-100 text-red-700 rounded-xs transition-colors cursor-pointer"
                    title="Remove connected product"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-stone-600">
                  <ShoppingBag className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>No product currently connected to this banner.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProductPickerOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase text-xs rounded-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ SELECT PRODUCT</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. BANNER TYPE & 5. DISPLAY ON HOMEPAGE */}
          <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-5 space-y-4 text-xs">
            <h2 className="font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2.5">
              4. Settings & Visibility
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Banner Type</label>
                <select
                  value={bannerType}
                  onChange={(e) => setBannerType(e.target.value as any)}
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-semibold"
                >
                  <option value="hero">Hero Slide</option>
                  <option value="promo">Promotional Banner</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Display Order</label>
                <input
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="Enter display order"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-mono font-bold"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={homepageEnabled}
                    onChange={(e) => setHomepageEnabled(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded-xs focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-stone-900 block">Display on Homepage</span>
                    <span className="text-[10px] text-stone-500 block">Shows in Hero Slider</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 6. Sticky Bottom Actions Bar (SAVE BANNER) */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-stone-200 p-3 sm:p-4 z-30 shadow-lg flex items-center justify-between gap-3 mt-8">
            <button
              type="button"
              onClick={() => setIsFormMode(false)}
              className="px-4 py-2 border border-stone-300 text-stone-700 font-bold uppercase rounded-xs hover:bg-stone-50 text-xs cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {editingBanner && (
                <button
                  type="button"
                  onClick={() => handleDelete(editingBanner.id)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold uppercase rounded-xs text-xs cursor-pointer transition-colors"
                >
                  Delete Banner
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-xs text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingBanner ? 'Save Changes' : 'Save Banner'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN VIEW: BANNERS LISTING (VERTICAL STACK ONLY)
  // -------------------------------------------------------------
  return (
    <div className="space-y-4 max-w-full">
      {/* 1. Simple & Clean Header */}
      <div className="bg-white border border-stone-200 p-4 sm:p-5 flex items-center justify-between shadow-2xs rounded-xs">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-stone-900 font-serif uppercase tracking-tight">
            BANNERS
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors rounded-xs shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD BANNER</span>
        </button>
      </div>

      {/* 2. Vertically Stacked Banner Listing (One Below Another) */}
      {banners.length === 0 ? (
        <div className="bg-white border border-stone-200 p-12 text-center rounded-xs shadow-2xs">
          <p className="text-xs text-stone-500 font-medium">No banners added yet.</p>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {banners.map((banner, index) => {
            const img = banner.image_url || banner.image || '';
            const linked = banner.product_id ? products.find(p => p.id === banner.product_id) : null;

            return (
              <div
                key={banner.id}
                className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden w-full transition-all hover:border-purple-300"
              >
                {/* Banner Image with 1920 x 650 aspect ratio */}
                <div
                  className="relative w-full overflow-hidden bg-stone-900/10"
                  style={{ aspectRatio: '1920 / 650' }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs font-mono">
                      1920 × 650 px
                    </div>
                  )}

                  {/* Top status indicator */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-2xs border ${
                        banner.homepage_enabled ?? banner.is_active
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-stone-800/80 text-stone-300 border-stone-700'
                      }`}
                    >
                      {banner.homepage_enabled ?? banner.is_active ? 'Homepage ON' : 'Homepage OFF'}
                    </span>
                  </div>
                </div>

                {/* Banner Meta & Action Buttons */}
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100 bg-white">
                  <div>
                    <p className="text-xs text-stone-700">
                      Connected Product:{' '}
                      {linked ? (
                        <span className="font-bold text-purple-700">{linked.name}</span>
                      ) : (
                        <span className="text-stone-400">None</span>
                      )}
                    </p>
                    <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                      Button: [{banner.button_text || 'SHOP NOW'}]
                    </p>
                  </div>

                  {/* Actions: EDIT & DELETE */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditForm(banner)}
                      className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-800 font-bold uppercase text-[11px] tracking-wider rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>EDIT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(banner.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold uppercase text-[11px] tracking-wider rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>DELETE</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
