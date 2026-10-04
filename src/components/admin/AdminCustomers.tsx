import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Search, Mail, Phone, MapPin, Eye } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { customers, orders } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');

  // Compute enriched customer data with orders
  const customerList = customers.map((c) => {
    const customerOrders = orders.filter((o) => o.customer_phone === c.phone || (c.email && o.customer_email === c.email));
    const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total ?? (o as any).total_amount ?? 0), 0);
    return {
      ...c,
      total_orders: customerOrders.length,
      total_spent: totalSpent
    };
  });

  const cities = ['all', ...Array.from(new Set(customers.map((c) => c.city).filter(Boolean)))];

  const filteredCustomers = customerList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCity = filterCity === 'all' || c.city === filterCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="bg-white border border-stone-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 font-serif">Customer Base</h2>
          <p className="text-xs text-stone-500">
            {customers.length} registered customers in SHAD SODAI database
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#1B4332]"
            />
          </div>

          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="bg-[#FFFDF7] border border-stone-300 p-1.5 text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#1B4332]"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === 'all' ? 'All Locations' : city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-stone-200 overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs text-stone-700">
          <thead className="bg-stone-50 text-stone-500 uppercase font-bold border-b border-stone-200 text-[11px]">
            <tr>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Contact Info</th>
              <th className="p-3.5">Delivery Address</th>
              <th className="p-3.5 text-center">Orders</th>
              <th className="p-3.5 text-right">Total Spent</th>
              <th className="p-3.5">Joined Date</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-400 text-xs">
                  No customers found matching the search criteria.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          to={`/admin/customers/${cust.id}`}
                          className="font-bold text-stone-900 block hover:text-[#1B4332] hover:underline"
                        >
                          {cust.name}
                        </Link>
                        <span className="text-[10px] text-stone-400">ID: {cust.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-stone-800">
                      <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{cust.phone || 'N/A'}</span>
                    </div>
                    {cust.email && (
                      <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                        <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>{cust.email}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="font-medium text-stone-800">{cust.city}</span>
                    </div>
                    <span className="text-[11px] text-stone-500 block line-clamp-1">
                      {cust.address || 'Address not specified'}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center justify-center font-bold bg-stone-100 text-stone-800 px-2.5 py-0.5 rounded-full text-[11px]">
                      {cust.total_orders}
                    </span>
                  </td>

                  <td className="p-3.5 text-right font-black text-[#1B4332] text-sm">
                    ৳{cust.total_spent.toLocaleString()}
                  </td>

                  <td className="p-3.5 text-stone-500 text-[11px]">
                    {cust.created_at ? new Date(cust.created_at).toLocaleDateString() : 'Recent'}
                  </td>

                  <td className="p-3.5 text-right">
                    <Link
                      to={`/admin/customers/${cust.id}`}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#1B4332] hover:bg-emerald-50 border border-emerald-200 rounded-xs transition-colors"
                      title="View Customer Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
