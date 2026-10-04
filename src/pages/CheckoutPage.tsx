import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { DEFAULT_PAYMENT_CONFIGS } from '../services/supabase';
import {
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Copy,
  Check,
  Upload,
  X,
  Info,
  Building,
  Smartphone,
  Banknote
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    deliveryCharge,
    cartTotal,
    placeOrder,
    currentUser,
    paymentConfigs
  } = useStore();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || 'Dhaka');
  const [notes, setNotes] = useState('');

  // Only show payment methods enabled in Admin -> Payments, sorted by display_order
  const sourceConfigs =
    paymentConfigs && paymentConfigs.length > 0 ? paymentConfigs : DEFAULT_PAYMENT_CONFIGS;

  const activeMethods = [...sourceConfigs]
    .filter((c) => c.is_enabled)
    .sort((a, b) => (a.display_order || 99) - (b.display_order || 99));

  const [selectedMethod, setSelectedMethod] = useState<string>(
    activeMethods[0]?.method || 'cod'
  );
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [paymentProof, setPaymentProof] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep selectedMethod valid when admin toggles methods
  React.useEffect(() => {
    if (activeMethods.length > 0 && !activeMethods.some((m) => m.method === selectedMethod)) {
      setSelectedMethod(activeMethods[0].method);
    }
  }, [activeMethods, selectedMethod]);

  const currentMethodConfig =
    activeMethods.find((m) => m.method === selectedMethod) || activeMethods[0];

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Payment proof file size must be less than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProof(reader.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  if (cart.length === 0) {
    return (
      <div className="bg-[#FFFDF7] min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white border border-stone-200 p-8 text-center space-y-4 rounded-xs shadow-2xs">
          <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-serif text-stone-900 uppercase">Cart is Empty</h2>
          <p className="text-stone-500 text-xs">You don't have any items to checkout.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#1B4332] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#2D6A4F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCodSelected =
    !currentMethodConfig ||
    currentMethodConfig.method === 'cod' ||
    currentMethodConfig.category === 'cod' ||
    currentMethodConfig.method.toLowerCase().includes('cash');

  const isMobileBanking =
    currentMethodConfig &&
    (currentMethodConfig.category === 'mobile_banking' ||
      ['bkash', 'nagad', 'rocket', 'bkash_personal', 'nagad_personal', 'rocket_personal'].includes(
        currentMethodConfig.method
      ));

  const isBankTransfer =
    currentMethodConfig &&
    (currentMethodConfig.category === 'bank_transfer' ||
      currentMethodConfig.method === 'bank_transfer');

  const isCardPayment =
    currentMethodConfig &&
    (currentMethodConfig.category === 'card_payment' ||
      currentMethodConfig.method === 'card_payment');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('Please fill in your Name, Phone Number, and Delivery Address.');
      return;
    }

    if (!isCodSelected) {
      if (!senderPhone.trim()) {
        setErrorMessage(
          `Please enter your sender number / reference for ${currentMethodConfig?.title || 'payment'}.`
        );
        return;
      }
      if (!transactionId.trim()) {
        setErrorMessage(
          `Please enter your ${currentMethodConfig?.title || 'Payment'} Transaction ID to confirm your order.`
        );
        return;
      }
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const order = await placeOrder({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        notes: notes.trim(),
        paymentMethod: currentMethodConfig?.title || selectedMethod,
        transactionId: isCodSelected ? '' : transactionId.trim(),
        senderPhone: isCodSelected ? '' : senderPhone.trim(),
        paymentProof: !isCodSelected && paymentProof ? paymentProof : undefined
      });

      if (order) {
        navigate(`/order-success/${order.order_number}`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-8 sm:py-12 pb-20 md:pb-12 w-full max-w-full overflow-hidden box-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 w-full max-w-full box-border">
        {/* Header */}
        <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif uppercase tracking-tight">
              Checkout
            </h1>
            <p className="text-stone-500 text-xs mt-0.5">
              Complete your delivery information and select an enabled payment method below.
            </p>
          </div>

          <Link
            to="/cart"
            className="text-xs text-[#1B4332] hover:underline font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Cart</span>
          </Link>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact & Shipping Address */}
            <div className="bg-white border border-stone-200 p-5 sm:p-6 rounded-xs shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900 font-serif uppercase tracking-wide">
                  Delivery Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Mobile Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your mobile number"
                      className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    City / Region *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs font-medium"
                  >
                    <option value="Dhaka">Dhaka (Inside Dhaka ৳60)</option>
                    <option value="Chattogram">Chattogram (৳120)</option>
                    <option value="Sylhet">Sylhet (৳120)</option>
                    <option value="Rajshahi">Rajshahi (৳120)</option>
                    <option value="Khulna">Khulna (৳120)</option>
                    <option value="Barishal">Barishal (৳120)</option>
                    <option value="Rangpur">Rangpur (৳120)</option>
                    <option value="Mymensingh">Mymensingh (৳120)</option>
                    <option value="Outside Dhaka">Other Districts (৳120)</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Detailed Delivery Address *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter house/flat, road, area, and landmark"
                      className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any special delivery instructions"
                    className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white border border-stone-200 p-5 sm:p-6 rounded-xs shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-stone-900 font-serif uppercase tracking-wide">
                    Payment Method
                  </h2>
                </div>

                <span className="text-[10px] font-bold text-[#1B4332] bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200 uppercase tracking-wider">
                  {activeMethods.length} Enabled Method{activeMethods.length !== 1 ? 's' : ''}
                </span>
              </div>

              {activeMethods.length === 0 ? (
                <div className="p-6 text-center bg-stone-50 border border-stone-200 rounded-xs space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="text-xs font-bold text-stone-800">
                    No Payment Methods Currently Enabled
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Please contact store support or enable a payment method in the Admin Payments module.
                  </p>
                </div>
              ) : (
                <>
                  {/* Method Selection Options */}
                  <div className="space-y-2.5">
                    {activeMethods.map((cfg) => {
                      const isSelected = selectedMethod === cfg.method;
                      const mKey = cfg.method.toLowerCase();
                      const isBkash = mKey.includes('bkash');
                      const isNagad = mKey.includes('nagad');
                      const isRocket = mKey.includes('rocket');
                      const isBank = mKey === 'bank_transfer' || cfg.category === 'bank_transfer';
                      const isCard = mKey === 'card_payment' || cfg.category === 'card_payment';
                      const isCod = mKey === 'cod' || cfg.category === 'cod';

                      return (
                        <label
                          key={cfg.id}
                          className={`flex items-start gap-3 p-3.5 border rounded-xs cursor-pointer transition-all ${
                            isSelected
                              ? isBkash
                                ? 'border-[#E2136E] bg-pink-50/40 ring-1 ring-[#E2136E]'
                                : isNagad
                                ? 'border-[#F7941D] bg-amber-50/40 ring-1 ring-[#F7941D]'
                                : isRocket
                                ? 'border-[#8C3494] bg-purple-50/40 ring-1 ring-[#8C3494]'
                                : isBank
                                ? 'border-[#1B365D] bg-blue-50/40 ring-1 ring-[#1B365D]'
                                : isCard
                                ? 'border-indigo-700 bg-indigo-50/40 ring-1 ring-indigo-700'
                                : 'border-[#1B4332] bg-emerald-50/40 ring-1 ring-[#1B4332]'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={isSelected}
                            onChange={() => setSelectedMethod(cfg.method)}
                            className="mt-1 text-[#1B4332] focus:ring-[#1B4332]"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                {cfg.logo_url ? (
                                  <img
                                    src={cfg.logo_url}
                                    alt={cfg.title}
                                    className="w-6 h-6 object-contain rounded-2xs border border-stone-200 bg-white p-0.5"
                                  />
                                ) : isBank ? (
                                  <Building className="w-4 h-4 text-[#1B365D]" />
                                ) : isCard ? (
                                  <CreditCard className="w-4 h-4 text-indigo-700" />
                                ) : isCod ? (
                                  <Banknote className="w-4 h-4 text-[#1B4332]" />
                                ) : (
                                  <Smartphone className="w-4 h-4 text-stone-700" />
                                )}

                                <span className="font-bold text-xs text-stone-900">
                                  {cfg.title}
                                </span>

                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-2xs uppercase tracking-wider ${
                                    isBkash
                                      ? 'bg-[#E2136E] text-white'
                                      : isNagad
                                      ? 'bg-[#F7941D] text-white'
                                      : isRocket
                                      ? 'bg-[#8C3494] text-white'
                                      : isBank
                                      ? 'bg-[#1B365D] text-white'
                                      : isCard
                                      ? 'bg-indigo-700 text-white'
                                      : 'bg-[#1B4332] text-white'
                                  }`}
                                >
                                  {cfg.account_type}
                                </span>
                              </div>

                              {!isCod && cfg.account_number && (
                                <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-2xs border border-stone-200">
                                  {cfg.account_number}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-stone-500 mt-1">
                              {isCod
                                ? cfg.instructions || 'Pay with cash upon receiving your order.'
                                : isBank
                                ? 'Transfer funds to our bank account and submit your transaction reference below.'
                                : isCard
                                ? 'Complete manual card payment to the destination card below and provide your reference.'
                                : `Complete ${cfg.account_type} to our ${cfg.title} number and submit the Transaction ID below.`}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* MANUAL PAYMENT DETAILS & CUSTOMER INPUTS */}
                  {currentMethodConfig && !isCodSelected && (
                    <div className="border border-stone-200 bg-[#FFFDF7] rounded-xs p-4 sm:p-5 space-y-4">
                      {/* 1. MOBILE BANKING (bKash / Nagad / Rocket) */}
                      {isMobileBanking && (
                        <div className="bg-white border border-stone-300 p-4 rounded-xs shadow-2xs space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
                            <span className="font-bold text-stone-600 uppercase tracking-wider">
                              {currentMethodConfig.title} Account Details
                            </span>
                            <span className="text-[10px] font-bold uppercase text-[#1B4332] bg-emerald-50 px-2 py-0.5 rounded-2xs border border-emerald-200">
                              Payment Type: {currentMethodConfig.account_type}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                                {currentMethodConfig.title} Number
                              </span>
                              {currentMethodConfig.account_number ? (
                                <span className="font-mono text-base sm:text-lg font-black text-stone-900 tracking-wider block select-all">
                                  {currentMethodConfig.account_number}
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-amber-700 block">
                                  Account number not configured by admin yet
                                </span>
                              )}
                            </div>

                            {currentMethodConfig.account_number && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(currentMethodConfig.account_number, 'chk-mob-num')
                                }
                                className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
                              >
                                {copiedId === 'chk-mob-num' ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Number</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. BANK TRANSFER */}
                      {isBankTransfer && (
                        <div className="bg-white border border-stone-300 p-4 rounded-xs shadow-2xs space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
                            <span className="font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Building className="w-4 h-4 text-[#1B365D]" />
                              <span>Bank Transfer Destination</span>
                            </span>
                            <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded-2xs border border-blue-200">
                              Bank Transfer
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xs">
                              <span className="text-[10px] font-bold text-stone-400 uppercase block">
                                Bank Name
                              </span>
                              <span className="font-bold text-stone-900">
                                {currentMethodConfig.bank_name || '—'}
                              </span>
                            </div>

                            <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xs">
                              <span className="text-[10px] font-bold text-stone-400 uppercase block">
                                Account Name
                              </span>
                              <span className="font-bold text-stone-900">
                                {currentMethodConfig.account_name || '—'}
                              </span>
                            </div>

                            <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xs sm:col-span-2 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-stone-400 uppercase block">
                                  Account Number
                                </span>
                                <span className="font-mono text-sm font-black text-stone-900 select-all">
                                  {currentMethodConfig.account_number || '—'}
                                </span>
                              </div>
                              {currentMethodConfig.account_number && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(currentMethodConfig.account_number, 'chk-bank-num')
                                  }
                                  className="px-2.5 py-1 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[11px] font-bold rounded-xs flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedId === 'chk-bank-num' ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-300" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xs">
                              <span className="text-[10px] font-bold text-stone-400 uppercase block">
                                Branch
                              </span>
                              <span className="font-semibold text-stone-800">
                                {currentMethodConfig.branch_name || '—'}
                              </span>
                            </div>

                            <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xs">
                              <span className="text-[10px] font-bold text-stone-400 uppercase block">
                                Routing Number
                              </span>
                              <span className="font-mono font-bold text-stone-900">
                                {currentMethodConfig.routing_number || '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. MANUAL CARD PAYMENT */}
                      {isCardPayment && (
                        <div className="bg-white border border-stone-300 p-4 rounded-xs shadow-2xs space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
                            <span className="font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-indigo-700" />
                              <span>Manual Card Payment Destination</span>
                            </span>
                            <span className="text-[10px] font-bold uppercase text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-2xs border border-indigo-200">
                              Manual Card Transfer
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xs">
                              <span className="text-[10px] font-bold text-stone-400 uppercase block">
                                Card / Account Holder Name
                              </span>
                              <span className="font-bold text-stone-900">
                                {currentMethodConfig.account_name || '—'}
                              </span>
                            </div>

                            <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xs">
                              <span className="text-[10px] font-bold text-stone-400 uppercase block">
                                Bank Name
                              </span>
                              <span className="font-bold text-stone-900">
                                {currentMethodConfig.bank_name || '—'}
                              </span>
                            </div>

                            <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xs sm:col-span-2 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-stone-400 uppercase block">
                                  Destination Card Number
                                </span>
                                <span className="font-mono text-sm font-black text-stone-900 select-all">
                                  {currentMethodConfig.account_number || '—'}
                                </span>
                              </div>
                              {currentMethodConfig.account_number && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(currentMethodConfig.account_number, 'chk-card-num')
                                  }
                                  className="px-2.5 py-1 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[11px] font-bold rounded-xs flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedId === 'chk-card-num' ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-300" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Exact Amount Banner */}
                      <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xs flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                          Payable Amount:
                        </span>
                        <span className="font-mono text-base font-black text-[#1B4332]">
                          ৳{cartTotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Instructions (if configured) */}
                      {currentMethodConfig.instructions && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                            Instructions:
                          </span>
                          <div className="bg-white border border-stone-200 p-3.5 rounded-xs text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                            {currentMethodConfig.instructions}
                          </div>
                        </div>
                      )}

                      {/* Customer Input Fields */}
                      <div className="bg-white border border-stone-200 p-4 rounded-xs space-y-3.5">
                        <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block border-b border-stone-100 pb-2">
                          Submit Your Payment Information
                        </span>

                        {/* Sender Number */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                            {isBankTransfer
                              ? 'Sender Account / Phone Number *'
                              : isCardPayment
                              ? 'Sender Phone / Reference Number *'
                              : 'Sender Number *'}
                          </label>
                          <input
                            type="text"
                            required={!isCodSelected}
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            placeholder="Enter your sender number"
                            className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                          />
                        </div>

                        {/* Transaction ID */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                            Transaction ID *
                          </label>
                          <input
                            type="text"
                            required={!isCodSelected}
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Enter transaction ID"
                            className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                          />
                        </div>

                        {/* Optional Payment Proof / Screenshot */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                            Payment Proof / Screenshot (Optional)
                          </label>

                          {paymentProof ? (
                            <div className="flex items-center gap-3 p-2 bg-stone-50 border border-stone-200 rounded-xs">
                              <img
                                src={paymentProof}
                                alt="Payment Proof"
                                className="w-12 h-12 object-cover rounded-xs border border-stone-300"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold text-stone-800 block truncate">
                                  Payment Screenshot Attached
                                </span>
                                <span className="text-[10px] text-emerald-700 font-semibold block">
                                  Will be submitted with your order
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setPaymentProof('')}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-200 rounded-xs transition-colors"
                                title="Remove screenshot"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-stone-300 hover:border-[#1B4332] bg-[#FFFDF7] hover:bg-stone-50 rounded-xs cursor-pointer transition-colors text-xs text-stone-600">
                              <Upload className="w-4 h-4 text-stone-400" />
                              <span>Upload payment proof / screenshot (Optional)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProofUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xs text-[11px] text-amber-900 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          Your payment status will initially be <strong>Pending</strong> until verified by our admin team. Never share your PIN, OTP, CVV, or password.
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column: Order Items Review & Final CTA */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-stone-200 p-5 sm:p-6 rounded-xs shadow-2xs space-y-5">
              <h2 className="text-base font-bold font-serif text-stone-900 uppercase tracking-wide border-b border-stone-100 pb-3">
                Order Summary ({cart.length} item{cart.length !== 1 ? 's' : ''})
              </h2>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const itemKey =
                    item.id ||
                    `${item.product_id || item.product?.id}-${
                      item.variant_id || item.selected_variant?.id
                    }`;
                  const itemImage =
                    item.product_image ||
                    item.selected_variant?.image ||
                    item.product?.main_image ||
                    (item.product as any)?.image ||
                    (Array.isArray(item.product?.gallery_images) &&
                      item.product.gallery_images[0]) ||
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80';

                  const itemName =
                    item.product_name ||
                    item.product?.name ||
                    (item.product as any)?.title ||
                    'Product';

                  const rawPrice =
                    item.price ??
                    item.selected_variant?.price ??
                    item.product?.selling_price ??
                    (item.product as any)?.price ??
                    0;
                  const numPrice = Number(rawPrice);
                  const safePrice = !isNaN(numPrice) && numPrice > 0 ? numPrice : 0;

                  const itemQty = Math.max(1, Number(item.quantity) || 1);
                  const lineTotal = safePrice * itemQty;

                  const variantLabel =
                    item.weight ||
                    [item.selected_variant?.size, item.selected_variant?.color]
                      .filter(Boolean)
                      .join(' / ') ||
                    item.size ||
                    '';

                  return (
                    <div
                      key={itemKey}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={itemImage}
                          alt=""
                          className="w-11 h-11 object-cover rounded-xs border border-stone-200 shrink-0 bg-stone-50"
                        />
                        <div className="truncate">
                          <p className="font-bold text-stone-900 truncate">{itemName}</p>
                          <p className="text-[10px] text-stone-500 font-mono">
                            {variantLabel ? `${variantLabel} • ` : ''}৳
                            {safePrice.toLocaleString()} × {itemQty}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-stone-900 shrink-0">
                        ৳{lineTotal.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-stone-200 pt-3 space-y-2 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-mono font-bold text-stone-900">
                    ৳{cartSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Charge ({city})</span>
                  <span className="font-mono font-bold text-stone-900">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-700 uppercase font-bold">FREE</span>
                    ) : (
                      `৳${deliveryCharge}`
                    )}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-black text-stone-900 uppercase">
                    Payable Amount
                  </span>
                  <span className="text-2xl font-black text-[#1B4332] font-mono">
                    ৳{cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isSubmitting || activeMethods.length === 0}
                className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Submitting Order...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Order (৳{cartTotal.toLocaleString()})</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[10px] text-stone-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>Secure Order & Manual Payment Verification</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
