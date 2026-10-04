import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Star, CheckCircle, Trash2, Clock, Check, X, ShieldAlert } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const { allReviews, updateReviewStatus, deleteReview, showToast } = useStore();
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const filteredReviews = allReviews.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const pendingCount = allReviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 font-serif uppercase tracking-wide">
            Reviews Moderation & Verification
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Approve customer reviews before they appear publicly on SHAD SODAI product pages.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xs transition-colors ${
              filter === 'all'
                ? 'bg-[#1B4332] text-white'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({allReviews.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xs transition-colors flex items-center gap-1.5 ${
              filter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xs transition-colors ${
              filter === 'approved'
                ? 'bg-[#1B4332] text-white'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            Approved ({allReviews.length - pendingCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs text-stone-700">
          <thead className="bg-stone-50 text-stone-500 uppercase font-bold border-b border-stone-200 text-[11px]">
            <tr>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Product</th>
              <th className="p-3.5">Rating</th>
              <th className="p-3.5">Feedback / Comment</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-400 text-xs">
                  No reviews found matching this filter.
                </td>
              </tr>
            ) : (
              filteredReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-stone-900 block">{rev.customer_name}</span>
                    <span className="text-[10px] text-stone-400">{rev.date || 'Recent'}</span>
                  </td>

                  <td className="p-3.5 text-[#1B4332] font-semibold">
                    {rev.product_name || 'General Product Review'}
                  </td>

                  <td className="p-3.5">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </td>

                  <td className="p-3.5 italic text-stone-600 max-w-sm leading-relaxed">
                    "{rev.comment}"
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 font-bold uppercase text-[10px] rounded-full inline-block ${
                        rev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    {rev.status === 'pending' ? (
                      <button
                        onClick={() => updateReviewStatus(rev.id, 'approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold uppercase rounded-xs inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => updateReviewStatus(rev.id, 'pending')}
                        className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-2.5 py-1 text-[11px] font-bold uppercase rounded-xs inline-flex items-center gap-1"
                      >
                        Set Pending
                      </button>
                    )}

                    <button
                      onClick={() => deleteReview(rev.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded-xs inline-flex items-center"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
