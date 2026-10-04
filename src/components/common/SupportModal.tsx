import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, MessageCircle, Phone, Mail, Clock, HelpCircle, ShieldCheck } from 'lucide-react';

export const SupportModal: React.FC = () => {
  const { isSupportOpen, setIsSupportOpen, settings } = useStore();

  if (!isSupportOpen) return null;

  const whatsappLink = `https://wa.me/${(settings.whatsapp_number || '+18005550199').replace(/[^0-9]/g, '')}?text=Hello,%20I%20have%20an%20inquiry%20about%20Prakriti%20Natural%20Dry%20Food`;
  const phoneLink = `tel:${settings.store_phone || '+18005550199'}`;
  const emailLink = `mailto:${settings.store_email || 'support@prakritidryfood.com'}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-xs shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-4 py-3 bg-[#1B4332] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#F4A261]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">CUSTOMER SUPPORT</h3>
          </div>
          <button
            onClick={() => setIsSupportOpen(false)}
            className="text-white/80 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-left">
          
          {/* Quick Action Channels */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Instant Contact Channels
            </p>

            {/* WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Chat on WhatsApp</h4>
                  <p className="text-[10px] text-emerald-700">Instant answers from our product advisors</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-800">CONNECT →</span>
            </a>

            {/* Direct Call */}
            <a
              href={phoneLink}
              className="flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-900 rounded-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Direct Phone Support</h4>
                  <p className="text-[10px] text-stone-600">{settings.store_phone || '+1 (800) 555-0199'}</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#1B4332]">CALL →</span>
            </a>

            {/* Email */}
            <a
              href={emailLink}
              className="flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-900 rounded-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#8D5B4C] text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Email Inquiries</h4>
                  <p className="text-[10px] text-stone-600">{settings.store_email || 'support@prakritidryfood.com'}</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#8D5B4C]">SEND →</span>
            </a>
          </div>

          {/* Operating Hours */}
          <div className="p-3 bg-[#FFFDF7] border border-stone-200 rounded-xs flex items-center gap-2.5 text-xs text-stone-700">
            <Clock className="w-4 h-4 text-[#1B4332] shrink-0" />
            <div>
              <span className="font-bold">Hours of Operation:</span> Daily 8:00 AM – 10:00 PM
            </div>
          </div>

          {/* Quick FAQ Accordion / Highlights */}
          <div className="pt-2 border-t border-stone-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-[#E86A17]" />
              <span>Frequently Asked Questions</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xs">
                <p className="font-bold text-stone-900">Are all products 100% preservative-free?</p>
                <p className="text-[11px] text-stone-600 mt-1">
                  Yes, every batch is selected from trusted organic suppliers with zero added sugar, sulfur dioxide, or chemical preservatives.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xs">
                <p className="font-bold text-stone-900">How quickly are orders delivered?</p>
                <p className="text-[11px] text-stone-600 mt-1">
                  City orders arrive within 24 hours. Nationwide regional orders take 48-72 hours in safe food-grade protective boxes.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xs">
                <p className="font-bold text-stone-900">What payment methods are supported?</p>
                <p className="text-[11px] text-stone-600 mt-1">
                  Cash on Delivery (COD), bKash, Nagad, and direct bank transfers.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
          <button
            onClick={() => setIsSupportOpen(false)}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 uppercase"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
