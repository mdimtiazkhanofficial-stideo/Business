import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  CourierService,
  CourierConfig,
  BANGLADESH_COURIER_REGISTRY,
  CourierRegistryItem
} from '../../services/courierService';
import {
  Truck,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Edit2,
  Trash2,
  Power,
  Shield,
  Eye,
  EyeOff,
  ExternalLink,
  Globe,
  Settings2,
  Sliders,
  Check,
  Zap
} from 'lucide-react';

interface AdminCourierManagementProps {
  mode?: 'list' | 'add' | 'edit';
}

export const AdminCourierManagement: React.FC<AdminCourierManagementProps> = ({ mode = 'list' }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useStore();

  const [couriers, setCouriers] = useState<CourierConfig[]>([]);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string } }>({});
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  // Active edit/add state
  const isFormMode = mode === 'add' || mode === 'edit';
  const editingCourier = id ? CourierService.getCourierById(id) : null;

  // Form state
  const [selectedProvider, setSelectedProvider] = useState<string>(
    editingCourier?.provider_code || ''
  );
  const [courierName, setCourierName] = useState<string>(editingCourier?.name || '');
  const [logoUrl, setLogoUrl] = useState<string>(editingCourier?.logo_url || '');
  const [website, setWebsite] = useState<string>(editingCourier?.website || '');
  const [connectionType, setConnectionType] = useState<'api' | 'manual'>(
    editingCourier?.connection_type || 'api'
  );
  const [isEnabled, setIsEnabled] = useState<boolean>(editingCourier?.is_enabled ?? true);
  const [isCustom, setIsCustom] = useState<boolean>(editingCourier?.is_custom ?? false);
  const [credentials, setCredentials] = useState<{ [key: string]: string }>({
    api_key: editingCourier?.api_key || '',
    secret_key: editingCourier?.secret_key || '',
    access_token: editingCourier?.access_token || '',
    client_id: editingCourier?.client_id || '',
    client_secret: editingCourier?.client_secret || '',
    username: editingCourier?.username || '',
    password: editingCourier?.password || '',
    store_id: editingCourier?.store_id || '',
    merchant_id: editingCourier?.merchant_id || '',
    user_id: editingCourier?.user_id || '',
    branch_id: editingCourier?.branch_id || '',
    branch_name: editingCourier?.branch_name || '',
    base_url: editingCourier?.base_url || ''
  });

  const [formTestStatus, setFormTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    loadCouriers();
  }, []);

  const loadCouriers = () => {
    setCouriers(CourierService.getAllCouriers());
  };

  useEffect(() => {
    if (editingCourier) {
      setSelectedProvider(editingCourier.provider_code);
      setCourierName(editingCourier.name);
      setLogoUrl(editingCourier.logo_url || '');
      setWebsite(editingCourier.website || '');
      setConnectionType(editingCourier.connection_type);
      setIsEnabled(editingCourier.is_enabled);
      setIsCustom(Boolean(editingCourier.is_custom));
      setCredentials({
        api_key: editingCourier.api_key || '',
        secret_key: editingCourier.secret_key || '',
        access_token: editingCourier.access_token || '',
        client_id: editingCourier.client_id || '',
        client_secret: editingCourier.client_secret || '',
        username: editingCourier.username || '',
        password: editingCourier.password || '',
        store_id: editingCourier.store_id || '',
        merchant_id: editingCourier.merchant_id || '',
        user_id: editingCourier.user_id || '',
        branch_id: editingCourier.branch_id || '',
        branch_name: editingCourier.branch_name || '',
        base_url: editingCourier.base_url || ''
      });
    } else if (mode === 'add') {
      setSelectedProvider('');
      setCourierName('');
      setLogoUrl('');
      setWebsite('');
      setConnectionType('api');
      setIsEnabled(true);
      setIsCustom(false);
      setCredentials({
        api_key: '',
        secret_key: '',
        access_token: '',
        client_id: '',
        client_secret: '',
        username: '',
        password: '',
        store_id: '',
        merchant_id: '',
        user_id: '',
        branch_id: '',
        branch_name: '',
        base_url: ''
      });
    }
  }, [id, mode]);

  const handleProviderChange = (providerCode: string) => {
    setSelectedProvider(providerCode);
    if (providerCode === 'custom') {
      setIsCustom(true);
      setCourierName('');
      setLogoUrl('');
      setWebsite('');
      setCredentials({
        api_key: '',
        secret_key: '',
        access_token: '',
        client_id: '',
        client_secret: '',
        username: '',
        password: '',
        store_id: '',
        merchant_id: '',
        user_id: '',
        branch_id: '',
        branch_name: '',
        base_url: ''
      });
    } else {
      const reg = BANGLADESH_COURIER_REGISTRY.find(r => r.provider_code === providerCode);
      if (reg) {
        setIsCustom(false);
        setCourierName(reg.name);
        setLogoUrl(reg.logo_url);
        setWebsite(reg.website);
        setCredentials(prev => ({
          ...prev,
          base_url: reg.default_base_url || ''
        }));
      }
    }
    setFormTestStatus(null);
  };

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = async (courierToTest?: CourierConfig) => {
    const config: CourierConfig = courierToTest || {
      id: id || `cr-${Date.now()}`,
      provider_code: selectedProvider,
      name: courierName,
      logo_url: logoUrl,
      website: website,
      connection_type: connectionType,
      api_status: 'not_connected',
      is_enabled: isEnabled,
      is_custom: isCustom,
      ...credentials
    };

    setIsTesting(config.id);
    const result = await CourierService.testConnection(config);
    setIsTesting(null);

    if (courierToTest) {
      setTestResults(prev => ({ ...prev, [courierToTest.id]: result }));
      loadCouriers();
    } else {
      setFormTestStatus(result);
    }

    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleToggleCourier = (courierId: string, currentStatus: boolean) => {
    CourierService.toggleCourierStatus(courierId, !currentStatus);
    loadCouriers();
    showToast(`Courier ${!currentStatus ? 'Enabled' : 'Disabled'} successfully`, 'info');
  };

  const handleDeleteCourier = (courierId: string) => {
    if (confirm('Are you sure you want to remove this courier configuration?')) {
      CourierService.deleteCourier(courierId);
      loadCouriers();
      showToast('Courier configuration removed', 'info');
    }
  };

  const handleSaveCourier = (e: React.FormEvent) => {
    e.preventDefault();

    if (!courierName.trim()) {
      showToast('Please enter a courier name', 'error');
      return;
    }

    // Has API credentials check
    const hasValidKey = connectionType === 'manual' || Boolean(
      credentials.api_key?.trim() ||
      credentials.access_token?.trim() ||
      (credentials.client_id?.trim() && credentials.client_secret?.trim()) ||
      credentials.user_id?.trim()
    );

    const courierId = id || editingCourier?.id || `cr-${selectedProvider}-${Date.now().toString().slice(-4)}`;

    const newConfig: CourierConfig = {
      id: courierId,
      provider_code: selectedProvider,
      name: courierName.trim(),
      logo_url: logoUrl.trim() || undefined,
      website: website.trim() || undefined,
      connection_type: connectionType,
      api_status: connectionType === 'manual' ? 'connected' : hasValidKey ? 'connected' : 'not_connected',
      is_enabled: isEnabled,
      is_custom: isCustom,
      ...credentials
    };

    CourierService.saveCourier(newConfig);
    showToast(`Courier "${courierName}" saved successfully!`, 'success');
    navigate('/admin/couriers');
  };

  const activeRegistryItem = BANGLADESH_COURIER_REGISTRY.find(r => r.provider_code === selectedProvider);

  // -------------------------------------------------------------
  // FULL PAGE: ADD / EDIT COURIER FORM
  // -------------------------------------------------------------
  if (isFormMode) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto pb-20">
        {/* Top Header */}
        <div className="bg-white border border-stone-200 p-4 sm:p-5 flex items-center justify-between shadow-2xs rounded-xs">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/couriers"
              className="p-2 border border-stone-200 bg-white hover:bg-stone-100 rounded-xs text-stone-600 transition-colors"
              title="Back to Courier List"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-stone-900 font-serif uppercase tracking-tight">
                {mode === 'add' ? 'Add / Configure Courier' : `Edit Courier: ${courierName}`}
              </h1>
              <p className="text-xs text-stone-500">
                Setup API connection details and configure 1-click dispatch
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveCourier} className="space-y-4">
          
          {/* 1. Basic Courier Setup Card */}
          <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-5 space-y-4 text-xs">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-700" />
                <h2 className="font-bold text-stone-900 uppercase tracking-wider">
                  1. Courier Provider & Mode
                </h2>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-xs border border-purple-200">
                {connectionType === 'api' ? 'API Integration' : 'Manual Dispatch'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Select Courier Provider *</label>
                <select
                  required
                  value={selectedProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-semibold focus:outline-none focus:border-purple-600"
                >
                  <option value="">Select courier provider</option>
                  <optgroup label="Predefined Bangladesh Couriers">
                    {BANGLADESH_COURIER_REGISTRY.map(reg => (
                      <option key={reg.provider_code} value={reg.provider_code}>
                        {reg.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Custom / Other">
                    <option value="custom">+ Add Custom Courier</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Courier Display Name *</label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Enter courier display name"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Connection Type</label>
                <select
                  value={connectionType}
                  onChange={(e) => setConnectionType(e.target.value as any)}
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-semibold"
                >
                  <option value="api">API Automated Dispatch</option>
                  <option value="manual">Manual Tracking Only</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Website URL (Optional)</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://courier.com"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-mono"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded-xs focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-stone-900 block">Enable in Order Page</span>
                    <span className="text-[10px] text-stone-500 block">Allows dispatch in Delivery Information</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Dynamic API Credentials Card */}
          {connectionType === 'api' && (
            <div className="bg-white border border-stone-200 rounded-xs shadow-2xs p-5 space-y-4 text-xs">
              <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-700" />
                  <h2 className="font-bold text-stone-900 uppercase tracking-wider">
                    2. {courierName} API Credentials
                  </h2>
                </div>
                <span className="text-[11px] text-stone-500">
                  Dynamic fields configured for {selectedProvider.toUpperCase()}
                </span>
              </div>

              {activeRegistryItem && activeRegistryItem.description && (
                <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xs text-[11px] text-purple-900 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>{activeRegistryItem.description}</span>
                </div>
              )}

              {/* Render dynamic fields for predefined registry */}
              {activeRegistryItem ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeRegistryItem.fields.map((field) => {
                    const isSecret = field.type === 'password';
                    const isRevealed = showSecrets[field.key];
                    const val = credentials[field.key] || '';

                    return (
                      <div key={field.key} className={field.key === 'base_url' ? 'sm:col-span-2' : ''}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-stone-700">
                            {field.label} {field.required && '*'}
                          </label>
                          {isSecret && (
                            <button
                              type="button"
                              onClick={() => toggleShowSecret(field.key)}
                              className="text-[10px] text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                            >
                              {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{isRevealed ? 'Hide' : 'Show'}</span>
                            </button>
                          )}
                        </div>
                        <input
                          type={isSecret ? (isRevealed ? 'text' : 'password') : 'text'}
                          value={val}
                          required={field.required}
                          onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-mono"
                        />
                        {field.description && (
                          <p className="text-[10px] text-stone-400 mt-1">{field.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Custom Courier Fields */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-stone-700">API Key *</label>
                        <button
                          type="button"
                          onClick={() => toggleShowSecret('api_key')}
                          className="text-[10px] text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                        >
                          {showSecrets.api_key ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showSecrets.api_key ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <input
                        type={showSecrets.api_key ? 'text' : 'password'}
                        value={credentials.api_key}
                        onChange={(e) => handleCredentialChange('api_key', e.target.value)}
                        placeholder="Enter API Key"
                        className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Secret Key / Token</label>
                      <input
                        type="password"
                        value={credentials.secret_key}
                        onChange={(e) => handleCredentialChange('secret_key', e.target.value)}
                        placeholder="Enter Secret Key"
                        className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">API Base URL</label>
                    <input
                      type="url"
                      value={credentials.base_url}
                      onChange={(e) => handleCredentialChange('base_url', e.target.value)}
                      placeholder="https://api.customcourier.com/v1"
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Test Connection Button & Status */}
              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleTestConnection()}
                  disabled={isTesting !== null}
                  className="px-4 py-2 border border-purple-600 text-purple-700 hover:bg-purple-50 font-bold uppercase text-xs rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
                </button>

                {formTestStatus && (
                  <div className={`p-2 px-3 rounded-xs border text-xs flex items-center gap-2 ${
                    formTestStatus.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {formTestStatus.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span className="font-semibold">{formTestStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sticky Bottom Actions Bar */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-stone-200 p-3 sm:p-4 z-30 shadow-lg flex items-center justify-between gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate('/admin/couriers')}
              className="px-4 py-2 border border-stone-300 text-stone-700 font-bold uppercase rounded-xs hover:bg-stone-50 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-xs text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Courier Configuration</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LIST VIEW: ALL CONFIGURED & AVAILABLE COURIERS
  // -------------------------------------------------------------
  const configuredList = couriers.filter(c => c.api_status === 'connected' || Boolean(c.api_key || c.access_token || c.client_id));
  const configuredIds = new Set(couriers.map(c => c.provider_code));

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="bg-white border border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xs shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-purple-100 text-purple-700 flex items-center justify-center rounded-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-stone-900 font-serif uppercase tracking-tight">
                COURIER API
              </h1>
              <p className="text-xs text-stone-500">
                Manage courier connections and API credentials
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/couriers/add"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors rounded-xs shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD COURIER</span>
          </Link>
        </div>
      </div>

      {/* 2. Connected Couriers Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
            <span>Connected Couriers</span>
            <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {couriers.filter(c => c.is_enabled && c.api_status === 'connected').length} Active
            </span>
          </h2>
        </div>

        {couriers.length === 0 ? (
          <div className="bg-white border border-stone-200 p-8 text-center rounded-xs shadow-2xs space-y-3">
            <Truck className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">No Couriers Connected Yet</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Connect your Steadfast, Pathao, RedX or other Bangladesh courier API accounts to enable automated 1-click booking on the Order page.
            </p>
            <Link
              to="/admin/couriers/add"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase rounded-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect First Courier</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {couriers.map((courier) => {
              const isConnected = courier.api_status === 'connected';
              const isTestingThis = isTesting === courier.id;
              const result = testResults[courier.id];

              return (
                <div
                  key={courier.id}
                  className={`bg-white border rounded-xs p-4 shadow-2xs flex flex-col justify-between gap-3 transition-all ${
                    courier.is_enabled && isConnected
                      ? 'border-purple-200 hover:border-purple-400'
                      : 'border-stone-200 opacity-90'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-stone-100 border border-stone-200 rounded-xs flex items-center justify-center text-stone-700 font-bold text-xs uppercase overflow-hidden shrink-0">
                          {courier.logo_url ? (
                            <img src={courier.logo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Truck className="w-5 h-5 text-purple-700" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 text-sm leading-tight">
                            {courier.name}
                          </h3>
                          <span className="text-[10px] text-stone-400 uppercase font-mono">
                            {courier.connection_type === 'api' ? 'API Integration' : 'Manual Mode'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 border rounded-2xs ${
                          courier.is_enabled
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {courier.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    {/* Status Row */}
                    <div className="p-2 bg-stone-50 border border-stone-100 rounded-xs space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 text-[11px]">API Status:</span>
                        <span
                          className={`font-bold text-[11px] flex items-center gap-1 ${
                            isConnected ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          {isConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 text-[11px]">Order Page:</span>
                        <span className="font-bold text-[11px] text-stone-800">
                          {courier.is_enabled && isConnected ? 'Active in Delivery Info' : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    {result && (
                      <div className={`text-[11px] p-1.5 rounded-xs border flex items-center gap-1.5 ${
                        result.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {result.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span className="truncate">{result.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-stone-100 text-xs">
                    <Link
                      to={`/admin/couriers/edit/${courier.id}`}
                      className="py-1.5 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 font-bold uppercase text-[11px] tracking-wider rounded-xs text-center flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleTestConnection(courier)}
                      disabled={isTestingThis}
                      className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold uppercase text-[11px] tracking-wider rounded-xs text-center flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTestingThis ? 'animate-spin' : ''}`} />
                      <span>{isTestingThis ? '...' : 'Test'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleCourier(courier.id, courier.is_enabled)}
                      className={`py-1.5 px-2 font-bold uppercase text-[11px] tracking-wider rounded-xs text-center flex items-center justify-center gap-1 cursor-pointer ${
                        courier.is_enabled
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{courier.is_enabled ? 'Disable' : 'Enable'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Available Bangladesh Couriers Registry (Quick Connect) */}
      <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-2xs space-y-4">
        <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-serif">
              Available Bangladesh Courier Integrations
            </h2>
            <p className="text-xs text-stone-500">
              Select any pre-configured courier from the registry to setup API connection
            </p>
          </div>
          <Link
            to="/admin/couriers/add"
            className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
          >
            <span>+ Add Custom Courier</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {BANGLADESH_COURIER_REGISTRY.map((reg) => {
            const isConfigured = configuredIds.has(reg.provider_code);

            return (
              <div
                key={reg.provider_code}
                className="p-3 border border-stone-200 rounded-xs flex flex-col justify-between gap-2 hover:border-purple-300 transition-colors bg-stone-50/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-stone-900 text-xs">{reg.name}</h4>
                    {isConfigured && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-2xs">
                        Added
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-2">
                    {reg.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <a
                    href={reg.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-stone-400 hover:text-stone-700 flex items-center gap-0.5"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      handleProviderChange(reg.provider_code);
                      navigate('/admin/couriers/add');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 font-bold uppercase text-[10px] rounded-xs transition-colors cursor-pointer"
                  >
                    {isConfigured ? 'Configure' : '+ Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
