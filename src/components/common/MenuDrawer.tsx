import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Home,
  ShoppingBag,
  Grid,
  Tag,
  Sparkles,
  ChevronRight,
  ChevronDown,
  User,
  Package,
  Heart,
  Headphones,
  Phone,
  MessageSquare,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

export const MenuDrawer: React.FC = () => {
  const {
    isMenuOpen,
    setIsMenuOpen,
    categories,
    setSelectedCategoryId,
    cartCount,
    wishlist,
    currentUser,
    authRole,
    settings
  } = useStore();

  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState<boolean>(true);
  const navigate = useNavigate();

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, setIsMenuOpen]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  if (!isMenuOpen) return null;

  const handleNavigate = (path: string, categoryId?: string | null) => {
    if (categoryId !== undefined) {
      setSelectedCategoryId(categoryId);
    }
    setIsMenuOpen(false);
    navigate(path);
  };

  const isAdminUser =
    authRole === 'admin' ||
    currentUser?.role === 'admin' ||
    (currentUser as any)?.isAdmin === true;

  const storePhone = settings.contact_phone || '+880 1700-000000';

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 h-[100dvh] z-50 flex m-0 p-0" role="dialog" aria-modal="true">
      {/* 1. Backdrop Overlay (85%-90% drawer, rest dark overlay) */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 h-[100dvh] bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 m-0 p-0"
      />

      {/* 2. Left Slide-out Drawer */}
      <div className="relative top-0 left-0 w-[86vw] max-w-[340px] sm:max-w-sm bg-white h-[100dvh] max-h-[100dvh] m-0 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250 border-r border-stone-200">
        
        {/* =======================================================
            4. MENU HEADER: [Logo] SHAD SODAI / Natural Food + [X] Close
        ======================================================= */}
        <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between shrink-0">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xs bg-[#1B4332] flex items-center justify-center text-[#FFFDF7] font-serif font-black text-base shadow-2xs group-hover:bg-[#2D6A4F] transition-colors">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-[#1B4332] font-serif">
                SHAD SODAI
              </span>
              <span className="text-[9px] tracking-widest text-[#8D5B4C] uppercase font-bold -mt-0.5">
                Natural Food
              </span>
            </div>
          </Link>

          {/* Close Icon (✕) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close Menu"
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =======================================================
            SCROLLABLE MENU CONTENT
        ======================================================= */}
        <div className="overflow-y-auto flex-1 p-3.5 space-y-4">

          {/* 5. MAIN MENU ITEMS */}
          <div className="space-y-1">
            {/* HOME */}
            <button
              type="button"
              onClick={() => handleNavigate('/')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 hover:text-[#1B4332] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-[#1B4332]" />
                <span>HOME</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B4332] transition-colors" />
            </button>

            {/* SHOP ALL PRODUCTS */}
            <button
              type="button"
              onClick={() => handleNavigate('/shop', null)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 hover:text-[#1B4332] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-[#1B4332]" />
                <span>SHOP ALL PRODUCTS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B4332] transition-colors" />
            </button>

            {/* BROWSE CATEGORIES */}
            <button
              type="button"
              onClick={() => handleNavigate('/categories')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 hover:text-[#1B4332] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Grid className="w-4 h-4 text-[#1B4332]" />
                <span>BROWSE CATEGORIES</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B4332] transition-colors" />
            </button>

            {/* OFFERS / DEALS */}
            <button
              type="button"
              onClick={() => handleNavigate('/shop?filter=deals', null)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 hover:text-[#1B4332] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-[#E86A17]" />
                <span>OFFERS / DEALS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B4332] transition-colors" />
            </button>

            {/* NEW ARRIVALS */}
            <button
              type="button"
              onClick={() => handleNavigate('/shop?filter=new', null)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 hover:text-[#1B4332] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                <span>NEW ARRIVALS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B4332] transition-colors" />
            </button>
          </div>

          {/* Thin Divider */}
          <hr className="border-t border-stone-200" />

          {/* =======================================================
              6. CATEGORY SECTION (Expandable / Dynamic Database List)
          ======================================================= */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-stone-900 hover:bg-stone-50 rounded-xs transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                  CATEGORIES
                </span>
                {categories.length > 0 && (
                  <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded-xs">
                    {categories.length}
                  </span>
                )}
              </div>
              {isCategoriesExpanded ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
            </button>

            {/* Expandable Category List */}
            {isCategoriesExpanded && (
              <div className="pl-2 pr-1 space-y-0.5 animate-in fade-in duration-150">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleNavigate(`/shop?category=${cat.id}`, cat.id)}
                      className="w-full flex items-center justify-between py-2 px-3 text-xs text-stone-700 hover:text-[#1B4332] hover:bg-emerald-50/50 rounded-xs text-left transition-colors group"
                    >
                      <span className="truncate pr-2 group-hover:font-semibold">
                        › {cat.name}
                      </span>
                      <ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-[#1B4332] shrink-0" />
                    </button>
                  ))
                ) : (
                  <p className="text-[11px] text-stone-400 px-3 py-1">
                    No categories found
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Thin Divider */}
          <hr className="border-t border-stone-200" />

          {/* =======================================================
              7. CUSTOMER SECTION
          ======================================================= */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-3 block mb-1">
              CUSTOMER AREA
            </span>

            {/* MY ACCOUNT */}
            <button
              type="button"
              onClick={() => handleNavigate(currentUser ? '/account' : '/login')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 hover:text-[#1B4332] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#1B4332]" />
                <span>MY ACCOUNT</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B4332] transition-colors" />
            </button>

            {/* MY ORDERS */}
            <button
              type="button"
              onClick={() => handleNavigate(currentUser ? '/account' : '/track-order')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 hover:text-[#1B4332] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-[#1B4332]" />
                <span>MY ORDERS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B4332] transition-colors" />
            </button>

            {/* CART */}
            <button
              type="button"
              onClick={() => handleNavigate('/cart')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 hover:text-[#1B4332] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-[#1B4332]" />
                <span>CART</span>
              </div>
              <div className="flex items-center gap-1.5">
                {cartCount > 0 && (
                  <span className="bg-[#E86A17] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                    {cartCount}
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B4332] transition-colors" />
              </div>
            </button>

            {/* WISHLIST */}
            <button
              type="button"
              onClick={() => handleNavigate(currentUser ? '/account' : '/shop')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 hover:text-[#1B4332] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-[#E86A17]" />
                <span>WISHLIST</span>
              </div>
              <div className="flex items-center gap-1.5">
                {wishlist.length > 0 && (
                  <span className="bg-stone-200 text-stone-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                    {wishlist.length}
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B4332] transition-colors" />
              </div>
            </button>

            {/* SUPPORT */}
            <button
              type="button"
              onClick={() => handleNavigate('/support')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 hover:text-[#1B4332] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Headphones className="w-4 h-4 text-[#1B4332]" />
                <span>SUPPORT</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B4332] transition-colors" />
            </button>
          </div>

        </div>

        {/* =======================================================
            8. SUPPORT SECTION (Fixed at bottom)
        ======================================================= */}
        <div className="p-3.5 bg-[#FFFDF7] border-t border-stone-200 space-y-2 shrink-0">
          
          {/* CONTACT US */}
          <button
            type="button"
            onClick={() => handleNavigate('/contact')}
            className="w-full flex items-center gap-2.5 py-1.5 px-2 text-xs font-bold text-stone-700 hover:text-[#1B4332] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#1B4332]" />
            <span className="uppercase tracking-wider">☎ CONTACT US</span>
            <span className="text-[10px] text-stone-400 font-mono ml-auto">{storePhone}</span>
          </button>

          {/* SUPPORT & HELPDESK */}
          <button
            type="button"
            onClick={() => handleNavigate('/support')}
            className="w-full flex items-center gap-2.5 py-1.5 px-2 text-xs font-bold text-stone-700 hover:text-[#1B4332] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#1B4332]" />
            <span className="uppercase tracking-wider">💬 SUPPORT & HELPDESK</span>
          </button>
        </div>

      </div>
    </div>
  );
};
