import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Phone, MessageCircle, Send, X, Headphones } from 'lucide-react';

export const FloatingContact: React.FC = () => {
  const { settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const phone = settings.store_phone || '+1 (800) 555-0199';
  const whatsapp = settings.whatsapp_number || '+18005550199';
  const fbPage = settings.facebook_page_url || 'https://facebook.com';

  return (
    <div className="hidden md:flex fixed bottom-5 left-5 z-30 flex-col items-start gap-2">
      {/* Expanded Actions */}
      {isOpen && (
        <div className="flex flex-col gap-2 mb-1 animate-fadeIn">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20SHAD%20SODAI,%20I%20want%20to%20know%20about%20your%20products`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-2 text-xs font-bold rounded-full shadow-md transition-transform hover:scale-105"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {/* Phone Call */}
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-3 py-2 text-xs font-bold rounded-full shadow-md transition-transform hover:scale-105"
          >
            <Phone className="w-4 h-4" />
            <span>Call Us</span>
          </a>

          {/* Messenger */}
          <a
            href={fbPage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0084FF] hover:bg-[#0073e6] text-white px-3 py-2 text-xs font-bold rounded-full shadow-md transition-transform hover:scale-105"
          >
            <Send className="w-4 h-4" />
            <span>Messenger</span>
          </a>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-3.5 py-2.5 rounded-full shadow-lg border border-[#2D6A4F] transition-all hover:scale-105"
        aria-label="Contact Customer Care"
      >
        {isOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <>
            <Headphones className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold">Support</span>
          </>
        )}
      </button>
    </div>
  );
};
