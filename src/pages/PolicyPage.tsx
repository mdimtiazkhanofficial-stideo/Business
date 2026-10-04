import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { DEFAULT_POLICY_PAGES, INITIAL_QUICK_LINKS } from '../data/initialCatalog';
import { PolicyPageSlug } from '../types';
import {
  FileText,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle2,
  Send
} from 'lucide-react';

const POLICY_ICONS: Record<PolicyPageSlug, React.FC<{ className?: string }>> = {
  'terms-and-conditions': FileText,
  'privacy-policy': ShieldCheck,
  'shipping-and-delivery': Truck,
  'return-and-refund': RotateCcw,
  'payment-policy': CreditCard,
  'customer-rules': Users,
  'report-an-issue': AlertTriangle
};

interface PolicyPageProps {
  fixedSlug?: PolicyPageSlug;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ fixedSlug }) => {
  const { slug } = useParams<{ slug: string }>();
  const { settings, quickLinks, submitSupportMessage, currentUser, showToast } = useStore();

  const validSlug = (fixedSlug || slug || 'terms-and-conditions') as PolicyPageSlug;
  const matchedQuickLink =
    (quickLinks || []).find((item) => item.slug === validSlug || item.url === `/${validSlug}`) ||
    INITIAL_QUICK_LINKS.find((item) => item.slug === validSlug || item.url === `/${validSlug}`);

  const isKnownSlug = Boolean(matchedQuickLink || DEFAULT_POLICY_PAGES[validSlug]);

  // Report an Issue form state
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [orderNumber, setOrderNumber] = useState('');
  const [issueCategory, setIssueCategory] = useState('Size Exchange / Fit Issue');
  const [issueDetails, setIssueDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isKnownSlug) {
    return <Navigate to="/" replace />;
  }

  const fallbackPolicyData =
    settings.policy_pages?.[validSlug] || DEFAULT_POLICY_PAGES[validSlug];

  const pageTitle =
    matchedQuickLink?.page_title ||
    matchedQuickLink?.title?.toUpperCase() ||
    fallbackPolicyData?.title ||
    'POLICY';

  const shortDescription =
    matchedQuickLink?.short_description ?? fallbackPolicyData?.subtitle ?? '';

  const activeSections = [...(matchedQuickLink?.sections || [])]
    .filter((sec) => sec.is_active !== false)
    .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99));

  const companyName = settings.company_name || settings.store_name || 'SHAD SODAI';
  const ActiveIcon = POLICY_ICONS[validSlug] || FileText;

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !issueDetails.trim()) {
      showToast('Please enter your name, phone number, and issue description.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSupportMessage({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || 'no-email@customer.local',
        subject: `[ISSUE REPORT] ${issueCategory}${
          orderNumber.trim() ? ` (Order #${orderNumber.trim()})` : ''
        }`,
        message: `Order Number: ${orderNumber.trim() || 'N/A'}\nIssue Type: ${issueCategory}\nPhone: ${customerPhone.trim()}\n\nDetails:\n${issueDetails.trim()}`
      });
      setSubmittedSuccess(true);
      setOrderNumber('');
      setIssueDetails('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback legacy content blocks if no structured sections exist
  const legacyContentBlocks = (fallbackPolicyData?.content || '')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-6 sm:py-10 pb-24 md:pb-16 w-full max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Individual Policy Content Card (Matches exact screenshot design, no listing/index box) */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          {/* Policy Header */}
          <div className="bg-stone-50 border-b border-stone-200 p-5 sm:p-7 flex items-start gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xs bg-[#1B4332] text-white flex items-center justify-center shrink-0">
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              {companyName && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B4332] block">
                  {companyName}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif uppercase tracking-tight">
                {pageTitle}
              </h1>
              {shortDescription && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {shortDescription}
                </p>
              )}
            </div>
          </div>

          {/* Complete Policy Content Sections (Dynamic from Admin Panel -> Quick Links) */}
          <div className="p-5 sm:p-7 space-y-4">
            {activeSections.length > 0 ? (
              activeSections.map((sec) => {
                const validBullets = (sec.bullet_points || [])
                  .map((b) => b.trim())
                  .filter(Boolean);

                return (
                  <div
                    key={sec.id}
                    className="p-4 sm:p-5 bg-[#FFFDF7] border border-stone-200/90 rounded-xs space-y-2"
                  >
                    <h2 className="text-sm sm:text-base font-bold text-stone-900 font-serif">
                      {sec.section_number}. {sec.heading}
                    </h2>

                    {sec.content && (
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                        {sec.content}
                      </p>
                    )}

                    {validBullets.length > 0 && (
                      <ul className="space-y-1.5 pt-0.5">
                        {validBullets.map((point, idx) => (
                          <li
                            key={idx}
                            className="text-xs sm:text-sm text-stone-700 leading-relaxed flex items-start gap-2"
                          >
                            <span className="text-stone-800 font-bold select-none">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
            ) : (
              legacyContentBlocks.map((block, index) => {
                const lines = block.split('\n');
                const firstLine = lines[0]?.trim() || '';
                const isHeading =
                  /^\d+\./.test(firstLine) ||
                  (lines.length > 1 && firstLine.length < 70 && !firstLine.startsWith('•'));

                if (isHeading && lines.length > 1) {
                  const bodyText = lines.slice(1).join('\n').trim();
                  return (
                    <div
                      key={index}
                      className="p-4 sm:p-5 bg-[#FFFDF7] border border-stone-200/90 rounded-xs space-y-2"
                    >
                      <h2 className="text-sm sm:text-base font-bold text-stone-900 font-serif">
                        {firstLine}
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                        {bodyText}
                      </p>
                    </div>
                  );
                }

                return (
                  <p
                    key={index}
                    className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line"
                  >
                    {block}
                  </p>
                );
              })
            )}
          </div>
        </div>

        {/* Direct Issue Report Form when on the 'Report an Issue' page */}
        {validSlug === 'report-an-issue' && (
          <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-5 sm:p-7 space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E86A17] block">
                Customer Support Desk
              </span>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif uppercase mt-0.5">
                Submit Your Issue Report
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Provide your order and issue details below so our team can assist you directly.
              </p>
            </div>

            {submittedSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xs text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#1B4332] mx-auto" />
                <h3 className="text-sm font-bold text-stone-900 uppercase">
                  Issue Report Submitted Successfully
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Thank you. Our support team has received your report and will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="px-4 py-2 bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleIssueSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase block">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase block">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase block">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Enter order ID"
                    className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase block">
                    Issue Category *
                  </label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  >
                    <option value="Size Exchange / Fit Issue">Size Exchange / Fit Issue</option>
                    <option value="Garment Quality / Defect">Garment Quality / Defect</option>
                    <option value="Delivery / Courier Delay">Delivery / Courier Delay</option>
                    <option value="Payment / TrxID Verification">Payment / TrxID Verification</option>
                    <option value="Wrong Item Received">Wrong Item Received</option>
                    <option value="Other Inquiry">Other Issue</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 uppercase block">
                    Issue Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Issue Report'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
