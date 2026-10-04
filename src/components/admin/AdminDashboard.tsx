import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { CourierService, CourierConfig } from '../../services/courierService';
import { Order } from '../../types';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  Database,
  ArrowUpRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Star,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Headphones,
  Settings,
  Edit2,
  Eye,
  BarChart3,
  Boxes,
  ChevronRight
} from 'lucide-react';

type SalesPeriod = 'today' | '7d' | '30d' | '12m';

interface AdminDashboardProps {
  onNavigate?: (
    tab:
      | 'dashboard'
      | 'products'
      | 'categories'
      | 'orders'
      | 'reviews'
      | 'customers'
      | 'banners'
      | 'support'
      | 'process'
      | 'settings'
  ) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const navigate = useNavigate();
  const {
    products,
    categories,
    orders,
    customers,
    allReviews,
    banners,
    settings,
    supportMessages,
    processSteps,
    loading,
    isSupabaseActive,
    refreshData,
    showToast
  } = useStore();

  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>('30d');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [couriers, setCouriers] = useState<CourierConfig[]>(() => CourierService.getAllCouriers());

  useEffect(() => {
    setCouriers(CourierService.getAllCouriers());
  }, [orders, settings]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      await refreshData();
      setCouriers(CourierService.getAllCouriers());
      showToast('Dashboard synced with latest database records', 'info');
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to load data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper to resolve safe numeric order total from existing Order model
  const getOrderAmount = (order: Order): number => {
    const raw = order.total ?? (order as any).total_amount ?? 0;
    const num = Number(raw);
    return !isNaN(num) && num > 0 ? num : 0;
  };

  // ============================================================================
  // SECTION 1: REAL KPI SUMMARY CALCULATIONS
  // ============================================================================
  const validSalesOrders = useMemo(
    () => orders.filter((o) => o.order_status !== 'cancelled'),
    [orders]
  );

  const totalSalesAmount = useMemo(
    () => validSalesOrders.reduce((sum, o) => sum + getOrderAmount(o), 0),
    [validSalesOrders]
  );

  const paidSalesAmount = useMemo(
    () =>
      validSalesOrders
        .filter((o) => o.payment_status === 'paid' || o.order_status === 'delivered')
        .reduce((sum, o) => sum + getOrderAmount(o), 0),
    [validSalesOrders]
  );

  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const totalCustomersCount = customers.length;

  // ============================================================================
  // SECTION 2: ORDER STATUS BREAKDOWN
  // ============================================================================
  const orderStatusCounts = useMemo(() => {
    const counts: Record<Order['order_status'], number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      incomplete: 0,
      cancelled: 0
    };
    for (const o of orders) {
      if (o.order_status && counts[o.order_status] !== undefined) {
        counts[o.order_status] += 1;
      }
    }
    return counts;
  }, [orders]);

  const orderStatusConfig: Array<{
    key: Order['order_status'];
    label: string;
    count: number;
    accentBorder: string;
    textColor: string;
    bgColor: string;
  }> = [
    {
      key: 'pending',
      label: 'Pending',
      count: orderStatusCounts.pending,
      accentBorder: 'border-l-amber-500',
      textColor: 'text-amber-800',
      bgColor: 'bg-amber-50/60'
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      count: orderStatusCounts.confirmed,
      accentBorder: 'border-l-indigo-500',
      textColor: 'text-indigo-800',
      bgColor: 'bg-indigo-50/60'
    },
    {
      key: 'processing',
      label: 'Processing',
      count: orderStatusCounts.processing,
      accentBorder: 'border-l-purple-500',
      textColor: 'text-purple-800',
      bgColor: 'bg-purple-50/60'
    },
    {
      key: 'shipped',
      label: 'Shipped',
      count: orderStatusCounts.shipped,
      accentBorder: 'border-l-blue-500',
      textColor: 'text-blue-800',
      bgColor: 'bg-blue-50/60'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      count: orderStatusCounts.delivered,
      accentBorder: 'border-l-emerald-600',
      textColor: 'text-emerald-800',
      bgColor: 'bg-emerald-50/60'
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: orderStatusCounts.cancelled,
      accentBorder: 'border-l-red-500',
      textColor: 'text-red-800',
      bgColor: 'bg-red-50/60'
    }
  ];

  // ============================================================================
  // SECTION 3: REAL SALES OVERVIEW CHART DATA
  // ============================================================================
  const salesOverviewData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    interface Bucket {
      label: string;
      shortLabel: string;
      sales: number;
      ordersCount: number;
    }

    const buckets: Bucket[] = [];

