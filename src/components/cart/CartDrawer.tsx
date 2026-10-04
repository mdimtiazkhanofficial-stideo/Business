import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    deliveryCharge,
    cartTotal,
    setIsCheckoutOpen,
    settings
  } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = settings.free_delivery_min_order || 50;
  const neededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-full max-w-md bg-[#FFFDF7] border-l border-stone-200 flex flex-col shadow-2xl">
          
          {/* Drawer Header */}
          <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#1B4332]" />
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-900 font-serif">
                Shopping Cart ({cart.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-700"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-stone-100 p-3 text-xs border-b border-stone-200">
            {neededForFreeDelivery > 0 ? (
              <p className="text-stone-700 text-[11px]">
                Add <span className="font-bold text-[#1B4332]">${neededForFreeDelivery.toFixed(2)}</span> more to qualify for <span className="font-bold text-[#E86A17]">Free Shipping!</span>
              </p>
            ) : (
              <p className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                <span>Free delivery unlocked for this order!</span>
              </p>
            )}
            <div className="w-full bg-stone-200 h-1.5 mt-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#1B4332] h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100)}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
                <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">Your shopping bag is empty</p>
                <p className="text-[11px] text-stone-500 mt-1">Discover pure natural dried fruits, nuts, and healthy snacks.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 bg-[#1B4332] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#2D6A4F]"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="pt-3 flex gap-3 items-start">
                  <img
                    src={item.product.main_image}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover border border-stone-200 rounded-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-[#8D5B4C] font-semibold">
                      Option: {[item.selected_variant.size, item.selected_variant.color].filter(Boolean).join(' / ') || item.selected_variant.weight || 'Standard'}
                    </p>
                    <p className="text-xs font-extrabold text-[#1B4332] mt-0.5">
                      ৳{item.selected_variant.price.toLocaleString('en-US')}
                    </p>

                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center border border-stone-300 bg-white rounded-xs">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-stone-600 hover:bg-stone-100 font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-stone-600 hover:bg-stone-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 bg-white border-t border-stone-200 space-y-2.5">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-stone-900">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Standard Shipping:</span>
                  <span className="font-bold text-stone-900">
                    {deliveryCharge === 0 ? 'FREE' : `$${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-stone-200 pt-1.5 flex justify-between text-sm font-extrabold text-stone-900">
                  <span>Order Total:</span>
                  <span className="text-[#1B4332] text-base">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors rounded-xs shadow-2xs"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500 pt-0.5">
                <ShieldCheck className="w-3 h-3 text-[#1B4332]" />
                <span>Secure Checkout & Cash on Delivery Guarantee</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
