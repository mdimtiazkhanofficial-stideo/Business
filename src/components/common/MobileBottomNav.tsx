import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Home, ShoppingBag, User, MessageCircle, Menu } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { cartCount } = useStore();

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-2 py-1 w-full max-w-full overflow-hidden"
    >
      <div className="grid grid-cols-4 items-center justify-around text-center">
        
        {/* HOME */}
        <NavLink
          to="/"
          id="btn-nav-home"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-[#1B4332]' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Home className="w-5 h-5" strokeWidth={isActive ? 2.3 : 1.8} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1B4332] rounded-full" />
                )}
              </div>
              <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">HOME</span>
            </>
          )}
        </NavLink>

        {/* CART */}
        <NavLink
          to="/cart"
          id="btn-nav-cart"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors relative ${
              isActive ? 'text-[#1B4332]' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <ShoppingBag className="w-5 h-5" strokeWidth={isActive ? 2.3 : 1.8} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#E86A17] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1B4332] rounded-full" />
                )}
              </div>
              <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">CART</span>
            </>
          )}
        </NavLink>

        {/* ACCOUNT */}
        <NavLink
          to="/account"
          id="btn-nav-account"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-[#1B4332]' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <User className="w-5 h-5" strokeWidth={isActive ? 2.3 : 1.8} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1B4332] rounded-full" />
                )}
              </div>
              <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">ACCOUNT</span>
            </>
          )}
        </NavLink>

        {/* SUPPORT */}
        <NavLink
          to="/support"
          id="btn-nav-support"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-[#1B4332]' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <MessageCircle className="w-5 h-5" strokeWidth={isActive ? 2.3 : 1.8} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1B4332] rounded-full" />
                )}
              </div>
              <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">SUPPORT</span>
            </>
          )}
        </NavLink>

      </div>
    </nav>
  );
};
