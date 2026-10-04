import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { SiteSettings, PolicyPageSlug, PolicyPageContent } from '../../types';
import { DEFAULT_POLICY_PAGES } from '../../data/initialCatalog';
import {
  Upload,
  Image as ImageIcon,
  Building2,
  Sparkles,
  FileText,
  Phone,
  ShieldCheck,
  Copyright,
  Smartphone,
  Save,
  RefreshCw
} from 'lucide-react';

const POLICY_CMS_TABS: Array<{ slug: PolicyPageSlug; label: string }> = [
  { slug: 'terms-and-conditions', label: 'Terms & Conditions' },
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'shipping-and-delivery', label: 'Shipping & Delivery Policy' },
  { slug: 'return-and-refund', label: 'Return & Refund Policy' },
  { slug: 'payment-policy', label: 'Payment Policy' },
  { slug: 'customer-rules', label: 'Customer Rules' },
  { slug: 'report-an-issue', label: 'Report an Issue' }
];

export const AdminBranding: React.FC = () => {
  const { settings, saveSettings, showToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePolicySlug, setActivePolicySlug] = useState<PolicyPageSlug>('terms-and-conditions');

  // Form State
  const [formData, setFormData] = useState<SiteSettings>({
    store_name: '',
    company_name: '',
    store_logo: '',
    company_logo: '',
    announcement_text: '',
    footer_tagline: '',
    footer_description: '',
    store_phone: '',
    contact_phone: '',
    store_email: '',
    contact_email: '',
    store_address: '',
    contact_address: '',
    support_email: '',
    support_phone: '',
    whatsapp_number: '',
    facebook_page_url: '',
    guarantee_quality: '',
    guarantee_authentic: '',
    guarantee_delivery: '',
    guarantee_purity: '',
    guarantee_payments: '',
    guarantee_certification: '',
    policy_pages: DEFAULT_POLICY_PAGES,
    copyright_text: '',
    footer_bottom_line_1: '',
    footer_bottom_line_2: '',
    footer_bottom_line_3: '',
    app_download_enabled: false,
    app_download_button_text: '',
    app_android_url: '',
    app_ios_url: '',
    delivery_inside_dhaka: 60,
    delivery_outside_dhaka: 120,
    free_delivery_min_order: 1500,
    supabase_connected: false
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        store_name: settings.company_name || settings.store_name || '',
        company_name: settings.company_name || settings.store_name || '',
        store_logo: settings.company_logo || settings.store_logo || '',
        company_logo: settings.company_logo || settings.store_logo || '',
        announcement_text: settings.announcement_text || '',
        footer_tagline: settings.footer_tagline || '',
        footer_description: settings.footer_description || '',
        store_phone: settings.contact_phone || settings.store_phone || '',
        contact_phone: settings.contact_phone || settings.store_phone || '',
        store_email: settings.contact_email || settings.store_email || '',
        contact_email: settings.contact_email || settings.store_email || '',
        store_address: settings.contact_address || settings.store_address || '',
        contact_address: settings.contact_address || settings.store_address || '',
        support_email: settings.support_email || '',
        support_phone: settings.support_phone || '',
        whatsapp_number: settings.whatsapp_number || '',
        facebook_page_url: settings.facebook_page_url || '',
        guarantee_quality: settings.guarantee_quality || settings.guarantee_purity || '',
        guarantee_authentic: settings.guarantee_authentic || settings.guarantee_certification || '',
        guarantee_delivery: settings.guarantee_delivery || '',
        guarantee_purity: settings.guarantee_quality || settings.guarantee_purity || '',
        guarantee_payments: settings.guarantee_payments || '',
        guarantee_certification: settings.guarantee_authentic || settings.guarantee_certification || '',
        policy_pages: {
          ...DEFAULT_POLICY_PAGES,
          ...(settings.policy_pages || {})
        },
        copyright_text: settings.copyright_text || '',
        footer_bottom_line_1: settings.footer_bottom_line_1 || '',
        footer_bottom_line_2: settings.footer_bottom_line_2 || '',
        footer_bottom_line_3: settings.footer_bottom_line_3 || '',
        app_download_enabled: settings.app_download_enabled ?? false,
        app_download_button_text: settings.app_download_button_text || '',
        app_android_url: settings.app_android_url || '',
        app_ios_url: settings.app_ios_url || '',
        delivery_inside_dhaka: settings.delivery_inside_dhaka ?? 60,
        delivery_outside_dhaka: settings.delivery_outside_dhaka ?? 120,
        free_delivery_min_order: settings.free_delivery_min_order ?? 1500,
        supabase_connected: settings.supabase_connected ?? false
      });
    }
  }, [settings]);

  const handlePolicyPageChange = (
    slug: PolicyPageSlug,
    field: keyof PolicyPageContent,
    value: string
  ) => {
    setFormData((prev) => {
      const currentPages = prev.policy_pages || DEFAULT_POLICY_PAGES;
      const existingPage = currentPages[slug] || DEFAULT_POLICY_PAGES[slug];
      return {
        ...prev,
        policy_pages: {
          ...currentPages,
          [slug]: {
            ...existingPage,
            [field]: value,
            updated_at: new Date().toISOString().split('T')[0]
          }
        }
      };
    });
  };

  // Handle Logo Upload (PNG, JPG, SVG)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Logo file size must be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setFormData((prev) => ({
            ...prev,
            company_logo: result,
            store_logo: result
          }));
          showToast('Company logo updated successfully', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      company_logo: '',
      store_logo: ''
    }));
    showToast('Company logo cleared (fallback monogram will be used)', 'info');
  };

  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Keep store_* and company_* in sync
      ...(field === 'company_name' ? { store_name: value } : {}),
      ...(field === 'store_name' ? { company_name: value } : {}),
      ...(field === 'contact_phone' ? { store_phone: value } : {}),
      ...(field === 'store_phone' ? { contact_phone: value } : {}),
      ...(field === 'contact_email' ? { store_email: value } : {}),
      ...(field === 'store_email' ? { contact_email: value } : {}),
      ...(field === 'contact_address' ? { store_address: value } : {}),
      ...(field === 'store_address' ? { contact_address: value } : {})
    }));
  };

  // Auto-grow textarea handler
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const mergedSettings: SiteSettings = {
        ...settings,
        ...formData,
        company_name: formData.company_name?.trim() || formData.store_name?.trim() || 'SHAD SODAI',
        store_name: formData.company_name?.trim() || formData.store_name?.trim() || 'SHAD SODAI',
        company_logo: formData.company_logo || formData.store_logo || '',
        store_logo: formData.company_logo || formData.store_logo || ''
      };

      await saveSettings(mergedSettings);

      // Update browser document title dynamically
      document.title = `${mergedSettings.company_name} | Official Store`;

      showToast('Branding Settings Saved Successfully', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save branding settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="bg-white border border-stone-200 p-4 sm:p-6 rounded-xs shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-[#E86A17] uppercase tracking-wider block">
                CENTRAL IDENTITY CONTROL
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-tight uppercase mt-0.5">
              BRANDING & IDENTITY
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Configure company logos, names, announcement tickers, guarantees, and footer data. Updates everywhere automatically.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* =========================================================
            SECTION 1: COMPANY LOGO
        ========================================================= */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-200 pb-3">
            <ImageIcon className="w-5 h-5 text-[#1B4332]" />
            <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wide">
              1. Company Logo
            </h2>
          </div>

          <p className="text-xs text-stone-600">
            Upload your official company brand logo. Supports <strong>PNG, JPG, SVG</strong> with transparent or solid backgrounds. Automatically updates the header, mobile drawer, sidebar, and footer.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/svg+xml, image/webp"
            onChange={handleLogoUpload}
            className="hidden"
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Logo Preview Box */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-stone-50 border border-dashed border-stone-300 rounded-xs">
              {formData.company_logo ? (
                <div className="relative group flex flex-col items-center">
                  <div className="h-20 max-w-full flex items-center justify-center p-2 bg-white border border-stone-200 rounded-xs shadow-2xs">
                    <img
                      src={formData.company_logo}
                      alt="Company Logo Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono mt-2">Active Logo Preview</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-4 text-stone-400">
                  <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 mb-2">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-stone-700">No Custom Logo Uploaded</span>
                  <span className="text-[11px] text-stone-500 mt-0.5">Using default stylish letter monogram</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{formData.company_logo ? 'Change Logo Image' : 'Upload Company Logo'}</span>
                </button>

                {formData.company_logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="bg-white border border-stone-300 hover:border-red-400 text-stone-700 hover:text-red-600 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                  >
                    Clear Logo
                  </button>
                )}
              </div>

              <div className="text-[11px] text-stone-500 space-y-1">
                <p>• Recommended dimensions: <strong>240 × 80 px</strong> or higher ratio.</p>
                <p>• Supported formats: <strong>PNG, JPG, SVG, WebP</strong> (Max 5MB).</p>
              </div>

              {/* Alternative Logo URL Input */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Or Direct Logo Image URL:
                </label>
                <input
                  type="url"
                  value={formData.company_logo || ''}
                  onChange={(e) => handleInputChange('company_logo', e.target.value)}
                  placeholder="https://your-domain.com/logo.png"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-mono rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 2: COMPANY NAME
        ========================================================= */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-200 pb-3">
            <Building2 className="w-5 h-5 text-[#1B4332]" />
            <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wide">
              2. Company Name
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Official Company / Brand Name *
            </label>
            <input
              type="text"
              required
              value={formData.company_name || ''}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="e.g. SHAD SODAI"
              className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs sm:text-sm font-bold text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
            />
            <p className="text-[11px] text-stone-500">
              Used beside header/footer logos, browser tab title, customer invoices, and meta tags.
            </p>
          </div>
        </div>

        {/* =========================================================
            SECTION 3: TAGLINES
        ========================================================= */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-stone-200 pb-3">
            <Sparkles className="w-5 h-5 text-[#1B4332]" />
            <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wide">
              3. Taglines & Tickers
            </h2>
          </div>

          {/* Field 1: Header Announcement Text (Auto-growing textarea) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Header Announcement Text (Scrolling Marquee Ticker)
              </label>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs font-bold">
                Auto-Growing Single-Line Ticker
              </span>
            </div>
            <textarea
              rows={2}
              value={formData.announcement_text || ''}
              onInput={handleTextareaInput}
              onChange={(e) => handleInputChange('announcement_text', e.target.value)}
              placeholder="e.g. Premium Clothing & Essentials • 7-Day Easy Exchange • Free Delivery on Orders Over ৳1500"
              className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs sm:text-sm text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332] resize-none overflow-hidden"
            />
            <p className="text-[11px] text-stone-500">
              Unlimited length text that continuously scrolls right-to-left in the green top announcement bar.
            </p>
          </div>

          {/* Field 2: Footer Tagline (Auto-growing textarea) */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Footer Brand Subtitle / Tagline
            </label>
            <textarea
              rows={1}
              value={formData.footer_tagline || ''}
              onInput={handleTextareaInput}
              onChange={(e) => handleInputChange('footer_tagline', e.target.value)}
              placeholder="e.g. Premium Streetwear & Apparel • Trusted Since 2026"
              className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs sm:text-sm text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332] resize-none overflow-hidden"
            />
            <p className="text-[11px] text-stone-500">
              Displayed directly below the company name in the footer and mobile side drawer.
            </p>
          </div>
        </div>

        {/* =========================================================
            SECTION 4: FOOTER DESCRIPTION
        ========================================================= */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-200 pb-3">
            <FileText className="w-5 h-5 text-[#1B4332]" />
            <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wide">
              4. Footer Company Description
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Company Overview Description (Full Width • Auto-Height)
            </label>
            <textarea
              rows={3}
              value={formData.footer_description || ''}
              onInput={handleTextareaInput}
              onChange={(e) => handleInputChange('footer_description', e.target.value)}
              placeholder="Describe your brand, quality philosophy, and heritage..."
              className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs sm:text-sm text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332] resize-none overflow-hidden"
            />
            <p className="text-[11px] text-stone-500">
              Displayed in the primary footer column describing the company to visitors.
            </p>
          </div>
        </div>

        {/* =========================================================
            SECTION 5: CONTACT INFORMATION
        ========================================================= */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-200 pb-3">
            <Phone className="w-5 h-5 text-[#1B4332]" />
            <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wide">
              5. Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Primary Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.contact_phone || formData.store_phone || ''}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+880 1700-000000"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            {/* Primary Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Primary Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.contact_email || formData.store_email || ''}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="support@shadsodai.com"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            {/* Support Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Support Helpline Phone
              </label>
              <input
                type="text"
                value={formData.support_phone || ''}
                onChange={(e) => handleInputChange('support_phone', e.target.value)}
                placeholder="+880 1711-000000"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            {/* Support Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Support / Helpdesk Email
              </label>
              <input
                type="email"
                value={formData.support_email || ''}
                onChange={(e) => handleInputChange('support_email', e.target.value)}
                placeholder="help@shadsodai.com"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            {/* Company Address (Full Width) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Physical Company Address *
              </label>
              <textarea
                rows={2}
                value={formData.contact_address || formData.store_address || ''}
                onInput={handleTextareaInput}
                onChange={(e) => handleInputChange('contact_address', e.target.value)}
                placeholder="House 12, Road 4, Sector 7, Uttara, Dhaka, Bangladesh"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332] resize-none overflow-hidden"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                WhatsApp Chat Number
              </label>
              <input
                type="text"
                value={formData.whatsapp_number || ''}
                onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                placeholder="+8801700000000"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            {/* Facebook Page URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Facebook Page / Community Link
              </label>
              <input
                type="url"
                value={formData.facebook_page_url || ''}
                onChange={(e) => handleInputChange('facebook_page_url', e.target.value)}
                placeholder="https://facebook.com/shadsodai"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 6: QUALITY / GUARANTEE SECTION (CLOTHING & FASHION)
        ========================================================= */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-200 pb-3">
            <ShieldCheck className="w-5 h-5 text-[#1B4332]" />
            <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wide">
              6. Quality / Guarantee Section
            </h2>
          </div>

          <p className="text-xs text-stone-600">
            Configures the 4 clothing/fashion guarantee items displayed in the Footer Quality / Guarantee column.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Quality Assurance */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Quality Assurance Description
              </label>
              <input
                type="text"
                value={formData.guarantee_quality || ''}
                onChange={(e) => {
                  handleInputChange('guarantee_quality', e.target.value);
                  handleInputChange('guarantee_purity', e.target.value);
                }}
                placeholder="Multi-stage garment inspection with premium stitch & fabric durability."
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            {/* 2. Authentic Products */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Authentic Products Description
              </label>
              <input
                type="text"
                value={formData.guarantee_authentic || ''}
                onChange={(e) => {
                  handleInputChange('guarantee_authentic', e.target.value);
                  handleInputChange('guarantee_certification', e.target.value);
                }}
                placeholder="100% genuine high-GSM combed cotton & authentic tailored apparel."
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            {/* 3. Secure Payment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Secure Payment Description
              </label>
              <input
                type="text"
                value={formData.guarantee_payments || ''}
                onChange={(e) => handleInputChange('guarantee_payments', e.target.value)}
                placeholder="Cash on Delivery, bKash, Nagad, Rocket & verified bank transfer."
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            {/* 4. Reliable Delivery */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Reliable Delivery Description
              </label>
              <input
                type="text"
                value={formData.guarantee_delivery || ''}
                onChange={(e) => handleInputChange('guarantee_delivery', e.target.value)}
                placeholder="Fast 24-48h delivery inside Dhaka & 2-4 days nationwide courier."
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 6B: TERMS & POLICIES PAGES (CMS EDITOR)
        ========================================================= */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#1B4332]" />
              <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wide">
                Terms & Policies Pages (Database / CMS Editor)
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-[#1B4332] border border-emerald-200 px-2.5 py-0.5 rounded-2xs">
              7 Dedicated Policy Pages
            </span>
          </div>

          <p className="text-xs text-stone-600">
            Select any policy page below to edit its title, subtitle, and content. All changes save to the database and update the standalone policy pages linked in the website footer.
          </p>

          {/* Policy Selector Tabs */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {POLICY_CMS_TABS.map((tab) => {
              const isSelected = activePolicySlug === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => setActivePolicySlug(tab.slug)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xs border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4332] text-white border-[#1B4332]'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Policy Page Editor */}
          {(() => {
            const currentPolicy =
              formData.policy_pages?.[activePolicySlug] ||
              DEFAULT_POLICY_PAGES[activePolicySlug];

            return (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={currentPolicy?.title || ''}
                      onChange={(e) =>
                        handlePolicyPageChange(activePolicySlug, 'title', e.target.value)
                      }
                      placeholder="Enter policy page title"
                      className="w-full bg-white border border-stone-300 p-2.5 text-xs font-bold text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                      Page Subtitle
                    </label>
                    <input
                      type="text"
                      value={currentPolicy?.subtitle || ''}
                      onChange={(e) =>
                        handlePolicyPageChange(activePolicySlug, 'subtitle', e.target.value)
                      }
                      placeholder="Enter policy page subtitle"
                      className="w-full bg-white border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    Full Policy Content
                  </label>
                  <textarea
                    rows={10}
                    value={currentPolicy?.content || ''}
                    onChange={(e) =>
                      handlePolicyPageChange(activePolicySlug, 'content', e.target.value)
                    }
                    placeholder="Enter full policy content..."
                    className="w-full bg-white border border-stone-300 p-3 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332] leading-relaxed"
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* =========================================================
            SECTION 7: COPYRIGHT AREA
        ========================================================= */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-200 pb-3">
            <Copyright className="w-5 h-5 text-[#1B4332]" />
            <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wide">
              7. Footer Copyright & Bottom Badges
            </h2>
          </div>

          <div className="space-y-4">
            {/* Copyright Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Copyright Notice
              </label>
              <input
                type="text"
                value={formData.copyright_text || ''}
                onChange={(e) => handleInputChange('copyright_text', e.target.value)}
                placeholder="© 2026 SHAD SODAI. All Rights Reserved."
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bottom Line 1 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Footer Bottom Line 1
                </label>
                <input
                  type="text"
                  value={formData.footer_bottom_line_1 || ''}
                  onChange={(e) => handleInputChange('footer_bottom_line_1', e.target.value)}
                  placeholder="Combed Compact Cotton"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>

              {/* Bottom Line 2 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Footer Bottom Line 2
                </label>
                <input
                  type="text"
                  value={formData.footer_bottom_line_2 || ''}
                  onChange={(e) => handleInputChange('footer_bottom_line_2', e.target.value)}
                  placeholder="Tailored Streetwear Fit"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>

              {/* Bottom Line 3 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Footer Bottom Line 3
                </label>
                <input
                  type="text"
                  value={formData.footer_bottom_line_3 || ''}
                  onChange={(e) => handleInputChange('footer_bottom_line_3', e.target.value)}
                  placeholder="Crafted with ❤️ for modern lifestyle"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 8: MOBILE APP DOWNLOAD
        ========================================================= */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-[#1B4332]" />
              <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wide">
                8. Mobile App Download CTA
              </h2>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.app_download_enabled)}
                onChange={(e) => handleInputChange('app_download_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B4332]"></div>
              <span className="ml-2.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                {formData.app_download_enabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
              </span>
            </label>
          </div>

          <p className="text-xs text-stone-600">
            When enabled, an attractive app download button appears in the website footer allowing customers to get the official iOS or Android app directly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Button Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Button Text
              </label>
              <input
                type="text"
                value={formData.app_download_button_text || ''}
                onChange={(e) => handleInputChange('app_download_button_text', e.target.value)}
                placeholder="Enter app download button text"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            {/* Android App URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Google Play / Android APK URL
              </label>
              <input
                type="url"
                value={formData.app_android_url || ''}
                onChange={(e) => handleInputChange('app_android_url', e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=com.shadsodai"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            {/* iOS App URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Apple App Store URL
              </label>
              <input
                type="url"
                value={formData.app_ios_url || ''}
                onChange={(e) => handleInputChange('app_ios_url', e.target.value)}
                placeholder="https://apps.apple.com/app/shadsodai"
                className="w-full bg-[#FFFDF7] border border-stone-300 p-2.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 9: STICKY BOTTOM SAVE ACTION BAR
        ========================================================= */}
        <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-xs text-stone-600 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Changes will immediately update the live customer storefront upon saving</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto ml-auto bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xs shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Branding...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Branding Settings</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
