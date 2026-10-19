import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  Truck,
  Users,
  Image as ImageIcon,
  Sparkles,
  Star,
  Headphones,
  CheckCircle2,
  Link2,
  Settings,
  Menu,
  X,
  ExternalLink,
  Database,
  Store
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { isSupabaseActive } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open for consistent Android Chrome viewport behavior
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isCurrent = (path: string, exact: boolean = false) => {
    if (exact) return location.pathname === path || location.pathname === '/admin/dashboard';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Courier API', path: '/admin/couriers', icon: Truck },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Banners', path: '/admin/banners', icon: ImageIcon },
    { label: 'Branding', path: '/admin/branding', icon: Sparkles },
    { label: 'Quick Links', path: '/admin/quick-links', icon: Link2 },
    { label: 'Customer Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Support Inquiries', path: '/admin/support', icon: Headphones },
    { label: 'Quality Process Steps', path: '/admin/process', icon: CheckCircle2 },
    { label: 'Settings & Supabase', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F5F5F4] flex flex-col font-sans selection:bg-[#1B4332] selection:text-white w-full max-w-full overflow-x-hidden m-0 p-0">
      {/* Top Header */}
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between w-full max-w-full shrink-0 m-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-[#1B4332] hover:bg-stone-100 rounded-xs transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#1B4332] text-[#FFFDF7] font-serif font-bold text-base flex items-center justify-center rounded-xs">
              S
            </div>
            <div>
              <span className="text-sm sm:text-base font-extrabold text-stone-900 uppercase tracking-tight font-serif block">
                SHAD SODAI ADMIN PANEL
              </span>
              <span className="text-[10px] text-stone-500 font-medium hidden sm:block">
                Store & Inventory Operations Control
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/settings"
            title="Configure Supabase Database"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-xs border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#1B4332]" />
            <span className={`w-2 h-2 rounded-full ${isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-semibold text-stone-700">
              {isSupabaseActive ? 'Supabase Connected' : 'Connect Supabase'}
            </span>
          </Link>

          <Link
            to="/"
            className="px-3.5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>STOREFRONT</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </Link>
        </div>
      </header>

      {/* Full-Viewport Mobile Sidebar Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-[100dvh] bg-black/50 z-40 md:hidden m-0 p-0"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Workspace Body (Sidebar + Content) */}
      <div className="flex-1 flex w-full max-w-full m-0 p-0">
        {/* Sidebar Navigation: starts at top: 0 with 100dvh on mobile, sticky below header on desktop */}
        <aside
          className={`
            fixed top-0 left-0 bottom-0 z-50 h-[100dvh] max-h-[100dvh]
            md:sticky md:top-16 md:z-20 md:h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-4rem)]
            w-64 bg-white border-r border-stone-200
            shrink-0 px-3.5 pt-2.5 pb-4 md:p-3.5 m-0
            overflow-y-auto overscroll-contain
            transition-transform duration-200 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="flex items-center justify-between px-3 pt-1 pb-2 border-b border-stone-100 mb-1.5 mt-0">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Store Management
            </span>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1 -mr-1 text-stone-500 hover:text-stone-900 rounded-xs transition-colors cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Database connection badge in mobile drawer */}
          <div className="md:hidden px-1 mb-2">
            <Link
              to="/admin/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xs text-[11px]"
            >
              <span className="flex items-center gap-1.5 font-bold text-stone-700">
                <Database className="w-3.5 h-3.5 text-[#1B4332]" />
                Database
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-600">
                <span className={`w-2 h-2 rounded-full ${isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                {isSupabaseActive ? 'Connected' : 'Connect'}
              </span>
            </Link>
          </div>

          <nav className="space-y-1 m-0 p-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[#1B4332] text-white'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
