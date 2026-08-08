import { useState, useEffect } from "react";
import { publicApi } from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Activity,
  AlertCircle,
  Building,
  RefreshCw,
  Copy,
  CheckCircle2,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const COMPONENTS = [
  { value: "all", label: "All Components" },
  { value: "Whole Blood", label: "Whole Blood" },
  { value: "Packed Red Blood Cells", label: "Packed Red Cells (PRBC)" },
  { value: "Platelets", label: "Platelets" },
  { value: "Fresh Frozen Plasma", label: "Plasma (FFP)" },
];

const CentralStockDirectory = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [filters, setFilters] = useState({
    bloodGroup: "all",
    componentType: "all",
    city: "",
    state: "",
    pincode: "",
  });

  const fetchStock = async (customParams = null) => {
    setLoading(true);
    try {
      const activeFilters = customParams || filters;
      const params = {};
      if (activeFilters.bloodGroup !== "all") params.bloodGroup = activeFilters.bloodGroup;
      if (activeFilters.componentType !== "all") params.componentType = activeFilters.componentType;
      if (activeFilters.city) params.city = activeFilters.city;
      if (activeFilters.state) params.state = activeFilters.state;
      if (activeFilters.pincode) params.pincode = activeFilters.pincode;

      const res = await publicApi.getCentralStock(params);
      setStock(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch central stock directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock({});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStock();
  };

  const clearFilters = () => {
    const resetState = {
      bloodGroup: "all",
      componentType: "all",
      city: "",
      state: "",
      pincode: "",
    };
    setFilters(resetState);
    fetchStock(resetState);
  };

  const handleCopyDetails = (item) => {
    const facility = item.bloodLab || item.hospital;
    const text = `🩸 ${item.bloodGroup} ${item.componentType} (${item.quantity} Units Available)\n🏥 Facility: ${facility?.name || "Blood Center"}\n📍 Location: ${facility?.address?.city || ""}, ${facility?.address?.state || ""}\n📞 Contact: ${facility?.phone || "N/A"}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item._id);
    toast.success("Stock details copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="flex-grow mt-16 sm:mt-20">
        {/* Hero Banner Section (Matching Home Page Theme) */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-900 text-white py-16 sm:py-20 mb-10 shadow-lg">
          {/* Home Page Concentric Circles SVG Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="30"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="20"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium backdrop-blur-sm animate-pulse">
              <Activity className="w-4 h-4 text-white" />
              Live National Stock Registry
            </div>

            {/* Main Title matching Home Page typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              LifeDrop{" "}
              <span className="bg-gradient-to-r from-red-200 to-red-300 bg-clip-text text-transparent">
                Live Stock Directory
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-red-100 max-w-2xl mx-auto font-normal leading-relaxed">
              Real-time central visibility into tested blood components, reserve quantities, and emergency availability across certified labs and hospitals.
            </p>

            {/* Live Metrics Row inside Hero */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-2.5 text-center shadow-md">
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-200 block">Total Units Available</span>
                <span className="text-xl sm:text-2xl font-black text-white">{loading ? "..." : stock.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}</span>
              </div>

              <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-2.5 text-center shadow-md">
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-200 block">Active Facilities</span>
                <span className="text-xl sm:text-2xl font-black text-white">{loading ? "..." : new Set(stock.map((i) => (i.bloodLab || i.hospital)?._id || (i.bloodLab || i.hospital)?.name)).size}</span>
              </div>

              <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-2.5 text-center shadow-md flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-200 block">Live Network Sync</span>
                  <span className="text-xs font-black text-emerald-300">Verified Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          {/* Premium Search Filter Card */}
          <div className="bg-white rounded-3xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-200/80 p-6 sm:p-8 mb-8 relative overflow-hidden">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600"></div>

            <form onSubmit={handleSearchSubmit} className="space-y-6">
              {/* Filter Section Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Filter Stock Directory</h2>
                    <p className="text-xs text-slate-400">Refine by location, blood group, or component type</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 bg-slate-50 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-slate-200/70 hover:border-red-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              {/* Location Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">State</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Gujarat"
                      value={filters.state}
                      onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))}
                      className="w-full border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none text-sm bg-slate-50/40 hover:bg-white focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">City</label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Ahmedabad"
                      value={filters.city}
                      onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
                      className="w-full border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none text-sm bg-slate-50/40 hover:bg-white focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Pincode</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 382418"
                      value={filters.pincode}
                      onChange={(e) => setFilters((p) => ({ ...p, pincode: e.target.value }))}
                      className="w-full border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none text-sm bg-slate-50/40 hover:bg-white focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Blood Type Grid Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                  Blood Group
                </label>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, bloodGroup: "all" }))}
                    className={`px-4 py-2.5 rounded-2xl border font-extrabold text-xs transition-all ${
                      filters.bloodGroup === "all"
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white border-transparent shadow-lg shadow-red-500/25 scale-[1.03]"
                        : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    All Types
                  </button>
                  {BLOOD_GROUPS.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setFilters((p) => ({ ...p, bloodGroup: group }))}
                      className={`px-4 py-2.5 rounded-2xl border font-extrabold text-xs transition-all ${
                        filters.bloodGroup === group
                          ? "bg-gradient-to-r from-red-600 to-rose-600 text-white border-transparent shadow-lg shadow-red-500/25 scale-[1.03]"
                          : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Component Select & Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Component Type
                  </label>
                  <select
                    value={filters.componentType}
                    onChange={(e) => setFilters((p) => ({ ...p, componentType: e.target.value }))}
                    className="w-full border border-slate-200/90 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none text-slate-800 text-sm bg-slate-50/40 hover:bg-white focus:bg-white font-medium cursor-pointer"
                  >
                    {COMPONENTS.map((comp) => (
                      <option key={comp.value} value={comp.value}>
                        {comp.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-grow bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-xl shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Search Stock Availability
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-5 rounded-2xl transition-all hover:scale-[1.01] text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Results Directory */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold text-slate-800">
                Matches Found ({stock.length})
              </h2>
              <button
                onClick={() => fetchStock()}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-all flex items-center gap-1.5 text-sm"
                title="Refresh results"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Sync
              </button>
            </div>

            {loading ? (
              /* Skeleton Loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 animate-pulse"
                  >
                    <div className="flex justify-between items-center">
                      <div className="w-10 h-10 bg-slate-200 rounded-2xl"></div>
                      <div className="w-12 h-6 bg-slate-200 rounded-xl"></div>
                    </div>
                    <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                    <div className="h-8 w-full bg-slate-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : stock.length === 0 ? (
              /* Empty Results Card */
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No Matching Blood Stock Found</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  No matching safe stock units were found in this area. Try modifying your search filter or request urgent blood from nearby donors.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-md shadow-red-200"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* 4 Cards per Row Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {stock.map((item) => {
                  const facility = item.bloodLab || item.hospital;
                  const isLab = facility?.facilityType === "blood-lab";
                  const quantity = Number(item.quantity) || 1;
                  const isLow = quantity < 3;

                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-[0_8px_25px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_35px_-12px_rgba(225,29,72,0.14)] hover:border-red-300 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
                    >
                      {/* Top Accent Gradient Line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600"></div>

                      <div className="space-y-3.5">
                        {/* Header Row: Blood Group, Component, Quantity */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white font-black text-lg flex items-center justify-center shadow-md shadow-red-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                              {item.bloodGroup}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-extrabold text-slate-900 leading-snug truncate" title={item.componentType}>
                                {item.componentType}
                              </h3>
                              <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono mt-0.5">
                                Bag #{item.bagId || item._id?.toString().slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Quantity Badge */}
                          <div className="flex-shrink-0 text-center">
                            <div className={`px-2.5 py-1 rounded-xl border text-center ${
                              isLow
                                ? "bg-amber-50 border-amber-200 text-amber-800"
                                : "bg-red-50 border-red-100 text-red-700"
                            }`}>
                              <span className="text-lg font-black text-red-600 block leading-none">{quantity}</span>
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-red-500 block mt-0.5">
                                {quantity === 1 ? "Unit" : "Units"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Facility Details Box */}
                        <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3 space-y-2 text-[11px] text-slate-600">
                          <div className="flex items-center justify-between gap-1.5">
                            <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 truncate">
                              <Building className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                              <span className="truncate" title={facility?.name}>{facility?.name || "Partner Facility"}</span>
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border flex-shrink-0 ${
                                isLab
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {isLab ? "Lab" : "Hospital"}
                            </span>
                          </div>

                          {facility?.address && (
                            <p className="flex items-start gap-1.5 text-slate-500 leading-tight">
                              <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                              <span className="truncate">
                                {facility.address.city}, {facility.address.state}
                              </span>
                            </p>
                          )}

                          {facility?.phone && (
                            <p className="flex items-center gap-1.5 text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span>{facility.phone}</span>
                            </p>
                          )}

                          {facility?.operatingHours?.open && (
                            <p className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                              <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span>
                                {facility.operatingHours.open} – {facility.operatingHours.close}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 text-emerald-700 font-extrabold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Tested Safe</span>
                        </div>

                        <button
                          onClick={() => handleCopyDetails(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          {copiedId === item._id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CentralStockDirectory;
