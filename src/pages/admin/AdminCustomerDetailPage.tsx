import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, Phone, Mail, MapPin, ShoppingBag, Calendar } from 'lucide-react';

export const AdminCustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orders } = useStore();

  // Find customer by ID from orders or registered customers
  const customerOrders = orders.filter(
    (o) => o.user_id === id || o.customer_phone === id || o.id === id
  );

  const customerName = customerOrders[0]?.customer_name || 'Customer';
  const customerPhone = customerOrders[0]?.customer_phone || id || 'N/A';
  const customerAddress = customerOrders[0]?.customer_address || 'Address on record';
  const customerCity = customerOrders[0]?.customer_city || 'Dhaka';
  const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total ?? o.total_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-stone-200 p-4 sm:p-5 flex items-center justify-between rounded-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="p-2 border border-stone-200 hover:bg-stone-100 rounded-xs text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 font-serif uppercase tracking-tight">
              Customer: {customerName}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Customer identifier: {id}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-2xs">
          <span className="text-xs font-bold text-stone-500 uppercase block">Total Orders</span>
          <span className="text-2xl font-black text-[#1B4332] font-mono">{customerOrders.length}</span>
        </div>
        <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-2xs">
          <span className="text-xs font-bold text-stone-500 uppercase block">Total Lifetime Spent</span>
          <span className="text-2xl font-black text-[#1B4332] font-mono">৳{totalSpent.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-2xs">
          <span className="text-xs font-bold text-stone-500 uppercase block">Delivery Location</span>
          <span className="text-sm font-bold text-stone-800 block mt-1 truncate">{customerCity}</span>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Order Purchase History
          </h2>
        </div>

        {customerOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            No orders found for this customer record.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {customerOrders.map((ord) => (
              <div key={ord.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <Link
                    to={`/admin/orders/${ord.id}`}
                    className="font-mono font-bold text-[#1B4332] hover:underline block"
                  >
                    #{ord.order_number}
                  </Link>
                  <span className="text-stone-400 text-[11px]">
                    {new Date(ord.created_at).toLocaleDateString()} • {ord.items.length} items
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full capitalize text-[10px] font-bold bg-stone-100 text-stone-800">
                    {ord.order_status}
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    ৳{Number(ord.total ?? ord.total_amount ?? 0).toLocaleString()}
                  </span>
                  <Link
                    to={`/admin/orders/${ord.id}`}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 font-bold uppercase rounded-xs"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
