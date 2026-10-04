import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { DataService } from '../../services/supabase';
import { AdminProfile } from '../../types';
import {
  Sliders,
  UserCheck,
  ShieldCheck,
  Database,
  Save,
  Copy,
  Lock,
  Phone,
  Mail,
  Key,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AdminSettingsProps {
  subTab?: 'general' | 'profile' | 'security';
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ subTab: propSubTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, saveSettings, isSupabaseActive, adminProfile, saveAdminProfile, logout, showToast, refreshData } = useStore();

  const getActiveTabFromLocation = (): 'general' | 'profile' | 'security' => {
    if (propSubTab) return propSubTab;
    if (location.pathname.endsWith('/profile')) return 'profile';
    if (location.pathname.endsWith('/security')) return 'security';
    return 'general';
  };

  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'security'>(getActiveTabFromLocation);

  useEffect(() => {
    setActiveTab(getActiveTabFromLocation());
  }, [location.pathname, propSubTab]);

  // General Settings Form
  const [generalForm, setGeneralForm] = useState(settings);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Admin Profile Form
  const [profileForm, setProfileForm] = useState<AdminProfile>({
    id: 'adm-01',
    name: 'TAZU MART Administrator',
    email: 'admin@tazumart.com',
    phone: '+880 1711-889900',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    last_login: new Date().toISOString(),
    permissions: ['products', 'orders', 'categories', 'stock', 'calculations', 'banners', 'customers', 'seo', 'settings']
  });

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setGeneralForm(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (adminProfile && Object.keys(adminProfile).length > 0) {
      setProfileForm(adminProfile);
    }
  }, [adminProfile]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      await saveSettings(generalForm);
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAdminProfile(profileForm);
  };

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword) {
      localStorage.setItem('tazu_admin_pin', newPassword);
      showToast('Admin master password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showToast('Security settings preserved', 'info');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(DataService.SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    showToast('Supabase SQL Schema script copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSeedDatabase = async () => {
    if (!confirm('This will seed the initial fashion catalog & categories into your Supabase database. Continue?')) {
      return;
    }
    try {
      setIsSeeding(true);
      await DataService.seedDatabase();
      await refreshData();
      showToast('Database seeded with fashion catalog successfully!');
    } catch (e: any) {
      showToast('Error seeding database: ' + e.message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('tazu_admin_authenticated');
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      
      {/* 1. Header */}
      <div className="bg-white border border-slate-200/90 rounded-[18px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Settings & Administrator Control
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md">
              Secure
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure store business details, manage administrative credentials, roles & database schemas
          </p>
        </div>
      </div>

      {/* 2. Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('general'); navigate('/admin/settings'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'general'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>General Settings</span>
        </button>

        <button
          onClick={() => { setActiveTab('profile'); navigate('/admin/settings/profile'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Admin Profile</span>
        </button>

        <button
          onClick={() => { setActiveTab('security'); navigate('/admin/settings/security'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'security'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & Roles</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* Tab 1: General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6 max-w-4xl">
          
          {/* Supabase Status Card */}
          <div className="bg-white border border-slate-200/90 rounded-[18px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Supabase PostgreSQL Cloud Integration
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct live connection for products, categories, orders, customers & banners
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  isSupabaseActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {isSupabaseActive ? '● Supabase Connected' : '● Integrated Offline Cache'}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                All data additions, edits, and deletions update the Supabase database. You can copy the complete PostgreSQL SQL schema below or re-seed the fashion catalog anytime.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'SQL Copied!' : 'Copy Supabase SQL Schema'}</span>
              </button>

              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-purple-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Seeding...' : 'Seed Initial Catalog'}</span>
              </button>
            </div>
          </div>

          {/* Business & Delivery Settings Form */}
          <form onSubmit={handleSaveGeneral} className="bg-white border border-slate-200/90 rounded-[18px] p-5 sm:p-7 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Storefront Identity & Shipping Rates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store / Brand Name</label>
                <input
                  type="text"
                  value={generalForm.store_name || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, store_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Support Phone / Mobile</label>
                <input
                  type="text"
                  value={generalForm.store_phone || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, store_phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Order Number</label>
                <input
                  type="text"
                  value={generalForm.whatsapp_number || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, whatsapp_number: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Support Email</label>
                <input
                  type="email"
                  value={generalForm.store_email || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, store_email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Charge (Inside Dhaka)</label>
                <input
                  type="number"
                  min="0"
                  value={generalForm.delivery_inside_dhaka || 60}
                  onChange={(e) => setGeneralForm({ ...generalForm, delivery_inside_dhaka: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Charge (Outside Dhaka)</label>
                <input
                  type="number"
                  min="0"
                  value={generalForm.delivery_outside_dhaka || 120}
                  onChange={(e) => setGeneralForm({ ...generalForm, delivery_outside_dhaka: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Free Delivery Minimum Order (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={generalForm.free_delivery_min_order || 2500}
                  onChange={(e) => setGeneralForm({ ...generalForm, free_delivery_min_order: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSavingGeneral}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                {isSavingGeneral ? 'Saving...' : 'Save General Settings'}
              </button>
            </div>
          </form>

        </div>
      )}

      {/* Tab 2: Admin Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200/90 rounded-[18px] p-5 sm:p-7 shadow-xs max-w-2xl space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                Administrator Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current active administrator credentials and personal contact details
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center">
              AD
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Admin Full Name *</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Email *</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Phone</label>
                <input
                  type="text"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={profileForm.role}
                onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
              >
                <option value="Super Admin">Super Admin (Full Root Permissions)</option>
                <option value="Store Manager">Store Manager (Products, Orders & Categories)</option>
                <option value="Inventory Lead">Inventory Lead (Stock & Calculations)</option>
                <option value="Staff">Staff (Orders Viewer)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                Update Profile
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Security & Permissions */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-2xl">
          
          <form onSubmit={handleUpdateSecurity} className="bg-white border border-slate-200/90 rounded-[18px] p-5 sm:p-7 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-900 border-b border-slate-100 pb-2">
              Admin Access Key & Password
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Master Password</label>
                <input
                  type="password"
                  placeholder="Enter current password (default: tazu2026)"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new PIN/password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs"
                >
                  Update Master Password
                </button>
              </div>
            </div>
          </form>

          {/* Session Logout Action */}
          <div className="bg-white border border-slate-200/90 rounded-[18px] p-5 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Logout Administrative Session</h4>
              <p className="text-xs text-slate-400 mt-0.5">Revoke current local session token and lock dashboard access</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
