import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    deliveryCharge,
    cartTotal,
    settings
  } = useStore();

  const freeDeliveryThreshold = settings.free_delivery_min_order || 50;
  const neededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  if (cart.length === 0) {
    return (
      <div className="bg-[#FFFDF7] min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white border border-stone-200 p-8 text-center space-y-4 rounded-xs shadow-2xs">
          <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-serif text-stone-900 uppercase">Your Cart is Empty</h2>
          <p className="text-stone-500 text-xs leading-relaxed">
            You haven't added any items to your cart yet.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Start Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-8 sm:py-12 pb-20 md:pb-12 w-full max-w-full overflow-hidden box-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 w-full max-w-full box-border">
        
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif uppercase tracking-tight">
              Shopping Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})
            </h1>
            <p className="text-stone-500 text-xs mt-0.5">Review your selected items before proceeding to checkout.</p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="self-start sm:self-auto text-xs text-stone-500 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xs">
          {neededForFreeDelivery > 0 ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-emerald-900">
                <span>Add <strong>৳{neededForFreeDelivery.toLocaleString()}</strong> more for <strong>FREE Delivery</strong></span>
                <span className="font-bold">{Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100))}%</span>
              </div>
              <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1B4332] h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-900 font-bold">
              <Truck className="w-4 h-4 text-[#1B4332]" />
              <span>Congratulations! You qualify for FREE Delivery across Bangladesh!</span>
            </div>
          )}
        </div>

        {/* Cart Layout: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Items Table / List */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xs shadow-2xs divide-y divide-stone-100 overflow-hidden">
            {cart.map((item) => {
              const itemKey = item.id || `${item.product_id || item.product?.id}-${item.variant_id || item.selected_variant?.id}`;
              const itemImage =
                item.product_image ||
                item.selected_variant?.image ||
                item.product?.main_image ||
                (item.product as any)?.image ||
                (Array.isArray(item.product?.gallery_images) && item.product.gallery_images[0]) ||
                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80';

              const itemName =
                item.product_name ||
                item.product?.name ||
                (item.product as any)?.title ||
                'Product';

              const productId = item.product_id || item.product?.id || '';

              const rawPrice = item.price ?? item.selected_variant?.price ?? item.product?.selling_price ?? (item.product as any)?.price ?? 0;
              const numPrice = Number(rawPrice);
              const safePrice = !isNaN(numPrice) && numPrice > 0 ? numPrice : 0;

              const itemQty = Math.max(1, Number(item.quantity) || 1);
              const lineTotal = safePrice * itemQty;

              const variantLabel =
                item.weight ||
                [item.selected_variant?.size, item.selected_variant?.color].filter(Boolean).join(' / ') ||
                item.size ||
                '';

              return (
                <div
                  key={itemKey}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors"
                >
                  {/* Product Thumbnail & Details */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <img
                      src={itemImage}
                      alt={itemName}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xs border border-stone-200 shrink-0 bg-stone-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <Link
                        to={productId ? `/product/${productId}` : '#'}
                        className="font-bold text-stone-900 text-xs sm:text-sm font-serif hover:text-[#1B4332] line-clamp-1 truncate block"
                      >
                        {itemName}
                      </Link>
                      {variantLabel && (
                        <p className="text-[11px] text-[#8D5B4C] font-semibold mt-0.5">
                          Selected: {variantLabel}
                        </p>
                      )}
                      <p className="text-xs font-mono font-bold text-stone-800 mt-1 sm:hidden">
                        ৳{safePrice.toLocaleString()} each
                      </p>
                    </div>
                  </div>

                  {/* Price & Quantity Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 shrink-0">
                    <div className="hidden sm:block text-right">
                      <span className="text-xs text-stone-400 block text-[10px] uppercase font-bold">Unit Price</span>
                      <span className="text-xs font-mono font-semibold text-stone-800">
                        ৳{safePrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-stone-300 bg-white rounded-xs">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id || productId, itemQty - 1)}
                        className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 font-bold text-xs cursor-pointer active:bg-stone-200"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-stone-900 font-mono min-w-[24px] text-center">
                        {itemQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id || productId, itemQty + 1)}
                        className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 font-bold text-xs cursor-pointer active:bg-stone-200"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-xs text-stone-400 block text-[10px] uppercase font-bold sm:hidden">Total</span>
                      <span className="text-sm font-black text-[#1B4332] font-mono">
                        ৳{lineTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id || productId)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="p-4 bg-stone-50 flex items-center justify-between">
              <Link
                to="/shop"
                className="text-xs font-bold uppercase tracking-wider text-[#1B4332] hover:underline flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-stone-200 p-5 sm:p-6 rounded-xs shadow-2xs space-y-4">
              <h2 className="text-base font-bold font-serif text-stone-900 uppercase tracking-wide border-b border-stone-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-mono font-bold text-stone-900">৳{cartSubtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-mono font-bold text-stone-900">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-700 uppercase font-bold">FREE</span>
                    ) : (
                      `৳${deliveryCharge.toLocaleString()}`
                    )}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-black text-stone-900 uppercase">Grand Total</span>
                  <span className="text-xl font-black text-[#1B4332] font-mono">
                    ৳{cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xs shadow-xs transition-colors cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-[11px] text-stone-500 justify-center">
                <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                <span>Hygienically Packed & Guaranteed Fresh</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
