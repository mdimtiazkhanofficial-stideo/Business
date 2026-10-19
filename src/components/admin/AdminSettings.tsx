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
  AlertTriangle,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Activity,
  ExternalLink
} from 'lucide-react';

interface AdminSettingsProps {
  subTab?: 'general' | 'profile' | 'security';
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ subTab: propSubTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    settings,
    saveSettings,
    isSupabaseActive,
    supabaseConfig,
    connectSupabase,
    disconnectSupabase,
    checkSupabaseHealth,
    adminProfile,
    saveAdminProfile,
    logout,
    showToast,
    refreshData
  } = useStore();

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

  // Supabase Connection Form State
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig?.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig?.anonKey || '');
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [isConnectingSupabase, setIsConnectingSupabase] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    tablesPending?: boolean;
    productCount?: number;
  } | null>(null);

  useEffect(() => {
    if (supabaseConfig?.url) setSupabaseUrl(supabaseConfig.url);
    if (supabaseConfig?.anonKey) setSupabaseAnonKey(supabaseConfig.anonKey);
  }, [supabaseConfig]);

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

  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      showToast('Please enter both Supabase Project URL and Anon/Public Key', 'error');
      return;
    }
    setIsConnectingSupabase(true);
    try {
      const res = await connectSupabase(supabaseUrl.trim(), supabaseAnonKey.trim());
      setConnectionHealth({
        tested: true,
        connected: res.success,
        message: res.message,
        tablesPending: res.tablesPending,
        productCount: res.productCount
      });
    } finally {
      setIsConnectingSupabase(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingSupabase(true);
    try {
      const health = await checkSupabaseHealth();
      setConnectionHealth({
        tested: true,
        connected: health.connected,
        message: health.message,
        tablesPending: health.tablesPending,
        productCount: health.productCount
      });
      if (health.connected) {
        showToast(health.message, 'success');
      } else {
        showToast(health.message, 'error');
      }
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from this Supabase database? You can reconnect anytime.')) {
      return;
    }
    await disconnectSupabase();
    setConnectionHealth(null);
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
          
          {/* Supabase Database Connection Manager Card */}
          <div className="bg-white border border-slate-200/90 rounded-[18px] p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Supabase PostgreSQL Cloud Database
                  </h3>
                  <p className="text-xs text-slate-500">
                    Connect your live Supabase project to sync products, categories, orders, customers &amp; CMS
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 ${
                    isSupabaseActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span>{isSupabaseActive ? 'Supabase Connected' : 'Offline / Local Cache'}</span>
                </span>
              </div>
            </div>

            {/* Connection Credentials Form */}
            <form onSubmit={handleConnectSupabase} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Supabase Project URL *
                    </label>
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      <span>Supabase Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="url"
                    required
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Find in Supabase: <span className="font-semibold text-slate-600">Project Settings → API → Project URL</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project API Key (anon / public) *
                  </label>
                  <div className="relative">
                    <input
                      type={showAnonKey ? 'text' : 'password'}
                      required
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnonKey(!showAnonKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Find in Supabase: <span className="font-semibold text-slate-600">Project Settings → API → Project API Keys (anon public)</span>
                  </p>
                </div>
              </div>

              {/* Status Banner when tested */}
              {connectionHealth && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    connectionHealth.connected
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {connectionHealth.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{connectionHealth.message}</p>
                    {connectionHealth.tablesPending && (
                      <p className="text-[11px] text-emerald-700">
                        Tip: Click &quot;Copy Supabase SQL Schema&quot; below, paste it into your Supabase SQL Editor and run it, then click &quot;Seed Initial Catalog&quot;.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isConnectingSupabase}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Wifi className="w-4 h-4" />
                  <span>{isConnectingSupabase ? 'Connecting...' : (isSupabaseActive ? 'Update Connection' : 'Connect Database')}</span>
                </button>

                {isSupabaseActive && (
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingSupabase}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Activity className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isTestingSupabase ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                )}

                {isSupabaseActive && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-red-200 cursor-pointer"
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'SQL Copied!' : 'Copy Supabase SQL Schema'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-purple-200 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Seeding...' : 'Seed Initial Catalog'}</span>
                </button>
              </div>
            </form>

            {/* Quick 3-Step Setup Instructions */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
              <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500 block">
                How to connect in 3 simple steps:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                <li>Create a project on <strong>supabase.com</strong> (or open your existing project).</li>
                <li>Go to <strong>Project Settings → API</strong> to copy your <strong>Project URL</strong> and <strong>anon/public</strong> key.</li>
                <li>Go to <strong>SQL Editor</strong> in Supabase, click <strong>&quot;Copy Supabase SQL Schema&quot;</strong> above, paste &amp; click <strong>Run</strong>, then enter your credentials above and click <strong>&quot;Connect Database&quot;</strong>.</li>
              </ol>
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
