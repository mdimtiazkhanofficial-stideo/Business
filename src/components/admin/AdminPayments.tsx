import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { DataService, DEFAULT_PAYMENT_CONFIGS } from '../../services/supabase';
import { PaymentAccountConfig, PaymentRecord, PaymentRecordStatus } from '../../types';
import {
  CreditCard,
  Smartphone,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Search,
  Copy,
  Check,
  ExternalLink,
  Upload,
  Eye,
  X,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const {
    paymentConfigs,
    savePaymentConfig,
    paymentRecords,
    verifyPayment,
    rejectPayment,
    orders,
    showToast
  } = useStore();

  // Local editable state for the 5 manual payment methods
  const [forms, setForms] = useState<Record<string, PaymentAccountConfig>>(() => {
    const initial: Record<string, PaymentAccountConfig> = {};
    for (const def of DEFAULT_PAYMENT_CONFIGS) {
      initial[def.method] = { ...def };
    }
    return initial;
  });

  const [savingMethod, setSavingMethod] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState<boolean>(false);
  const [uploadingLogoFor, setUploadingLogoFor] = useState<string | null>(null);

  // Order Payment Verification Queue filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentRecordStatus>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sync local forms whenever paymentConfigs load/update from database
  useEffect(() => {
    if (paymentConfigs && paymentConfigs.length > 0) {
      setForms((prev) => {
        const next = { ...prev };
        for (const def of DEFAULT_PAYMENT_CONFIGS) {
          if (!next[def.method]) {
            next[def.method] = { ...def };
          }
        }
        for (const cfg of paymentConfigs) {
          let key = cfg.method;
          if (key === 'bkash_personal') key = 'bkash';
          if (key === 'nagad_personal') key = 'nagad';
          if (key === 'rocket_personal') key = 'rocket';
          if (next[key]) {
            next[key] = {
              ...next[key],
              ...cfg,
              method: key,
              account_number: cfg.account_number || '',
              account_name: cfg.account_name || '',
              bank_name: cfg.bank_name || '',
              branch_name: cfg.branch_name || '',
              routing_number: cfg.routing_number || '',
              instructions: cfg.instructions || '',
              logo_url: cfg.logo_url || '',
              display_order: Number(cfg.display_order) || next[key].display_order
            };
          }
        }
        return next;
      });
    }
  }, [paymentConfigs]);

  const updateMethodField = <K extends keyof PaymentAccountConfig>(
    methodKey: string,
    field: K,
    value: PaymentAccountConfig[K]
  ) => {
    setForms((prev) => ({
      ...prev,
      [methodKey]: {
        ...prev[methodKey],
        [field]: value
      }
    }));
  };

  const handleToggleMethod = async (methodKey: string) => {
    const current = forms[methodKey];
    if (!current) return;
    const nextEnabled = !current.is_enabled;
    const updated: PaymentAccountConfig = {
      ...current,
      is_enabled: nextEnabled
    };
    setForms((prev) => ({ ...prev, [methodKey]: updated }));
    await savePaymentConfig(updated);
  };

  const handleSaveSingleMethod = async (methodKey: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const current = forms[methodKey];
    if (!current) return;

    setSavingMethod(methodKey);
    try {
      await savePaymentConfig({
        ...current,
        title: current.title.trim() || methodKey,
        account_number: (current.account_number || '').trim(),
        account_name: (current.account_name || '').trim(),
        bank_name: (current.bank_name || '').trim(),
        branch_name: (current.branch_name || '').trim(),
        routing_number: (current.routing_number || '').trim(),
        instructions: (current.instructions || '').trim(),
        logo_url: (current.logo_url || '').trim(),
        display_order: Number(current.display_order) || 1
      });
    } finally {
      setSavingMethod(null);
    }
  };

  const handleSaveAllMethods = async () => {
    setSavingAll(true);
    try {
      const methodsList = Object.values(forms) as PaymentAccountConfig[];
      for (const cfg of methodsList) {
        await DataService.savePaymentConfig({
          ...cfg,
          title: cfg.title.trim() || cfg.method,
          account_number: (cfg.account_number || '').trim(),
          account_name: (cfg.account_name || '').trim(),
          bank_name: (cfg.bank_name || '').trim(),
          branch_name: (cfg.branch_name || '').trim(),
          routing_number: (cfg.routing_number || '').trim(),
          instructions: (cfg.instructions || '').trim(),
          logo_url: (cfg.logo_url || '').trim(),
          display_order: Number(cfg.display_order) || 1
        });
      }
      // Refresh via savePaymentConfig on the first item to sync StoreContext state
      if (methodsList.length > 0) {
        await savePaymentConfig(methodsList[0]);
      }
      showToast('All payment methods saved successfully!', 'success');
    } finally {
      setSavingAll(false);
    }
  };

  const handleLogoUpload = async (methodKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogoFor(methodKey);
    try {
      const url = await DataService.uploadImage(file);
      updateMethodField(methodKey, 'logo_url', url);
      showToast('Payment logo uploaded', 'info');
    } catch {
      showToast('Failed to upload logo image', 'error');
    } finally {
      setUploadingLogoFor(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied: ${text}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered real order payment records
  const filteredRecords = paymentRecords.filter((rec) => {
    if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;
    if (
      methodFilter !== 'ALL' &&
      !rec.payment_method.toLowerCase().includes(methodFilter.toLowerCase())
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTrx = rec.transaction_id?.toLowerCase().includes(q);
      const matchOrder =
        rec.order_number?.toLowerCase().includes(q) || rec.order_id?.toLowerCase().includes(q);
      const matchCust =
        rec.customer_name?.toLowerCase().includes(q) || rec.customer_phone?.toLowerCase().includes(q);
      const matchSender = rec.sender_phone?.toLowerCase().includes(q);
      if (!matchTrx && !matchOrder && !matchCust && !matchSender) return false;
    }
    return true;
  });

  const enabledCount = (Object.values(forms) as PaymentAccountConfig[]).filter((c) => c.is_enabled).length;
  const pendingPaymentsCount = paymentRecords.filter((r) => r.status === 'PENDING').length;
  const verifiedPaymentsCount = paymentRecords.filter((r) => r.status === 'PAID').length;

  const mobileMethods: Array<{
    key: 'bkash' | 'nagad' | 'rocket';
    label: string;
    numberPlaceholder: string;
    accentColor: string;
  }> = [
    {
      key: 'bkash',
      label: 'bKash',
      numberPlaceholder: 'Enter bKash number',
      accentColor: 'border-l-[#E2136E]'
    },
    {
      key: 'nagad',
      label: 'Nagad',
      numberPlaceholder: 'Enter Nagad number',
      accentColor: 'border-l-[#F7941D]'
    },
    {
      key: 'rocket',
      label: 'Rocket',
      numberPlaceholder: 'Enter Rocket number',
      accentColor: 'border-l-[#8C3494]'
    }
  ];

  const bankForm = forms['bank_transfer'] || DEFAULT_PAYMENT_CONFIGS[3];
  const cardForm = forms['card_payment'] || DEFAULT_PAYMENT_CONFIGS[4];

  return (
    <div className="space-y-6 w-full max-w-full pb-16">
      {/* TOP HEADER BAR */}
      <div className="bg-white border border-stone-200 p-4 sm:p-5 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-stone-900 font-serif uppercase tracking-tight">
            Payment Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure manual payment methods (bKash, Nagad, Rocket, Bank Transfer, Card Payment) for customer checkout and verify order payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-stone-600 font-mono">
            <span className="font-bold text-[#1B4332]">{enabledCount}</span> / 5 methods enabled
          </div>
          <button
            type="button"
            onClick={handleSaveAllMethods}
            disabled={savingAll}
            className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingAll ? 'Saving All...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* COMPACT SUMMARY STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-stone-200 p-3.5 rounded-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Configured Methods
          </span>
          <span className="text-xl font-extrabold font-mono tabular-nums text-stone-900 mt-1 block">
            5
          </span>
          <span className="text-[11px] text-stone-500">
            bKash · Nagad · Rocket · Bank · Card
          </span>
        </div>

        <div className="bg-white border border-stone-200 p-3.5 rounded-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Enabled at Checkout
          </span>
          <span className="text-xl font-extrabold font-mono tabular-nums text-[#1B4332] mt-1 block">
            {enabledCount}
          </span>
          <span className="text-[11px] text-stone-500">
            Visible to customers during checkout
          </span>
        </div>

        <div className="bg-white border border-stone-200 p-3.5 rounded-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Pending Verification
          </span>
          <span className="text-xl font-extrabold font-mono tabular-nums text-amber-700 mt-1 block">
            {pendingPaymentsCount}
          </span>
          <span className="text-[11px] text-stone-500">
            Orders awaiting payment check
          </span>
        </div>

        <div className="bg-white border border-stone-200 p-3.5 rounded-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Verified Paid Orders
          </span>
          <span className="text-xl font-extrabold font-mono tabular-nums text-emerald-700 mt-1 block">
            {verifiedPaymentsCount}
          </span>
          <span className="text-[11px] text-stone-500">
            Confirmed in database
          </span>
        </div>
      </div>

      {/* =====================================================================
          SECTION 1: MOBILE BANKING (bKash, Nagad, Rocket)
      ===================================================================== */}
      <div className="bg-white border border-stone-200 rounded-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#1B4332]" />
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                Mobile Banking (bKash, Nagad, Rocket)
              </h2>
              <p className="text-[11px] text-stone-500">
                Enter your actual mobile banking numbers and customer instructions. Leave disabled if not in use.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {mobileMethods.map(({ key, label, numberPlaceholder, accentColor }) => {
            const cfg = forms[key] || DEFAULT_PAYMENT_CONFIGS.find((d) => d.method === key)!;

            return (
              <form
                key={key}
                onSubmit={(e) => handleSaveSingleMethod(key, e)}
                className={`border border-stone-200 border-l-4 ${accentColor} bg-white p-4 rounded-xs flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3.5 text-xs">
                  {/* Method Header + Enable Toggle */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      {cfg.logo_url ? (
                        <img
                          src={cfg.logo_url}
                          alt={cfg.title}
                          className="w-7 h-7 object-contain rounded-xs border border-stone-200 bg-white p-0.5"
                        />
                      ) : (
                        <div className="w-7 h-7 bg-stone-100 border border-stone-200 rounded-xs flex items-center justify-center font-bold text-stone-700 text-xs">
                          {label.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-sm text-stone-900 block">{label}</span>
                        <span className="text-[10px] text-stone-500">
                          {cfg.is_enabled ? 'Enabled on Checkout' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* Enable ON/OFF Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-stone-600">
                        {cfg.is_enabled ? 'ON' : 'OFF'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleMethod(key)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          cfg.is_enabled ? 'bg-[#1B4332]' : 'bg-stone-300'
                        }`}
                        aria-label={`Enable ${label}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            cfg.is_enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Name & Display Order */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block font-bold text-stone-700 mb-1">
                        Payment Method
                      </label>
                      <input
                        type="text"
                        value={cfg.title}
                        onChange={(e) => updateMethodField(key, 'title', e.target.value)}
                        placeholder={`Enter method name (${label})`}
                        className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={cfg.display_order}
                        onChange={(e) =>
                          updateMethodField(key, 'display_order', Number(e.target.value) || 1)
                        }
                        placeholder="Order"
                        className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-mono text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                      />
                    </div>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={cfg.account_number}
                      onChange={(e) => updateMethodField(key, 'account_number', e.target.value)}
                      placeholder={numberPlaceholder}
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-mono text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                    />
                  </div>

                  {/* Payment Type: Send Money / Payment */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Payment Type
                    </label>
                    <select
                      value={cfg.account_type || 'Send Money'}
                      onChange={(e) => updateMethodField(key, 'account_type', e.target.value)}
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-semibold text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                    >
                      <option value="Send Money">Send Money</option>
                      <option value="Payment">Payment</option>
                      <option value="Send Money / Payment">Send Money / Payment</option>
                    </select>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={cfg.instructions}
                      onChange={(e) => updateMethodField(key, 'instructions', e.target.value)}
                      placeholder="Enter customer instructions"
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                    />
                  </div>

                  {/* Optional Payment Logo / Icon */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Optional Payment Logo / Icon
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cfg.logo_url || ''}
                        onChange={(e) => updateMethodField(key, 'logo_url', e.target.value)}
                        placeholder="Upload or paste logo URL"
                        className="flex-1 bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                      />
                      <label className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xs cursor-pointer text-xs font-bold text-stone-700 shrink-0 flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingLogoFor === key ? '...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(key, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingMethod === key}
                    className="w-full py-2 px-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {savingMethod === key ? 'Saving...' : `Save ${label}`}
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          SECTION 2 & 3: BANK TRANSFER & MANUAL CARD PAYMENT
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 2: BANK TRANSFER */}
        <form
          onSubmit={(e) => handleSaveSingleMethod('bank_transfer', e)}
          className="bg-white border border-stone-200 rounded-xs overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#1B4332]" />
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Bank Transfer
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Configure bank account details for direct customer bank deposits or transfers
                  </p>
                </div>
              </div>

              {/* Enable Bank Transfer Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-600">
                  {bankForm.is_enabled ? 'ON' : 'OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleMethod('bank_transfer')}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    bankForm.is_enabled ? 'bg-[#1B4332]' : 'bg-stone-300'
                  }`}
                  aria-label="Enable Bank Transfer"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      bankForm.is_enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Payment Method Name
                  </label>
                  <input
                    type="text"
                    value={bankForm.title}
                    onChange={(e) => updateMethodField('bank_transfer', 'title', e.target.value)}
                    placeholder="Enter payment method name (Bank Transfer)"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bankForm.display_order}
                    onChange={(e) =>
                      updateMethodField('bank_transfer', 'display_order', Number(e.target.value) || 4)
                    }
                    placeholder="Enter display order"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-mono text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankForm.bank_name || ''}
                    onChange={(e) => updateMethodField('bank_transfer', 'bank_name', e.target.value)}
                    placeholder="Enter bank name"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={bankForm.account_name || ''}
                    onChange={(e) => updateMethodField('bank_transfer', 'account_name', e.target.value)}
                    placeholder="Enter account name"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankForm.account_number}
                    onChange={(e) => updateMethodField('bank_transfer', 'account_number', e.target.value)}
                    placeholder="Enter bank account number"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-mono text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={bankForm.branch_name || ''}
                    onChange={(e) => updateMethodField('bank_transfer', 'branch_name', e.target.value)}
                    placeholder="Enter branch name"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    value={bankForm.routing_number || ''}
                    onChange={(e) => updateMethodField('bank_transfer', 'routing_number', e.target.value)}
                    placeholder="Enter routing number"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-mono text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Instructions
                </label>
                <textarea
                  rows={3}
                  value={bankForm.instructions}
                  onChange={(e) => updateMethodField('bank_transfer', 'instructions', e.target.value)}
                  placeholder="Enter customer instructions"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Optional Payment Logo / Icon
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bankForm.logo_url || ''}
                    onChange={(e) => updateMethodField('bank_transfer', 'logo_url', e.target.value)}
                    placeholder="Upload or paste bank logo URL"
                    className="flex-1 bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                  <label className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xs cursor-pointer text-xs font-bold text-stone-700 shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogoFor === 'bank_transfer' ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload('bank_transfer', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-stone-100 bg-stone-50/40 flex justify-end">
            <button
              type="submit"
              disabled={savingMethod === 'bank_transfer'}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingMethod === 'bank_transfer' ? 'Saving...' : 'Save Bank Transfer'}
            </button>
          </div>
        </form>

        {/* SECTION 3: MANUAL CARD PAYMENT */}
        <form
          onSubmit={(e) => handleSaveSingleMethod('card_payment', e)}
          className="bg-white border border-stone-200 rounded-xs overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#1B4332]" />
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Card Payment (Manual Destination)
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Display destination card details for manual card transfer instructions
                  </p>
                </div>
              </div>

              {/* Enable Card Payment Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-600">
                  {cardForm.is_enabled ? 'ON' : 'OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleMethod('card_payment')}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    cardForm.is_enabled ? 'bg-[#1B4332]' : 'bg-stone-300'
                  }`}
                  aria-label="Enable Card Payment"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      cardForm.is_enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 text-xs">
              {/* Security Rule Notice */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs flex items-start gap-2 text-[11px] text-stone-600">
                <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
                <span>
                  <strong>Security Notice:</strong> This is for displaying manual payment destination instructions only. Never ask for or store CVV, Card PIN, OTP, Password, or full card security credentials.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Payment Method Name
                  </label>
                  <input
                    type="text"
                    value={cardForm.title}
                    onChange={(e) => updateMethodField('card_payment', 'title', e.target.value)}
                    placeholder="Enter payment method name (Card Payment)"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cardForm.display_order}
                    onChange={(e) =>
                      updateMethodField('card_payment', 'display_order', Number(e.target.value) || 5)
                    }
                    placeholder="Enter display order"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-mono text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Card / Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={cardForm.account_name || ''}
                    onChange={(e) => updateMethodField('card_payment', 'account_name', e.target.value)}
                    placeholder="Enter card or account holder name"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={cardForm.bank_name || ''}
                    onChange={(e) => updateMethodField('card_payment', 'bank_name', e.target.value)}
                    placeholder="Enter bank name"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Card Number (Destination)
                </label>
                <input
                  type="text"
                  value={cardForm.account_number}
                  onChange={(e) => updateMethodField('card_payment', 'account_number', e.target.value)}
                  placeholder="Enter destination card number"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-mono text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Instructions
                </label>
                <textarea
                  rows={3}
                  value={cardForm.instructions}
                  onChange={(e) => updateMethodField('card_payment', 'instructions', e.target.value)}
                  placeholder="Enter customer instructions"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Optional Payment Logo / Icon
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cardForm.logo_url || ''}
                    onChange={(e) => updateMethodField('card_payment', 'logo_url', e.target.value)}
                    placeholder="Upload or paste card icon URL"
                    className="flex-1 bg-[#FFFDF7] border border-stone-300 p-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                  />
                  <label className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xs cursor-pointer text-xs font-bold text-stone-700 shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogoFor === 'card_payment' ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload('card_payment', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-stone-100 bg-stone-50/40 flex justify-end">
            <button
              type="submit"
              disabled={savingMethod === 'card_payment'}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingMethod === 'card_payment' ? 'Saving...' : 'Save Card Payment'}
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================================
          SECTION 4: REAL ORDER PAYMENTS & VERIFICATION LOG (FROM EXISTING DATABASE)
      ===================================================================== */}
      <div className="bg-white border border-stone-200 rounded-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
              Customer Order Payments ({paymentRecords.length})
            </h2>
            <p className="text-[11px] text-stone-500">
              Real payment submissions linked directly to customer orders in the database
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order #, TrxID, Phone..."
                className="bg-[#FFFDF7] border border-stone-300 pl-8 pr-3 py-1.5 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#FFFDF7] border border-stone-300 px-2.5 py-1.5 text-xs font-semibold text-stone-800 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-[#FFFDF7] border border-stone-300 px-2.5 py-1.5 text-xs font-semibold text-stone-800 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
            >
              <option value="ALL">All Methods</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Card Payment</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <FileText className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="text-xs font-bold text-stone-800">No payment records found</h3>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL' || methodFilter !== 'ALL'
                ? 'No records match your current search or filter criteria.'
                : 'When customers place orders at checkout, their real payment details and Transaction IDs will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase font-bold border-b border-stone-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5">Order</th>
                  <th className="py-2.5 px-3.5">Customer</th>
                  <th className="py-2.5 px-3.5">Method</th>
                  <th className="py-2.5 px-3.5">Sender Number</th>
                  <th className="py-2.5 px-3.5">Transaction ID</th>
                  <th className="py-2.5 px-3.5 text-right">Amount</th>
                  <th className="py-2.5 px-3.5">Proof</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRecords.map((rec) => {
                  const linkedOrder = orders.find(
                    (o) => o.id === rec.order_id || o.order_number === rec.order_number
                  );
                  return (
                    <tr key={rec.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono tabular-nums font-bold text-[#1B4332] whitespace-nowrap">
                        <Link
                          to={`/admin/orders/${linkedOrder?.id || rec.order_id}`}
                          className="hover:underline inline-flex items-center gap-1"
                        >
                          <span>#{rec.order_number || rec.order_id}</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </Link>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-stone-900">
                          {rec.customer_name || linkedOrder?.customer_name || 'Customer'}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {rec.customer_phone || linkedOrder?.customer_phone || '—'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-stone-800 whitespace-nowrap">
                        {rec.payment_method}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-stone-700 whitespace-nowrap">
                        {rec.sender_phone || linkedOrder?.sender_phone || '—'}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {rec.transaction_id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-xs border border-stone-200">
                              {rec.transaction_id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(rec.transaction_id, `trx-${rec.id}`)}
                              className="p-1 text-stone-400 hover:text-stone-800"
                              title="Copy Transaction ID"
                            >
                              {copiedId === `trx-${rec.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-stone-900 whitespace-nowrap">
                        ৳{Number(rec.amount || 0).toLocaleString('en-US')}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {rec.payment_proof ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(rec.payment_proof || null)}
                            className="text-xs font-bold text-[#1B4332] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-stone-400">None</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-bold uppercase ${
                            rec.status === 'PAID'
                              ? 'text-emerald-700'
                              : rec.status === 'REJECTED'
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {rec.status !== 'PAID' && (
                            <button
                              type="button"
                              onClick={() => verifyPayment(rec.id, 'Verified by Admin')}
                              className="px-2.5 py-1 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[11px] font-bold rounded-xs transition-colors cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                          {rec.status !== 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => rejectPayment(rec.id, 'Rejected by Admin')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold rounded-xs transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYMENT PROOF MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-xs p-4 space-y-3 border border-stone-300">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="text-xs font-bold text-stone-900 uppercase">
                Payment Proof Receipt
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 text-stone-500 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto bg-stone-100 p-2 flex items-center justify-center">
              <img src={previewImage} alt="Payment Proof" className="max-h-[65vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
