import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Product, OrderItem } from '../../types';
import { AdminDeliveryInformationCard } from './AdminDeliveryInformationCard';
import { ArrowLeft, Plus, Trash2, Search, X } from 'lucide-react';

export const AdminCreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, createManualOrder, showToast } = useStore();

  // Accordion state
  const [openSections, setOpenSections] = useState({
    customer: true,
    products: true,
    delivery: true,
    payment: true,
    summary: true,
    status: true,
    delivery_info: true,
    notes: false
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Courier state
  const [courierDetails, setCourierDetails] = useState({
    courier_name: '',
    tracking_id: '',
    shipment_status: '',
    shipment_date: ''
  });

  // Product Selection Panel state
  const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [area, setArea] = useState('');
  const [roadHouse, setRoadHouse] = useState('');

  // Selected Order items list (slim horizontal cards)
  const [orderItems, setOrderItems] = useState<Array<{
    productId: string;
    variantSize: string;
    quantity: number;
    unitPrice: number;
  }>>([]);

  // Delivery location (Inside Dhaka = ৳60, Outside Dhaka = ৳120)
  const [deliveryLocation, setDeliveryLocation] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const deliveryCharge = deliveryLocation === 'inside_dhaka' ? 60 : 120;

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partially_paid' | 'paid'>('pending');
  const [paidAmount, setPaidAmount] = useState<number | string>('');

  // Order Status & Notes
  const [orderStatus, setOrderStatus] = useState<'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('pending');
  const [orderNotes, setOrderNotes] = useState('');

  // Filtered products for selection (ALL products, no category filtering)
  const selectableProducts = products.filter(p =>
    !productSearchTerm ||
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(productSearchTerm.toLowerCase()))
  );

  // Calculations
  const subtotal = orderItems.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.productId);
    const price = item.unitPrice || prod?.selling_price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const grandTotal = subtotal + deliveryCharge;
  const dueAmount = Math.max(0, grandTotal - (Number(paidAmount) || 0));

  // Toggle Product Selection (ADD -> SELECT, SELECTED -> UNSELECT, NO DUPLICATES)
  const handleToggleProductSelection = (prod: Product) => {
    const isCurrentlySelected = orderItems.some(it => it.productId === prod.id);

    if (isMultipleChoice) {
      // MULTIPLE CHOICE = ON
      if (isCurrentlySelected) {
        // Unselect / remove from order
        setOrderItems(prev => prev.filter(it => it.productId !== prod.id));
        showToast(`Unselected "${prod.name}"`, 'info');
      } else {
        // Select / add to order
        setOrderItems(prev => [
          ...prev,
          {
            productId: prod.id,
            variantSize: prod.sizes?.[0] || 'Standard',
            quantity: 1,
            unitPrice: prod.selling_price
          }
        ]);
        showToast(`Selected "${prod.name}"`, 'success');
      }
    } else {
      // MULTIPLE CHOICE = OFF (Single Selection)
      if (isCurrentlySelected) {
        // Unselect if same product clicked again
        setOrderItems([]);
        showToast(`Unselected "${prod.name}"`, 'info');
      } else {
        // Replace with single selected product
        setOrderItems([
          {
            productId: prod.id,
            variantSize: prod.sizes?.[0] || 'Standard',
            quantity: 1,
            unitPrice: prod.selling_price
          }
        ]);
        showToast(`Selected "${prod.name}"`, 'success');
        // Close panel on single choice selection
        setIsProductSelectionOpen(false);
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateOrder = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      showToast('Please fill in customer name, phone and delivery address', 'error');
      return;
    }

    if (orderItems.length === 0) {
      showToast('Please select at least one product for the order', 'error');
      return;
    }

    // Validate stock
    for (const item of orderItems) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        showToast('Please select a valid product', 'error');
        return;
      }
      if (item.quantity > prod.stock) {
        showToast(`Insufficient stock for "${prod.name}". Available: ${prod.stock}`, 'error');
        return;
      }
    }

    const formattedItems: OrderItem[] = orderItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const price = item.unitPrice || prod?.selling_price || 0;
      return {
        product_id: item.productId,
        product_name: prod?.name || 'Product',
        variant_size: item.variantSize,
        quantity: item.quantity,
        unit_price: price,
        total_price: price * item.quantity,
        image: prod?.main_image || ''
      };
    });

    const fullAddress = `${deliveryAddress}, Area: ${area || 'N/A'}, Road/House: ${roadHouse || 'N/A'}, Thana: ${thana}, District: ${district}`;

    try {
      const newOrder = await createManualOrder({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        customer_address: fullAddress,
        customer_city: district,
        order_notes: orderNotes || undefined,
        items: formattedItems,
        payment_method: paymentMethod === 'rocket' ? 'bkash' : paymentMethod,
        delivery_charge: deliveryCharge,
        payment_status: paymentStatus === 'paid' ? 'paid' : 'pending',
        order_status: orderStatus,
        courier_name: courierDetails.courier_name || undefined,
        tracking_id: courierDetails.tracking_id || undefined,
        shipment_status: courierDetails.shipment_status || undefined,
        shipment_date: courierDetails.shipment_date || undefined
      });

      showToast(isDraft ? 'Order saved as draft!' : 'Order Created Successfully!', 'success');
      navigate(`/admin/orders/${newOrder.id}`);
    } catch {
      showToast('Failed to create order. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-white border border-stone-200 p-4 flex items-center justify-between shadow-2xs rounded-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 border border-stone-200 bg-white hover:bg-stone-100 rounded-xs text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-base font-bold text-stone-900 uppercase font-serif">CREATE ORDER</h2>
            <p className="text-xs text-stone-500">Select existing products and configure customer details</p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => handleCreateOrder(e, false)} className="space-y-4 text-xs">
        {/* 1. Customer Information */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('customer')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">Customer Information</span>
            <span className="text-stone-500 font-bold text-sm">{openSections.customer ? '▴' : '˅'}</span>
          </div>
          {openSections.customer && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-purple-600 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter mobile number"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-purple-600 rounded-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter customer email"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-purple-600 rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address"
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs focus:outline-none focus:border-purple-600 rounded-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">District / City</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                  >
                    <option value="">Select district / city</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Thana / Upazila</label>
                  <input
                    type="text"
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    placeholder="Enter thana or upazila"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Area</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Enter area"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Road / House</label>
                  <input
                    type="text"
                    value={roadHouse}
                    onChange={(e) => setRoadHouse(e.target.value)}
                    placeholder="Enter road or house"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                  />
                </div>
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
              <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">PRODUCTS</span>
              <span className="text-[11px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-bold">
                {orderItems.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProductSelectionOpen(!isProductSelectionOpen);
                }}
                className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-3 py-1.5 font-bold uppercase text-[11px] rounded-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD PRODUCT</span>
              </button>
              <span className="text-stone-500 font-bold text-sm">{openSections.products ? '▴' : '˅'}</span>
            </div>
          </div>

          {openSections.products && (
            <div className="p-4 space-y-4">
              {/* PRODUCT SELECTION PANEL (ALL PRODUCTS, NO CATEGORY FILTER, 2-COLUMN ON MOBILE) */}
              {isProductSelectionOpen && (
                <div className="bg-stone-50 border border-stone-300 rounded-xs p-3.5 space-y-3 shadow-inner animate-in fade-in-50 duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-200">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <span className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                        ALL PRODUCTS ({selectableProducts.length})
                      </span>

                      {/* MULTIPLE CHOICE TOGGLE */}
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xs border border-stone-200 shadow-2xs">
                        <span className="text-[10px] sm:text-[11px] font-bold text-stone-700">MULTIPLE CHOICE</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newMode = !isMultipleChoice;
                            setIsMultipleChoice(newMode);
                            // If switching to OFF and multiple were selected, keep only first one
                            if (!newMode && orderItems.length > 1) {
                              setOrderItems([orderItems[0]]);
                            }
                          }}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-2xs uppercase transition-colors cursor-pointer ${
                            isMultipleChoice
                              ? 'bg-[#1B4332] text-white shadow-2xs'
                              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                        >
                          {isMultipleChoice ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* SEARCH INPUT */}
                      <div className="relative flex-1 sm:w-64">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          placeholder="Search products..."
                          className="w-full bg-white border border-stone-300 pl-8 pr-2.5 py-1.5 text-xs text-stone-800 rounded-xs focus:outline-none focus:border-[#1B4332]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsProductSelectionOpen(false)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                        title="Close Selection Panel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 2-COLUMN GRID (MOBILE) / RESPONSIVE (DESKTOP) */}
                  {selectableProducts.length === 0 ? (
                    <div className="p-6 text-center text-stone-500 bg-white border border-stone-200 rounded-xs text-xs">
                      No products match your search.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {selectableProducts.map((p) => {
                        const isSelected = orderItems.some(it => it.productId === p.id);

                        return (
                          <div
                            key={p.id}
                            className={`bg-white border rounded-xs p-2.5 flex flex-col justify-between transition-all ${
                              isSelected ? 'border-[#1B4332] ring-1 ring-[#1B4332] bg-emerald-50/20' : 'border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="aspect-square bg-stone-100 rounded-xs overflow-hidden border border-stone-100 relative">
                                <img
                                  src={p.main_image}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80';
                                  }}
                                />
                                {isSelected && (
                                  <span className="absolute top-1 right-1 bg-[#1B4332] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-2xs shadow-xs">
                                    SELECTED ✓
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="font-bold text-stone-900 text-xs line-clamp-2 leading-tight">
                                  {p.name}
                                </h4>
                                <div className="flex items-center justify-between mt-1 text-[11px]">
                                  <span className="font-bold font-mono text-[#1B4332]">৳{p.selling_price}</span>
                                  <span className="text-[10px] text-stone-500">Stock: {p.stock}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleProductSelection(p)}
                              className={`mt-2.5 w-full py-1.5 font-bold uppercase text-[11px] rounded-xs shadow-2xs cursor-pointer flex items-center justify-center gap-1 transition-colors ${
                                isSelected
                                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                  : 'bg-[#1B4332] hover:bg-[#2D6A4F] text-white'
                              }`}
                            >
                              <span>{isSelected ? 'SELECTED' : 'ADD'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SELECTED PRODUCTS LIST (SLIM / HORIZONTAL CARDS) */}
              <div className="space-y-2">
                {orderItems.length === 0 ? (
                  <div className="p-6 text-center text-stone-500 bg-stone-50 border border-dashed border-stone-300 rounded-xs space-y-1">
                    <p className="font-bold text-stone-700">No products added to this order yet.</p>
                    <p className="text-[11px] text-stone-500">
                      Click the <strong className="text-[#1B4332]">+ ADD PRODUCT</strong> button above to select products from your store.
                    </p>
                  </div>
                ) : (
                  orderItems.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    const price = item.unitPrice || prod?.selling_price || 0;
                    const subtotalAmt = price * item.quantity;

                    return (
                      <div
                        key={`${item.productId}-${idx}`}
                        className="p-2.5 sm:p-3 bg-white border border-stone-200 rounded-xs shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        {/* Left: Thumbnail & Title */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-stone-100 border border-stone-200 rounded-xs overflow-hidden shrink-0">
                            <img
                              src={prod?.main_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                              {prod?.name || 'Selected Product'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 mt-0.5">
                              <span className="font-mono font-semibold text-stone-700">৳{price}</span>
                              {prod?.sku && <span>SKU: {prod.sku}</span>}
                              {prod?.sizes && prod.sizes.length > 1 && (
                                <div className="flex items-center gap-1">
                                  <span>Size:</span>
                                  <select
                                    value={item.variantSize}
                                    onChange={(e) => {
                                      const updated = [...orderItems];
                                      updated[idx].variantSize = e.target.value;
                                      setOrderItems(updated);
                                    }}
                                    className="bg-stone-50 border border-stone-300 px-1 py-0.5 text-[10px] rounded-2xs font-bold text-stone-800"
                                  >
                                    {prod.sizes.map(sz => (
                                      <option key={sz} value={sz}>{sz}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Quantity Stepper, Subtotal, Remove */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                          {/* Quantity Stepper */}
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...orderItems];
                                if (updated[idx].quantity > 1) {
                                  updated[idx].quantity -= 1;
                                  setOrderItems(updated);
                                } else {
                                  handleRemoveItem(idx);
                                }
                              }}
                              className="w-7 h-7 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-l-xs border border-stone-300 flex items-center justify-center cursor-pointer"
                            >
                              −
                            </button>
                            <span className="w-9 h-7 bg-white border-y border-stone-300 text-center text-xs font-mono font-bold flex items-center justify-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...orderItems];
                                updated[idx].quantity += 1;
                                setOrderItems(updated);
                              }}
                              className="w-7 h-7 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-r-xs border border-stone-300 flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right min-w-[70px]">
                            <span className="text-xs sm:text-sm font-bold font-mono text-[#1B4332]">
                              ৳{subtotalAmt}
                            </span>
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-stone-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                            title="Remove product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Delivery Section (Clean labels without charge amounts in text) */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('delivery')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">DELIVERY CHARGE</span>
            <span className="text-stone-500 font-bold text-sm">{openSections.delivery ? '▴' : '˅'}</span>
          </div>
          {openSections.delivery && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-stone-800">
                  <input
                    type="radio"
                    name="delivery_location"
                    checked={deliveryLocation === 'inside_dhaka'}
                    onChange={() => setDeliveryLocation('inside_dhaka')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Inside Dhaka</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-stone-800">
                  <input
                    type="radio"
                    name="delivery_location"
                    checked={deliveryLocation === 'outside_dhaka'}
                    onChange={() => setDeliveryLocation('outside_dhaka')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Outside Dhaka</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 4. Payment Section */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('payment')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">Payment Details</span>
            <span className="text-stone-500 font-bold text-sm">{openSections.payment ? '▴' : '˅'}</span>
          </div>
          {openSections.payment && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Paid Amount (৳)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="Enter paid amount"
                    className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs font-mono font-bold"
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
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">Order Summary</span>
            <span className="text-stone-500 font-bold text-sm">{openSections.summary ? '▴' : '˅'}</span>
          </div>
          {openSections.summary && (
            <div className="p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-600">Product Subtotal:</span>
                <span className="font-bold">৳{subtotal}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-600">Delivery Charge:</span>
                <span className="font-bold">৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200 text-sm font-bold text-[#1B4332]">
                <span>Grand Total:</span>
                <span>৳{grandTotal}</span>
              </div>
              <div className="flex justify-between py-1 text-stone-600">
                <span>Paid Amount:</span>
                <span>৳{Number(paidAmount) || 0}</span>
              </div>
              <div className="flex justify-between py-1 text-red-600 font-bold">
                <span>Due Amount:</span>
                <span>৳{dueAmount}</span>
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
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">Order Status</span>
            <span className="text-stone-500 font-bold text-sm">{openSections.status ? '▴' : '˅'}</span>
          </div>
          {openSections.status && (
            <div className="p-4 space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as any)}
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-bold"
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

        {/* 7. Delivery Information Section (Courier API Integration) */}
        <AdminDeliveryInformationCard
          isOpen={openSections.delivery_info}
          onToggle={() => toggleSection('delivery_info')}
          orderData={{
            order_number: `MAN-${Date.now().toString().slice(-4)}`,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_address: `${deliveryAddress}, Area: ${area || 'N/A'}, Thana: ${thana}, District: ${district}`,
            customer_city: district,
            total: grandTotal,
            payment_method: paymentMethod,
            payment_status: paymentStatus === 'paid' ? 'paid' : 'pending',
            order_notes: orderNotes,
            items: orderItems,
            courier_name: courierDetails.courier_name,
            tracking_id: courierDetails.tracking_id,
            shipment_status: courierDetails.shipment_status,
            shipment_date: courierDetails.shipment_date
          }}
          onSuccess={(courierRes) => {
            setCourierDetails(courierRes);
            showToast(`Courier parcel booked with ${courierRes.courier_name}! Tracking: ${courierRes.tracking_id}`, 'success');
          }}
        />

        {/* 8. Notes Section */}
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleSection('notes')}
            className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
          >
            <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">Notes</span>
            <span className="text-stone-500 font-bold text-sm">{openSections.notes ? '▴' : '˅'}</span>
          </div>
          {openSections.notes && (
            <div className="p-4 space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Order / Delivery Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Special customer requests or courier delivery instructions..."
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
              type="button"
              onClick={(e) => handleCreateOrder(e, true)}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold uppercase rounded-xs text-xs cursor-pointer transition-colors"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-xs text-xs shadow-xs cursor-pointer transition-colors"
            >
              Create Order
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
