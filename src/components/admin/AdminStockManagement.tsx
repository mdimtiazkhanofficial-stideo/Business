import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, StockHistoryRecord } from '../../types';
import {
  Boxes,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  Plus,
  Minus,
  History,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  PackageCheck,
  RefreshCw,
  Sliders
} from 'lucide-react';

export const AdminStockManagement: React.FC = () => {
  const { products, stockHistory, adjustStock, showToast } = useStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'adjustment' | 'history'>('inventory');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Quick Adjustment Modal State
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Factory batch restock');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dedicated Adjustment Tab State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [tabAdjustmentQty, setTabAdjustmentQty] = useState<number>(10);
  const [tabReason, setTabReason] = useState<string>('Warehouse intake');

  // Stats calculation
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockProducts = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 10);
  const outOfStockProducts = products.filter((p) => (p.stock || 0) === 0);
  const healthyStockProducts = products.filter((p) => (p.stock || 0) > 10);

  // Filtered inventory products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    if (stockFilter === 'low') return matchesSearch && (p.stock || 0) > 0 && (p.stock || 0) <= 10;
    if (stockFilter === 'out') return matchesSearch && (p.stock || 0) === 0;
    return matchesSearch;
  });

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForModal || adjustmentValue === 0) {
      showToast('Please enter a non-zero adjustment quantity', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await adjustStock(selectedProductForModal.id, adjustmentValue, adjustmentReason);
      setSelectedProductForModal(null);
      setAdjustmentValue(0);
    } catch {
      showToast('Failed to update stock', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || tabAdjustmentQty === 0) {
      showToast('Please select a product and valid adjustment quantity', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await adjustStock(selectedProductId, tabAdjustmentQty, tabReason);
      setTabAdjustmentQty(10);
    } catch {
      showToast('Failed to update stock', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSelectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      
      {/* 1. Header with Live Status */}
      <div className="bg-white border border-slate-200/90 rounded-[18px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Warehouse Stock Management
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-mono">
              {totalStockUnits.toLocaleString()} total units
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inventory levels, low stock warnings, instant adjustments & automatic order deduction history
          </p>
        </div>

        <button
          onClick={() => setActiveTab('adjustment')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Sliders className="w-4 h-4" />
          <span>+ Stock Adjustment</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Stock */}
        <div className="bg-white border border-slate-200/90 rounded-[18px] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Units</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
            {totalStockUnits.toLocaleString()}
          </p>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">In warehouse</span>
        </div>

        {/* Healthy Stock */}
        <div className="bg-white border border-slate-200/90 rounded-[18px] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Healthy Stock</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-2 font-mono">
            {healthyStockProducts.length}
          </p>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">&gt;10 units available</span>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => { setActiveTab('inventory'); setStockFilter('low'); }}
          className="bg-white border border-slate-200/90 rounded-[18px] p-3.5 sm:p-4 shadow-xs cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Low Stock</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-2 font-mono">
            {lowStockProducts.length}
          </p>
          <span className="text-[10px] font-bold text-amber-700 mt-1 block">≤10 units remaining</span>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => { setActiveTab('inventory'); setStockFilter('out'); }}
          className="bg-white border border-slate-200/90 rounded-[18px] p-3.5 sm:p-4 shadow-xs cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Out of Stock</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-2 font-mono">
            {outOfStockProducts.length}
          </p>
          <span className="text-[10px] font-bold text-rose-600 mt-1 block">Requires immediate reorder</span>
        </div>

      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Current Stock ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('adjustment')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'adjustment'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Stock Adjustment</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Stock History ({stockHistory.length})</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          
          {/* Search & Stock Filter Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-[18px] p-3.5 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by title or SKU..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setStockFilter('low')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockFilter === 'low'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Low Stock ({lowStockProducts.length})
              </button>
              <button
                onClick={() => setStockFilter('out')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockFilter === 'out'
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Out of Stock ({outOfStockProducts.length})
              </button>
            </div>
          </div>

          {/* Product Stock Table / Card Rows */}
          <div className="space-y-3">
            {filteredProducts.map((p) => {
              const isLow = (p.stock || 0) > 0 && (p.stock || 0) <= 10;
              const isOut = (p.stock || 0) === 0;

              return (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200/90 rounded-[18px] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-200 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={p.main_image}
                      alt={p.name}
                      className="w-14 h-14 object-cover rounded-xl shrink-0 border border-slate-100"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        SKU: {p.sku} • Category: {p.category_name || 'Apparel'}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-xs font-mono font-bold text-purple-700">৳{p.selling_price}</span>
                        <span className="text-[10px] text-slate-400">Cost: ৳{p.buying_price || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-base sm:text-lg font-mono font-black text-slate-900 block">
                        {p.stock} units
                      </span>
                      {isOut ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase">
                          Low Stock Warning
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                          In Stock
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductForModal(p);
                        setAdjustmentValue(10);
                        setAdjustmentReason('Batch inventory restock');
                      }}
                      className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 border border-purple-200"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Adjust</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Tab 2: Stock Adjustment Form */}
      {activeTab === 'adjustment' && (
        <div className="bg-white border border-slate-200/90 rounded-[18px] p-5 sm:p-7 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
              Create Stock Adjustment
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add new inventory batches or record damages/deductions with permanent history logging
            </p>
          </div>

          <form onSubmit={handleTabAdjustmentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Product *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-hidden focus:border-purple-600"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku} • Current: {p.stock} units)
                  </option>
                ))}
              </select>
            </div>

            {/* Product Snapshot Card */}
            {activeSelectedProduct && (
              <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center gap-3.5">
                <img
                  src={activeSelectedProduct.main_image}
                  alt={activeSelectedProduct.name}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{activeSelectedProduct.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">Current Warehouse Stock: <strong>{activeSelectedProduct.stock} units</strong></p>
                  <p className="text-[11px] text-purple-700 font-bold">
                    Stock after adjustment: {Math.max(0, (activeSelectedProduct.stock || 0) + tabAdjustmentQty)} units
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity Change (+ to Add, - to Deduct) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTabAdjustmentQty(prev => prev - 5)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    required
                    value={tabAdjustmentQty}
                    onChange={(e) => setTabAdjustmentQty(Number(e.target.value) || 0)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-black text-center text-slate-900 focus:outline-hidden focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setTabAdjustmentQty(prev => prev + 5)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason / Source Note *
                </label>
                <input
                  type="text"
                  required
                  value={tabReason}
                  onChange={(e) => setTabReason(e.target.value)}
                  placeholder="e.g. Supplier batch intake, audit discrepancy"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-purple-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                {isSubmitting ? 'Updating Database...' : 'Apply Stock Adjustment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Stock History Log */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200/90 rounded-[18px] p-4 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                Stock Modification Audit Log
              </h3>
              <p className="text-xs text-slate-400">
                Complete timeline of manual restocks, batch intake, and automatic order deductions
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
              {stockHistory.length} events logged
            </span>
          </div>

          {stockHistory.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-400">
              No stock modification history recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stockHistory.map((rec) => (
                <div key={rec.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{rec.product_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">SKU: {rec.sku}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Reason: <span className="font-medium text-slate-700">{rec.reason || 'Inventory Adjustment'}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rec.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                        rec.quantity_changed >= 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {rec.quantity_changed > 0 ? `+${rec.quantity_changed}` : rec.quantity_changed} units
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {rec.previous_stock} → <strong className="text-slate-900">{rec.new_stock}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Adjustment Modal */}
      {selectedProductForModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[18px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Adjust Stock: {selectedProductForModal.name}
              </h3>
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500">Current Stock: <strong>{selectedProductForModal.stock} units</strong></span>
                <span className="text-purple-700 font-bold block">
                  New Stock After Adjustment: {Math.max(0, (selectedProductForModal.stock || 0) + adjustmentValue)} units
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity Change (+ to Add, - to Deduct)</label>
                <input
                  type="number"
                  required
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductForModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold"
                >
                  {isSubmitting ? 'Updating...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
