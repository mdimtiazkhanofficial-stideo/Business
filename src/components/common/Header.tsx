import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  User,
  Menu,
  Heart
} from 'lucide-react';
import { AnnouncementBar } from './AnnouncementBar';

export const Header: React.FC = () => {
  const {
    wishlist,
    searchQuery,
    setSearchQuery,
    authRole,
    setIsMenuOpen,
    settings
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const companyName = settings.company_name || settings.store_name || 'SHAD SODAI';
  const companyLogo = settings.company_logo || settings.store_logo || '';
  const tagline = settings.footer_tagline || 'Natural Food • Premium Quality';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF7] border-b border-stone-200 w-full max-w-full overflow-x-clip">
      {/* 1. Top Scrolling Marquee Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-2 sm:gap-4 w-full min-w-0">
          
          {/* Top Left: ☰ Three-Line Hamburger Icon + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="p-1.5 -ml-1 text-stone-800 hover:text-[#1B4332] hover:bg-stone-100 rounded-xs transition-colors focus:outline-hidden cursor-pointer shrink-0"
              aria-label="Open Navigation Menu"
              title="Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Logo - Branding */}
            <Link
              to="/"
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group min-w-0"
            >
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="h-7 sm:h-10 max-w-[100px] sm:max-w-[170px] object-contain shrink-0"
                />
              ) : (
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#1B4332] flex items-center justify-center text-[#FFFDF7] font-serif font-bold text-sm sm:text-lg shadow-2xs group-hover:bg-[#2D6A4F] transition-colors rounded-xs shrink-0">
                  {companyName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-lg font-extrabold tracking-tight text-[#1B4332] font-serif truncate block">
                  {companyName}
                </span>
                <span className="text-[8px] sm:text-[10px] tracking-wider text-[#8D5B4C] uppercase font-bold -mt-0.5 sm:-mt-1 font-bengali truncate block">
                  {tagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 shrink-0">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-[#1B4332] border-b-2 border-[#1B4332] pb-1'
                    : 'text-stone-700 hover:text-[#1B4332]'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-[#1B4332] border-b-2 border-[#1B4332] pb-1'
                    : 'text-stone-700 hover:text-[#1B4332]'
                }`
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-[#1B4332] border-b-2 border-[#1B4332] pb-1'
                    : 'text-stone-700 hover:text-[#1B4332]'
                }`
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/support"
              className={({ isActive }) =>
                `text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-[#1B4332] border-b-2 border-[#1B4332] pb-1'
                    : 'text-stone-700 hover:text-[#1B4332]'
                }`
              }
            >
              Support
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-[#1B4332] border-b-2 border-[#1B4332] pb-1'
                    : 'text-stone-700 hover:text-[#1B4332]'
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Right Action Icons: SEARCH | ♡ WISHLIST | (ACCOUNT) | ADMIN */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Search Bar on Desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-48 lg:w-56">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white border border-stone-200 pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-1.5 text-stone-700 hover:text-[#1B4332] cursor-pointer shrink-0"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* ♡ WISHLIST ICON (Right next to ADMIN) */}
            <Link
              to="/account?tab=wishlist"
              className="relative p-1.5 text-stone-700 hover:text-red-500 rounded-xs transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-mono shadow-2xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Account Link on Desktop */}
            <Link
              to="/account"
              className="hidden sm:flex items-center gap-1.5 p-1.5 bg-white border border-stone-200 hover:border-stone-400 text-stone-700 text-xs font-semibold px-2 py-1.5 rounded-xs transition-colors shrink-0"
              title="Customer Account"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Account</span>
            </Link>

            {/* Admin Direct Page Link */}
            <Link
              to="/admin"
              className="px-2 py-1 sm:p-1.5 border text-[11px] sm:text-xs font-semibold flex items-center gap-1 rounded-xs transition-colors bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 shrink-0"
              title="Admin Panel"
            >
              <span>Admin</span>
              {authRole === 'admin' && (
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isSearchOpen && (
          <form onSubmit={handleSearchSubmit} className="md:hidden py-2.5 border-t border-stone-200">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white border border-stone-200 pl-9 pr-3 py-1.5 text-xs text-stone-800 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-stone-400 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </header>
  );
};
