import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CourierService, CourierConfig } from '../../services/courierService';
import { Truck, AlertCircle, CheckCircle, ExternalLink, RefreshCw, Copy, Check, Settings } from 'lucide-react';

interface AdminDeliveryInformationCardProps {
  orderData: {
    id?: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    total: number;
    payment_method: string;
    payment_status: string;
    order_notes?: string;
    items?: any[];
    courier_name?: string;
    tracking_id?: string;
    shipment_status?: string;
    shipment_date?: string;
  };
  onSuccess?: (courierData: {
    courier_name: string;
    tracking_id: string;
    shipment_status: string;
    shipment_date: string;
  }) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AdminDeliveryInformationCard: React.FC<AdminDeliveryInformationCardProps> = ({
  orderData,
  onSuccess,
  isOpen = true,
  onToggle
}) => {
  const [configuredCouriers, setConfiguredCouriers] = useState<CourierConfig[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);

  // Existing courier details on the order
  const [courierDetails, setCourierDetails] = useState({
    courier_name: orderData.courier_name || '',
    tracking_id: orderData.tracking_id || '',
    shipment_status: orderData.shipment_status || '',
    shipment_date: orderData.shipment_date || ''
  });

  useEffect(() => {
    const list = CourierService.getConfiguredCouriers();
    setConfiguredCouriers(list);
    if (list.length > 0) {
      if (orderData.courier_name) {
        const match = list.find(c => c.name.toLowerCase() === orderData.courier_name?.toLowerCase() || c.id === orderData.courier_name?.toLowerCase());
        setSelectedCourierId(match ? match.id : list[0].id);
      } else {
        setSelectedCourierId(list[0].id);
      }
    }
  }, [orderData.courier_name]);

  useEffect(() => {
    if (orderData.courier_name || orderData.tracking_id) {
      setCourierDetails({
        courier_name: orderData.courier_name || '',
        tracking_id: orderData.tracking_id || '',
        shipment_status: orderData.shipment_status || 'Sent to Courier',
        shipment_date: orderData.shipment_date || new Date().toISOString()
      });
    }
  }, [orderData.courier_name, orderData.tracking_id, orderData.shipment_status, orderData.shipment_date]);

  const selectedCourier = configuredCouriers.find(c => c.id === selectedCourierId);
  const isAlreadySent = Boolean(courierDetails.tracking_id && courierDetails.courier_name);

  // Dynamic button text computation
  const getButtonText = () => {
    if (isLoading) {
      return selectedCourier ? `SENDING TO ${selectedCourier.name.toUpperCase()}...` : 'SENDING TO COURIER...';
    }
    if (!selectedCourier) {
      return 'SELECT COURIER';
    }
    return `SEND TO ${selectedCourier.name.toUpperCase()}`;
  };

  const handleSendToCourier = async () => {
    if (!selectedCourier) return;
    if (isAlreadySent) return;

    if (!orderData.customer_name?.trim() || !orderData.customer_phone?.trim() || !orderData.customer_address?.trim()) {
      setErrorMessage('গ্রাহকের নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করা আবশ্যক।');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await CourierService.sendOrderToCourier(selectedCourier.id, orderData);

      if (res.success && res.trackingId) {
        const newDetails = {
          courier_name: res.courierName || selectedCourier.name,
          tracking_id: res.trackingId,
          shipment_status: 'Sent to Courier',
          shipment_date: new Date().toISOString()
        };
        setCourierDetails(newDetails);
        if (onSuccess) {
          onSuccess(newDetails);
        }
      } else {
        setErrorMessage(res.message || 'Courier order পাঠানো যায়নি। আবার চেষ্টা করুন।');
      }
    } catch (err: any) {
      setErrorMessage('Courier order পাঠানো যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTracking = () => {
    if (!courierDetails.tracking_id) return;
    navigator.clipboard.writeText(courierDetails.tracking_id);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const trackingUrl = courierDetails.tracking_id
    ? CourierService.getTrackingUrl(courierDetails.courier_name, courierDetails.tracking_id)
    : '#';

  return (
    <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
      {/* Accordion Header */}
      <div
        onClick={onToggle}
        className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-purple-700" />
          <span className="font-bold text-stone-900 uppercase tracking-wider text-xs sm:text-sm">
            DELIVERY INFORMATION
          </span>
        </div>
        <span className="text-stone-500 font-bold text-sm">
          {isOpen ? '▴' : '˅'}
        </span>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4 text-xs">
          {/* Case 1: NO API CONFIGURED */}
          {configuredCouriers.length === 0 ? (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs text-center space-y-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-stone-800 text-sm">Courier API সেট করা হয়নি</p>
                <p className="text-stone-500 text-xs mt-0.5">
                  কোনো Courier API configured নেই। কুরিয়ারে পার্সেল বুক করতে অনুগ্রহ করে Settings থেকে Steadfast, Pathao অথবা RedX API যুক্ত করুন।
                </p>
              </div>
              <Link
                to="/admin/couriers"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase text-xs rounded-xs transition-colors shadow-2xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Go to Courier Settings</span>
              </Link>
            </div>
          ) : isAlreadySent ? (
            /* Case 2: ORDER ALREADY SUCCESSFULLY SENT TO COURIER */
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xs space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-900 uppercase tracking-wide">
                    Courier Order Created
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] uppercase rounded-2xs">
                  {courierDetails.shipment_status || 'Sent to Courier'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="block text-stone-500 text-[11px] font-semibold">Courier Service:</span>
                  <span className="font-bold text-stone-900 text-sm">
                    {courierDetails.courier_name}
                  </span>
                </div>

                <div>
                  <span className="block text-stone-500 text-[11px] font-semibold">Tracking / Consignment ID:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-xs text-emerald-900 bg-white px-2.5 py-1 border border-emerald-300 rounded-xs">
                      {courierDetails.tracking_id}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTracking}
                      className="p-1 hover:bg-emerald-100 text-emerald-800 rounded-xs transition-colors"
                      title="Copy Tracking ID"
                    >
                      {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {courierDetails.shipment_date && (
                <div className="text-[11px] text-stone-500">
                  Sent on: {new Date(courierDetails.shipment_date).toLocaleString()}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs rounded-xs shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>VIEW TRACKING / TRACK ORDER</span>
                </a>
                <span className="text-[11px] text-emerald-800 font-medium">
                  (Parcel already booked with {courierDetails.courier_name})
                </span>
              </div>
            </div>
          ) : (
            /* Case 3: COURIER API CONFIGURED & READY TO SEND */
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Courier Service</label>
                <select
                  value={selectedCourierId}
                  onChange={(e) => {
                    setSelectedCourierId(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-[#FFFDF7] border border-stone-300 p-2 text-xs rounded-xs font-semibold focus:outline-none focus:border-purple-600"
                >
                  {configuredCouriers.map((courier) => (
                    <option key={courier.id} value={courier.id}>
                      {courier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error display if API fails */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendToCourier}
                    disabled={isLoading}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] uppercase rounded-xs shrink-0 cursor-pointer"
                  >
                    RETRY
                  </button>
                </div>
              )}

              {/* Dynamic Action Button */}
              <button
                type="button"
                onClick={handleSendToCourier}
                disabled={isLoading || !selectedCourier}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold uppercase text-xs tracking-wider rounded-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{getButtonText()}</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>{getButtonText()}</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-stone-500 text-center">
                Dispatches recipient details and COD amount (৳{orderData.payment_status === 'paid' ? '0 (Paid)' : orderData.total}) directly to {selectedCourier?.name || 'Courier'}.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
