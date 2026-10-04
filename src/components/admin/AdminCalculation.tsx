import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, CalculationRecord } from '../../types';
import {
  Calculator,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  Package,
  Save,
  CheckCircle2,
  Boxes,
  ArrowRight,
  Info
} from 'lucide-react';

export const AdminCalculation: React.FC = () => {
  const { products, calculations, saveCalculation, deleteCalculation, showToast } = useStore();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [calcTitle, setCalcTitle] = useState('');
  const [calcNotes, setCalcNotes] = useState('');

  // Editable fields with auto-population from product
  const [buyingPrice, setBuyingPrice] = useState<number>(() => products[0]?.buying_price || 350);
  const [stockQuantity, setStockQuantity] = useState<number>(() => products[0]?.stock || 50);
  const [sellingPrice, setSellingPrice] = useState<number>(() => products[0]?.selling_price || 750);
  const [discount, setDiscount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-fill when a product is selected
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setBuyingPrice(Number(prod.buying_price) || 0);
      setStockQuantity(Number(prod.stock) || 1);
      setSellingPrice(Number(prod.selling_price) || 0);
      setDiscount(Math.max(0, (Number(prod.original_price) || Number(prod.discount_price) || prod.selling_price) - prod.selling_price));
      setCalcTitle(`${prod.name} Profit Analysis`);
    }
  };

  // Real-time calculations:
  // Total Cost = Buying Price * Stock Quantity
  const totalCost = Math.round(buyingPrice * stockQuantity);
  // Total Sales = (Selling Price - Discount) * Stock Quantity
  const netSellingPrice = Math.max(0, sellingPrice - discount);
  const totalSales = Math.round(netSellingPrice * stockQuantity);
  const totalDiscount = Math.round(discount * stockQuantity);
  // Profit = Total Sales - Total Cost
  const profit = totalSales - totalCost;
  // Profit Margin (%) = (Profit / Total Sales) * 100
  const profitMargin = totalSales > 0 ? Number(((profit / totalSales) * 100).toFixed(1)) : 0;

  const handleSaveCalculation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const selectedProd = products.find((p) => p.id === selectedProductId);
      const newCalc: CalculationRecord = {
        id: `calc-${Date.now()}`,
        title: calcTitle.trim() || `${selectedProd?.name || 'Product'} Projection`,
        product_id: selectedProductId,
        product_name: selectedProd?.name || 'Selected Product',
        buying_price: buyingPrice,
        stock_quantity: stockQuantity,
        selling_price: sellingPrice,
        discount,
        total_cost: totalCost,
        total_sales: totalSales,
        profit,
        profit_margin: profitMargin,
        notes: calcNotes.trim() || undefined,
        created_at: new Date().toISOString()
      };

      await saveCalculation(newCalc);
      setIsAddingNew(false);
      setCalcNotes('');
    } catch {
      showToast('Failed to save calculation', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      
      {/* 1. Top Header with + Add New Calculator Trigger */}
      <div className="bg-white border border-slate-200/90 rounded-[18px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Product Profit & Margin Calculator
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-mono">
              {calculations.length} saved models
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated unit cost, gross sales revenue, discount deduction, and net margin calculation engine
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddingNew(true);
            if (products[0]) handleProductSelect(products[0].id);
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Calculator</span>
        </button>
      </div>

      {/* 2. Interactive Calculator Panel (Form) */}
      {(isAddingNew || calculations.length === 0) && (
        <div className="bg-white border-2 border-purple-200 rounded-[18px] p-5 sm:p-7 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                New Profit Margin Calculation Model
              </h3>
            </div>
            {calculations.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Close Calculator
              </button>
            )}
          </div>

          <form onSubmit={handleSaveCalculation} className="space-y-6">
            
            {/* Step A: Product Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Product for Automatic Data Fetch *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-hidden focus:border-purple-600"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Calculation Title / Campaign Name
                </label>
                <input
                  type="text"
                  value={calcTitle}
                  onChange={(e) => setCalcTitle(e.target.value)}
                  placeholder="e.g. Eid Drop 2026 Batch Calculation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-purple-600 font-medium"
                />
              </div>
            </div>

            {/* Step B: 4 Core Parameters (Buying Price, Stock Quantity, Selling Price, Discount) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Buying Price (৳) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={buyingPrice}
                  onChange={(e) => setBuyingPrice(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Factory / sourcing cost</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Units in batch</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selling Price (৳) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Retail store price</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discount (৳/unit)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Per item markdown</span>
              </div>
            </div>

            {/* Step C: Real-Time Calculated Results (Total Cost, Total Sales, Discount, Profit, Margin) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              
              {/* Total Cost */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Cost</span>
                <p className="text-lg sm:text-xl font-mono font-black text-slate-900 mt-1">
                  ৳{totalCost.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">Buying × Stock</span>
              </div>

              {/* Total Sales */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Sales</span>
                <p className="text-lg sm:text-xl font-mono font-black text-blue-700 mt-1">
                  ৳{totalSales.toLocaleString()}
                </p>
                <span className="text-[10px] text-blue-600">(Price - Disc) × Stock</span>
              </div>

              {/* Total Discount */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Markdown</span>
                <p className="text-lg sm:text-xl font-mono font-black text-amber-700 mt-1">
                  ৳{totalDiscount.toLocaleString()}
                </p>
                <span className="text-[10px] text-amber-600">Discounts granted</span>
              </div>

              {/* Net Profit */}
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Net Profit</span>
                <p className="text-lg sm:text-xl font-mono font-black text-purple-800 mt-1">
                  ৳{profit.toLocaleString()}
                </p>
                <span className="text-[10px] text-purple-700 font-bold">Sales - Cost</span>
              </div>

              {/* Profit Margin */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Profit Margin</span>
                <p className="text-lg sm:text-xl font-mono font-black text-emerald-700 mt-1">
                  {profitMargin}%
                </p>
                <span className="text-[10px] text-emerald-700 font-bold">Net return</span>
              </div>

            </div>

            {/* Notes & Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={calcNotes}
                  onChange={(e) => setCalcNotes(e.target.value)}
                  placeholder="Optional internal remarks or production notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Calculation'}</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* 3. Saved Calculation Models List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Saved Product Margin Models & Scenarios
          </h3>
          <span className="text-xs text-slate-400">Permanently saved to Supabase</span>
        </div>

        {calculations.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-[18px] p-10 text-center shadow-xs">
            <Calculator className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No Calculation Models Saved Yet</h4>
            <p className="text-xs text-slate-400 mt-0.5">Use the form above to analyze product margins and save scenarios</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calculations.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200/90 rounded-[18px] p-5 shadow-xs hover:border-purple-200 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{c.title}</h4>
                      <p className="text-xs text-purple-700 font-medium">{c.product_name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCalculation(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Calculation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Buying</span>
                      <span className="font-mono font-bold text-slate-800">৳{c.buying_price}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Stock</span>
                      <span className="font-mono font-bold text-slate-800">{c.stock_quantity} pcs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Selling</span>
                      <span className="font-mono font-bold text-slate-800">৳{c.selling_price}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Discount</span>
                      <span className="font-mono font-bold text-amber-700">৳{c.discount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Projected Profit:</span>
                    <span className="text-base font-black font-mono text-purple-700">৳{c.profit?.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Margin:</span>
                    <span className="text-base font-black font-mono text-emerald-700">{c.profit_margin}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
