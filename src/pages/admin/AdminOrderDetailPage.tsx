import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { AdminDeliveryInformationCard } from '../../components/admin/AdminDeliveryInformationCard';
import { ArrowLeft, Phone, MapPin, Calendar, Clock, ShoppingBag, CheckCircle2, Truck, Printer, Save, FileText, Copy, Check, Eye, X, CreditCard, ExternalLink } from 'lucide-react';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder, showToast, paymentRecords, verifyPayment, rejectPayment } = useStore();

  const order = orders.find((o) => o.id === id || o.order_number === id);
  const paymentRecord = paymentRecords.find((p) => p.order_id === order?.id || p.order_number === order?.order_number);

  const [copiedTrx, setCopiedTrx] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Accordion state
  const [openSections, setOpenSections] = useState({
    customer: true,
    products: true,
    delivery: true,
    payment: true,
    summary: true,
    status: true,
    delivery_info: true,
    notes: true
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  // Editable form state
  const [customerName, setCustomerName] = useState(order?.customer_name || '');
  const [customerPhone, setCustomerPhone] = useState(order?.customer_phone || '');
  const [customerEmail, setCustomerEmail] = useState(order?.customer_email || '');
  const [customerAddress, setCustomerAddress] = useState(order?.customer_address || '');
  const [customerCity, setCustomerCity] = useState(order?.customer_city || 'Dhaka');
  const [orderStatus, setOrderStatus] = useState<Order['order_status']>(order?.order_status || 'pending');
  const [paymentStatus, setPaymentStatus] = useState<Order['payment_status']>(order?.payment_status || 'pending');
  const [paymentMethod, setPaymentMethod] = useState<string>(order?.payment_method || 'cod');
  const [senderPhone, setSenderPhone] = useState<string>(order?.sender_phone || paymentRecord?.sender_phone || '');
  const [transactionId, setTransactionId] = useState<string>(order?.transaction_id || paymentRecord?.transaction_id || '');
  const [orderNotes, setOrderNotes] = useState(order?.order_notes || '');

  // Courier state
  const [courierState, setCourierState] = useState({
    courier_name: order?.courier_name || '',
    tracking_id: order?.tracking_id || '',
    shipment_status: order?.shipment_status || '',
    shipment_date: order?.shipment_date || ''
  });

  if (!order) {
    return (
      <div className="bg-white border border-stone-200 p-8 text-center space-y-4 rounded-xs shadow-2xs">
        <h2 className="text-xl font-bold font-serif text-stone-900">Order Not Found</h2>
        <p className="text-stone-500 text-xs">The requested order does not exist or has been deleted.</p>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B4332] text-white text-xs font-bold uppercase rounded-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Order = {
      ...order,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || undefined,
      customer_address: customerAddress.trim(),
      customer_city: customerCity.trim(),
      order_status: orderStatus,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      sender_phone: senderPhone.trim() || undefined,
      transaction_id: transactionId.trim() || undefined,
      order_notes: orderNotes.trim(),
      courier_name: courierState.courier_name || undefined,
      tracking_id: courierState.tracking_id || undefined,
      shipment_status: courierState.shipment_status || undefined,
      shipment_date: courierState.shipment_date || undefined
    };
    await updateOrder(updated);
  };

  const handleCourierSuccess = async (courierData: {
    courier_name: string;
    tracking_id: string;
    shipment_status: string;
    shipment_date: string;
  }) => {
    setCourierState(courierData);
    const updated: Order = {
      ...order,
      ...courierData,
      order_status: orderStatus === 'pending' ? 'processing' : orderStatus
    };
    await updateOrder(updated);
    showToast(`Order #${order.order_number} successfully dispatched via ${courierData.courier_name}!`, 'success');
  };

  const getStatusBadgeClass = (status: Order['order_status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-20 w-full max-w-full overflow-x-hidden">
      {/* Top Action Header */}
      <div className="bg-white border border-slate-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[18px] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 border border-stone-200 hover:bg-stone-100 rounded-xs text-stone-600 transition-colors"
            title="Back to Orders"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 font-serif uppercase tracking-tight">
                Order #{order.order_number}
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-2xs border ${getStatusBadgeClass(order.order_status)}`}>
                {order.order_status}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 border border-stone-200 hover:bg-stone-100 rounded-xs text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Print Invoice"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Invoice</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveDetails} className="space-y-4">
        
        {/* 1. Customer Information Section */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('customer')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">
              Customer Information
            </span>
            <span className="text-stone-500 font-bold text-sm">
              {openSections.customer ? '▴' : '˅'}
            </span>
          </div>

          {openSections.customer && (
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Delivery Address *</label>
                <textarea
                  rows={2}
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Products Section */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('products')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#1B4332]" />
              <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">
                Products ({order.items.length})
              </span>
            </div>
            <span className="text-stone-500 font-bold text-sm">
              {openSections.products ? '▴' : '˅'}
            </span>
          </div>

          {openSections.products && (
            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 sm:p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80'}
                      alt=""
                      className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xs border border-stone-200 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-stone-900 text-xs sm:text-sm">{item.product_name}</h3>
                      {item.variant_size && (
                        <p className="text-[11px] text-[#8D5B4C] font-semibold mt-0.5">
                          Size: {item.variant_size}
                        </p>
                      )}
                      <p className="text-xs text-stone-500 font-mono mt-0.5">
                        ৳{item.unit_price} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#1B4332]">
                      ৳{(item.unit_price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Delivery Charge Section */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('delivery')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">
              Delivery Charge
            </span>
            <span className="text-stone-500 font-bold text-sm">
              {openSections.delivery ? '▴' : '˅'}
            </span>
          </div>

          {openSections.delivery && (
            <div className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-semibold">Delivery Fee Applied:</span>
                <span className="font-mono font-bold text-stone-900">৳{order.delivery_charge}</span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Calculated based on delivery destination ({customerCity.toLowerCase().includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka'}).
              </p>
            </div>
          )}
        </div>

        {/* 4. Payment Details Section */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('payment')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">
                Payment Details
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : paymentStatus === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {paymentStatus}
              </span>
            </div>
            <span className="text-stone-500 font-bold text-sm">
              {openSections.payment ? '▴' : '˅'}
            </span>
          </div>

          {openSections.payment && (
            <div className="p-4 space-y-4 text-xs">
              {/* Manual Payment Submission Audit Card */}
              {paymentRecord ? (
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#1B4332]" />
                      <span>Submitted Payment Record:</span>
                    </span>
                    <Link
                      to="/admin/payments"
                      className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1"
                    >
                      <span>Open Payments Queue</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-700 font-mono">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-sans">Method</span>
                      <span className="font-bold text-stone-900">{paymentRecord.payment_method}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-sans">A/C Number</span>
                      <span className="font-bold text-stone-900">{paymentRecord.account_number}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-sans">Amount</span>
                      <span className="font-bold text-[#1B4332]">৳{paymentRecord.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-sans">TrxID</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-900 select-all">
                          {paymentRecord.transaction_id || 'N/A'}
                        </span>
                        {paymentRecord.transaction_id && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(paymentRecord.transaction_id);
                              setCopiedTrx(true);
                              setTimeout(() => setCopiedTrx(false), 2000);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-800"
                            title="Copy TrxID"
                          >
                            {copiedTrx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {paymentRecord.sender_phone && (
                    <div className="text-[11px] text-stone-600 flex items-center gap-1.5">
                      <span className="text-stone-400">Sender Phone:</span>
                      <strong className="font-mono text-stone-900">{paymentRecord.sender_phone}</strong>
                    </div>
                  )}

                  {paymentRecord.payment_proof && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-stone-500 text-[11px]">Payment Proof:</span>
                      <button
                        type="button"
                        onClick={() => setProofPreview(paymentRecord.payment_proof || null)}
                        className="px-2 py-1 bg-white border border-stone-200 hover:border-stone-400 rounded text-[11px] font-bold text-stone-700 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-purple-600" />
                        <span>View Screenshot Receipt</span>
                      </button>
                    </div>
                  )}

                  {paymentRecord.admin_note && (
                    <div className="p-2 bg-white border border-stone-200 rounded text-[11px] text-stone-600">
                      <strong>Admin Note:</strong> {paymentRecord.admin_note}
                    </div>
                  )}

                  {/* Verification Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={async () => {
                        await verifyPayment(paymentRecord.id, 'Verified via Order Details');
                        setPaymentStatus('paid');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify Payment → PAID</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await rejectPayment(paymentRecord.id, 'Rejected via Order Details');
                        setPaymentStatus('rejected');
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Payment</span>
                    </button>
                  </div>
                </div>
              ) : (
                order.transaction_id && (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Transaction ID:</span>
                      <strong className="font-mono text-stone-900">{order.transaction_id}</strong>
                    </div>
                    {order.sender_phone && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Sender Phone:</span>
                        <strong className="font-mono text-stone-900">{order.sender_phone}</strong>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Order Status & Method Overrides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-semibold"
                    placeholder="Enter payment method"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-bold capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Sender Number</label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-mono"
                    placeholder="Enter sender number"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-mono font-bold"
                    placeholder="Enter transaction ID"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Order Summary Section */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('summary')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">
              Order Summary
            </span>
            <span className="text-stone-500 font-bold text-sm">
              {openSections.summary ? '▴' : '˅'}
            </span>
          </div>

          {openSections.summary && (
            <div className="p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-600">Product Subtotal:</span>
                <span className="font-bold">৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-600">Delivery Charge:</span>
                <span className="font-bold">৳{order.delivery_charge.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between py-1 border-b border-stone-100 text-emerald-700 font-semibold">
                  <span>Discount:</span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-1 text-sm font-bold text-[#1B4332]">
                <span>Grand Total:</span>
                <span>৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* 6. Order Status Section */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('status')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">
              Order Status
            </span>
            <span className="text-stone-500 font-bold text-sm">
              {openSections.status ? '▴' : '˅'}
            </span>
          </div>

          {openSections.status && (
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Update Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as any)}
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-bold capitalize"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 7. DELIVERY INFORMATION Section (Courier API Integration) */}
        <AdminDeliveryInformationCard
          isOpen={openSections.delivery_info}
          onToggle={() => toggleSection('delivery_info')}
          orderData={{
            order_number: order.order_number,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_address: customerAddress,
            customer_city: customerCity,
            total: order.total,
            payment_method: paymentMethod,
            payment_status: paymentStatus,
            order_notes: orderNotes,
            items: order.items,
            courier_name: courierState.courier_name || order.courier_name,
            tracking_id: courierState.tracking_id || order.tracking_id,
            shipment_status: courierState.shipment_status || order.shipment_status,
            shipment_date: courierState.shipment_date || order.shipment_date
          }}
          onSuccess={handleCourierSuccess}
        />

        {/* 8. Notes Section */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('notes')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">
              Notes
            </span>
            <span className="text-stone-500 font-bold text-sm">
              {openSections.notes ? '▴' : '˅'}
            </span>
          </div>

          {openSections.notes && (
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Customer / Admin Notes</label>
                <textarea
                  rows={3}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Special instructions or delivery notes..."
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-stone-200 p-3 sm:p-4 z-30 shadow-lg flex items-center justify-between gap-3 mt-8">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="px-4 py-2 border border-stone-300 text-stone-700 font-bold uppercase rounded-xs hover:bg-stone-50 text-xs cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-xs text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

      </form>

      {/* Proof Preview Modal */}
      {proofPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-xs uppercase text-stone-800">
                Payment Proof Screenshot - Order #{order.order_number}
              </span>
              <button
                type="button"
                onClick={() => setProofPreview(null)}
                className="p-1 text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-stone-100 p-2">
              <img src={proofPreview} alt="Payment Receipt" className="max-w-full max-h-[65vh] object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setProofPreview(null)}
                className="px-4 py-1.5 bg-stone-800 text-white text-xs font-bold rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
