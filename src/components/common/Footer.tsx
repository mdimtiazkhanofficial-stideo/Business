import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Award,
  CreditCard,
  Truck,
  Smartphone
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, quickLinks } = useStore();

  // Dynamic Quick Links & Policy Links from Admin Panel -> Quick Links
  const activeQuickLinks = [...(quickLinks || [])]
    .filter((item) => item.type === 'quick_link' && item.is_active !== false)
    .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99));

  const activePolicyLinks = [...(quickLinks || [])]
    .filter((item) => item.type === 'policy' && item.is_active !== false)
    .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99));

  // Dynamic Branding Data from Admin Panel -> Branding
  const companyName = settings.company_name || settings.store_name || '';
  const companyLogo = settings.company_logo || settings.store_logo || '';
  const footerTagline = settings.footer_tagline || '';
  const footerDescription = settings.footer_description || '';
  const contactPhone = settings.contact_phone || settings.store_phone || '';
  const contactEmail = settings.contact_email || settings.store_email || '';
  const contactAddress = settings.contact_address || settings.store_address || '';

  // Dynamic monogram fallback from Company Name
  const monogram =
    companyName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'S';

  // Dynamic Clothing/Fashion Quality & Guarantee lines from Admin Branding
  const guaranteeQuality =
    settings.guarantee_quality ||
    settings.guarantee_purity ||
    'Multi-stage garment inspection with premium stitch & fabric durability.';
  const guaranteeAuthentic =
    settings.guarantee_authentic ||
    settings.guarantee_certification ||
    '100% genuine high-GSM combed cotton & authentic tailored apparel.';
  const guaranteePayments =
    settings.guarantee_payments ||
    'Cash on Delivery, bKash, Nagad, Rocket & verified bank transfer.';
  const guaranteeDelivery =
    settings.guarantee_delivery ||
    'Fast 24-48h delivery inside Dhaka & 2-4 days nationwide courier.';

  return (
    <footer className="bg-[#143527] text-stone-300 border-t border-[#1E4D39] pb-20 md:pb-10 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10 lg:py-12 w-full min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 text-left">
          {/* Column 1: Dynamic Branding Information */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2.5 cursor-pointer group">
              {companyLogo ? (
                <div className="h-9 max-w-[140px] bg-white px-2 py-1 rounded-xs flex items-center justify-center shrink-0">
                  <img
                    src={companyLogo}
                    alt={companyName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-white text-[#1B4332] flex items-center justify-center font-serif font-bold text-sm rounded-xs tracking-wider group-hover:bg-amber-400 transition-colors shrink-0">
                  {monogram}
                </div>
              )}

              <div className="flex flex-col min-w-0">
                {companyName && (
                  <span className="text-base sm:text-lg font-extrabold text-white tracking-tight font-serif truncate">
                    {companyName}
                  </span>
                )}
                {footerTagline && (
                  <span className="text-[9px] tracking-widest text-amber-400 uppercase font-semibold line-clamp-1">
                    {footerTagline}
                  </span>
                )}
              </div>
            </Link>

            {footerDescription && (
              <p className="text-xs text-stone-300 leading-relaxed">
                {footerDescription}
              </p>
            )}

            <div className="space-y-1.5 text-xs text-stone-300 pt-0.5">
              {contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{contactPhone}</span>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{contactEmail}</span>
                </div>
              )}
              {contactAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{contactAddress}</span>
                </div>
              )}
            </div>

            {settings.app_download_enabled &&
              (settings.app_android_url || settings.app_ios_url) && (
                <div className="pt-1">
                  <a
                    href={settings.app_android_url || settings.app_ios_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E4D39] hover:bg-[#255C44] text-white text-[11px] font-bold uppercase tracking-wider rounded-xs border border-emerald-700/60 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{settings.app_download_button_text || 'Download App'}</span>
                  </a>
                </div>
              )}
          </div>

          {/* Column 2: QUICK LINKS (Managed from Admin Panel -> Quick Links) */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-[#255C44] pb-2 font-serif">
              Quick Links
            </h3>
            <ul className="space-y-1.5 text-xs">
              {activeQuickLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.url}
                    className="hover:text-amber-300 transition-colors inline-block py-0.5"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: TERMS & POLICIES (Managed from Admin Panel -> Quick Links, Direct Dedicated Pages) */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-[#255C44] pb-2 font-serif">
              Terms & Policies
            </h3>
            <ul className="space-y-1.5 text-xs">
              {activePolicyLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.url}
                    className="hover:text-amber-300 transition-colors inline-block py-0.5"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: QUALITY / GUARANTEE (Clothing & Fashion Aligned) */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-[#255C44] pb-2 font-serif">
              Quality / Guarantee
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Quality Assurance</span>
                  <span className="text-[11px] text-stone-300 leading-snug block">
                    {guaranteeQuality}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Authentic Products</span>
                  <span className="text-[11px] text-stone-300 leading-snug block">
                    {guaranteeAuthentic}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Secure Payment</span>
                  <span className="text-[11px] text-stone-300 leading-snug block">
                    {guaranteePayments}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Reliable Delivery</span>
                  <span className="text-[11px] text-stone-300 leading-snug block">
                    {guaranteeDelivery}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar (Dynamic from Branding Settings) */}
        <div className="mt-7 sm:mt-9 pt-4 border-t border-[#1E4D39] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-400">
          <p>{settings.copyright_text || `© 2026 ${companyName || 'SHAD SODAI'}. All Rights Reserved.`}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
            {settings.footer_bottom_line_1 && <span>{settings.footer_bottom_line_1}</span>}
            {settings.footer_bottom_line_2 && <span>• {settings.footer_bottom_line_2}</span>}
            {settings.footer_bottom_line_3 && <span>• {settings.footer_bottom_line_3}</span>}
          </div>
        </div>
      </div>
    </footer>
  );
};
