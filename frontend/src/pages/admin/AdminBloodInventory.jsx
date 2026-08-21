import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  Droplet,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  AlertTriangle,
  FileText,
  Calendar,
  Building,
  Building2,
  CheckCircle,
  Clock,
  FlaskConical,
  ShieldCheck,
  Award,
  Database,
  Layers,
  ChevronDown,
  Check
} from "lucide-react";
import { adminApi } from "../../services/api";

// Custom 3D Glassmorphic Dropdown Menu Item
function CustomStatusDropdown({ currentStatus, options, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusBadgeStyle = (st) => {
    const styles = {
      available: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      reserved: "bg-amber-50 text-amber-800 border-amber-200/90",
      expired: "bg-rose-50 text-rose-800 border-rose-200/90",
      used: "bg-slate-100 text-slate-700 border-slate-200/90",
    };
    return styles[st?.toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-slate-850 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
      >
        <span className="capitalize">{currentStatus}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-40 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/15 py-2 z-50 animate-scaleIn space-y-0.5">
          {options.map((opt) => {
            const isSelected = opt.value === currentStatus;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (opt.value !== currentStatus) onChange(opt.value);
                }}
                className={`w-full px-3.5 py-2 text-left text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${isSelected ? "bg-slate-100/90 text-slate-900" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
              >
                <span className={`px-2 py-0.5 rounded-full text-[10px] border font-black ${getStatusBadgeStyle(opt.value)}`}>
                  ● {opt.label}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminBloodInventory() {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [componentFilter, setComponentFilter] = useState("all");

  // Selection
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'delete'|'status', unit, value }
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Inventory and Stats
  const fetchStats = async () => {
    try {
      const res = await adminApi.getBloodInventoryStats();
      const data = res.data?.data || res.data;
      setStats(data);
    } catch (error) {
      console.error("Failed to load inventory stats");
    }
  };

  const fetchInventory = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: currentPage,
        limit: 10,
      };
      if (bloodGroupFilter !== "all") params.bloodGroup = bloodGroupFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (componentFilter !== "all") params.componentType = componentFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await adminApi.getBloodInventory({ params });
      const data = res.data?.data || res.data;
      setBloodUnits(data.bloodUnits || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load blood inventory");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, bloodGroupFilter, statusFilter, componentFilter, debouncedSearch]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    fetchStats();
  }, [bloodUnits]);

  // Handle Delete Blood Unit
  const handleDeleteUnit = async (unit) => {
    try {
      setActionLoading(true);
      await adminApi.deleteBloodUnit(unit._id);
      toast.success("Blood unit record deleted successfully");
      setConfirmModal(null);
      fetchInventory();
    } catch (error) {
      toast.error("Failed to delete blood record");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async (unit, status) => {
    try {
      setActionLoading(true);
      await adminApi.updateBloodStatus(unit._id, { status });
      toast.success("Blood status updated successfully");
      setConfirmModal(null);
      fetchInventory();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const styles = {
      available: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      reserved: "bg-amber-50 text-amber-800 border-amber-200/90",
      expired: "bg-rose-50 text-rose-800 border-rose-200/90",
      used: "bg-slate-100 text-slate-700 border-slate-200/90",
    };
    return styles[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getTestColor = (status) => {
    const styles = {
      safe: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      "pending-test": "bg-amber-50 text-amber-800 border-amber-200/90",
      "unsafe-discarded": "bg-rose-50 text-rose-800 border-rose-200/90",
    };
    return styles[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getBloodTypeBg = (bloodType) => {
    const colors = {
      "A+": "bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-red-600/30 border-red-400/40",
      "A-": "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30 border-rose-400/40",
      "B+": "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-600/30 border-blue-400/40",
      "B-": "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/30 border-sky-400/40",
      "O+": "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-600/30 border-emerald-400/40",
      "O-": "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/30 border-teal-400/40",
      "AB+": "bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-purple-600/30 border-purple-400/40",
      "AB-": "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/30 border-indigo-400/40"
    };
    return colors[bloodType] || "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-slate-600/30 border-slate-400/40";
  };

  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const totalAvailableUnits = stats?.bloodGroups ? Object.values(stats.bloodGroups).reduce((a, b) => a + b, 0) : 0;

  const inventoryStatusOptions = [
    { label: "Available", value: "available" },
    { label: "Reserved", value: "reserved" },
    { label: "Expired", value: "expired" },
    { label: "Used", value: "used" },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 3D Executive Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 border border-red-400/30 shrink-0">
            <Droplet className="w-7 h-7 text-white fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                Global Blood Stock Inventory
              </h1>
              <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200/80 rounded-full font-black text-[10px] uppercase tracking-wider shadow-2xs">
                {totalAvailableUnits} Units Available
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Track and manage global stock levels, testing queues, and component expiry across all facilities
            </p>
          </div>
        </div>

        <button
          onClick={() => { fetchInventory(true); fetchStats(); }}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Sync Inventory</span>
        </button>
      </div>

      {/* 4 Executive Clean & Uniform Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                Total Available Stock
              </span>
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black border border-red-100 group-hover:scale-110 transition-transform">
                <Droplet className="w-5 h-5 fill-red-600 text-red-600" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{totalAvailableUnits}</span>
              <span className="text-[11px] font-black text-red-700 bg-red-50 px-2.5 py-1 rounded-xl border border-red-200/80">
                Units Ready
              </span>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                Expiring in 7 Days
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black border border-amber-100 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.expiringSoon || 0}</span>
              <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80">
                Urgent Priority
              </span>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                Pending Lab Testing
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black border border-purple-100 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.statusDistribution["pending-test"] || 0}</span>
              <span className="text-[11px] font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200/80">
                Testing Queue
              </span>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                Critical Low Stock
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black border border-rose-100 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-600 uppercase tracking-tight">
                {stats.criticalGroups?.length > 0 ? stats.criticalGroups.join(", ") : "NONE"}
              </span>
              <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80">
                Alert Level
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3D Glassmorphic Specimen Capsules Bar (8 Blood Types) */}
      {stats && stats.bloodGroups && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {Object.entries(stats.bloodGroups).map(([group, count]) => {
            const isLow = count < 5;
            return (
              <div
                key={group}
                className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-4 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center group overflow-hidden relative"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-lg border-2 border-white ring-2 ring-slate-100 mb-2 group-hover:scale-110 transition-transform ${getBloodTypeBg(group)}`}>
                  {group}
                </div>
                <strong className={`text-xl font-black ${isLow ? "text-rose-600" : "text-slate-900"}`}>{count}</strong>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 border shadow-2xs ${isLow ? "bg-rose-50 text-rose-700 border-rose-200/80" : "bg-emerald-50 text-emerald-700 border-emerald-200/80"}`}>
                  {isLow ? "● CRITICAL" : "● STABLE"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Glassmorphic Filters & Search Bar */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-5 sm:p-6 shadow-xl shadow-slate-100/80 flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow-2xl transition-all duration-300">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by Bag ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-xs text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Blood Group Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
            <select
              value={bloodGroupFilter}
              onChange={(e) => { setBloodGroupFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="expired">Expired</option>
              <option value="used">Used</option>
            </select>
          </div>

          {/* Component Type Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <Layers className="w-4 h-4 text-slate-500" />
            <select
              value={componentFilter}
              onChange={(e) => { setComponentFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Components</option>
              <option value="Whole Blood">Whole Blood</option>
              <option value="PRBC">PRBC</option>
              <option value="Platelets">Platelets</option>
              <option value="FFP">FFP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 shadow-xl shadow-slate-100/80 overflow-hidden hover:shadow-2xl transition-all duration-300">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-2xl w-full"></div>
            ))}
          </div>
        ) : bloodUnits.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <Droplet className="w-8 h-8 fill-red-600" />
            </div>
            <h3 className="text-base font-black text-slate-850 uppercase tracking-wide">No Blood Units Found</h3>
            <p className="text-xs font-semibold text-slate-400 max-w-sm mt-1">We couldn't find any blood bags in the database matching your filters.</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-100 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-3 sm:px-4">Bag ID</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center">Group</th>
                  <th className="py-3.5 px-3 sm:px-4">Component</th>
                  <th className="py-3.5 px-2 sm:px-3">Volume</th>
                  <th className="py-3.5 px-3 sm:px-4">Status</th>
                  <th className="py-3.5 px-3 sm:px-4">Test Result</th>
                  <th className="py-3.5 px-3 sm:px-4">Location</th>
                  <th className="py-3.5 px-3 sm:px-4">Expiry Date</th>
                  <th className="py-3.5 px-3 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {bloodUnits.map((unit) => {
                  const expiring = isExpiringSoon(unit.expiryDate) && unit.status === "available";
                  return (
                    <tr key={unit._id} className={`hover:bg-slate-50/80 transition-colors ${expiring ? "bg-rose-50/20" : ""}`}>
                      <td className="py-3.5 px-3 sm:px-4 font-mono font-black text-slate-850">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200/80 inline-block font-bold text-[11px] truncate max-w-[120px]">
                          {unit.bagId}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 sm:px-3 text-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-md border-2 border-white ring-1 ring-slate-100 mx-auto ${getBloodTypeBg(unit.bloodGroup)}`}>
                          {unit.bloodGroup}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-slate-850 font-black text-xs truncate max-w-[110px]">
                        {unit.componentType}
                      </td>
                      <td className="py-3.5 px-2 sm:px-3 text-slate-900 font-black text-xs">{unit.quantity} ml</td>
                      <td className="py-3.5 px-3 sm:px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs inline-block ${getStatusColor(unit.status)}`}>
                          ● {unit.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 sm:px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs inline-block ${getTestColor(unit.testingStatus)}`}>
                          {unit.testingStatus === "pending-test" ? "● PENDING" : unit.testingStatus === "unsafe-discarded" ? "● UNSAFE" : "● SAFE"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-slate-700 font-bold">
                        <span className="truncate max-w-[130px] block" title={unit.hospital?.name || unit.bloodLab?.name || "Central Store"}>
                          {unit.hospital?.name || unit.bloodLab?.name || "Central Store"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 sm:px-4">
                        <span className={`inline-block ${expiring ? "text-rose-700 font-black bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 text-[11px]" : "text-slate-700 font-bold text-xs"}`}>
                          {new Date(unit.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <CustomStatusDropdown
                            currentStatus={unit.status}
                            options={inventoryStatusOptions}
                            onChange={(newStatus) => setConfirmModal({ type: "status", unit, value: newStatus })}
                          />
                          <button
                            onClick={() => setConfirmModal({ type: "delete", unit })}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 rounded-lg transition-all cursor-pointer active:scale-95 shadow-2xs"
                            title="Delete Blood Unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500">
              Showing page <strong className="font-black text-slate-850">{currentPage}</strong> of <strong className="font-black text-slate-850">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-2xs"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3D Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-850">
              {confirmModal.type === "delete" ? "Delete Blood Unit Record?" : "Update Blood Unit Status?"}
            </h3>
            <p className="text-slate-500 mt-2 text-xs font-semibold leading-relaxed">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete blood bag record ${confirmModal.unit.bagId}? This action cannot be undone.`
                : `Are you sure you want to change the status of blood bag ${confirmModal.unit.bagId} to ${confirmModal.value.toUpperCase()}?`}
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmModal.type === "delete"
                    ? handleDeleteUnit(confirmModal.unit)
                    : handleUpdateStatus(confirmModal.unit, confirmModal.value)
                }
                disabled={actionLoading}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${confirmModal.type === "delete" ? "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"}`}
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBloodInventory;