    if (salesPeriod === 'today') {
      // 6 4-hour intervals for Today
      for (let i = 0; i < 6; i++) {
        const startHour = i * 4;
        const endHour = startHour + 4;
        const label = `${startHour.toString().padStart(2, '0')}:00–${endHour.toString().padStart(2, '0')}:00`;
        const shortLabel = `${startHour}h`;
        buckets.push({ label, shortLabel, sales: 0, ordersCount: 0 });
      }

      for (const o of validSalesOrders) {
        const d = new Date(o.created_at);
        if (isNaN(d.getTime())) continue;
        if (d >= startOfToday) {
          const idx = Math.min(5, Math.floor(d.getHours() / 4));
          buckets[idx].sales += getOrderAmount(o);
          buckets[idx].ordersCount += 1;
        }
      }
    } else if (salesPeriod === '7d') {
      for (let i = 6; i >= 0; i--) {
        const day = new Date(startOfToday);
        day.setDate(day.getDate() - i);
        const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const shortLabel = day.toLocaleDateString('en-US', { weekday: 'short' });
        buckets.push({ label, shortLabel, sales: 0, ordersCount: 0 });
      }

      for (const o of validSalesOrders) {
        const d = new Date(o.created_at);
        if (isNaN(d.getTime())) continue;
        const orderDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.round((startOfToday.getTime() - orderDay.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 6) {
          const idx = 6 - diffDays;
          buckets[idx].sales += getOrderAmount(o);
          buckets[idx].ordersCount += 1;
        }
      }
    } else if (salesPeriod === '30d') {
      // 10 3-day buckets across last 30 days for clean mobile & desktop rendering
      for (let i = 9; i >= 0; i--) {
        const endDay = new Date(startOfToday);
        endDay.setDate(endDay.getDate() - i * 3);
        const startDay = new Date(endDay);
        startDay.setDate(startDay.getDate() - 2);
        const label = `${startDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        const shortLabel = endDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        buckets.push({ label, shortLabel, sales: 0, ordersCount: 0 });
      }

      for (const o of validSalesOrders) {
        const d = new Date(o.created_at);
        if (isNaN(d.getTime())) continue;
        const orderDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.round((startOfToday.getTime() - orderDay.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 30) {
          const bucketFromEnd = Math.floor(diffDays / 3);
          const idx = 9 - bucketFromEnd;
          if (buckets[idx]) {
            buckets[idx].sales += getOrderAmount(o);
            buckets[idx].ordersCount += 1;
          }
        }
      }
    } else {
      // 12 Months
      for (let i = 11; i >= 0; i--) {
        const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = mDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const shortLabel = mDate.toLocaleDateString('en-US', { month: 'short' });
        buckets.push({ label, shortLabel, sales: 0, ordersCount: 0 });
      }

      for (const o of validSalesOrders) {
        const d = new Date(o.created_at);
        if (isNaN(d.getTime())) continue;
        const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        if (monthDiff >= 0 && monthDiff < 12) {
          const idx = 11 - monthDiff;
          buckets[idx].sales += getOrderAmount(o);
          buckets[idx].ordersCount += 1;
        }
      }
    }

    const periodSales = buckets.reduce((sum, b) => sum + b.sales, 0);
    const periodOrders = buckets.reduce((sum, b) => sum + b.ordersCount, 0);
    const maxBucketSales = Math.max(...buckets.map((b) => b.sales), 0);

    return {
      buckets,
      periodSales,
      periodOrders,
      maxBucketSales
    };
  }, [validSalesOrders, salesPeriod]);

  // ============================================================================
  // SECTION 6: CATEGORY PRODUCT COUNTS (FROM REAL PRODUCT-CATEGORY RELATIONSHIP)
  // ============================================================================
  const categoriesWithCounts = useMemo(() => {
    return categories.map((cat) => {
      const count = products.filter((p) => p.category_id === cat.id).length;
      return {
        ...cat,
        realProductCount: count
      };
    });
  }, [categories, products]);

  // ============================================================================
  // SECTION 7: INVENTORY / STOCK SUMMARY
  // ============================================================================
  const inventoryStats = useMemo(() => {
    const inStock = products.filter((p) => Number(p.stock) > 10);
    const lowStock = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10);
    const outOfStock = products.filter((p) => Number(p.stock) <= 0);
    const attentionProducts = [...outOfStock, ...lowStock].slice(0, 6);

    return {
      inStockCount: inStock.length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      attentionProducts
    };
  }, [products]);

  // ============================================================================
  // SECTION 8: CUSTOMERS SUMMARY
  // ============================================================================
  const customerStats = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const enriched = customers.map((c) => {
      const custOrders = orders.filter(
        (o) =>
          (o.user_id && o.user_id === c.id) ||
          (c.phone && o.customer_phone === c.phone) ||
          (c.email && o.customer_email === c.email)
      );
      const spent = custOrders.reduce((sum, o) => sum + getOrderAmount(o), 0);
      return {
        ...c,
        computedOrders: Math.max(c.total_orders || 0, custOrders.length),
        computedSpent: Math.max(c.total_spent || 0, spent)
      };
    });

    const newCustomersCount = enriched.filter((c) => {
      if (!c.created_at) return false;
      const d = new Date(c.created_at);
      return !isNaN(d.getTime()) && d >= thirtyDaysAgo;
    }).length;

    const withOrdersCount = enriched.filter((c) => c.computedOrders > 0).length;

    return {
      total: enriched.length,
      newCustomersCount,
      withOrdersCount,
      recentCustomers: enriched.slice(0, 5)
    };
  }, [customers, orders]);

  // ============================================================================
  // SECTION 10–14: MODULE SUMMARIES
  // ============================================================================
  const bannerStats = useMemo(() => {
    const active = banners.filter((b) => b.is_active).length;
    const homepage = banners.filter((b) => b.homepage_enabled).length;
    return {
      total: banners.length,
      active,
      homepage
    };
  }, [banners]);

  const supportStats = useMemo(() => {
    const resolved = supportMessages.filter((m) => m.status === 'resolved').length;
    const pending = supportMessages.filter((m) => m.status !== 'resolved').length;
    return {
      total: supportMessages.length,
      pending,
      resolved
    };
  }, [supportMessages]);

  const processStats = useMemo(() => {
    const active = processSteps.filter((s) => s.status === 'active').length;
    return {
      total: processSteps.length,
      active
    };
  }, [processSteps]);

  const courierStats = useMemo(() => {
    const enabled = couriers.filter((c) => c.is_enabled).length;
    const apiConnected = couriers.filter(
      (c) => c.is_enabled && (c.api_status === 'connected' || Boolean(c.api_key?.trim()))
    ).length;
    const dispatchedOrders = orders.filter((o) => Boolean(o.courier_name)).length;
    return {
      totalProviders: couriers.length,
      enabled,
      apiConnected,
      dispatchedOrders
    };
  }, [couriers, orders]);

  // ============================================================================
  // LOADING SKELETON STATE
  // ============================================================================
  if (loading && products.length === 0 && categories.length === 0) {
    return (
      <div className="space-y-4 w-full max-w-full overflow-hidden">
        <div className="bg-white border border-stone-200 p-4 rounded-xs animate-pulse flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-stone-200 rounded-xs" />
            <div className="h-3 w-64 bg-stone-100 rounded-xs" />
          </div>
          <div className="h-8 w-28 bg-stone-200 rounded-xs" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="bg-white border border-stone-200 p-4 rounded-xs animate-pulse space-y-2">
              <div className="h-3 w-20 bg-stone-200 rounded-xs" />
              <div className="h-6 w-28 bg-stone-200 rounded-xs" />
              <div className="h-2.5 w-24 bg-stone-100 rounded-xs" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white border border-stone-200 p-3 rounded-xs animate-pulse space-y-1.5">
              <div className="h-3 w-16 bg-stone-200 rounded-xs" />
              <div className="h-5 w-10 bg-stone-200 rounded-xs" />
            </div>
          ))}
        </div>

        <div className="bg-white border border-stone-200 p-5 rounded-xs animate-pulse space-y-3">
          <div className="h-4 w-40 bg-stone-200 rounded-xs" />
          <div className="h-44 w-full bg-stone-100 rounded-xs" />
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (loadError) {
    return (
      <div className="bg-white border border-red-200 p-8 text-center rounded-xs space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="text-sm font-bold text-stone-900">Unable to load data</h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto">{loadError}</p>
        <button
          type="button"
          onClick={handleManualRefresh}
          className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full overflow-x-hidden pb-8">
      
      {/* =====================================================================
          TOP WORKSPACE CONTROL BAR
      ===================================================================== */}
      <div className="bg-white border border-stone-200 px-3.5 py-3 sm:px-5 sm:py-3.5 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900 font-serif uppercase tracking-tight truncate">
              Store Operations Overview
            </h2>
            <span className="text-[11px] text-stone-400 hidden sm:inline">·</span>
            <span className="text-[11px] font-medium text-emerald-800 hidden sm:inline">
              {isSupabaseActive ? 'Supabase Cloud Sync' : 'Integrated Database Active'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 truncate mt-0.5">
            Live metrics calculated directly from SHAD SODAI products, categories, orders, and customers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Database Records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/products/add"
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xs flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>

          <Link
            to="/admin/orders/create"
            className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xs flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Order</span>
          </Link>
        </div>
      </div>

      {/* =====================================================================
          SECTION 1 — REAL KPI SUMMARY (2 per row on mobile, 4 on desktop)
      ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* KPI 1: TOTAL SALES */}
        <Link
          to="/admin/orders"
          className="bg-white border border-stone-200 hover:border-[#1B4332] p-3.5 sm:p-4 rounded-xs transition-colors flex flex-col justify-between min-w-0 group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider truncate">
              Total Sales
            </span>
            <TrendingUp className="w-4 h-4 text-[#1B4332] shrink-0" />
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-2xl font-extrabold text-stone-900 font-mono tabular-nums truncate">
              ৳{totalSalesAmount.toLocaleString('en-US')}
            </p>
            <p className="text-[11px] text-stone-500 mt-1 truncate">
              {validSalesOrders.length > 0
                ? `৳${paidSalesAmount.toLocaleString('en-US')} collected`
                : 'No sales recorded yet'}
            </p>
          </div>
        </Link>

        {/* KPI 2: ORDERS */}
        <Link
          to="/admin/orders"
          className="bg-white border border-stone-200 hover:border-[#1B4332] p-3.5 sm:p-4 rounded-xs transition-colors flex flex-col justify-between min-w-0 group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider truncate">
              Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-[#1B4332] shrink-0" />
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-2xl font-extrabold text-stone-900 font-mono tabular-nums">
              {totalOrdersCount}
            </p>
            <p className="text-[11px] text-stone-500 mt-1 truncate">
              {orderStatusCounts.pending > 0
                ? `${orderStatusCounts.pending} pending · ${orderStatusCounts.delivered} delivered`
                : `${orderStatusCounts.delivered} delivered`}
            </p>
          </div>
        </Link>

        {/* KPI 3: PRODUCTS */}
        <Link
          to="/admin/products"
          className="bg-white border border-stone-200 hover:border-[#1B4332] p-3.5 sm:p-4 rounded-xs transition-colors flex flex-col justify-between min-w-0 group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider truncate">
              Products
            </span>
            <Package className="w-4 h-4 text-[#1B4332] shrink-0" />
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-2xl font-extrabold text-stone-900 font-mono tabular-nums">
              {totalProductsCount}
            </p>
            <p className="text-[11px] text-stone-500 mt-1 truncate">
              Across {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </p>
          </div>
        </Link>

        {/* KPI 4: CUSTOMERS */}
        <Link
          to="/admin/customers"
          className="bg-white border border-stone-200 hover:border-[#1B4332] p-3.5 sm:p-4 rounded-xs transition-colors flex flex-col justify-between min-w-0 group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider truncate">
              Customers
            </span>
            <Users className="w-4 h-4 text-[#1B4332] shrink-0" />
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-2xl font-extrabold text-stone-900 font-mono tabular-nums">
              {totalCustomersCount}
            </p>
            <p className="text-[11px] text-stone-500 mt-1 truncate">
              {customerStats.withOrdersCount} with orders
            </p>
          </div>
        </Link>

      </div>

      {/* =====================================================================
          SECTION 2 — COMPACT ORDER STATUS PIPELINE
      ===================================================================== */}
      <div className="bg-white border border-stone-200 p-3.5 sm:p-4 rounded-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
              Order Status Breakdown
            </h3>
            <p className="text-[11px] text-stone-500">
              Click any status to filter records in Order Management
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#1B4332] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>All Orders ({totalOrdersCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {orderStatusConfig.map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => navigate(`/admin/orders?status=${st.key}`)}
              className={`border border-stone-200 border-l-4 ${st.accentBorder} ${st.bgColor} hover:border-stone-400 p-2.5 sm:p-3 rounded-xs text-left transition-colors cursor-pointer flex items-center justify-between`}
            >
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-stone-600 block truncate">
                  {st.label}
                </span>
                <span className={`text-base sm:text-lg font-extrabold font-mono tabular-nums ${st.textColor}`}>
                  {st.count}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          SECTION 3 & SECTION 7 — SALES OVERVIEW CHART + INVENTORY SUMMARY
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* SECTION 3: SALES OVERVIEW (8 columns on desktop) */}
        <div className="lg:col-span-8 bg-white border border-stone-200 p-3.5 sm:p-5 rounded-xs flex flex-col justify-between space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-stone-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1B4332]" />
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Sales Overview
                </h3>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Period revenue:{' '}
                <strong className="font-mono tabular-nums text-stone-900">
                  ৳{salesOverviewData.periodSales.toLocaleString('en-US')}
                </strong>{' '}
                across{' '}
                <strong className="font-mono tabular-nums text-stone-900">
                  {salesOverviewData.periodOrders}
                </strong>{' '}
                {salesOverviewData.periodOrders === 1 ? 'order' : 'orders'}
              </p>
            </div>

            {/* Period Selector Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xs self-start sm:self-auto">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: '12m', label: '12 Months' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSalesPeriod(tab.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                    salesPeriod === tab.id
                      ? 'bg-[#1B4332] text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Body or Real Empty State */}
          {validSalesOrders.length === 0 || salesOverviewData.periodSales === 0 ? (
            <div className="h-48 sm:h-56 bg-stone-50/70 border border-dashed border-stone-200 rounded-xs flex flex-col items-center justify-center p-6 text-center">
              <BarChart3 className="w-7 h-7 text-stone-300 mb-2" />
              <p className="text-xs font-bold text-stone-700">No sales data available yet</p>
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs">
                {validSalesOrders.length === 0
                  ? 'Real revenue charts will automatically populate as customer orders are placed.'
                  : 'No orders were recorded during this selected time period.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <div className="h-48 sm:h-52 flex items-end gap-1.5 sm:gap-2.5 pt-6 pb-2 px-1 border-b border-stone-200">
                {salesOverviewData.buckets.map((bucket, idx) => {
                  const heightPercent =
                    salesOverviewData.maxBucketSales > 0
                      ? Math.max(
                          bucket.sales > 0 ? 8 : 2,
                          Math.round((bucket.sales / salesOverviewData.maxBucketSales) * 100)
                        )
                      : 2;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative min-w-0"
                      title={`${bucket.label}: ৳${bucket.sales.toLocaleString('en-US')} (${bucket.ordersCount} orders)`}
                    >
                      {/* Value label above bar on hover or when non-zero */}
                      {bucket.sales > 0 && (
                        <span className="text-[9px] font-mono tabular-nums font-bold text-[#1B4332] mb-1 truncate max-w-full">
                          ৳{bucket.sales >= 1000 ? `${(bucket.sales / 1000).toFixed(1)}k` : bucket.sales}
                        </span>
                      )}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[36px] rounded-t-xs transition-all ${
                          bucket.sales > 0
                            ? 'bg-[#1B4332] group-hover:bg-[#2D6A4F]'
                            : 'bg-stone-200/70'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 px-1">
                {salesOverviewData.buckets.map((bucket, idx) => (
                  <div key={idx} className="flex-1 text-center min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-mono text-stone-500 block truncate">
                      {bucket.shortLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 7: INVENTORY / STOCK SUMMARY (4 columns on desktop) */}
        <div className="lg:col-span-4 bg-white border border-stone-200 p-3.5 sm:p-5 rounded-xs flex flex-col justify-between space-y-4 min-w-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#1B4332]" />
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Inventory & Stock
                </h3>
              </div>
              <Link
                to="/admin/products"
                className="text-xs font-bold text-[#1B4332] hover:underline"
              >
                Manage
              </Link>
            </div>

            {/* 3 Stock Status Counters */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  In Stock
                </span>
                <span className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-emerald-900">
                  {inventoryStats.inStockCount}
                </span>
              </div>

              <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Low Stock
                </span>
                <span className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-amber-900">
                  {inventoryStats.lowStockCount}
                </span>
              </div>

              <div className="p-2.5 bg-red-50/60 border border-red-200 rounded-xs">
                <span className="text-[10px] font-bold text-red-800 uppercase block">
                  Out of Stock
                </span>
                <span className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-red-900">
                  {inventoryStats.outOfStockCount}
                </span>
              </div>
            </div>

            {/* Stock Attention List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                {inventoryStats.attentionProducts.length > 0
                  ? 'Stock Replenishment Needed'
                  : 'Stock Levels By Product'}
              </span>

              {products.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">No products available.</p>
              ) : (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xs max-h-44 overflow-y-auto">
                  {(inventoryStats.attentionProducts.length > 0
                    ? inventoryStats.attentionProducts
                    : products.slice(0, 5)
                  ).map((prod) => (
                    <Link
                      key={prod.id}
                      to={`/admin/products/edit/${prod.id}`}
                      className="p-2 flex items-center justify-between gap-2 hover:bg-stone-50 transition-colors text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-stone-900 block truncate">
                          {prod.name}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {prod.sku || prod.id}
                        </span>
                      </div>
                      <span
                        className={`font-mono tabular-nums text-[11px] font-bold shrink-0 ${
                          prod.stock <= 0
                            ? 'text-red-700'
                            : prod.stock <= 10
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {prod.stock <= 0 ? 'Out (0)' : `${prod.stock} in stock`}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Link
            to="/admin/products"
            className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider rounded-xs text-center transition-colors block"
          >
            Open Product Inventory →
          </Link>
        </div>

      </div>

      {/* =====================================================================
          SECTION 4 — RECENT ORDERS
      ===================================================================== */}
      <div className="bg-white border border-stone-200 rounded-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
              Recent Orders
            </h3>
            <p className="text-[11px] text-stone-500">
              Latest customer orders from the live database
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xs transition-colors whitespace-nowrap"
          >
            View All Orders
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShoppingBag className="w-7 h-7 text-stone-300 mx-auto" />
            <p className="text-xs font-bold text-stone-700">No customer orders placed yet.</p>
            <p className="text-[11px] text-stone-500">
              Orders placed on the storefront or created manually will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase font-bold border-b border-stone-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Order ID</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Customer</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Date</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Payment / Info</th>
                  <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Amount</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Status</th>
                  <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.slice(0, 6).map((order) => {
                  const amount = getOrderAmount(order);
                  const itemCount = Array.isArray(order.items)
                    ? order.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)
                    : 0;

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono tabular-nums font-bold text-[#1B4332] whitespace-nowrap">
                        <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-stone-900 truncate max-w-[150px]">
                          {order.customer_name}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {order.customer_phone} · {order.customer_city}
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono tabular-nums text-[11px] text-stone-600 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="uppercase font-semibold text-stone-800 text-[11px]">
                          {order.payment_method}
                        </span>
                        <span className="text-stone-400 mx-1">·</span>
                        <span className="text-[11px] text-stone-500 capitalize">
                          {order.payment_status}
                        </span>
                        <span className="text-stone-400 mx-1">·</span>
                        <span className="text-[11px] text-stone-500 font-mono">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-stone-900 whitespace-nowrap">
                        ৳{amount.toLocaleString('en-US')}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-bold capitalize ${
                            order.order_status === 'delivered'
                              ? 'text-emerald-700'
                              : order.order_status === 'shipped'
                              ? 'text-blue-700'
                              : order.order_status === 'cancelled'
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-xs font-bold text-[#1B4332] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================================
          SECTION 5 — PRODUCT OVERVIEW & SECTION 6 — CATEGORY OVERVIEW
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* SECTION 5: PRODUCT OVERVIEW (8 columns on desktop) */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Products Overview ({products.length})
                </h3>
                <p className="text-[11px] text-stone-500">
                  Live catalog synced with the Products module
                </p>
              </div>
              <Link
                to="/admin/products"
                className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xs transition-colors whitespace-nowrap"
              >
                View All Products
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Package className="w-7 h-7 text-stone-300 mx-auto" />
                <p className="text-xs font-bold text-stone-700">No products available.</p>
                <Link
                  to="/admin/products/add"
                  className="inline-block text-xs font-bold text-[#1B4332] hover:underline"
                >
                  + Add First Product
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 text-stone-500 uppercase font-bold border-b border-stone-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3.5">Product</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap">SKU</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap">Category</th>
                      <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Price</th>
                      <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Stock</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.slice(0, 6).map((prod) => {
                      const categoryName =
                        categories.find((c) => c.id === prod.category_id)?.name ||
                        prod.category_name ||
                        'Uncategorized';

                      return (
                        <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-2.5 px-3.5">
                            <Link
                              to={`/admin/products/edit/${prod.id}`}
                              className="flex items-center gap-2.5 group min-w-[160px]"
                            >
                              <div className="w-9 h-9 bg-stone-100 border border-stone-200 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                                {prod.main_image ? (
                                  <img
                                    src={prod.main_image}
                                    alt={prod.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-4 h-4 text-stone-400" />
                                )}
                              </div>
                              <span className="font-semibold text-stone-900 group-hover:text-[#1B4332] line-clamp-1">
                                {prod.name}
                              </span>
                            </Link>
                          </td>
                          <td className="py-2.5 px-3.5 font-mono tabular-nums text-[11px] text-stone-500 whitespace-nowrap">
                            {prod.sku || '—'}
                          </td>
                          <td className="py-2.5 px-3.5 text-stone-600 whitespace-nowrap">
                            {categoryName}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-stone-900 whitespace-nowrap">
                            ৳{Number(prod.selling_price || 0).toLocaleString('en-US')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono tabular-nums whitespace-nowrap">
                            <span
                              className={`font-bold ${
                                prod.stock <= 0
                                  ? 'text-red-700'
                                  : prod.stock <= 10
                                  ? 'text-amber-700'
                                  : 'text-stone-800'
                              }`}
                            >
                              {prod.stock}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <span
                              className={`text-[11px] font-bold capitalize ${
                                prod.status === 'active'
                                  ? 'text-emerald-700'
                                  : 'text-stone-500'
                              }`}
                            >
                              {prod.status || 'active'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <Link
                              to={`/admin/products/edit/${prod.id}`}
                              className="text-xs font-bold text-[#1B4332] hover:underline inline-flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: CATEGORY OVERVIEW (4 columns on desktop) */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Categories ({categoriesWithCounts.length})
                </h3>
                <p className="text-[11px] text-stone-500">
                  Real product count per category
                </p>
              </div>
              <Link
                to="/admin/categories"
                className="text-xs font-bold text-[#1B4332] hover:underline shrink-0"
              >
                Manage All
              </Link>
            </div>

            {categoriesWithCounts.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Layers className="w-7 h-7 text-stone-300 mx-auto" />
                <p className="text-xs font-bold text-stone-700">No categories available.</p>
                <Link
                  to="/admin/categories/add"
                  className="inline-block text-xs font-bold text-[#1B4332] hover:underline"
                >
                  + Add Category
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto">
                {categoriesWithCounts.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/admin/categories/edit/${cat.id}`}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-stone-100 border border-stone-200 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-stone-900 group-hover:text-[#1B4332] block truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-stone-500 block truncate">
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold font-mono tabular-nums text-stone-900">
                        {cat.realProductCount}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        {cat.realProductCount === 1 ? 'product' : 'products'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-stone-100 bg-stone-50/50">
            <Link
              to="/admin/categories/add"
              className="w-full py-1.5 px-3 bg-white border border-stone-300 hover:border-[#1B4332] text-stone-800 text-xs font-bold uppercase tracking-wider rounded-xs text-center transition-colors block"
            >
              + Add New Category
            </Link>
          </div>
        </div>

      </div>

      {/* =====================================================================
          SECTION 8 — CUSTOMERS & SECTION 9 — CUSTOMER REVIEWS
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* SECTION 8: CUSTOMER OVERVIEW (5 columns on desktop) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Customers Overview
                </h3>
                <p className="text-[11px] text-stone-500">
                  Real customer accounts & order activity
                </p>
              </div>
              <Link
                to="/admin/customers"
                className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xs transition-colors whitespace-nowrap"
              >
                View Customers
              </Link>
            </div>

            {/* 3 Customer Metrics */}
            <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50/60 text-center divide-x divide-stone-200">
              <div className="p-2.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">
                  Total
                </span>
                <span className="text-base font-extrabold font-mono tabular-nums text-stone-900">
                  {customerStats.total}
                </span>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">
                  New (30d)
                </span>
                <span className="text-base font-extrabold font-mono tabular-nums text-[#1B4332]">
                  {customerStats.newCustomersCount}
                </span>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">
                  With Orders
                </span>
                <span className="text-base font-extrabold font-mono tabular-nums text-stone-900">
                  {customerStats.withOrdersCount}
                </span>
              </div>
            </div>

            {customerStats.recentCustomers.length === 0 ? (
              <div className="p-8 text-center space-y-1.5">
                <Users className="w-7 h-7 text-stone-300 mx-auto" />
                <p className="text-xs font-bold text-stone-700">No customers registered yet.</p>
                <p className="text-[11px] text-stone-500">
                  Customers who register or place orders will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {customerStats.recentCustomers.map((cust) => (
                  <Link
                    key={cust.id}
                    to={`/admin/customers/${cust.id}`}
                    className="p-3 flex items-center justify-between gap-2 hover:bg-stone-50 transition-colors text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-stone-900 block truncate">
                        {cust.name}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono block truncate">
                        {cust.phone || cust.email || 'No contact'} · {cust.city || 'Dhaka'}
                      </span>
                    </div>
                    <div className="text-right shrink-0 font-mono tabular-nums">
                      <span className="font-bold text-stone-900 block">
                        ৳{cust.computedSpent.toLocaleString('en-US')}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        {cust.computedOrders} {cust.computedOrders === 1 ? 'order' : 'orders'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 9: RECENT CUSTOMER REVIEWS (7 columns on desktop) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Recent Customer Reviews ({allReviews.length})
                </h3>
                <p className="text-[11px] text-stone-500">
                  Real product ratings & moderation status
                </p>
              </div>
              <Link
                to="/admin/reviews"
                className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xs transition-colors whitespace-nowrap"
              >
                View All Reviews
              </Link>
            </div>

            {allReviews.length === 0 ? (
              <div className="p-8 text-center space-y-1.5">
                <Star className="w-7 h-7 text-stone-300 mx-auto" />
                <p className="text-xs font-bold text-stone-700">No customer reviews yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 text-stone-500 uppercase font-bold border-b border-stone-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3.5">Customer</th>
                      <th className="py-2.5 px-3.5">Product</th>
                      <th className="py-2.5 px-3.5">Rating</th>
                      <th className="py-2.5 px-3.5">Review</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap">Date</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {allReviews.slice(0, 5).map((rev) => {
                      const prodName =
                        rev.product_name ||
                        products.find((p) => p.id === rev.product_id)?.name ||
                        'Product';

                      return (
                        <tr key={rev.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-2.5 px-3.5 font-semibold text-stone-900 whitespace-nowrap">
                            {rev.customer_name}
                          </td>
                          <td className="py-2.5 px-3.5 text-stone-600 max-w-[140px] truncate">
                            {prodName}
                          </td>
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <span className="font-mono tabular-nums font-bold text-amber-600">
                              {rev.rating}/5 ★
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-stone-600 max-w-[200px] truncate">
                            {rev.comment}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono tabular-nums text-[11px] text-stone-500 whitespace-nowrap">
                            {rev.created_at || '—'}
                          </td>
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <span
                              className={`text-[11px] font-bold capitalize ${
                                rev.status === 'approved'
                                  ? 'text-emerald-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {rev.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* =====================================================================
          SECTIONS 10–15 — COMPACT STORE MANAGEMENT MODULES GRID
          (Banners, Branding, Support Inquiries, Courier API, Quality Process, Settings & Supabase)
      ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        
        {/* SECTION 10: BANNERS */}
        <Link
          to="/admin/banners"
          className="bg-white border border-stone-200 hover:border-[#1B4332] p-4 rounded-xs transition-colors flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#1B4332]" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Banners
              </h4>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100 text-xs">
            <div>
              <span className="text-[10px] text-stone-500 block">Total</span>
              <span className="font-mono tabular-nums font-bold text-stone-900">
                {bannerStats.total}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block">Active</span>
              <span className="font-mono tabular-nums font-bold text-emerald-700">
                {bannerStats.active}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block">Homepage</span>
              <span className="font-mono tabular-nums font-bold text-stone-900">
                {bannerStats.homepage}
              </span>
            </div>
          </div>
        </Link>

        {/* SECTION 11: BRANDING */}
        <Link
          to="/admin/branding"
          className="bg-white border border-stone-200 hover:border-[#1B4332] p-4 rounded-xs transition-colors flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1B4332]" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Branding
              </h4>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
          <div className="pt-1 border-t border-stone-100 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Brand Identity:</span>
              <span className="font-bold text-stone-900 truncate max-w-[150px]">
                {settings.company_name || settings.store_name || 'SHAD SODAI'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Helpline:</span>
              <span className="font-mono tabular-nums text-stone-700">
                {settings.contact_phone || settings.store_phone || 'Not set'}
              </span>
            </div>
          </div>
        </Link>

        {/* SECTION 12: SUPPORT INQUIRIES */}
        <Link
          to="/admin/support"
          className="bg-white border border-stone-200 hover:border-[#1B4332] p-4 rounded-xs transition-colors flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#1B4332]" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Support Inquiries
              </h4>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
          {supportStats.total === 0 ? (
            <div className="pt-1 border-t border-stone-100 text-xs text-stone-500">
              No support inquiries yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100 text-xs">
              <div>
                <span className="text-[10px] text-stone-500 block">Total</span>
                <span className="font-mono tabular-nums font-bold text-stone-900">
                  {supportStats.total}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block">Pending</span>
                <span className="font-mono tabular-nums font-bold text-amber-700">
                  {supportStats.pending}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block">Resolved</span>
                <span className="font-mono tabular-nums font-bold text-emerald-700">
                  {supportStats.resolved}
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* SECTION 14: COURIER API */}
        <Link
          to="/admin/couriers"
          className="bg-white border border-stone-200 hover:border-[#1B4332] p-4 rounded-xs transition-colors flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1B4332]" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Courier API
              </h4>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100 text-xs">
            <div>
              <span className="text-[10px] text-stone-500 block">Enabled</span>
              <span className="font-mono tabular-nums font-bold text-stone-900">
                {courierStats.enabled}/{courierStats.totalProviders}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block">API Ready</span>
              <span className="font-mono tabular-nums font-bold text-emerald-700">
                {courierStats.apiConnected}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block">Assigned</span>
              <span className="font-mono tabular-nums font-bold text-stone-900">
                {courierStats.dispatchedOrders}
              </span>
            </div>
          </div>
        </Link>

        {/* SECTION 13: QUALITY PROCESS STEPS */}
        <Link
          to="/admin/process"
          className="bg-white border border-stone-200 hover:border-[#1B4332] p-4 rounded-xs transition-colors flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Quality Process Steps
              </h4>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
          <div className="pt-1 border-t border-stone-100 text-xs flex items-center justify-between">
            <span className="text-stone-500">Configured Steps:</span>
            <span className="font-mono tabular-nums font-bold text-stone-900">
              {processStats.active} active / {processStats.total} total
            </span>
          </div>
        </Link>

        {/* SECTION 15: SETTINGS & SUPABASE */}
        <Link
          to="/admin/settings"
          className="bg-white border border-stone-200 hover:border-[#1B4332] p-4 rounded-xs transition-colors flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#1B4332]" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Settings & Supabase
              </h4>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
          <div className="pt-1 border-t border-stone-100 text-xs flex items-center justify-between">
            <span className="text-stone-500">Delivery (Dhaka / Outside):</span>
            <span className="font-mono tabular-nums font-bold text-stone-900">
              ৳{settings.delivery_inside_dhaka ?? 60} / ৳{settings.delivery_outside_dhaka ?? 120}
            </span>
          </div>
        </Link>

      </div>

    </div>
  );
};
