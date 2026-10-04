import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Star, CheckCircle, MessageSquarePlus } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  const { reviews, addReview, products } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [productId, setProductId] = useState(products[0]?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    await addReview({
      id: `rev-${Date.now()}`,
      product_id: productId,
      product_name: products.find((p) => p.id === productId)?.name,
      customer_name: name,
      rating,
      comment,
      verified_purchase: true,
      status: 'approved',
      created_at: new Date().toISOString().split('T')[0]
    });

    setName('');
    setComment('');
    setShowAddForm(false);
  };

  return (
    <section className="py-8 sm:py-12 bg-white border-b border-stone-200 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-4 sm:mb-6 border-b border-stone-200 pb-3">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#8D5B4C] uppercase tracking-wider block">
              VERIFIED TESTIMONIALS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-tight uppercase mt-0.5">
              CUSTOMER REVIEWS
            </h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] sm:text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1 uppercase tracking-wider border border-[#1B4332]/30 px-2.5 py-1 rounded-xs transition-colors shrink-0"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close' : 'Write Review'}</span>
          </button>
        </div>

        {/* Review Form Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-[#FFFDF7] border border-stone-300 max-w-lg mx-auto space-y-3 rounded-xs shadow-2xs"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">Share Your Experience</h4>
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Your Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David Reynolds"
                className="w-full bg-white border border-stone-300 p-2 text-xs text-stone-800 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2 text-xs text-stone-800 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Rating (1 to 5)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 p-2 text-xs text-stone-800 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                  <option value={2}>⭐⭐ (2/5)</option>
                  <option value={1}>⭐ (1/5)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Your Comments</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about the freshness, taste, and packaging..."
                className="w-full bg-white border border-stone-300 p-2 text-xs text-stone-800 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
              />
            </div>

            <button
              type="submit"
              className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded-xs shadow-2xs"
            >
              Submit Review
            </button>
          </form>
        )}

        {/* 3 Review Cards on Desktop, Horizontal Scroll on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {reviews.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-[#FFFDF7] border border-stone-200 p-3.5 sm:p-4 flex flex-col justify-between rounded-xs shadow-2xs"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex text-amber-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < review.rating ? 'fill-current text-amber-500' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              {/* Reviewer Info */}
              <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{review.customer_name}</h4>
                  {review.product_name && (
                    <p className="text-[10px] text-[#8D5B4C] font-semibold line-clamp-1">
                      {review.product_name}
                    </p>
                  )}
                </div>
                {review.verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-[9px] text-[#1B4332] font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-2xs">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
