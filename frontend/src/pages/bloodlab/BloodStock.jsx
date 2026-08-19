import React, { useCallback, useEffect, useState } from "react";
import { bloodLabApi } from "../../services/api.js";
import { 
  Droplets, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw, 
  AlertTriangle,
  Beaker,
  TrendingDown
} from "lucide-react";
import { toast } from "react-hot-toast";

const BloodStock = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState("add");
  const [form, setForm] = useState({ 
    bloodType: "", 
    quantity: "" 
  });

  // Blood types for dropdown
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Fetch current stock
  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await bloodLabApi.getStock();
      console.log("Fetched Stock Data:", data);
      if (data.success) {
        setStock(data.data || []);
      } else {
        toast.error("Failed to load blood stock");
      }
    } catch (error) {
      console.error("Fetch Stock Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load blood stock",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.bloodType || !form.quantity) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setSubmitting(true);

    try {
      const { data } =
        action === "add"
          ? await bloodLabApi.addStock(form)
          : await bloodLabApi.removeStock(form);

      if (data.success) {
        toast.success(data.message);
        setForm({ bloodType: "", quantity: "" });
        fetchStock();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Stock Update Error:", error);
      toast.error(
        error.response?.data?.message || `Error ${action === "add" ? "adding" : "removing"} blood stock`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Check for low stock items
  const lowStockItems = stock.filter(item => item.quantity < 10);

  return (
    <div className="space-y-6">
      {/* Signature Crimson-Rose Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 p-6 sm:p-8 text-white shadow-xl shadow-red-900/20 border border-red-500/30 mb-8">
        {/* Geometric Vector Rings Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center md:items-end">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-end text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-red-600 font-black flex items-center justify-center shadow-2xl ring-4 ring-white/20 flex-shrink-0">
              <Droplets className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 fill-red-600 animate-bounce" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                Blood Stock Management
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-red-100/90 mt-1">
                Manage your laboratory's blood inventory, add new supply units, and track real-time stock levels.
              </p>
            </div>
          </div>

          <button
            onClick={fetchStock}
            disabled={loading}
            className="px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-2xl font-black text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 shadow-md flex-shrink-0 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-white ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Refreshing..." : "Refresh Stock"}</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-100/80 text-amber-700 rounded-xl flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-extrabold text-amber-900 text-sm uppercase tracking-wide">Critical Low Stock Alert</p>
              <p className="text-amber-700 text-xs font-semibold mt-0.5">
                {lowStockItems.length} blood group{lowStockItems.length > 1 ? 's are' : ' is'} below minimum safety inventory thresholds.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-amber-200/60 text-amber-800 rounded-full font-black text-xs uppercase tracking-wider">
            Action Required
          </span>
        </div>
      )}

      {/* Stock Management Form */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100/90 p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/20 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <Beaker className="w-5 h-5" />
              </div>
              Inventory Control & Stock Adjustments
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Select blood component type and adjust reserve quantities in real-time.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setAction("add")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                action === "add"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              + Add Stock
            </button>
            <button
              type="button"
              onClick={() => setAction("remove")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                action === "remove"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              - Deduct Stock
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Select Blood Group
            </label>
            <select
              value={form.bloodType}
              onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
              className="w-full bg-slate-50/70 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
              required
            >
              <option value="">Choose Blood Type...</option>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Units Quantity
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 10"
              className="w-full bg-slate-50/70 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Operation Mode
            </label>
            <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 font-extrabold text-xs uppercase tracking-wide text-slate-700">
              {action === "add" ? "🟢 Deposit Supply" : "🔴 Deduct Reserve"}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 px-5 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
                action === "add"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/25 hover:shadow-emerald-600/35"
                  : "bg-gradient-to-r from-red-600 to-rose-600 shadow-red-600/25 hover:shadow-red-600/35"
              }`}
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : action === "add" ? (
                <PlusCircle className="w-4 h-4" />
              ) : (
                <MinusCircle className="w-4 h-4" />
              )}
              <span>{submitting ? "Processing..." : action === "add" ? "Commit Supply Units" : "Commit Inventory Deduction"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Blood Stock Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100/90 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <Droplets className="w-5 h-5 fill-red-600" />
              </div>
              Live Laboratory Blood Reserves
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Complete inventory status breakdown across all ABO & Rh blood groups.
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-red-50/80 border border-red-150/80 text-red-700 font-extrabold text-xs uppercase tracking-wider shadow-2xs">
            Total Reserve: <span className="text-sm font-black text-red-800">{stock.reduce((sum, item) => sum + item.quantity, 0)}</span> units
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-10 h-10 text-red-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-500 font-extrabold text-sm uppercase tracking-wider">Syncing real-time inventory...</p>
          </div>
        ) : stock.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Droplets className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-base font-extrabold text-slate-700">No Blood Stock Found</p>
            <p className="text-xs font-medium text-slate-400 mt-1">Use the control panel above to deposit initial inventory units.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60">
                  <th className="py-3.5 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider rounded-l-2xl">Blood Group</th>
                  <th className="py-3.5 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Reserve Units</th>
                  <th className="py-3.5 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Capacity Status</th>
                  <th className="py-3.5 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Estimated Expiry</th>
                  <th className="py-3.5 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider rounded-r-2xl">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stock.map((item) => {
                  const isLowStock = item.quantity < 10;
                  const isCritical = item.quantity < 5;
                  
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-all duration-200 group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md border-2 border-white ring-2 ${
                            isCritical 
                              ? "bg-gradient-to-br from-red-600 to-rose-700 text-white ring-red-200 shadow-red-600/20" 
                              : isLowStock 
                                ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white ring-amber-200 shadow-amber-500/20"
                                : "bg-gradient-to-br from-emerald-600 to-teal-700 text-white ring-emerald-200 shadow-emerald-600/20"
                          }`}>
                            {item.bloodGroup}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-850 text-sm tracking-wide">{item.bloodGroup}</span>
                            <span className="block text-[10px] font-bold text-slate-400">Whole Blood</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xl font-black ${
                            isCritical ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-850'
                          }`}>
                            {item.quantity}
                          </span>
                          <span className="text-xs font-bold text-slate-400">units</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200/80 shadow-2xs">
                            <TrendingDown className="w-3.5 h-3.5 text-red-600 animate-bounce" />
                            Critical
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200/80 shadow-2xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Adequate
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-600">
                        {new Date(item.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-400">
                        {new Date(item.updatedAt || item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
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
  );
};

export default BloodStock;