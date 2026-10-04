import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Your message has been received! Our support team will get back to you shortly.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-8 sm:py-14 pb-20 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#8D5B4C] uppercase tracking-wider block">
            Customer Helpdesk
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 font-serif tracking-tight uppercase">
            CONTACT & CUSTOMER SUPPORT
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            Have questions about an order, wholesale inquiry, or nutritional facts? Get in touch with our team directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Contact Details */}
          <div className="md:col-span-5 bg-white border border-stone-200 p-5 shadow-2xs space-y-4 rounded-xs">
            <h3 className="text-xs font-bold text-stone-900 font-serif uppercase tracking-wider border-b border-stone-200 pb-2">
              Office & Helpdesk
            </h3>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Address:</span>
                  <span>{settings.store_address || '742 Evergreen Terrace, Suite 100'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#1B4332] shrink-0" />
                <div>
                  <span className="font-bold block">Phone Helpline:</span>
                  <span>{settings.store_phone || '+1 (800) 555-0199'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#1B4332] shrink-0" />
                <div>
                  <span className="font-bold block">Email:</span>
                  <span>{settings.store_email || 'support@naturaldryfood.com'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#1B4332] shrink-0" />
                <div>
                  <span className="font-bold block">Support Hours:</span>
                  <span>9:00 AM - 10:00 PM (Monday - Sunday)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 text-xs">
              <p className="font-bold text-[#1B4332]">Direct WhatsApp Order Assistance:</p>
              <a
                href={`https://wa.me/${(settings.whatsapp_number || '+18005550199').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block bg-[#25D366] text-white px-4 py-2 font-bold rounded-xs shadow-2xs text-xs"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="md:col-span-7 bg-white border border-stone-200 p-5 shadow-2xs rounded-xs">
            <h3 className="text-xs font-bold text-stone-900 font-serif uppercase tracking-wider border-b border-stone-200 pb-2 mb-3">
              Send us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Email or Phone Number *</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah@example.com or phone"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you today? Inquire about products or orders..."
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                />
              </div>

              <button
                type="submit"
                className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs rounded-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
