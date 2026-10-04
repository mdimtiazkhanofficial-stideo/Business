import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Truck,
  ShoppingBag,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  X
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orders, updateOrderStatus, updateOrder, deleteOrder, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get('status') || 'all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    const paramStatus = searchParams.get('status');
    if (paramStatus) {
      setStatusFilter(paramStatus);
    }
  }, [searchParams]);

  // Modals state
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderToChangeStatus, setOrderToChangeStatus] = useState<Order | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<Order['order_status']>('pending');
  const [newPaymentStatusValue, setNewPaymentStatusValue] =
    useState<Order['payment_status']>('pending');
  const [previewProofOrder, setPreviewProofOrder] = useState<Order | null>(null);

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    await deleteOrder(orderToDelete.id);
    setOrderToDelete(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!orderToChangeStatus) return;
    await updateOrder({
      ...orderToChangeStatus,
      order_status: newStatusValue,
      payment_status: newPaymentStatusValue
    });
    showToast(
      `Order #${orderToChangeStatus.order_number} updated (Order: ${newStatusValue.toUpperCase()}, Payment: ${newPaymentStatusValue.toUpperCase()})`,
      'success'
    );
    setOrderToChangeStatus(null);
  };

  const handleQuickPaymentStatusChange = async (
    order: Order,
    nextPaymentStatus: 'pending' | 'paid' | 'rejected'
  ) => {
    await updateOrder({
      ...order,
      payment_status: nextPaymentStatus
    });
    showToast(
      `Order #${order.order_number} payment status set to ${nextPaymentStatus.toUpperCase()}`,
      'success'
    );
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(searchTerm) ||
      (o.transaction_id || '').toLowerCase().includes(q) ||
      (o.sender_phone || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
    const matchesPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && o.payment_status === 'paid') ||
      (paymentFilter === 'pending' && o.payment_status === 'pending') ||
      (paymentFilter === 'rejected' &&
        (o.payment_status === 'rejected' || (o.payment_status as string) === 'failed'));

    return matchesSearch && matchesStatus && matchesPayment;
  });

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

  const getPaymentStatusBadgeClass = (status: Order['payment_status'] | string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Create Order Button */}
      <div className="bg-white border border-stone-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 font-serif uppercase">
            ORDER MANAGEMENT
          </h2>
          <p className="text-xs text-stone-500">
            Total {orders.length} orders managed via database
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/orders/create')}
          className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors rounded-xs shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Order</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-stone-200 p-3 flex flex-col sm:flex-row items-center gap-3 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Customer, Mobile, Sender Number, or Transaction ID..."
            className="w-full bg-[#FFFDF7] border border-stone-200 pl-9 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#1B4332] rounded-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40 bg-[#FFFDF7] border border-stone-200 p-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#1B4332] rounded-xs"
        >
          <option value="all">All Order Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="w-full sm:w-44 bg-[#FFFDF7] border border-stone-200 p-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#1B4332] rounded-xs"
        >
          <option value="all">All Payment Status</option>
          <option value="pending">Payment: Pending</option>
          <option value="paid">Payment: Paid</option>
          <option value="rejected">Payment: Rejected</option>
        </select>
      </div>

      {/* Order Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-stone-200 p-12 text-center rounded-xs shadow-2xs space-y-3">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800 font-serif">No Orders Found</h3>
          <p className="text-xs text-stone-500">
            {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
              ? 'Try adjusting your search or status filters.'
              : 'Customer orders will appear here automatically when placed.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredOrders.map((order) => {
            const totalQty = order.items.reduce((sum, it) => sum + it.quantity, 0);
            const normalizedPaymentStatus =
              (order.payment_status as string) === 'failed' ? 'rejected' : order.payment_status;

            return (
              <div
                key={order.id}
                className="bg-white border border-stone-200 rounded-xs p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between gap-3 hover:border-[#1B4332] transition-all"
              >
                {/* Top Info */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-mono font-bold text-sm text-[#1B4332] hover:underline flex items-center gap-1"
                    >
                      <span>#{order.order_number}</span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 font-mono">
                        ৳{order.total.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 border rounded-2xs ${getStatusBadgeClass(
                          order.order_status
                        )}`}
                      >
                        {order.order_status}
                      </span>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-stone-900">{order.customer_name}</h4>
                    <p className="text-stone-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{order.customer_phone}</span>
                    </p>
                    <p className="text-stone-500 flex items-start gap-1 line-clamp-2">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                      <span>
                        {order.customer_address}, {order.customer_city}
                      </span>
                    </p>
                  </div>

                  {/* Payment Information Box */}
                  <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xs space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-stone-700 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span>{order.payment_method}</span>
                      </span>

                      <select
                        value={normalizedPaymentStatus}
                        onChange={(e) =>
                          handleQuickPaymentStatusChange(
                            order,
                            e.target.value as 'pending' | 'paid' | 'rejected'
                          )
                        }
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border rounded-2xs cursor-pointer focus:outline-none ${getPaymentStatusBadgeClass(
                          normalizedPaymentStatus
                        )}`}
                        title="Update Payment Status"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-stone-200/70 text-[10px]">
                      <div>
                        <span className="text-stone-400 uppercase block font-semibold">
                          Sender Number
                        </span>
                        <span className="font-mono font-bold text-stone-800">
                          {order.sender_phone || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 uppercase block font-semibold">
                          Transaction ID
                        </span>
                        <span className="font-mono font-bold text-stone-900 break-all">
                          {order.transaction_id || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-200/70 text-[10px] text-stone-500">
                      <span>
                        {order.items.length} Item{order.items.length !== 1 ? 's' : ''} • {totalQty}{' '}
                        Qty
                      </span>
                      {order.payment_proof && (
                        <button
                          type="button"
                          onClick={() => setPreviewProofOrder(order)}
                          className="text-[#1B4332] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Proof</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {order.courier_name && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 p-1.5 border border-emerald-200 rounded-xs flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>
                        Courier: <strong>{order.courier_name}</strong>{' '}
                        {order.tracking_id ? `(${order.tracking_id})` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3 Action Buttons: [ STATUS ] [ EDIT ] [ DELETE ] */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderToChangeStatus(order);
                      setNewStatusValue(order.order_status);
                      setNewPaymentStatusValue(
                        (order.payment_status as string) === 'failed'
                          ? 'rejected'
                          : order.payment_status
                      );
                    }}
                    className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer text-center"
                    title="Change Order & Payment Status"
                  >
                    Status
                  </button>

                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="py-1.5 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-[#1B4332] text-[11px] font-bold uppercase tracking-wider rounded-xs transition-colors text-center flex items-center justify-center gap-1"
                    title="View & Edit Order"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setOrderToDelete(order)}
                    className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold uppercase tracking-wider rounded-xs transition-colors border border-red-200 cursor-pointer text-center"
                    title="Delete Order"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Change Modal */}
      {orderToChangeStatus && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 w-full max-w-sm p-5 space-y-4 rounded-xs shadow-lg">
            <h3 className="text-sm font-bold text-stone-900 font-serif uppercase border-b border-stone-100 pb-2">
              Update Status (#{orderToChangeStatus.order_number})
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase block">
                  Order Status
                </label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value as any)}
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-bold text-stone-800 rounded-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase block">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatusValue}
                  onChange={(e) => setNewPaymentStatusValue(e.target.value as any)}
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-bold text-stone-800 rounded-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToChangeStatus(null)}
                className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase rounded-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className="py-2 px-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase rounded-xs shadow-2xs cursor-pointer"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Preview Modal */}
      {previewProofOrder && previewProofOrder.payment_proof && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 max-w-lg w-full p-4 rounded-xs shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase">
                  Payment Proof — Order #{previewProofOrder.order_number}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {previewProofOrder.payment_method} • TrxID:{' '}
                  <span className="font-mono font-bold text-stone-800">
                    {previewProofOrder.transaction_id || 'N/A'}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProofOrder(null)}
                className="p-1 text-stone-500 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto bg-stone-100 p-2 rounded-xs flex items-center justify-center">
              <img
                src={previewProofOrder.payment_proof}
                alt="Payment Proof"
                className="max-w-full h-auto object-contain rounded-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 w-full max-w-sm p-5 space-y-4 rounded-xs shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 font-serif">Delete Order?</h3>
                <p className="text-xs text-stone-600 mt-1">
                  Are you sure you want to delete order{' '}
                  <strong className="text-stone-900">#{orderToDelete.order_number}</strong>?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase rounded-xs cursor-pointer"
              >
                NO
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-xs shadow-2xs cursor-pointer"
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
