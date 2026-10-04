import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Mail, Phone, Calendar } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const { supportMessages, updateSupportMessageStatus, showToast } = useStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');

  const filteredMessages = supportMessages.filter((m) => {
    if (filterStatus === 'all') return true;
    return m.status === filterStatus;
  });

  const handleStatusChange = async (id: string, status: 'new' | 'in_progress' | 'resolved') => {
    await updateSupportMessageStatus(id, status);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 font-serif uppercase tracking-wide">
            Customer Support & Messages
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage inquiries, ticket requests, and feedback sent by SHAD SODAI customers.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1.5 bg-stone-100 p-1 rounded-xs text-xs font-bold">
          {(['all', 'new', 'in_progress', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 uppercase tracking-wider rounded-xs transition-colors ${
                filterStatus === st
                  ? 'bg-[#1B4332] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st === 'all' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="bg-white border border-stone-200 p-12 text-center text-stone-400 text-xs">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            No customer support inquiries found in this category.
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white border border-stone-200 rounded-xs p-4 shadow-2xs space-y-3 hover:border-stone-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-stone-900">{msg.subject}</h4>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                      msg.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : msg.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {msg.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                    <span className="font-semibold text-stone-700">{msg.customer_name}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-stone-400" /> {msg.customer_email}</span>
                    {msg.customer_phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-stone-400" /> {msg.customer_phone}</span>
                    )}
                    <span className="text-stone-400 text-[11px]">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-bold text-stone-500">Status:</span>
                  <select
                    value={msg.status}
                    onChange={(e) => handleStatusChange(msg.id, e.target.value as any)}
                    className="text-xs border border-stone-300 rounded-xs px-2 py-1 bg-white font-medium focus:outline-hidden focus:border-[#1B4332]"
                  >
                    <option value="new">New Ticket</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-xs border border-stone-100 text-xs text-stone-700 leading-relaxed">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
