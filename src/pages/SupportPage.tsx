import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  HelpCircle,
  ShieldCheck,
  Send,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Headphones
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { settings, currentUser, sendSupportMessage, showToast, products } = useStore();

  // Contact Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // AI Support Assistant State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'assistant' | 'user'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am the SHAD SODAI AI Food Assistant. Ask me anything about our natural dry fruits, organic nuts, health benefits, packaging, or how to place your order!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const whatsappLink = `https://wa.me/${(settings.whatsapp_number || '+8801700000000').replace(/[^0-9]/g, '')}?text=Hello%20SHAD%20SODAI%20Support,%20I%20have%20an%20inquiry%20regarding%20natural%20foods`;
  const phoneLink = `tel:${settings.store_phone || '+8801700000000'}`;
  const emailLink = `mailto:${settings.store_email || 'support@shadsodai.com'}`;

  const faqs = [
    {
      q: 'Are SHAD SODAI dry foods 100% natural with no chemical preservatives?',
      a: 'Yes, absolutely. All our premium dried fruits, raw seeds, and select dry fruits are 100% pure, natural, and free from sulphur, artificial food coloring, or synthetic sugar coatings.'
    },
    {
      q: 'How long does delivery take across Bangladesh?',
      a: 'Inside Dhaka city, orders are delivered within 24–48 hours. For outside Dhaka and all district towns across Bangladesh, delivery typically takes 2–4 business days via verified courier services.'
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes! We offer full Cash on Delivery nationwide. You can inspect your parcel packaging upon arrival and pay cash directly to the delivery person.'
    },
    {
      q: 'How should I store SHAD SODAI dry fruits & nuts?',
      a: 'Store in a cool, dry place away from direct sunlight and moisture. To retain maximum crispiness and aroma, keep them in airtight containers or securely sealed in our reusable zip pouches.'
    },
    {
      q: 'What is your return & exchange policy?',
      a: 'If you receive damaged packaging or notice any quality issues within 24 hours of delivery, contact our support team immediately via WhatsApp or phone. We will arrange a hassle-free replacement or refund.'
    }
  ];

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    setIsSending(true);
    try {
      await sendSupportMessage({
        id: `msg-${Date.now()}`,
        user_id: currentUser?.id,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || undefined,
        subject: subject.trim() || 'General Inquiry',
        message: message.trim(),
        status: 'pending',
        created_at: new Date().toISOString()
      });
      setIsTicketSubmitted(true);
      setMessage('');
      setSubject('');
      showToast('Support ticket sent successfully! We will contact you shortly.', 'success');
    } catch {
      showToast('Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleAiSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiThinking) return;

    const userQuery = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: userQuery }]);
    setChatInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      let reply = '';
      const q = userQuery.toLowerCase();

      if (q.includes('almond') || q.includes('badam') || q.includes('nut')) {
        reply = 'Our California Premium Almonds and Walnuts are rich in heart-healthy unsaturated fats, Vitamin E, and dietary protein. Great for morning breakfast bowls or memory focus!';
      } else if (q.includes('delivery') || q.includes('shipping') || q.includes('time') || q.includes('charge')) {
        reply = 'We deliver within 24–48 hours inside Dhaka (delivery ৳60) and 2–4 days nationwide (৳120). Orders over $50 / ৳3000 receive FREE delivery!';
      } else if (q.includes('payment') || q.includes('bkash') || q.includes('cash')) {
        reply = 'We support Cash on Delivery (COD) across all 64 districts of Bangladesh, as well as instant bKash and Nagad payment options.';
      } else if (q.includes('date') || q.includes('khajoor') || q.includes('khejur') || q.includes('medjool') || q.includes('ajwa')) {
        reply = 'We carry authentic Saudi Ajwa and Medjool dates with deep natural sweetness, soft caramel chew, and zero added sugars or preservatives.';
      } else if (q.includes('order') || q.includes('track')) {
        reply = 'You can track any active order anytime at /account/track-order using your order number or phone number!';
      } else {
        reply = `Thank you for asking! At SHAD SODAI, we source the highest grade natural dry fruits, organic seeds, and wholesome nuts with laboratory quality assurance. Is there a specific item or health benefit you'd like to learn more about?`;
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsAiThinking(false);
    }, 600);
  };

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-8 sm:py-12 pb-20 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#8D5B4C] uppercase tracking-widest">
            SHAD SODAI Help Center
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 font-serif uppercase tracking-tight">
            Customer Support & Assistance
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Have questions about our natural dry food quality, bulk packaging, or order status? We are here to support you 7 days a week.
          </p>
        </div>

        {/* Direct Channels Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* WhatsApp Direct */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-stone-200 hover:border-emerald-500 p-6 rounded-xs shadow-2xs transition-all hover:shadow-xs group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm font-serif uppercase">WhatsApp Advisor</h3>
                <p className="text-[11px] text-emerald-700 font-medium">Instant Live Chat</p>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Connect directly with our natural food advisors for product inquiries, custom gift boxes, or bulk orders.
            </p>
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              Start WhatsApp Chat →
            </span>
          </a>

          {/* Direct Hotline */}
          <a
            href={phoneLink}
            className="bg-white border border-stone-200 hover:border-[#1B4332] p-6 rounded-xs shadow-2xs transition-all hover:shadow-xs group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm font-serif uppercase">Phone Helpline</h3>
                <p className="text-[11px] text-stone-500 font-medium">{settings.store_phone || '+880 1700-000000'}</p>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Speak with customer service regarding delivery schedules, order alterations, or special requests.
            </p>
            <span className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider flex items-center gap-1">
              Call Now →
            </span>
          </a>

          {/* Email Support */}
          <a
            href={emailLink}
            className="bg-white border border-stone-200 hover:border-[#8D5B4C] p-6 rounded-xs shadow-2xs transition-all hover:shadow-xs group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#8D5B4C]/10 text-[#8D5B4C] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm font-serif uppercase">Official Email</h3>
                <p className="text-[11px] text-stone-500 font-medium">{settings.store_email || 'support@shadsodai.com'}</p>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Send formal partnership inquiries, wholesale inquiries, or detailed feedback directly to our team.
            </p>
            <span className="text-xs font-extrabold text-[#8D5B4C] uppercase tracking-wider flex items-center gap-1">
              Send Email →
            </span>
          </a>

        </div>

        {/* Two-Column Section: AI Food Advisor & Support Ticket Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive AI Food Advisor */}
          <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xs shadow-2xs flex flex-col overflow-hidden h-[540px]">
            {/* Header */}
            <div className="p-4 bg-[#1B4332] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-[#F4A261] flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">SHAD SODAI AI Assistant</h3>
                  <p className="text-[10px] text-emerald-200">Natural Food & Order Specialist</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-700/60 px-2 py-0.5 rounded-full font-mono">
                Online
              </span>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFFDF7]/60">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xs text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1B4332] text-white rounded-br-none'
                        : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-200 p-2.5 rounded-xs text-stone-500 text-xs flex items-center gap-1.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#1B4332] animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleAiSend} className="p-3 bg-white border-t border-stone-200 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about nuts, dried fruits, benefits, delivery..."
                className="flex-1 bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiThinking}
                className="bg-[#1B4332] text-white px-4 py-2 text-xs font-bold uppercase rounded-xs hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Direct Support Ticket Form */}
          <div className="lg:col-span-6 bg-white border border-stone-200 p-6 rounded-xs shadow-2xs space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-base font-bold text-stone-900 font-serif uppercase tracking-wide">
                Send a Support Ticket
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Leave your contact details and message; our team will review and reply via phone or email.
              </p>
            </div>

            {isTicketSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xs text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Ticket Received!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you. Your support ticket has been recorded. Our customer support desk will contact you soon.
                </p>
                <button
                  onClick={() => setIsTicketSubmitted(false)}
                  className="mt-2 text-xs font-bold text-[#1B4332] underline uppercase"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Farhan Chowdhury"
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 01700-000000"
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@shadsodai.com"
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Order Delivery Status, Product Query..."
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry, order number, or request in detail..."
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Submitting...' : 'Submit Support Ticket'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* FAQ Accordion Section */}
        <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-xs shadow-2xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-lg sm:text-2xl font-bold font-serif text-stone-900 uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-500 text-xs">
              Quick answers about SHAD SODAI products, delivery schedules, and guarantees.
            </p>
          </div>

          <div className="divide-y divide-stone-200 max-w-3xl mx-auto">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-3.5">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 text-xs sm:text-sm font-bold text-stone-900 hover:text-[#1B4332] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-stone-600 leading-relaxed mt-2.5 pr-6">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
