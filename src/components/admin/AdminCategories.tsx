import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { DataService } from '../../services/supabase';
import { Plus, Edit2, Trash2, ArrowLeft, X, Layers, Search } from 'lucide-react';

interface AdminCategoriesProps {
  mode?: 'add' | 'edit';
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ mode }) => {
  const { categories, products, saveCategory, deleteCategory, saveProduct, showToast } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const isAddRoute = mode === 'add' || location.pathname === '/admin/categories/add';
  const isEditRoute = mode === 'edit' || Boolean(id) || location.pathname.startsWith('/admin/categories/edit/');
  const isFormMode = isAddRoute || isEditRoute;

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<Omit<Category, 'display_order'> & { display_order: number | string }>({
    id: '',
    name: '',
    bn_name: '',
    slug: '',
    description: '',
    image: '',
    banner_image: '',
    display_order: '',
    is_active: true,
    show_on_homepage: true
  });

  useEffect(() => {
    if (isEditRoute && id) {
      const found = categories.find((c) => c.id === id);
      if (found) {
        setEditingCategory(found);
        setFormState(found);
      }
    } else if (isAddRoute) {
      setEditingCategory(null);
      setFormState({
        id: `cat-${Date.now()}`,
        name: '',
        bn_name: '',
        slug: '',
        description: '',
        image: '',
        banner_image: '',
        display_order: '',
        is_active: true,
        show_on_homepage: true
      });
    }
  }, [id, isAddRoute, isEditRoute, categories]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      let url = '';
      try {
        url = await DataService.uploadImage(file);
      } catch {
        url = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      setFormState((prev) => ({ ...prev, image: url }));
    } catch {
      showToast('Failed to upload category image', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    const slug = formState.slug || formState.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await saveCategory({
      ...formState,
      display_order: Number(formState.display_order) || categories.length + 1,
      slug
    });
    showToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!', 'success');
    navigate('/admin/categories');
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    const catId = categoryToDelete.id;
    const catName = categoryToDelete.name;

    // Check if products exist in this category and reassign them so no orphaned products are left
    const affectedProducts = products.filter((p) => p.category_id === catId);
    if (affectedProducts.length > 0) {
      const fallbackCategory = categories.find((c) => c.id !== catId && c.is_active);
      const fallbackId = fallbackCategory ? fallbackCategory.id : 'cat-tshirts';
      for (const p of affectedProducts) {
        await saveProduct({ ...p, category_id: fallbackId });
      }
    }

    await deleteCategory(catId);
    showToast(`Category "${catName}" deleted successfully!`, 'success');
    setCategoryToDelete(null);
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.bn_name && cat.bn_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && cat.is_active) ||
      (statusFilter === 'inactive' && !cat.is_active);
    return matchesSearch && matchesStatus;
  });

  const productsCountForCat = (catId: string) => {
    return products.filter((p) => p.category_id === catId).length;
  };

  return (
    <div className="space-y-4">
      {isFormMode ? (
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs">
          <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/admin/categories"
                className="p-2 border border-stone-200 bg-white hover:bg-stone-100 rounded-xs text-stone-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h3 className="text-base font-bold text-stone-900 uppercase tracking-wider font-serif">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <p className="text-xs text-stone-500">
                  {editingCategory ? `Editing: ${editingCategory.name}` : 'Configure display settings and details for this category.'}
                </p>
              </div>
            </div>
            <Link
              to="/admin/categories"
              className="text-stone-400 hover:text-stone-700 p-2"
            >
              <X className="w-5 h-5" />
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs max-w-2xl">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="Enter category name"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Bangla Name (বাংলা নাম)</label>
              <input
                type="text"
                value={formState.bn_name || ''}
                onChange={(e) => setFormState({ ...formState, bn_name: e.target.value })}
                placeholder="Enter Bangla category name"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Description / Tagline</label>
              <input
                type="text"
                value={formState.description || ''}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Enter category description"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
              />
            </div>

            {/* Category Image Upload */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category Image</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              {formState.image ? (
                <div className="relative w-32 h-32 bg-stone-100 border border-stone-300 rounded-xs overflow-hidden group">
                  <img
                    src={formState.image}
                    alt="Category Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormState({ ...formState, image: '' })}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs shadow-sm cursor-pointer transition-colors"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 bg-[#FFFDF7] border-2 border-dashed border-stone-300 hover:border-[#1B4332] rounded-xs flex flex-col items-center justify-center cursor-pointer transition-colors text-stone-500 hover:text-[#1B4332]"
                >
                  {isUploading ? (
                    <span className="text-xs font-bold animate-pulse">Uploading...</span>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mb-1">
                        <Plus className="w-5 h-5 text-stone-600" />
                      </div>
                      <span className="text-[11px] font-bold text-center px-1">Upload category image</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Display Sort Order</label>
                <input
                  type="number"
                  value={formState.display_order}
                  onChange={(e) => setFormState({ ...formState, display_order: e.target.value })}
                  placeholder="Enter display sort order"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Status</label>
                <select
                  value={formState.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormState({ ...formState, is_active: e.target.value === 'active' })}
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Homepage Visibility</label>
              <select
                value={formState.show_on_homepage ? 'yes' : 'no'}
                onChange={(e) => setFormState({ ...formState, show_on_homepage: e.target.value === 'yes' })}
                className="w-full sm:w-1/2 bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-[#1B4332] rounded-xs"
              >
                <option value="yes">Show on Homepage</option>
                <option value="no">Hide from Homepage</option>
              </select>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
              <Link
                to="/admin/categories"
                className="px-4 py-2 border border-stone-300 text-stone-700 font-bold uppercase text-xs rounded-xs hover:bg-stone-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold uppercase text-xs rounded-xs shadow-xs"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Action Header */}
          <div className="bg-white border border-stone-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif uppercase">CATEGORY MANAGEMENT</h2>
              <p className="text-xs text-stone-500">
                Manage categories, images and product counts
              </p>
            </div>
            <Link
              to="/admin/categories/add"
              className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors rounded-xs shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Category</span>
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-stone-200 p-3 flex flex-col sm:flex-row items-center gap-3 shadow-2xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full bg-[#FFFDF7] border border-stone-200 pl-9 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#1B4332] rounded-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-44 bg-[#FFFDF7] border border-stone-200 p-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#1B4332] rounded-xs"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Category Cards Grid or Empty State */}
          {filteredCategories.length === 0 ? (
            <div className="bg-white border border-stone-200 p-12 text-center rounded-xs shadow-2xs space-y-3">
              <Layers className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800 font-serif">No Categories Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Create your first category to organize your products.
              </p>
              <div>
                <Link
                  to="/admin/categories/add"
                  className="inline-flex items-center gap-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs shadow-2xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Category</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredCategories.map((cat) => {
                const pCount = productsCountForCat(cat.id);

                return (
                  <div
                    key={cat.id}
                    className="bg-white border border-stone-200 rounded-xs p-3 shadow-2xs flex flex-col justify-between gap-3 group hover:border-[#1B4332] transition-all"
                  >
                    {/* Top: Image Left + Info Right */}
                    <div className="flex items-center gap-3.5">
                      {/* Small Square Thumbnail (~90-100px) */}
                      <div className="w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] bg-stone-100 border border-stone-200 rounded-xs overflow-hidden shrink-0 relative">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50">
                            <Layers className="w-6 h-6 mb-0.5 opacity-50" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">No Image</span>
                          </div>
                        )}
                        {!cat.is_active && (
                          <span className="absolute top-1 right-1 bg-stone-800/80 text-white text-[8px] font-bold uppercase px-1 py-0.2 rounded-2xs">
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Text Content Right */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-bold text-stone-900 text-sm sm:text-base line-clamp-1 font-serif">
                          {cat.name}
                        </h3>
                        {cat.bn_name && (
                          <p className="text-xs text-stone-500 font-bengali line-clamp-1">
                            {cat.bn_name}
                          </p>
                        )}
                        <p className="text-xs font-bold text-[#1B4332] pt-0.5">
                          {pCount} Products
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Action Buttons [ EDIT ] [ DELETE ] */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                      <Link
                        to={`/admin/categories/edit/${cat.id}`}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors text-center"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(cat)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors border border-red-200 cursor-pointer text-center"
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

          {/* Delete Confirmation Modal with Product Safeguard */}
          {categoryToDelete && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-stone-300 w-full max-w-sm p-5 space-y-4 rounded-xs shadow-lg animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-serif">
                      Delete Category?
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Are you sure you want to delete <strong className="text-stone-900">"{categoryToDelete.name}"</strong>?
                    </p>
                    {productsCountForCat(categoryToDelete.id) > 0 && (
                      <p className="text-[11px] font-bold text-amber-800 bg-amber-50 p-2 border border-amber-200 rounded-xs mt-2">
                        This category contains {productsCountForCat(categoryToDelete.id)} products. Deleting it will reassign these products to another active category so no orphaned products are created.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(null)}
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
    </div>
  );
};
