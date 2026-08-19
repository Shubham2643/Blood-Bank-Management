import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { hospitalApi } from "../../services/api.js";
import { toast } from "react-hot-toast";
import {
  Droplet,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  Calendar,
  RefreshCw,
  AlertCircle,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Activity,
  Zap,
} from "lucide-react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config/env.js";
import { getAuthToken } from "../../utils/auth.js";

const HospitalBloodStock = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("bloodGroup");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [stats, setStats] = useState({
    totalUnits: 0,
    lowStock: 0,
    expiringSoon: 0,
    bloodTypes: 0,
  });

  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const calculateStats = useCallback((stockData) => {
    const totalUnits = stockData.reduce((sum, item) => sum + item.quantity, 0);
    const lowStock = stockData.filter((item) => item.quantity < 5).length;

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const expiringSoon = stockData.filter((item) => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= nextWeek && expiryDate > today;
    }).length;

    const bloodTypesCount = stockData.length;

    setStats({
      totalUnits,
      lowStock,
      expiringSoon,
      bloodTypes: bloodTypesCount,
    });
  }, []);

  const loadStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await hospitalApi.getStock();

      const stockData = res.data.data?.inventory || res.data.data || [];
      setStock(stockData);
      calculateStats(stockData);
    } catch (err) {
      console.error("Load stock error:", err);
      toast.error("Failed to load blood stock");
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  // Connect to Socket.io for real-time inventory updates
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    console.log("🔌 Connecting to Socket.io on Hospital Inventory page...");
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected on Hospital Inventory page:", socket.id);
      setIsSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected on Hospital Inventory page");
      setIsSocketConnected(false);
    });

    socket.on("request-processed", (data) => {
      console.log("🔔 Real-time event: request-processed", data);
      toast.success(`Request for ${data.bloodType} (${data.units} units) was ${data.status}! Stock updated.`);
      loadStock();
    });

    socket.on("stock-updated", (data) => {
      console.log("🔔 Real-time event: stock-updated", data);
      loadStock();
    });

    return () => {
      console.log("🔌 Disconnecting Socket from Hospital Inventory page...");
      socket.disconnect();
    };
  }, [loadStock]);

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      "A+": "bg-red-50 text-red-700 border-red-200",
      "A-": "bg-red-50 text-red-600 border-red-200",
      "B+": "bg-blue-50 text-blue-700 border-blue-200",
      "B-": "bg-blue-50 text-blue-600 border-blue-200",
      "O+": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "O-": "bg-emerald-50 text-emerald-600 border-emerald-200",
      "AB+": "bg-purple-50 text-purple-700 border-purple-200",
      "AB-": "bg-purple-50 text-purple-600 border-purple-200",
    };
    return colors[bloodType] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getStockStatus = (quantity, expiryDate) => {
    if (quantity === 0 || !expiryDate) {
      return {
        status: "out of stock",
        color: "bg-slate-100 text-slate-600 border-slate-200",
        icon: AlertCircle,
      };
    }

    const today = new Date();
    const expiry = new Date(expiryDate);

    if (expiry <= today) {
      return {
        status: "expired",
        color: "bg-red-105 text-red-800 border-red-200",
        icon: AlertTriangle,
      };
    }

    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 3) {
      return {
        status: "critical",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertTriangle,
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: "warning",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertTriangle,
      };
    } else if (quantity < 5) {
      return {
        status: "low",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: AlertTriangle,
      };
    } else {
      return {
        status: "good",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: CheckCircle,
      };
    }
  };

  const getStockForType = (bloodType) => {
    return (
      stock.find((item) => item.bloodGroup === bloodType) || {
        bloodGroup: bloodType,
        quantity: 0,
        expiryDate: null,
      }
    );
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) <= new Date();
  };

  // Filter and sort stock
  const processedStock = stock
    .filter((item) => {
      // Search term filter
      const matchesSearch = item.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      if (statusFilter === "all") return matchesSearch;
      
      const itemStatus = getStockStatus(item.quantity, item.expiryDate).status;
      return matchesSearch && itemStatus === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === "bloodGroup") {
        return a.bloodGroup.localeCompare(b.bloodGroup);
      }
      if (sortBy === "quantity-desc") {
        return b.quantity - a.quantity;
      }
      if (sortBy === "quantity-asc") {
        return a.quantity - b.quantity;
      }
      if (sortBy === "expiry-asc") {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      }
      if (sortBy === "expiry-desc") {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(b.expiryDate) - new Date(a.expiryDate);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-pulse mb-6">
            <Droplet className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Loading Blood Stock...
          </h2>
          <p className="text-slate-500 font-medium">Checking live inventory databases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Signature Crimson-Rose Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 p-6 sm:p-8 text-white shadow-xl shadow-red-900/20 border border-red-500/30">
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
                <Droplet className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 fill-red-600 animate-bounce" />
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                    Blood Stock Inventory
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all ${
                    isSocketConnected 
                      ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40" 
                      : "bg-amber-500/25 text-amber-200 border border-amber-400/40"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${isSocketConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    {isSocketConnected ? "Live Sync Active" : "Connecting..."}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-red-100/90 mt-1">
                  Manage and monitor your hospital's real-time blood supply reserves and component expirations.
                </p>
              </div>
            </div>

            <button
              onClick={loadStock}
              className="px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-2xl font-black text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 shadow-md flex-shrink-0 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-white ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Inventory</span>
            </button>
          </div>
        </div>

        {/* Executive 3D Metric Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Units */}
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform -z-10" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Units</span>
                <span className="text-3xl sm:text-4xl font-black text-slate-850 tracking-tight mt-1.5 block">{stats.totalUnits}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 block">Live reserve count</span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6 fill-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 2: Groups Available */}
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform -z-10" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Groups Available</span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight mt-1.5 block">{stats.bloodTypes} / 8</span>
                <span className="text-[10px] font-bold text-emerald-700 mt-1 block">In stock in lab</span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-md shadow-emerald-500/10 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 3: Low Stock Groups */}
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform -z-10" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Low Stock Groups</span>
                <span className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight mt-1.5 block">{stats.lowStock}</span>
                <span className="text-[10px] font-bold text-amber-700 mt-1 block">&lt; 5 units threshold</span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-md shadow-amber-500/10 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 4: Expiring Soon */}
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform -z-10" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Expiring Soon</span>
                <span className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight mt-1.5 block">{stats.expiringSoon}</span>
                <span className="text-[10px] font-bold text-rose-700 mt-1 block">Within 7 days</span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-md shadow-rose-500/10 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Blood Type Overview Grid */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <Activity className="w-5 h-5" />
                </div>
                Blood Groups Health Overview
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Real-time laboratory blood level tube analysis across 8 major groups.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" /> Good
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm ml-2" /> Low / Warning
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-600 shadow-sm ml-2" /> Critical
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {bloodTypes.map((bloodType) => {
              const stockItem = getStockForType(bloodType);
              const status = getStockStatus(
                stockItem.quantity,
                stockItem.expiryDate,
              );
              const StatusIcon = status.icon;
              const isExpiredItem = isExpired(stockItem.expiryDate);
              const percentage = Math.min(100, Math.max(0, (stockItem.quantity / 20) * 100));

              let liquidGradient = "bg-gradient-to-t from-red-700 via-rose-600 to-red-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]";
              if (status.status === "good") {
                liquidGradient = "bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]";
              } else if (status.status === "low" || status.status === "warning") {
                liquidGradient = "bg-gradient-to-t from-amber-600 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]";
              } else if (status.status === "critical" || status.status === "expired") {
                liquidGradient = "bg-gradient-to-t from-rose-800 via-red-600 to-rose-500 shadow-[0_0_14px_rgba(225,29,72,0.8)]";
              } else {
                liquidGradient = "bg-slate-300";
              }

              return (
                <div
                  key={bloodType}
                  className={`bg-white rounded-3xl border border-slate-100/90 p-4 shadow-xl shadow-slate-100 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between items-center text-center ${
                    isExpiredItem ? "opacity-60" : ""
                  }`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-rose-100/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                  {/* Header Badge */}
                  <div className="w-full flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-2xl text-xs font-black border shadow-2xs ${getBloodTypeColor(bloodType)}`}>
                      {bloodType}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  {/* 3D Glassmorphic Specimen Vial Casing */}
                  <div className="my-2 relative flex flex-col items-center">
                    <div className="w-7 h-28 bg-slate-100/90 border-2 border-slate-200/90 rounded-full overflow-hidden relative shadow-inner flex flex-col justify-end p-0.5">
                      {/* Measurement Tick Marks */}
                      <div className="absolute inset-0 flex flex-col justify-between py-2.5 px-1 pointer-events-none z-20 opacity-30">
                        <div className="w-full h-0.5 bg-slate-400 rounded-full" />
                        <div className="w-full h-0.5 bg-slate-400 rounded-full" />
                        <div className="w-full h-0.5 bg-slate-400 rounded-full" />
                        <div className="w-full h-0.5 bg-slate-400 rounded-full" />
                      </div>

                      {/* Liquid level column */}
                      <div
                        className={`w-full rounded-b-full transition-all duration-1000 ease-out relative ${liquidGradient}`}
                        style={{ height: `${percentage}%` }}
                      >
                        {/* Meniscus wave cap */}
                        {percentage > 0 && (
                          <div className="absolute -top-1 left-0 right-0 h-2 bg-white/40 rounded-full blur-[1px]" />
                        )}
                      </div>

                      {/* Glass vertical glare streak */}
                      <div className="absolute top-1 left-1.5 w-1 h-[90%] bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-full pointer-events-none z-30" />
                    </div>
                  </div>

                  {/* Quantity & Expiry Info */}
                  <div className="mt-2 w-full">
                    <span className="text-2xl font-black text-slate-850 block leading-tight">
                      {stockItem.quantity}
                    </span>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">
                      Units
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 w-full">
                    <span className={`inline-flex items-center justify-center gap-1 w-full py-1 px-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border shadow-2xs ${status.color}`}>
                      <StatusIcon size={9} />
                      <span className="truncate">{status.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Inventory Table */}
        <div className="bg-white rounded-3xl border border-slate-100/90 shadow-xl shadow-slate-100 overflow-hidden">
          
          {/* Table Header and Control bar */}
          <div className="p-6 border-b border-slate-100 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <Droplet className="w-5 h-5 fill-red-600" />
                </div>
                Detailed Inventory Records
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Filter and sort active laboratory blood stocks.
              </p>
            </div>
            
            {/* Dynamic Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search blood group..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-850 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white w-48 transition-all"
                />
              </div>

              {/* Status Select */}
              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-3.5 pr-8 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all cursor-pointer appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="good">Good</option>
                  <option value="low">Low Stock</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="expired">Expired</option>
                  <option value="out of stock">Out of Stock</option>
                </select>
                <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Select */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-3.5 pr-8 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all cursor-pointer appearance-none"
                >
                  <option value="bloodGroup">Sort: Group Name</option>
                  <option value="quantity-desc">Sort: Qty (High to Low)</option>
                  <option value="quantity-asc">Sort: Qty (Low to High)</option>
                  <option value="expiry-asc">Sort: Expiry (Soonest)</option>
                  <option value="expiry-desc">Sort: Expiry (Latest)</option>
                </select>
                <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {processedStock.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50">
              <Droplet className="w-14 h-14 text-slate-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-extrabold text-slate-800 mb-1 uppercase tracking-wide">
                No Matching Stock Items
              </h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto mb-5 font-semibold leading-relaxed">
                We couldn't find any blood stocks matching the current filters. Request blood from labs to add new entries.
              </p>
              <Link
                to="/hospital/blood-request-create"
                className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2 border border-red-500/30"
              >
                <Plus size={16} />
                <span>Request Blood</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-slate-800">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-[11px] uppercase font-extrabold tracking-wider">
                    <th className="p-4 text-left">Blood Group</th>
                    <th className="p-4 text-left">Quantity</th>
                    <th className="p-4 text-left">Inventory Status</th>
                    <th className="p-4 text-left">Expiry Date</th>
                    <th className="p-4 text-left">Days Left</th>
                    <th className="p-4 text-left">Last Synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedStock.map((item) => {
                    const status = getStockStatus(
                      item.quantity,
                      item.expiryDate,
                    );
                    const StatusIcon = status.icon;
                    const today = new Date();
                    const expiryDate = new Date(item.expiryDate);
                    const daysLeft = Math.ceil(
                      (expiryDate - today) / (1000 * 60 * 60 * 24),
                    );
                    const isExpiredItem = isExpired(item.expiryDate);

                    let rowBg = "hover:bg-slate-50/60";
                    if (isExpiredItem) {
                      rowBg = "bg-red-50/20 hover:bg-red-50/40";
                    } else if (daysLeft <= 3) {
                      rowBg = "bg-rose-50/10 hover:bg-rose-50/30";
                    } else if (daysLeft <= 7) {
                      rowBg = "bg-amber-50/10 hover:bg-amber-50/30";
                    }

                    return (
                      <tr
                        key={item._id}
                        className={`transition-colors duration-150 ${rowBg}`}
                      >
                        <td className="p-4">
                          <span
                            className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border shadow-2xs ${getBloodTypeColor(item.bloodGroup)}`}
                          >
                            {item.bloodGroup}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-black text-slate-850">
                                {item.quantity}
                              </span>
                              <span className="text-xs text-slate-400 font-extrabold">units</span>
                              {item.quantity < 5 && (
                                <Minus size={13} className="text-orange-500 ml-1" />
                              )}
                            </div>
                            {/* Stock Indicator Progress */}
                            <div className="w-24 bg-slate-150 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.quantity < 5 ? "bg-orange-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, (item.quantity / 20) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit border shadow-2xs ${status.color}`}
                          >
                            <StatusIcon size={12} />
                            <span className="capitalize">{status.status}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Calendar size={13} className="text-slate-400" />
                            <span className={isExpiredItem ? "text-red-600 font-black" : "text-slate-800 font-bold"}>
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs font-extrabold ${
                              daysLeft <= 0
                                ? "text-red-650"
                                : daysLeft <= 3
                                  ? "text-red-505"
                                  : daysLeft <= 7
                                    ? "text-yellow-600"
                                    : "text-emerald-600"
                            }`}
                          >
                            {daysLeft <= 0 ? (
                              <span className="inline-flex items-center gap-1 text-red-600 font-black">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                EXPIRED
                              </span>
                            ) : (
                              `${daysLeft} days left`
                            )}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-400 font-bold">
                          {new Date(
                            item.updatedAt || item.createdAt,
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alerts Panel Section */}
        {stock.some((item) => {
          const status = getStockStatus(item.quantity, item.expiryDate);
          return (
            status.status === "critical" ||
            status.status === "expired" ||
            item.quantity < 3
          );
        }) && (
          <div className="bg-gradient-to-br from-rose-50/70 to-red-50/40 border border-rose-200/80 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xl shadow-rose-950/5">
            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-60" />
            
            <h3 className="text-base font-black text-rose-950 uppercase tracking-wide mb-4 flex items-center gap-2 relative z-10">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              Action Required: Important Inventory Alerts
            </h3>
            
            <div className="space-y-3 relative z-10">
              {stock.map((item) => {
                const status = getStockStatus(item.quantity, item.expiryDate);
                const isExpiredItem = isExpired(item.expiryDate);

                if (
                  status.status === "critical" ||
                  status.status === "expired" ||
                  item.quantity < 3
                ) {
                  return (
                    <div
                      key={item._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/90 border border-rose-150 rounded-2xl shadow-sm hover:shadow-md transition-all gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                          <AlertTriangle size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-850 text-sm">
                              {item.bloodGroup}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-2xs ${
                              isExpiredItem ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}>
                              {isExpiredItem ? "Expired" : "Action Needed"}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-semibold block mt-0.5 leading-relaxed">
                            {isExpiredItem
                              ? "These blood units have expired and must be disposed of safely."
                              : status.status === "critical"
                                ? "Critical: Expiry is within 3 days. Prioritize usage immediately!"
                                : "Stock is low. Please request replenishment."}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span className="text-sm font-black text-slate-850">
                          {item.quantity} units
                        </span>
                        {item.expiryDate && (
                          <span className="text-[10px] text-slate-400 font-extrabold mt-0.5">
                            Exp: {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Lower Widget Row: Quick Actions + Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Quick Operations Panel */}
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-100/20 rounded-full blur-3xl -z-10" />

            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <Zap className="w-4 h-4" />
                  </div>
                  Quick Operations
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-semibold mb-6">
                Replenish blood supply reserves or execute real-time inventory synchronization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/hospital/blood-request-create"
                className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white py-3.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/25 hover:scale-[1.02] active:scale-95 cursor-pointer border border-red-500/30"
              >
                <Plus size={16} />
                <span>Request More Blood</span>
              </Link>

              <button
                onClick={loadStock}
                className="bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 text-slate-700 py-3.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <RefreshCw size={15} className={`text-slate-600 ${loading ? "animate-spin" : ""}`} />
                <span>Sync Inventory</span>
              </button>
            </div>
          </div>

          {/* Stock Status Guide */}
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                Stock Health Guide
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <CheckCircle size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-extrabold text-emerald-900 block uppercase tracking-wider text-[11px]">Good</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Qty &ge; 5, Expiry &gt; 7d</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200/60 rounded-2xl">
                <AlertCircle size={15} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-extrabold text-slate-800 block uppercase tracking-wider text-[11px]">Out of Stock</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Quantity = 0 units</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-amber-50/50 border border-amber-100 rounded-2xl">
                <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-extrabold text-amber-900 block uppercase tracking-wider text-[11px]">Low Stock</span>
                  <span className="text-[10px] text-amber-700 font-semibold">Quantity &lt; 5 units</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                <AlertTriangle size={15} className="text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <span className="font-extrabold text-amber-950 block uppercase tracking-wider text-[11px]">Warning</span>
                  <span className="text-[10px] text-amber-800 font-semibold">Expiry &le; 7 days</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-rose-50/60 border border-rose-100 rounded-2xl">
                <AlertTriangle size={15} className="text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-extrabold text-rose-900 block uppercase tracking-wider text-[11px]">Critical</span>
                  <span className="text-[10px] text-rose-700 font-semibold">Expiry &le; 3 days</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-rose-100/70 border border-rose-200 rounded-2xl">
                <AlertTriangle size={15} className="text-rose-700 mt-0.5 shrink-0" />
                <div>
                  <span className="font-extrabold text-rose-950 block uppercase tracking-wider text-[11px]">Expired</span>
                  <span className="text-[10px] text-rose-800 font-semibold">Passed expiry date</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HospitalBloodStock;
