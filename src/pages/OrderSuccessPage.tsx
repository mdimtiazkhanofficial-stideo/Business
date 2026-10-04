import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, ShoppingBag, Truck, ArrowRight, PackageCheck, PhoneCall } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { orders } = useStore();

  const order = orders.find((o) => o.order_number === orderNumber || o.id === orderNumber);

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-10 sm:py-16 pb-20 md:pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Success Card */}
        <div className="bg-white border border-stone-200 p-6 sm:p-10 rounded-xs shadow-2xs text-center space-y-6">
          
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#8D5B4C] uppercase tracking-widest block">
              SHAD SODAI Natural Foods
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif uppercase tracking-tight">
              Order Confirmed!
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Thank you for choosing SHAD SODAI. We have received your order and our packaging specialists will begin hygienic nitrogen sealing promptly.
            </p>
          </div>

          {/* Order ID Box */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-xs inline-block min-w-[280px]">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Your Order Number
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#1B4332] font-mono tracking-wider">
              #{orderNumber}
            </span>
          </div>

          {order && (
            <div className="text-left bg-[#FFFDF7] border border-stone-200 p-4 sm:p-5 rounded-xs text-xs space-y-3">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Customer:</span>
                <span className="font-bold text-stone-900">{order.customer_name} ({order.customer_phone})</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Destination:</span>
                <span className="font-bold text-stone-900 text-right">{order.customer_address}, {order.customer_city}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Payment Method:</span>
                <span className="font-bold text-stone-900">{order.payment_method}</span>
              </div>
              {order.transaction_id && order.transaction_id !== 'COD' && (
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-500">Transaction ID (TrxID):</span>
                  <span className="font-mono font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-900 border border-stone-200">
                    {order.transaction_id}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Total Payable:</span>
                <span className="font-mono font-bold text-[#1B4332] text-sm">
                  ৳{(order.total ?? order.total_amount ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Payment Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider ${
                    order.payment_status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.payment_status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.payment_status === 'paid'
                    ? 'PAID (Verified)'
                    : order.payment_status === 'rejected'
                    ? 'REJECTED'
                    : 'PENDING VERIFICATION'}
                </span>
              </div>

              {order.payment_status === 'pending' && order.payment_method !== 'cod' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xs text-[11px] text-amber-900">
                  <p className="font-semibold">
                    ℹ️ Your payment submission is currently <strong>PENDING</strong> verification.
                  </p>
                  <p className="text-amber-800 mt-0.5">
                    Our billing team will check the personal account statement against your TrxID and confirm your order promptly.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              to={`/account/track-order?order=${orderNumber}`}
              className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Delivery</span>
            </Link>

            <Link
              to="/shop"
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
