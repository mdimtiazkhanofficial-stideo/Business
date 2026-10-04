import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Database } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings, isSupabaseActive } = useStore();

  const announcementMessage =
    settings.announcement_text ||
    'Premium Clothing & Essentials • 7-Day Easy Exchange • Free Delivery on Orders Over ৳1500 • Cash on Delivery Available Nationwide';

  // Single unit to be repeated in the ticker
  const tickerItem = (
    <div className="inline-flex items-center gap-4 sm:gap-6 px-4 shrink-0 text-[11px] sm:text-xs font-semibold tracking-wider uppercase whitespace-nowrap">
      <span className="flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-[#F4A261] shrink-0 fill-current" />
        <span>{announcementMessage}</span>
      </span>

      {isSupabaseActive && (
        <span className="inline-flex items-center gap-1 text-[10px] bg-[#2D6A4F] text-emerald-100 px-2 py-0.2 rounded-full font-mono lowercase tracking-normal">
          <Database className="w-2.5 h-2.5" /> db live
        </span>
      )}

      <span className="text-[#F4A261]/60">•</span>
    </div>
  );

  return (
    <div
      className="bg-[#1B4332] text-[#F3F4F1] w-full max-w-full overflow-hidden overflow-x-clip border-b border-[#2D6A4F]/30 py-1.5 select-none relative z-30 flex items-center"
      style={{ height: '32px', contain: 'paint', touchAction: 'pan-y' }}
      role="region"
      aria-label="Announcement"
    >
      {/* Infinite Smooth Marquee Ticker */}
      <div className="animate-marquee flex items-center whitespace-nowrap">
        {tickerItem}
        {tickerItem}
        {tickerItem}
        {tickerItem}
      </div>
    </div>
  );
};
