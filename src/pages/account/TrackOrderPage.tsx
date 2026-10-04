import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Search, PackageCheck, Truck, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { orders } = useStore();

  const [query, setQuery] = useState(searchParams.get('order') || '');
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const orderParam = searchParams.get('order');
    if (orderParam) {
      setQuery(orderParam);
      const clean = orderParam.replace(/^#/, '');
      const found = orders.find(
        (o) =>
          o.order_number.toLowerCase() === clean.toLowerCase() ||
          o.id.toLowerCase() === clean.toLowerCase()
      );
      setResult(found || 'not_found');
    }
  }, [searchParams, orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const clean = query.trim().replace(/^#/, '');
    const found = orders.find(
      (o) =>
        o.order_number.toLowerCase() === clean.toLowerCase() ||
        o.id.toLowerCase() === clean.toLowerCase() ||
        o.customer_phone.includes(clean)
    );
    setResult(found || 'not_found');
  };

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-8 sm:py-12 pb-20 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#8D5B4C] uppercase tracking-widest">
            SHAD SODAI Dispatch
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif uppercase tracking-tight">
            Live Order Tracking
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Check real-time packaging, transit, and delivery progress for your natural food orders.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white border border-stone-200 p-4 rounded-xs shadow-2xs flex gap-2">
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Order Number (e.g. SG-12345) or Customer Phone..."
            className="flex-1 bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
          />
          <button
            type="submit"
            className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
        </form>

        {result === 'not_found' && (
          <div className="p-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs text-xs text-center space-y-2">
            <p className="font-bold">No order found matching "{query}".</p>
            <p className="text-[11px] text-amber-700">
              Please check the spelling of your order number, or contact SHAD SODAI support if you placed your order recently.
            </p>
          </div>
        )}

        {result && result !== 'not_found' && (
          <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-xs shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                <span className="font-mono font-bold text-stone-900 text-base sm:text-lg">
                  Order #{result.order_number}
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  Placed on {new Date(result.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-bold rounded-full capitalize bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                Status: {result.order_status}
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 bg-white border border-emerald-300 rounded-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-stone-900 block">Order Placed</span>
                <span className="text-[10px] text-stone-400">Verified</span>
              </div>
              <div className={`p-3.5 bg-white border rounded-xs ${
                ['processing', 'shipped', 'delivered'].includes(result.order_status)
                  ? 'border-emerald-300'
                  : 'border-stone-200 opacity-40'
              }`}>
                <PackageCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-stone-900 block">Packaging</span>
                <span className="text-[10px] text-stone-400">Hygienic Seal</span>
              </div>
              <div className={`p-3.5 bg-white border rounded-xs ${
                ['shipped', 'delivered'].includes(result.order_status)
                  ? 'border-emerald-300'
                  : 'border-stone-200 opacity-40'
              }`}>
                <Truck className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-stone-900 block">Courier Transit</span>
                <span className="text-[10px] text-stone-400">On The Road</span>
              </div>
              <div className={`p-3.5 bg-white border rounded-xs ${
                result.order_status === 'delivered'
                  ? 'border-emerald-300'
                  : 'border-stone-200 opacity-40'
              }`}>
                <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-stone-900 block">Delivered</span>
                <span className="text-[10px] text-stone-400">Handed Over</span>
              </div>
            </div>

            {/* Summary Details */}
            <div className="bg-[#FFFDF7] p-4 border border-stone-200 rounded-xs text-xs space-y-2 text-stone-700">
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500">Customer:</span>
                <span className="font-bold text-stone-900">{result.customer_name} ({result.customer_phone})</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500">Delivery Address:</span>
                <span className="font-bold text-stone-900 text-right">{result.customer_address}, {result.customer_city}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500">Payment Method:</span>
                <span className="font-bold text-stone-900">{result.payment_method}</span>
              </div>
              {result.transaction_id && result.transaction_id !== 'COD' && (
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-500">Transaction ID (TrxID):</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded text-[11px] border border-stone-200">
                    {result.transaction_id}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500">Payment Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    result.payment_status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : result.payment_status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {result.payment_status === 'paid'
                    ? 'PAID (Verified)'
                    : result.payment_status === 'rejected'
                    ? 'REJECTED'
                    : 'PENDING VERIFICATION'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-stone-500">Total Payable:</span>
                <span className="font-mono font-bold text-base text-[#1B4332]">
                  ৳{(result.total ?? result.total_amount ?? 0).toLocaleString()}
                </span>
              </div>

              {result.payment_status === 'pending' && result.payment_method !== 'cod' && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 mt-2">
                  ⏳ <strong>Payment verification in progress:</strong> Our billing admin will verify your TrxID against the personal account statement and confirm your order promptly.
                </div>
              )}
            </div>

            {/* Items in order */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Items in this Package</h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xs">
                {result.items.map((it: any, i: number) => (
                  <div key={i} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={it.product_image} alt="" className="w-8 h-8 object-cover rounded-xs border" />
                      <div>
                        <span className="font-bold text-stone-900">{it.product_name}</span>
                        <span className="text-[10px] text-stone-400 block">{it.weight} × {it.quantity}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-stone-900">৳{(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <Link
            to="/account"
            className="text-xs text-[#1B4332] hover:underline font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to My Account</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
