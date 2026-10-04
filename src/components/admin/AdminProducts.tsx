import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant, ProductColor, SizeVariant } from '../../types';
import { DataService } from '../../services/supabase';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  ArrowLeft,
  Palette,
  Layers,
  Sparkles,
  PackageOpen
} from 'lucide-react';
import { ProductGalleryUploader } from './ProductGalleryUploader';

interface AdminProductsProps {
  mode?: 'add' | 'edit';
}

const COMMON_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', 'Free Size'];

export const AdminProducts: React.FC<AdminProductsProps> = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { products, categories, saveProduct, deleteProduct, showToast } = useStore();

  const isAddRoute = mode === 'add' || location.pathname === '/admin/products/add';
  const isEditRoute = mode === 'edit' || Boolean(id) || location.pathname.startsWith('/admin/products/edit/');
  const isFormMode = isAddRoute || isEditRoute;

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const name = productToDelete.name;
    await deleteProduct(productToDelete.id);
    showToast(`Product "${name}" deleted successfully!`, 'success');
    setProductToDelete(null);
  };

  // New size and color draft inputs
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('');
  const [newColorImage, setNewColorImage] = useState('');

  // Form State for Add / Edit Product
  const [formState, setFormState] = useState<{
    name: string;
    bn_name: string;
    sku: string;
    category_id: string;
    main_image: string;
    gallery_images: string[];
    short_description: string;
    long_description: string;
    buying_price: number | string;
    selling_price: number | string;
    discount_price: number | string;
    stock: number | string;
    sizes: string[];
    colors: ProductColor[];
    fabric: string;
    material: string;
    fit: string;
    pattern: string;
    sleeve: string;
    neck_collar: string;
    gender: string;
    season: string;
    brand: string;
    origin: string;
    exchange_policy: string;
    tags: string;
    care_instructions: string;
    sizeVariants: SizeVariant[];
    variants: ProductVariant[];
    delivery_info: string;
    seo_title: string;
    seo_description: string;
    status: 'active' | 'inactive' | 'draft';
    is_popular: boolean;
    is_bestseller: boolean;
    is_combo: boolean;
  }>({
    name: '',
    bn_name: '',
    sku: '',
    category_id: '',
    main_image: '',
    gallery_images: [],
    short_description: '',
    long_description: '',
    buying_price: '',
    selling_price: '',
    discount_price: '',
    stock: '',
    sizes: [],
    colors: [],
    fabric: '',
    material: '',
    fit: '',
    pattern: '',
    sleeve: '',
    neck_collar: '',
    gender: '',
    season: '',
    brand: '',
    origin: '',
    exchange_policy: '',
    tags: '',
    care_instructions: '',
    sizeVariants: [],
    variants: [],
    delivery_info: '',
    seo_title: '',
    seo_description: '',
    status: 'active',
    is_popular: false,
    is_bestseller: false,
    is_combo: false
  });

  const [addMode, setAddMode] = useState<'single' | 'batch'>('single');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    product: true,
    images: true,
    description: false,
    price: true,
    stock: false,
    variation: false,
    details: false,
    warranty: false,
    delivery: false,
    seo: false,
    status: false
  });
  const [specRows, setSpecRows] = useState<Array<{ name: string; value: string }>>([]);
  const [batchItems, setBatchItems] = useState<Array<{ name: string; sku: string; price: number | string; stock: number | string }>>([
    { name: '', sku: '', price: '', stock: '' }
  ]);

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const item of batchItems) {
      if (!item.name.trim()) continue;
      const category = categories.find((c) => c.id === formState.category_id);
      const productPayload: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: item.name,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: item.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category_id: formState.category_id,
        category_name: category?.name || '',
        main_image: formState.main_image || '',
        gallery_images: formState.main_image ? [formState.main_image] : [],
        short_description: item.name,
        long_description: item.name,
        buying_price: Number(formState.buying_price) || 0,
        selling_price: Number(item.price) || 0,
        stock: Number(item.stock) || 0,
        rating: 5.0,
        review_count: 1,
        brand: formState.brand || '',
        variants: [],
        delivery_info: '',
        seo_title: item.name,
        seo_description: item.name,
        status: 'active'
      };
      await saveProduct(productPayload);
    }
    showToast('Batch products created successfully!', 'success');
    navigate('/admin/products');
  };

  useEffect(() => {
    if (isEditRoute && id) {
      const prod = products.find((p) => p.id === id);
      if (prod) {
        setEditingProduct(prod);
        setFormState({
          name: prod.name || '',
          bn_name: prod.bn_name || '',
          sku: prod.sku || '',
          category_id: prod.category_id || '',
          main_image: prod.main_image || '',
          gallery_images: Array.isArray(prod.gallery_images) && prod.gallery_images.length > 0
            ? prod.gallery_images
            : (typeof prod.gallery_images === 'string' && prod.gallery_images
                ? (prod.gallery_images as string).split(',').map((s) => s.trim()).filter(Boolean)
                : (prod.main_image ? [prod.main_image] : [])),
          short_description: prod.short_description || '',
          long_description: prod.long_description || '',
          buying_price: prod.buying_price ?? '',
          selling_price: prod.selling_price ?? '',
          discount_price: prod.discount_price || '',
          stock: prod.stock ?? '',
          sizes: prod.sizes && prod.sizes.length > 0
            ? prod.sizes
            : Array.from(new Set((prod.variants || []).map((v) => v.size).filter(Boolean) as string[])),
          colors: prod.colors || [],
          fabric: prod.fabric || '',
          material: prod.material || '',
          fit: prod.fit || '',
          pattern: prod.pattern || '',
          sleeve: prod.sleeve || '',
          neck_collar: prod.neck_collar || '',
          gender: prod.gender || '',
          season: prod.season || '',
          brand: prod.brand || '',
          origin: prod.origin || '',
          exchange_policy: prod.exchange_policy || '',
          tags: (prod.tags || []).join(', '),
          care_instructions: prod.care_instructions || '',
          sizeVariants: (() => {
            if (prod.sizeVariants && Array.isArray(prod.sizeVariants)) {
              return prod.sizeVariants.map((sv) => ({
                size: sv.size,
                extraPrice: Number(sv.extraPrice ?? sv.extra_price ?? 0)
              }));
            }
            if (prod.size_variants && Array.isArray(prod.size_variants)) {
              return prod.size_variants.map((sv) => ({
                size: sv.size,
                extraPrice: Number(sv.extraPrice ?? sv.extra_price ?? 0)
              }));
            }
            if (prod.variants && Array.isArray(prod.variants)) {
              const map = new Map<string, number>();
              prod.variants.forEach((v) => {
                if (v.size) {
                  const diff = Math.max(0, (v.price || prod.selling_price) - prod.selling_price);
                  if (!map.has(v.size) || diff > (map.get(v.size) || 0)) {
                    map.set(v.size, diff);
                  }
                }
              });
              return Array.from(map.entries()).map(([size, extraPrice]) => ({
                size,
                extraPrice
              }));
            }
            return [];
          })(),
          variants: (prod.variants || []).map((v, idx) => ({
            ...v,
            size: v.size || (prod.sizes && prod.sizes[idx % prod.sizes.length]) || 'Standard',
            color: v.color || (prod.colors && prod.colors[0]?.name) || ''
          })),
          delivery_info: prod.delivery_info || '',
          seo_title: prod.seo_title || '',
          seo_description: prod.seo_description || '',
          status: prod.status || 'active',
          is_popular: Boolean(prod.is_popular),
          is_bestseller: Boolean(prod.is_bestseller),
          is_combo: Boolean(prod.is_combo)
        });
      }
    } else if (isAddRoute) {
      setEditingProduct(null);
      setCustomSizeInput('');
      setNewColorName('');
      setNewColorHex('');
      setNewColorImage('');
      setFormState({
        name: '',
        bn_name: '',
        sku: '',
        category_id: '',
        main_image: '',
        gallery_images: [],
        short_description: '',
        long_description: '',
        buying_price: '',
        selling_price: '',
        discount_price: '',
        stock: '',
        sizes: [],
        colors: [],
        fabric: '',
        material: '',
        fit: '',
        pattern: '',
        sleeve: '',
        neck_collar: '',
        gender: '',
        season: '',
        brand: '',
        origin: '',
        exchange_policy: '',
        tags: '',
        care_instructions: '',
        sizeVariants: [],
        variants: [],
        delivery_info: '',
        seo_title: '',
        seo_description: '',
        status: 'active',
        is_popular: false,
        is_bestseller: false,
        is_combo: false
      });
    }
  }, [id, isAddRoute, isEditRoute, products, categories]);

  // Size management helpers
  const handleToggleSize = (size: string) => {
    setFormState((prev) => {
      const exists = prev.sizes.includes(size);
      const updatedSizes = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      const updatedVariants = exists
        ? prev.sizeVariants.filter((v) => v.size !== size)
        : prev.sizeVariants;
      return { ...prev, sizes: updatedSizes, sizeVariants: updatedVariants };
    });
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    const s = customSizeInput.trim().toUpperCase();
    if (!s) return;
    if (!formState.sizes.includes(s)) {
      setFormState((prev) => ({ ...prev, sizes: [...prev.sizes, s] }));
    }
    setCustomSizeInput('');
  };

  const handleRemoveSize = (size: string) => {
    setFormState((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
      sizeVariants: prev.sizeVariants.filter((v) => v.size !== size)
    }));
  };

  // Color management helpers
  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newColorName.trim();
    if (!name) return;

    if (!formState.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setFormState((prev) => ({
        ...prev,
        colors: [
          ...prev.colors,
          {
            name,
            hex: newColorHex.trim() || '#111111',
            image: newColorImage.trim() || undefined
          }
        ]
      }));
    }
    setNewColorName('');
    setNewColorHex('');
    setNewColorImage('');
  };

  const handleRemoveColor = (colorName: string) => {
    setFormState((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.name !== colorName)
    }));
  };

  // Size Variant Pricing Helpers (Requirement 2 & 5)
  const handleAddSizeVariant = () => {
    const usedSizes = new Set(formState.sizeVariants.map((v) => v.size));
    const availableToAdd = formState.sizes.filter((s) => !usedSizes.has(s));

    if (availableToAdd.length === 0) {
      showToast('All configured product sizes already have variant pricing.', 'info');
      return;
    }

    const nextSize = availableToAdd[0];
    setFormState((prev) => ({
      ...prev,
      sizeVariants: [...prev.sizeVariants, { size: nextSize, extraPrice: 0 }]
    }));
  };

  const handleRemoveSizeVariant = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      sizeVariants: prev.sizeVariants.filter((_, i) => i !== index)
    }));
  };

  const handleSizeVariantChange = (
    index: number,
    field: 'size' | 'extraPrice',
    value: string | number
  ) => {
    setFormState((prev) => {
      const updated = [...prev.sizeVariants];
      if (field === 'extraPrice') {
        const num = typeof value === 'number' ? value : Number(value);
        updated[index] = {
          ...updated[index],
          extraPrice: isNaN(num) ? 0 : Math.max(0, num)
        };
      } else if (field === 'size') {
        updated[index] = {
          ...updated[index],
          size: String(value)
        };
      }
      return { ...prev, sizeVariants: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const category = categories.find((c) => c.id === formState.category_id);

    const finalMain = formState.main_image || (formState.gallery_images[0] || '');
    const finalGallery = formState.gallery_images.length > 0
      ? formState.gallery_images
      : (finalMain ? [finalMain] : []);

    const sizeVariantsToSave: SizeVariant[] = formState.sizeVariants.map((sv) => ({
      size: sv.size,
      extraPrice: Math.max(0, Number(sv.extraPrice) || 0)
    }));

    // Backwards-compatible legacy variants for external tools or checkout lookups
    const legacyVariants: ProductVariant[] = (formState.sizes.length > 0 ? formState.sizes : ['Standard']).map(
      (sz, idx) => {
        const sv = sizeVariantsToSave.find((v) => v.size.toLowerCase() === sz.toLowerCase());
        const extra = sv ? sv.extraPrice : 0;
        const sellingPrice = Number(formState.selling_price) + extra;
        const discountPrice = Number(formState.discount_price)
          ? Number(formState.discount_price) + extra
          : sellingPrice;
        return {
          id: `var-${sz}-${idx}`,
          size: sz,
          price: sellingPrice,
          original_price: discountPrice,
          stock: Number(formState.stock)
        };
      }
    );

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formState.name,
      bn_name: formState.bn_name,
      slug: formState.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: formState.sku,
      category_id: formState.category_id,
      category_name: category?.name || 'Clothing & Apparel',
      main_image: finalMain,
      gallery_images: finalGallery,
      short_description: formState.short_description,
      long_description: formState.long_description || formState.short_description,
      buying_price: Number(formState.buying_price),
      selling_price: Number(formState.selling_price),
      discount_price: Number(formState.discount_price) || undefined,
      stock: Number(formState.stock),
      rating: editingProduct ? editingProduct.rating : 5.0,
      review_count: editingProduct ? editingProduct.review_count : 1,
      brand: formState.brand || 'SHAD SODAI',
      sizes: formState.sizes,
      colors: formState.colors,
      sizeVariants: sizeVariantsToSave,
      size_variants: sizeVariantsToSave,
      fabric: formState.fabric,
      material: formState.material,
      fit: formState.fit,
      pattern: formState.pattern,
      sleeve: formState.sleeve,
      neck_collar: formState.neck_collar,
      gender: formState.gender,
      season: formState.season,
      origin: formState.origin,
      exchange_policy: formState.exchange_policy,
      tags: formState.tags.split(',').map((t) => t.trim()).filter(Boolean),
      care_instructions: formState.care_instructions,
      variants: legacyVariants,
      delivery_info: formState.delivery_info,
      seo_title: formState.seo_title || formState.name,
      seo_description: formState.seo_description || formState.short_description,
      status: formState.status,
      is_popular: formState.is_popular,
      is_bestseller: formState.is_bestseller,
      is_combo: formState.is_combo
    };

    await saveProduct(productPayload);
    showToast(editingProduct ? 'Product updated successfully!' : 'Product published successfully!', 'success');
    navigate('/admin/products');
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {!isFormMode && (
        <>
          {/* Action Header */}
          <div className="bg-white border border-stone-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif">Product Management Studio</h2>
              <p className="text-xs text-stone-500">
                Total {products.length} clothing items active in database
              </p>
            </div>
            <Link
              to="/admin/products/add"
              className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors rounded-xs shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Clothing Product</span>
            </Link>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white border border-stone-200 p-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product title or SKU..."
                className="w-full bg-[#FFFDF7] border border-stone-200 pl-9 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-48 bg-[#FFFDF7] border border-stone-200 p-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#1B4332]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vertical Product Cards Listing */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-stone-200 p-8 text-center rounded-xs shadow-2xs">
              <PackageOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-800 font-serif">No Products Found</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {searchTerm || filterCategory !== 'all'
                  ? 'Try adjusting your search or category filter.'
                  : 'Click "+ Add Clothing Product" to create your first product.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((p) => {
                const categoryName =
                  categories.find((c) => c.id === p.category_id)?.name ||
                  p.category_name ||
                  'Uncategorized';

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-stone-200 rounded-xs p-3.5 sm:p-4 shadow-2xs space-y-3"
                  >
                    {/* Main Content Area */}
                    <div className="flex gap-3.5 sm:gap-4 items-start">
                      {/* Main Product Image Container */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 border border-stone-200 rounded-xs overflow-hidden shrink-0">
                        <img
                          src={p.main_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80';
                          }}
                        />
                      </div>

                      {/* Product Information */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Product Title (truncated with ellipsis if long) */}
                        <h3 className="font-bold text-stone-900 text-sm sm:text-base line-clamp-1">
                          {p.name}
                        </h3>

                        {/* Category */}
                        <p className="text-xs text-stone-600">
                          <span className="text-stone-500">Category:</span>{' '}
                          <span className="font-semibold text-[#8D5B4C]">{categoryName}</span>
                        </p>

                        {/* Stock */}
                        <p className="text-xs text-stone-600">
                          <span className="text-stone-500">Stock:</span>{' '}
                          <span className={`font-semibold ${p.stock <= 10 ? 'text-red-600' : 'text-stone-800'}`}>
                            {p.stock} units
                          </span>
                          {p.stock <= 10 && (
                            <span className="ml-1.5 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 border border-red-200 rounded-2xs">
                              Low
                            </span>
                          )}
                        </p>

                        {/* Selling Price */}
                        <div className="text-xs text-stone-600">
                          <span className="text-stone-500">Selling Price:</span>{' '}
                          <span className="font-bold text-sm sm:text-base text-[#1B4332] font-mono">
                            ৳{p.selling_price}
                          </span>
                          {p.discount_price && p.discount_price > p.selling_price && (
                            <span className="ml-2 text-[11px] text-stone-400 line-through font-mono">
                              ৳{p.discount_price}
                            </span>
                          )}
                        </div>

                        {/* Optional SKU */}
                        {p.sku && (
                          <p className="text-[10px] text-stone-400 font-mono">
                            SKU: {p.sku}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Action Buttons: Exactly [ EDIT ] and [ DELETE ] */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                      <Link
                        to={`/admin/products/edit/${p.id}`}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setProductToDelete(p)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {productToDelete && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-stone-300 w-full max-w-sm p-5 space-y-4 rounded-xs shadow-lg animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-serif">
                      Delete Product
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Are you sure you want to delete this product?
                    </p>
                    <p className="text-[11px] font-bold text-stone-800 mt-1 bg-stone-50 p-1.5 border border-stone-200 rounded-xs line-clamp-1">
                      "{productToDelete.name}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setProductToDelete(null)}
                    className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer text-center"
                  >
                    NO
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-2xs text-center"
                  >
                    YES
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Product Direct Page Form */}
      {isFormMode && (
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs">
          <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                to="/admin/products"
                className="p-2 border border-stone-200 bg-white hover:bg-stone-100 rounded-xs text-stone-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h3 className="text-base font-bold text-stone-900 uppercase tracking-wider font-serif">
                  {editingProduct ? 'Edit Clothing Product' : 'Add New Clothing Product'}
                </h3>
                <p className="text-xs text-stone-500">
                  Configure apparel title, sizes, color swatches, variant pricing and images
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-stone-200/70 p-1 rounded-xs">
              <button
                type="button"
                onClick={() => setAddMode('single')}
                className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xs transition-colors cursor-pointer ${addMode === 'single' ? 'bg-[#1B4332] text-white shadow-2xs' : 'text-stone-700 hover:bg-stone-300'}`}
              >
                Single Product
              </button>
              <button
                type="button"
                onClick={() => setAddMode('batch')}
                className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xs transition-colors cursor-pointer ${addMode === 'batch' ? 'bg-[#1B4332] text-white shadow-2xs' : 'text-stone-700 hover:bg-stone-300'}`}
              >
                Batch Add (Multiple)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 text-xs">
            {/* 1. Basic Product Info */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#8D5B4C] uppercase tracking-wider border-b pb-1">
                1. General Product Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Product Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Enter product name"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Product Title (Bengali)</label>
                  <input
                    type="text"
                    value={formState.bn_name}
                    onChange={(e) => setFormState({ ...formState, bn_name: e.target.value })}
                    placeholder="Enter product name in Bengali"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    required
                    value={formState.category_id}
                    onChange={(e) => setFormState({ ...formState, category_id: e.target.value })}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332]"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-stone-700">SKU Code *</label>
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}` }))}
                      className="text-[10px] text-[#1B4332] font-bold uppercase tracking-wider hover:underline cursor-pointer"
                    >
                      Generate SKU
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formState.sku}
                    onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                    placeholder="Enter SKU or product code"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Status *</label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Product Gallery Images (Visual Image Upload Gallery Interface) */}
            <div className="space-y-3">
              <ProductGalleryUploader
                mainImage={formState.main_image}
                galleryImages={formState.gallery_images}
                onChangeMainImage={(url) => setFormState((prev) => ({ ...prev, main_image: url }))}
                onChangeGalleryImages={(images) => setFormState((prev) => ({ ...prev, gallery_images: images }))}
                onError={(msg) => showToast(msg, 'error')}
              />
            </div>

            {/* 3. Base Pricing & Global Stock */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#8D5B4C] uppercase tracking-wider border-b pb-1">
                3. Base Pricing & Inventory (৳ BDT)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Cost Price (৳)</label>
                  <input
                    type="number"
                    value={formState.buying_price}
                    onChange={(e) => setFormState({ ...formState, buying_price: e.target.value })}
                    placeholder="Enter internal buying price"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Selling Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={formState.selling_price}
                    onChange={(e) => setFormState({ ...formState, selling_price: e.target.value })}
                    placeholder="Enter discount / selling price"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Regular / Original (৳)</label>
                  <input
                    type="number"
                    value={formState.discount_price}
                    onChange={(e) => setFormState({ ...formState, discount_price: e.target.value })}
                    placeholder="Enter regular price"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Total Stock (Units) *</label>
                  <input
                    type="number"
                    required
                    value={formState.stock}
                    onChange={(e) => setFormState({ ...formState, stock: e.target.value })}
                    placeholder="Enter stock quantity"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 4. CLOTHING SIZES & COLOR SWATCHES CONFIGURATION (Requirement 9) */}
            <div className="space-y-4 border border-stone-200 p-3.5 bg-stone-50/50 rounded-xs">
              <div className="border-b border-stone-200 pb-2">
                <h4 className="font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5 text-sm">
                  <Layers className="w-4 h-4" />
                  <span>4. Clothing Sizes, Colors & Variant Studio</span>
                </h4>
                <p className="text-[11px] text-stone-500">
                  Select available sizes and add color swatches for this garment. Only configured sizes & colors appear on the customer page.
                </p>
              </div>

              {/* Sub-section A: Available Sizes */}
              <div className="space-y-2">
                <label className="block font-bold text-stone-800 uppercase tracking-wide">
                  A. Configured Available Sizes:
                </label>

                {/* Quick toggle chips */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-stone-500 mr-1">Quick Select:</span>
                  {COMMON_SIZES.map((s) => {
                    const isSelected = formState.sizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleToggleSize(s)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-xs border transition-all ${
                          isSelected
                            ? 'bg-[#1B4332] text-white border-[#1B4332]'
                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                        }`}
                      >
                        {isSelected ? `✓ ${s}` : s}
                      </button>
                    );
                  })}
                </div>

                {/* Custom size input */}
                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="Enter custom size"
                    className="flex-1 bg-white border border-stone-300 p-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="bg-stone-800 hover:bg-stone-900 text-white px-3 py-1.5 text-xs font-bold uppercase rounded-xs"
                  >
                    + Add Size
                  </button>
                </div>

                {/* Active Sizes Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-stone-600">Active Product Sizes:</span>
                  {formState.sizes.length === 0 ? (
                    <span className="text-[11px] text-red-600 font-semibold">No sizes selected (free-size).</span>
                  ) : (
                    formState.sizes.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold rounded-xs text-[11px]"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(s)}
                          className="hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Sub-section B: Available Colors & Swatches */}
              <div className="space-y-2.5 pt-3 border-t border-stone-200">
                <label className="block font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>B. Configured Color Swatches:</span>
                </label>

                {/* Add new color form */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-2.5 border border-stone-200 rounded-xs">
                  <div>
                    <label className="block text-[10px] text-stone-500 font-bold mb-0.5">Color Name *</label>
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Enter color name"
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 font-bold mb-0.5">Swatch Hex</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={newColorHex || '#111111'}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-7 h-7 p-0 border border-stone-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        placeholder="Enter hex color"
                        className="flex-1 bg-[#FFFDF7] border border-stone-300 p-1 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 font-bold mb-0.5">Color Photo (Optional)</label>
                    <div className="flex items-center gap-1.5">
                      {newColorImage ? (
                        <div className="relative w-7 h-7 rounded-xs border border-stone-300 overflow-hidden shrink-0 group">
                          <img src={newColorImage} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewColorImage('')}
                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove color photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}
                      <label className="bg-stone-100 hover:bg-stone-200 border border-stone-300 px-2.5 py-1 text-xs font-bold text-stone-700 rounded-xs cursor-pointer flex items-center gap-1 shrink-0">
                        <Upload className="w-3 h-3 text-[#1B4332]" />
                        <span>{newColorImage ? 'Change' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const url = await DataService.uploadImage(file);
                              setNewColorImage(url);
                              if (!formState.gallery_images.includes(url)) {
                                setFormState((prev) => ({
                                  ...prev,
                                  gallery_images: [...prev.gallery_images, url]
                                }));
                              }
                            } catch {
                              showToast('Failed to upload image', 'error');
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {formState.gallery_images.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) setNewColorImage(e.target.value);
                          }}
                          className="text-[10px] border border-stone-300 bg-white p-1 rounded-xs max-w-[100px] truncate"
                          title="Pick from product gallery photos"
                        >
                          <option value="">From Gallery...</option>
                          {formState.gallery_images.map((gImg, gIdx) => (
                            <option key={gIdx} value={gImg}>Photo #{gIdx + 1}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-1.5 px-3 font-bold uppercase rounded-xs text-xs"
                    >
                      + Add Color
                    </button>
                  </div>
                </div>

                {/* Active Colors List */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {formState.colors.map((c) => (
                    <div
                      key={c.name}
                      className="inline-flex items-center gap-2 p-1.5 bg-white border border-stone-300 rounded-xs shadow-2xs"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: c.hex || '#111' }}
                      />
                      <span className="font-bold text-stone-800">{c.name}</span>
                      {c.image && (
                        <span className="text-[9px] bg-stone-100 text-stone-500 px-1 rounded-2xs">with image</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(c.name)}
                        className="text-stone-400 hover:text-red-600 font-bold ml-1 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-section C: Simple Size-Based Variant Pricing */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wide text-xs sm:text-sm">
                      C. VARIANT PRICING
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Configure extra pricing for individual sizes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSizeVariant}
                    disabled={formState.sizes.length === 0 || formState.sizeVariants.length >= formState.sizes.length}
                    className="self-start sm:self-auto bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 rounded-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ ADD VARIANT</span>
                  </button>
                </div>

                {formState.sizes.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xs">
                    Please activate available sizes in <strong>A. Configured Available Sizes</strong> above first.
                  </div>
                ) : formState.sizeVariants.length === 0 ? (
                  <div className="p-3 bg-stone-50 border border-dashed border-stone-300 text-stone-500 text-xs rounded-xs text-center">
                    No extra size charges configured.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formState.sizeVariants.map((sv, idx) => {
                      const otherUsedSizes = new Set(
                        formState.sizeVariants.filter((_, i) => i !== idx).map((v) => v.size)
                      );
                      const selectableSizes = formState.sizes.filter(
                        (s) => !otherUsedSizes.has(s) || s === sv.size
                      );

                      return (
                        <div
                          key={`${sv.size}-${idx}`}
                          className="flex items-end gap-2.5 sm:gap-3 p-2.5 bg-white border border-stone-200 rounded-xs shadow-2xs"
                        >
                          {/* Size Field */}
                          <div className="flex-1 min-w-0">
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Size
                            </label>
                            <select
                              value={sv.size}
                              onChange={(e) => handleSizeVariantChange(idx, 'size', e.target.value)}
                              className="w-full bg-[#FFFDF7] border border-stone-300 px-2.5 py-1.5 text-xs font-bold text-stone-900 rounded-xs focus:border-[#1B4332] focus:outline-none"
                            >
                              {selectableSizes.map((sz) => (
                                <option key={sz} value={sz}>
                                  {sz}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Extra Price Field */}
                          <div className="flex-1 min-w-0">
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Extra Price (৳)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={sv.extraPrice === 0 ? '0' : sv.extraPrice ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                                handleSizeVariantChange(idx, 'extraPrice', val);
                              }}
                              placeholder="0"
                              className="w-full bg-[#FFFDF7] border border-stone-300 px-2.5 py-1.5 text-xs font-mono font-bold text-stone-900 rounded-xs focus:border-[#1B4332] focus:outline-none"
                            />
                          </div>

                          {/* Small Delete X Button */}
                          <div className="shrink-0 pb-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveSizeVariant(idx)}
                              className="text-stone-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer rounded-xs hover:bg-stone-100 flex items-center justify-center"
                              title={`Remove ${sv.size} variant`}
                              aria-label={`Remove ${sv.size} variant`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 5. Fabric, Fit & Descriptions */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#8D5B4C] uppercase tracking-wider border-b pb-1">
                5. Descriptions, Fabric & Specifications
              </h4>

              <div>
                <label className="block font-bold text-stone-700 mb-1 text-xs">Short Description *</label>
                <input
                  type="text"
                  required
                  value={formState.short_description}
                  onChange={(e) => setFormState({ ...formState, short_description: e.target.value })}
                  placeholder="Enter product description"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 text-xs">Detailed Description *</label>
                <textarea
                  rows={3}
                  value={formState.long_description}
                  onChange={(e) => setFormState({ ...formState, long_description: e.target.value })}
                  placeholder="Enter product features and detailed description"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 text-xs">Fabric Composition</label>
                <input
                  type="text"
                  value={formState.fabric}
                  onChange={(e) => setFormState({ ...formState, fabric: e.target.value })}
                  placeholder="Enter fabric composition"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                />
              </div>

              {/* 2-Column Grid for Specifications */}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                {/* Row 1: Fit Profile | Brand Name */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1 text-xs">Fit Profile</label>
                  <input
                    type="text"
                    value={formState.fit}
                    onChange={(e) => setFormState({ ...formState, fit: e.target.value })}
                    placeholder="Enter fit profile"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1 text-xs">Brand Name</label>
                  <input
                    type="text"
                    value={formState.brand}
                    onChange={(e) => setFormState({ ...formState, brand: e.target.value })}
                    placeholder="Select or enter brand"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                  />
                </div>

                {/* Row 2: Pattern | Sleeve */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1 text-xs">Pattern</label>
                  <input
                    type="text"
                    value={formState.pattern}
                    onChange={(e) => setFormState({ ...formState, pattern: e.target.value })}
                    placeholder="Enter pattern"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1 text-xs">Sleeve</label>
                  <input
                    type="text"
                    value={formState.sleeve}
                    onChange={(e) => setFormState({ ...formState, sleeve: e.target.value })}
                    placeholder="Enter sleeve style"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                  />
                </div>

                {/* Row 3: Neck / Collar | Gender */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1 text-xs">Neck / Collar</label>
                  <input
                    type="text"
                    value={formState.neck_collar}
                    onChange={(e) => setFormState({ ...formState, neck_collar: e.target.value })}
                    placeholder="Enter neck or collar style"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1 text-xs">Gender</label>
                  <input
                    type="text"
                    value={formState.gender}
                    onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                    placeholder="Enter gender"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                  />
                </div>

                {/* Row 4: Season */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1 text-xs">Season</label>
                  <input
                    type="text"
                    value={formState.season}
                    onChange={(e) => setFormState({ ...formState, season: e.target.value })}
                    placeholder="Enter season"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 text-xs">Wash & Care Instructions</label>
                <input
                  type="text"
                  value={formState.care_instructions}
                  onChange={(e) => setFormState({ ...formState, care_instructions: e.target.value })}
                  placeholder="Enter wash and care instructions"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 text-xs">Delivery Information</label>
                <input
                  type="text"
                  value={formState.delivery_info}
                  onChange={(e) => setFormState({ ...formState, delivery_info: e.target.value })}
                  placeholder="Enter delivery information"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 text-xs">Exchange & Return Policy</label>
                <input
                  type="text"
                  value={formState.exchange_policy}
                  onChange={(e) => setFormState({ ...formState, exchange_policy: e.target.value })}
                  placeholder="Enter exchange and return policy"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 text-xs">Product Tags / Keywords (comma separated)</label>
                <input
                  type="text"
                  value={formState.tags}
                  onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
                  placeholder="Enter product keywords"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                />
              </div>
            </div>

            {/* 6. Promotional Flags */}
            <div className="flex flex-wrap gap-4 pt-2 border-t">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={formState.is_popular}
                  onChange={(e) => setFormState({ ...formState, is_popular: e.target.checked })}
                  className="rounded text-[#1B4332]"
                />
                <span>Popular Item (Homepage featured)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={formState.is_bestseller}
                  onChange={(e) => setFormState({ ...formState, is_bestseller: e.target.checked })}
                  className="rounded text-[#1B4332]"
                />
                <span>Best Seller</span>
              </label>
            </div>

            {/* Sticky Bottom Actions Bar */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-stone-200 p-3 sm:p-4 z-30 shadow-lg flex items-center justify-between gap-3 mt-8">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-4 py-2 border border-stone-300 text-stone-700 font-bold uppercase rounded-xs hover:bg-stone-50 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormState(prev => ({ ...prev, status: 'draft' }));
                  }}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold uppercase rounded-xs text-xs cursor-pointer transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-xs shadow-xs transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Clothing Product'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
