import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { SeoSettings } from '../../types';
import {
  Search,
  Globe,
  Share2,
  Tag,
  Save,
  CheckCircle2,
  Sliders,
  Image as ImageIcon,
  ExternalLink,
  Smartphone,
  Monitor
} from 'lucide-react';

export const AdminSeoMaster: React.FC = () => {
  const { seoSettings, saveSeoSettings, showToast } = useStore();

  const [form, setForm] = useState<SeoSettings>({
    site_title: 'TAZU MART BD | Premium Streetwear & Fashion Apparel Bangladesh',
    meta_description: 'Discover premium heavyweight tees, luxury casual shirts, tailored stretch chinos and modern streetwear online in Bangladesh with express cash on delivery.',
    meta_keywords: 'fashion bangladesh, streetwear dhaka, premium tshirts, mens clothing bd, tazu mart, oversized tshirts, denim jeans',
    og_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    google_site_verification: 'google-site-verification=TAZU_MART_BD_VERIFY_2026',
    google_analytics_id: 'G-TAZUMART2026',
    facebook_pixel_id: '10982347891234',
    social_facebook_url: 'https://facebook.com/tazumartbd',
    social_instagram_url: 'https://instagram.com/tazumartbd',
    social_youtube_url: '',
    structured_data_enabled: true,
    product_seo_template: '{product_name} - Best Price in BD | TAZU MART',
    category_seo_template: 'Shop {category_name} Collection Online in Bangladesh'
  });

  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'product_cat'>('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (seoSettings && Object.keys(seoSettings).length > 0) {
      setForm(seoSettings);
    }
  }, [seoSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSeoSettings(form);
    } catch {
      showToast('Failed to save SEO settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      
      {/* 1. Header */}
      <div className="bg-white border border-slate-200/90 rounded-[18px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              SEO Master & Search Engine Optimizer
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
              Google Grounded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimize meta titles, descriptions, OpenGraph social share cards, and automated schema for Google indexing
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving to DB...' : 'Save SEO Master'}</span>
        </button>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'general'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>General SEO & Google</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'social'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Sharing & OG Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('product_cat')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'product_cat'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Product & Category SEO</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Tab 1: General SEO & Google Search Snippet Preview */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Form Inputs */}
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-[18px] p-5 sm:p-7 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                Search Engine Meta Tags
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Site Meta Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.site_title}
                  onChange={(e) => setForm({ ...form, site_title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-purple-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Recommended length: 50-60 characters ({form.site_title.length} characters used)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meta Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.meta_description}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-purple-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Recommended length: 140-160 characters ({form.meta_description.length} characters used)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={form.meta_keywords}
                  onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Google Site Verification Tag
                  </label>
                  <input
                    type="text"
                    value={form.google_site_verification || ''}
                    onChange={(e) => setForm({ ...form, google_site_verification: e.target.value })}
                    placeholder="google-site-verification=..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Google Analytics Measurement ID
                  </label>
                  <input
                    type="text"
                    value={form.google_analytics_id || ''}
                    onChange={(e) => setForm({ ...form, google_analytics_id: e.target.value })}
                    placeholder="G-XXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live Google Snippet Simulation */}
            <div className="bg-white border border-slate-200/90 rounded-[18px] p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Google Search Result Preview</span>
              </h3>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                    TM
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block leading-tight">TAZU MART BD</span>
                    <span className="text-[10px] text-slate-400 font-mono block leading-tight">https://tazumart.com.bd</span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer line-clamp-2 leading-snug">
                  {form.site_title || 'TAZU MART BD | Streetwear & Fashion'}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {form.meta_description || 'Explore premium collections of cotton tees, chinos, jackets and apparel in BD.'}
                </p>
              </div>

              <p className="text-[11px] text-slate-400">
                This simulation represents how your storefront snippet will appear on Google and major search engines.
              </p>
            </div>

          </div>
        )}

        {/* Tab 2: Social Sharing & Open Graph */}
        {activeTab === 'social' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-[18px] p-5 sm:p-7 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                Social Sharing & OpenGraph Meta
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Open Graph Share Card Image (1200 × 630 recommended) *
                </label>
                <input
                  type="text"
                  required
                  value={form.og_image}
                  onChange={(e) => setForm({ ...form, og_image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page URL</label>
                  <input
                    type="text"
                    value={form.social_facebook_url || ''}
                    onChange={(e) => setForm({ ...form, social_facebook_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Profile URL</label>
                  <input
                    type="text"
                    value={form.social_instagram_url || ''}
                    onChange={(e) => setForm({ ...form, social_instagram_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meta / Facebook Pixel ID</label>
                <input
                  type="text"
                  value={form.facebook_pixel_id || ''}
                  onChange={(e) => setForm({ ...form, facebook_pixel_id: e.target.value })}
                  placeholder="e.g. 10982347891234"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            {/* Social Share Card Preview */}
            <div className="bg-white border border-slate-200/90 rounded-[18px] p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Social Link Preview (Facebook / WhatsApp / iMessage)
              </span>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="h-36 bg-slate-100 overflow-hidden">
                  <img
                    src={form.og_image}
                    alt="OG Card"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 bg-slate-50 space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">TAZUMART.COM.BD</span>
                  <h4 className="font-bold text-slate-900 truncate">{form.site_title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{form.meta_description}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Product & Category SEO Automated Templates */}
        {activeTab === 'product_cat' && (
          <div className="bg-white border border-slate-200/90 rounded-[18px] p-5 sm:p-7 shadow-xs space-y-6 max-w-3xl">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Dynamic Metadata Template Patterns
            </h3>
            <p className="text-xs text-slate-500">
              Set automated meta title formulas for all catalog products and category landing pages. Use placeholders like <code>{'{product_name}'}</code> and <code>{'{category_name}'}</code>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Meta Title Template
                </label>
                <input
                  type="text"
                  value={form.product_seo_template || ''}
                  onChange={(e) => setForm({ ...form, product_seo_template: e.target.value })}
                  placeholder="{product_name} - Best Price in BD | TAZU MART"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Preview: "Vintage Washed Denim Trucker Jacket - Best Price in BD | TAZU MART"
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Meta Title Template
                </label>
                <input
                  type="text"
                  value={form.category_seo_template || ''}
                  onChange={(e) => setForm({ ...form, category_seo_template: e.target.value })}
                  placeholder="Shop {category_name} Collection Online in Bangladesh"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Preview: "Shop Denim Jeans Collection Online in Bangladesh"
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Templates'}
              </button>
            </div>
          </div>
        )}

      </form>

    </div>
  );
};
