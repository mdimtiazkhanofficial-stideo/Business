import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  User,
  PackageCheck,
  Heart,
  Truck,
  MapPin,
  Phone,
  Mail,
  Lock,
  LogOut,
  Send,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  HelpCircle,
  Search,
  ChevronRight
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentUser,
    logout,
    orders,
    wishlist,
    products,
    updateProfile,
    supportMessages,
    sendSupportMessage,
    reviews,
    showToast
  } = useStore();

  const tabParam = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  // Edit profile form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Track Order form state
  const [trackQuery, setTrackQuery] = useState(searchParams.get('order') || '');
  const [trackResult, setTrackResult] = useState<any | null>(null);

  // Support Message state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportText, setSupportText] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setAddress(currentUser.address || '');
      setCity(currentUser.city || 'Dhaka');
    }
  }, [currentUser]);

  // Handle auto tracking if order param is passed
  useEffect(() => {
    const orderParam = searchParams.get('order');
    if (orderParam) {
      const found = orders.find((o) => o.order_number === orderParam || o.id === orderParam);
      if (found) {
        setTrackResult(found);
      }
    }
  }, [searchParams, orders]);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // If not logged in, render the login/register gateway directly on this route
  if (!currentUser) {
    return (
      <div className="bg-[#FFFDF7] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white border border-stone-200 p-8 rounded-xs shadow-2xs text-center space-y-6">
          <div className="w-16 h-16 bg-[#1B4332]/10 text-[#1B4332] rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black font-serif text-stone-900 uppercase tracking-tight">
              Customer Account
            </h1>
            <p className="text-stone-500 text-xs leading-relaxed">
              Please sign in to view your orders, delivery status, saved address book, and exclusive member discounts.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              to="/login"
              className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Create New Account</span>
            </Link>

            <Link
              to="/account/track-order"
              className="block pt-2 text-xs font-bold text-[#8D5B4C] hover:underline uppercase tracking-wider"
            >
              Have an Order ID? Track As Guest →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter orders for current user
  const userOrders = orders.filter(
    (o) =>
      o.user_id === currentUser.id ||
      (currentUser.phone && o.customer_phone === currentUser.phone) ||
      (currentUser.email && o.customer_email === currentUser.email)
  );

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const userReviews = reviews.filter(
    (r) => r.author.toLowerCase() === currentUser.name.toLowerCase()
  );

  const userMessages = supportMessages.filter(
    (m) => m.user_id === currentUser.id || (currentUser.email && m.customer_email === currentUser.email)
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        city: city.trim()
      });
      showToast('Profile updated successfully!', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateProfile({ password: newPassword });
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showToast('Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    const clean = trackQuery.trim().replace(/^#/, '');
    const found = orders.find(
      (o) =>
        o.order_number.toLowerCase() === clean.toLowerCase() ||
        o.id.toLowerCase() === clean.toLowerCase() ||
        o.customer_phone.includes(clean)
    );
    setTrackResult(found || 'not_found');
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportText.trim()) return;
    setIsSendingSupport(true);
    try {
      await sendSupportMessage({
        id: `msg-${Date.now()}`,
        user_id: currentUser.id,
        customer_name: currentUser.name,
        customer_phone: currentUser.phone || '',
        customer_email: currentUser.email,
        subject: supportSubject.trim(),
        message: supportText.trim(),
        status: 'pending',
        created_at: new Date().toISOString()
      });
      showToast('Support ticket sent! We will respond shortly.', 'success');
      setSupportSubject('');
      setSupportText('');
    } catch {
      showToast('Failed to send message', 'error');
    } finally {
      setIsSendingSupport(false);
    }
  };

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-8 sm:py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User Greeting & Header */}
        <div className="bg-white border border-stone-200 p-5 sm:p-6 rounded-xs shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-serif font-black text-2xl shrink-0 shadow-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif uppercase tracking-tight">
                  {currentUser.name}
                </h1>
              </div>
              <p className="text-stone-500 text-xs mt-0.5 flex flex-wrap gap-x-4">
                <span>Phone: {currentUser.phone || 'N/A'}</span>
                {currentUser.email && <span>Email: {currentUser.email}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold uppercase rounded-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Layout: Sidebar Navigation & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-1">
            <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden divide-y divide-stone-100">
              <button
                onClick={() => changeTab('overview')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-[#1B4332] text-white'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Dashboard Overview</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => changeTab('orders')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-[#1B4332] text-white'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PackageCheck className="w-4 h-4" />
                  <span>My Orders ({userOrders.length})</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => changeTab('track')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'track'
                    ? 'bg-[#1B4332] text-white'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4" />
                  <span>Track Order</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => changeTab('wishlist')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'wishlist'
                    ? 'bg-[#1B4332] text-white'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4" />
                  <span>Saved Wishlist ({wishlist.length})</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => changeTab('profile')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-[#1B4332] text-white'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4" />
                  <span>Saved Addresses & Profile</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => changeTab('reviews')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-[#1B4332] text-white'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4" />
                  <span>My Reviews ({userReviews.length})</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => changeTab('password')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'password'
                    ? 'bg-[#1B4332] text-white'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => changeTab('support')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'support'
                    ? 'bg-[#1B4332] text-white'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Support Tickets ({userMessages.length})</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 bg-white border border-stone-200 p-5 sm:p-8 rounded-xs shadow-2xs">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold font-serif text-stone-900 uppercase tracking-wide">
                    Account Dashboard
                  </h2>
                  <p className="text-xs text-stone-500">
                    Welcome to your personal customer portal. Track ongoing deliveries and recent food orders.
                  </p>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xs text-center">
                    <span className="text-xs text-stone-500 font-bold uppercase block">Total Orders</span>
                    <span className="text-xl font-mono font-black text-[#1B4332]">{userOrders.length}</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xs text-center">
                    <span className="text-xs text-stone-500 font-bold uppercase block">Wishlist Items</span>
                    <span className="text-xl font-mono font-black text-[#1B4332]">{wishlist.length}</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xs text-center">
                    <span className="text-xs text-stone-500 font-bold uppercase block">Default City</span>
                    <span className="text-sm font-bold text-stone-900">{currentUser.city || 'Dhaka'}</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xs text-center">
                    <span className="text-xs text-stone-500 font-bold uppercase block">Support Tickets</span>
                    <span className="text-xl font-mono font-black text-[#1B4332]">{userMessages.length}</span>
                  </div>
                </div>

                {/* Recent Order Preview */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Most Recent Order
                    </h3>
                    {userOrders.length > 0 && (
                      <button
                        onClick={() => changeTab('orders')}
                        className="text-xs text-[#1B4332] font-bold hover:underline uppercase"
                      >
                        View All Orders →
                      </button>
                    )}
                  </div>

                  {userOrders.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 border border-stone-200 rounded-xs space-y-3">
                      <PackageCheck className="w-10 h-10 text-stone-300 mx-auto" />
                      <p className="text-xs text-stone-500">You haven't placed any orders with SHAD SODAI yet.</p>
                      <Link
                        to="/shop"
                        className="inline-block bg-[#1B4332] text-white px-4 py-2 text-xs font-bold uppercase rounded-xs hover:bg-[#2D6A4F]"
                      >
                        Browse Natural Foods
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-[#FFFDF7] border border-stone-200 p-4 rounded-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
                        <div>
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            #{userOrders[0].order_number}
                          </span>
                          <span className="text-stone-400 text-xs ml-2">
                            {new Date(userOrders[0].created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full capitalize bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                          {userOrders[0].order_status}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 space-y-1">
                        <p>Total Items: <strong>{userOrders[0].items.length}</strong></p>
                        <p>Payable Amount: <strong className="font-mono text-stone-900">৳{userOrders[0].total_amount.toLocaleString()}</strong> ({userOrders[0].payment_method.toUpperCase()})</p>
                        <p>Delivery: {userOrders[0].customer_address}, {userOrders[0].customer_city}</p>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => {
                            setTrackQuery(userOrders[0].order_number);
                            setTrackResult(userOrders[0]);
                            changeTab('track');
                          }}
                          className="bg-[#1B4332] text-white px-3 py-1.5 text-xs font-bold uppercase rounded-xs hover:bg-[#2D6A4F]"
                        >
                          Track Delivery
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-serif text-stone-900 uppercase tracking-wide">
                      My Orders ({userOrders.length})
                    </h2>
                    <p className="text-xs text-stone-500">History of all your confirmed orders</p>
                  </div>
                  <Link
                    to="/shop"
                    className="text-xs font-bold text-[#1B4332] hover:underline uppercase"
                  >
                    + New Order
                  </Link>
                </div>

                {userOrders.length === 0 ? (
                  <div className="p-12 text-center bg-stone-50 border border-stone-200 rounded-xs space-y-3">
                    <PackageCheck className="w-12 h-12 text-stone-300 mx-auto" />
                    <p className="text-sm font-bold text-stone-700">No orders placed yet</p>
                    <Link
                      to="/shop"
                      className="inline-block bg-[#1B4332] text-white px-5 py-2 text-xs font-bold uppercase rounded-xs hover:bg-[#2D6A4F]"
                    >
                      Explore Natural Foods
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#FFFDF7] border border-stone-200 p-4 sm:p-5 rounded-xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                          <div>
                            <span className="font-mono font-bold text-stone-900 text-sm sm:text-base">
                              #{order.order_number}
                            </span>
                            <span className="text-stone-400 text-xs ml-2">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full capitalize bg-emerald-100 text-emerald-800">
                              {order.order_status}
                            </span>
                            <button
                              onClick={() => {
                                setTrackQuery(order.order_number);
                                setTrackResult(order);
                                changeTab('track');
                              }}
                              className="text-xs bg-white border border-stone-300 hover:border-stone-500 px-2.5 py-1 font-bold uppercase rounded-xs"
                            >
                              Track
                            </button>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-stone-100">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={it.product_image}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded-xs border border-stone-200"
                                />
                                <div>
                                  <span className="font-bold text-stone-900 block">{it.product_name}</span>
                                  <span className="text-[10px] text-stone-500 font-mono">
                                    {it.weight} × {it.quantity}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-stone-900">
                                ৳{(it.price * it.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-stone-200 pt-3 flex items-center justify-between text-xs">
                          <span className="text-stone-500">
                            Payment: <strong className="uppercase">{order.payment_method}</strong> ({order.payment_status})
                          </span>
                          <span className="text-sm font-black text-[#1B4332] font-mono">
                            Total: ৳{order.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TRACK ORDER TAB */}
            {activeTab === 'track' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold font-serif text-stone-900 uppercase tracking-wide">
                    Order Tracking System
                  </h2>
                  <p className="text-xs text-stone-500">
                    Enter your Order Number (e.g. SG-88231 or 12345) or Customer Phone to view live parcel progress.
                  </p>
                </div>

                <form onSubmit={handleTrackSearch} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    required
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder="Enter Order # or Phone Number"
                    className="flex-1 bg-white border border-stone-300 p-2.5 text-xs rounded-xs"
                  />
                  <button
                    type="submit"
                    className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-5 py-2.5 text-xs font-bold uppercase rounded-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </form>

                {trackResult === 'not_found' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs text-xs">
                    No order found matching "{trackQuery}". Please double check your order number or phone number.
                  </div>
                )}

                {trackResult && trackResult !== 'not_found' && (
                  <div className="bg-[#FFFDF7] border border-stone-200 p-5 sm:p-6 rounded-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                      <div>
                        <span className="font-mono font-bold text-stone-900 text-base">
                          Order #{trackResult.order_number}
                        </span>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Placed on {new Date(trackResult.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-xs font-bold rounded-full capitalize bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                        Status: {trackResult.order_status}
                      </span>
                    </div>

                    {/* Stepper Timeline */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Delivery Milestones
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-white border border-emerald-300 rounded-xs">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                          <span className="text-xs font-bold text-stone-900 block">Order Placed</span>
                          <span className="text-[10px] text-stone-400">Confirmed</span>
                        </div>
                        <div className={`p-3 bg-white border rounded-xs ${
                          ['processing', 'shipped', 'delivered'].includes(trackResult.order_status)
                            ? 'border-emerald-300'
                            : 'border-stone-200 opacity-50'
                        }`}>
                          <PackageCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                          <span className="text-xs font-bold text-stone-900 block">Processing</span>
                          <span className="text-[10px] text-stone-400">Packaging</span>
                        </div>
                        <div className={`p-3 bg-white border rounded-xs ${
                          ['shipped', 'delivered'].includes(trackResult.order_status)
                            ? 'border-emerald-300'
                            : 'border-stone-200 opacity-50'
                        }`}>
                          <Truck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                          <span className="text-xs font-bold text-stone-900 block">On The Way</span>
                          <span className="text-[10px] text-stone-400">Courier Transit</span>
                        </div>
                        <div className={`p-3 bg-white border rounded-xs ${
                          trackResult.order_status === 'delivered'
                            ? 'border-emerald-300'
                            : 'border-stone-200 opacity-50'
                        }`}>
                          <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                          <span className="text-xs font-bold text-stone-900 block">Delivered</span>
                          <span className="text-[10px] text-stone-400">Completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 border border-stone-200 rounded-xs text-xs space-y-1 text-stone-600">
                      <p>Recipient: <strong>{trackResult.customer_name}</strong> ({trackResult.customer_phone})</p>
                      <p>Delivery Location: {trackResult.customer_address}, {trackResult.customer_city}</p>
                      <p>Total Bill: <strong className="font-mono text-stone-900">৳{trackResult.total_amount.toLocaleString()}</strong> ({trackResult.payment_method.toUpperCase()})</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-serif text-stone-900 uppercase tracking-wide">
                      My Saved Wishlist ({wishlistProducts.length})
                    </h2>
                    <p className="text-xs text-stone-500">Products you've saved for future health orders</p>
                  </div>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="p-12 text-center bg-stone-50 border border-stone-200 rounded-xs space-y-3">
                    <Heart className="w-12 h-12 text-stone-300 mx-auto" />
                    <p className="text-sm font-bold text-stone-700">Your wishlist is empty</p>
                    <Link
                      to="/shop"
                      className="inline-block bg-[#1B4332] text-white px-5 py-2 text-xs font-bold uppercase rounded-xs hover:bg-[#2D6A4F]"
                    >
                      Find Foods You Love
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map((p) => (
                      <div key={p.id} className="p-3 border border-stone-200 rounded-xs flex gap-3 items-center">
                        <img
                          src={p.main_image}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-xs border border-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${p.id}`}
                            className="font-bold text-xs font-serif text-stone-900 hover:text-[#1B4332] block truncate"
                          >
                            {p.name}
                          </Link>
                          <span className="font-mono font-bold text-[#1B4332] text-xs block mt-0.5">
                            ৳{p.selling_price}
                          </span>
                          <Link
                            to={`/product/${p.id}`}
                            className="text-[11px] font-bold text-[#1B4332] hover:underline uppercase block mt-1"
                          >
                            View Product →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE & ADDRESSES TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold font-serif text-stone-900 uppercase tracking-wide">
                    Profile & Delivery Addresses
                  </h2>
                  <p className="text-xs text-stone-500">Update your contact details and default shipping address</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                        Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Default Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House / Road / Area / Landmark"
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      City / Region
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chattogram">Chattogram</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barishal">Barishal</option>
                      <option value="Rangpur">Rangpur</option>
                      <option value="Mymensingh">Mymensingh</option>
                      <option value="Outside Dhaka">Other Districts</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold font-serif text-stone-900 uppercase tracking-wide">
                    My Product Reviews ({userReviews.length})
                  </h2>
                  <p className="text-xs text-stone-500">Reviews and ratings you've submitted for purchased items</p>
                </div>

                {userReviews.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 border border-stone-200 rounded-xs space-y-2">
                    <Star className="w-10 h-10 text-stone-300 mx-auto" />
                    <p className="text-xs text-stone-500">You haven't reviewed any products yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userReviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xs space-y-1">
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-stone-800">{rev.comment}</p>
                        <span className="text-[10px] text-stone-400 block">
                          Status: {rev.status} • {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CHANGE PASSWORD TAB */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold font-serif text-stone-900 uppercase tracking-wide">
                    Change Password
                  </h2>
                  <p className="text-xs text-stone-500">Ensure your account uses a strong, secure password</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors disabled:opacity-50"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* SUPPORT TICKETS TAB */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-serif text-stone-900 uppercase tracking-wide">
                      Support Inquiries ({userMessages.length})
                    </h2>
                    <p className="text-xs text-stone-500">Send tickets and view response status</p>
                  </div>
                  <Link
                    to="/support"
                    className="text-xs font-bold text-[#1B4332] hover:underline uppercase"
                  >
                    Help Center & Live Chat →
                  </Link>
                </div>

                <form onSubmit={handleSendSupport} className="bg-stone-50 p-4 border border-stone-200 rounded-xs space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Submit New Ticket
                  </h4>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 block">Subject</label>
                    <input
                      type="text"
                      required
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      placeholder="e.g. Delivery status inquiry..."
                      className="w-full bg-white border border-stone-300 p-2 text-xs rounded-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 block">Message Details</label>
                    <textarea
                      required
                      rows={3}
                      value={supportText}
                      onChange={(e) => setSupportText(e.target.value)}
                      placeholder="Describe what you need assistance with..."
                      className="w-full bg-white border border-stone-300 p-2 text-xs rounded-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingSupport}
                    className="bg-[#1B4332] text-white px-4 py-2 text-xs font-bold uppercase rounded-xs hover:bg-[#2D6A4F] transition-colors"
                  >
                    {isSendingSupport ? 'Sending...' : 'Submit Ticket'}
                  </button>
                </form>

                {userMessages.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Ticket History
                    </h4>
                    {userMessages.map((msg) => (
                      <div key={msg.id} className="p-3 bg-[#FFFDF7] border border-stone-200 rounded-xs space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-stone-900">{msg.subject}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-stone-600">{msg.message}</p>
                        <span className="text-[10px] text-stone-400 block">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
