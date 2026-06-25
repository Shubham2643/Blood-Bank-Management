import { useEffect, useState, useCallback } from "react";
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
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-red-500 to-rose-600 rounded-xl text-white shadow-md shadow-rose-100">
                  <Droplet className="w-5 h-5 animate-pulse" />
                </div>
                Blood Stock Inventory
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                isSocketConnected 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-amber-50 text-amber-700 border-amber-100"
              }`}>
                <span className={`h-2 w-2 rounded-full ${isSocketConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {isSocketConnected ? "Live Sync Active" : "Connecting..."}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 font-semibold">
              Manage and monitor your hospital's blood supply levels in real-time
            </p>
          </div>
          <button
            onClick={loadStock}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl text-slate-600 px-4 py-2.5 hover:bg-slate-50 transition-all shadow-sm font-bold text-sm active:scale-95 shrink-0"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh Inventory
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-50 group-hover:scale-125 transition-transform duration-500 opacity-60" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalUnits}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Units</div>
              </div>
              <div className="p-3 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-100">
                <Droplet className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-50 group-hover:scale-125 transition-transform duration-500 opacity-60" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-3xl font-black text-emerald-600 tracking-tight">{stats.bloodTypes}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Groups Available</div>
              </div>
              <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl text-white shadow-md shadow-emerald-100">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-orange-50 group-hover:scale-125 transition-transform duration-500 opacity-60" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-3xl font-black text-orange-500 tracking-tight">{stats.lowStock}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Low Stock Groups</div>
              </div>
              <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl text-white shadow-md shadow-amber-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-rose-50 group-hover:scale-125 transition-transform duration-500 opacity-60" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-3xl font-black text-red-500 tracking-tight">{stats.expiringSoon}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Expiring Soon</div>
              </div>
              <div className="p-3 bg-gradient-to-tr from-rose-500 to-red-600 rounded-xl text-white shadow-md shadow-rose-100">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Blood Type Overview Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Blood Groups Health Overview
          </h2>
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

              let liquidColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]";
              if (status.status === "good") {
                liquidColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
              } else if (status.status === "low" || status.status === "warning") {
                liquidColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
              } else if (status.status === "critical" || status.status === "expired") {
                liquidColor = "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]";
              } else {
                liquidColor = "bg-slate-300";
              }

              return (
                <div
                  key={bloodType}
                  className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center justify-between ${
                    isExpiredItem ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex flex-col justify-between h-full items-start">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getBloodTypeColor(bloodType)}`}>
                      {bloodType}
                    </span>
                    <div className="mt-2.5">
                      <span className="text-2xl font-black text-slate-800 block leading-none">
                        {stockItem.quantity}
                      </span>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide mt-1 block">
                        Units
                      </span>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mt-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${status.color}`}>
                        <StatusIcon size={9} />
                        <span className="capitalize">{status.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Vial graphics */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-4 h-16 bg-slate-50 border border-slate-200 rounded-full overflow-hidden relative shadow-inner flex flex-col justify-end">
                      {/* Liquid representation */}
                      <div
                        className={`w-full rounded-b-full transition-all duration-700 ease-out ${liquidColor}`}
                        style={{ height: `${percentage}%` }}
                      />
                      {/* Reflection sheen */}
                      <div className="absolute top-0 left-0.5 w-0.5 h-full bg-white/20 rounded-full" />
                    </div>
                    
                    {/* Date subtitle */}
                    {stockItem.expiryDate ? (
                      <span className="text-[8px] font-bold text-slate-400 mt-1 block text-center max-w-[52px] truncate">
                        {new Date(stockItem.expiryDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-slate-300 mt-1 block text-center">
                        Empty
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Inventory Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Table Header and Control bar */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <Droplet className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Detailed Inventory Records
              </h2>
            </div>
            
            {/* Dynamic Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search blood group..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 w-44 transition-all"
                />
              </div>

              {/* Status Select */}
              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-all cursor-pointer appearance-none animate-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="good">Good</option>
                  <option value="low">Low Stock</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="expired">Expired</option>
                  <option value="out of stock">Out of Stock</option>
                </select>
                <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Select */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-all cursor-pointer appearance-none animate-none"
                >
                  <option value="bloodGroup">Sort: Group Name</option>
                  <option value="quantity-desc">Sort: Qty (High to Low)</option>
                  <option value="quantity-asc">Sort: Qty (Low to High)</option>
                  <option value="expiry-asc">Sort: Expiry (Soonest)</option>
                  <option value="expiry-desc">Sort: Expiry (Latest)</option>
                </select>
                <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {processedStock.length === 0 ? (
            <div className="text-center py-16">
              <Droplet className="w-14 h-14 text-slate-250 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                No matching stock items
              </h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-5 font-semibold">
                We couldn't find any blood stocks matching the current filters. Request blood from labs to add new entries.
              </p>
              <button
                onClick={() =>
                  (window.location.href = "/hospital/blood-request-create")
                }
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-red-100 transition-all hover:shadow-lg active:scale-95"
              >
                Request Blood
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-slate-800">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                    <th className="p-4 text-left font-extrabold">Blood Group</th>
                    <th className="p-4 text-left font-extrabold">Quantity</th>
                    <th className="p-4 text-left font-extrabold">Inventory Status</th>
                    <th className="p-4 text-left font-extrabold">Expiry Date</th>
                    <th className="p-4 text-left font-extrabold">Days Left</th>
                    <th className="p-4 text-left font-extrabold">Last Synced</th>
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
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getBloodTypeColor(item.bloodGroup)}`}
                          >
                            {item.bloodGroup}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-extrabold text-slate-850">
                                {item.quantity}
                              </span>
                              <span className="text-xs text-slate-400 font-semibold">units</span>
                              {item.quantity < 5 && (
                                <Minus size={13} className="text-orange-500 ml-1" />
                              )}
                            </div>
                            {/* Stock Indicator Progress */}
                            <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden">
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
                            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit border ${status.color}`}
                          >
                            <StatusIcon size={12} />
                            <span className="capitalize">{status.status}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-650 font-medium">
                            <Calendar size={13} className="text-slate-400" />
                            <span className={isExpiredItem ? "text-red-650 font-bold" : "text-slate-700 font-semibold"}>
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-sm font-bold ${
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
                              <span className="inline-flex items-center gap-1 text-red-600">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                EXPIRED
                              </span>
                            ) : (
                              `${daysLeft} days left`
                            )}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-455 font-semibold">
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
          <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-6 relative overflow-hidden">
            {/* Soft decorative backdrop glow */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-60" />
            
            <h3 className="text-base font-extrabold text-rose-800 mb-4 flex items-center gap-2 relative z-10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white border border-rose-100/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 rounded-xl text-rose-600 shrink-0">
                          <AlertTriangle size={15} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800">
                              {item.bloodGroup}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              isExpiredItem ? "bg-red-150 text-red-800" : "bg-orange-100 text-orange-800"
                            }`}>
                              {isExpiredItem ? "Expired" : "Action Needed"}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-semibold block mt-0.5">
                            {isExpiredItem
                              ? "These blood units have expired and must be disposed of safely."
                              : status.status === "critical"
                                ? "Critical: Expiry is within 3 days. Prioritize usage immediately!"
                                : "Stock is low. Please request replenishment."}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span className="text-sm font-extrabold text-slate-700">
                          {item.quantity} units
                        </span>
                        {item.expiryDate && (
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5">
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
          
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Plus size={18} className="text-slate-500" />
                Quick Operations
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-semibold">
                Replenish inventory or run manual updates to align database states instantly.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() =>
                  (window.location.href = "/hospital/blood-request-create")
                }
                className="bg-red-600 bg-gradient-to-br hover:from-red-700 hover:to-rose-700 text-white py-2.5 px-4 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-100 hover:shadow-lg active:scale-95"
              >
                <Plus size={15} />
                Request More Blood
              </button>
              <button
                onClick={loadStock}
                className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 py-2.5 px-4 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                Sync Inventory
              </button>
            </div>
          </div>

          {/* Stock Status Guide */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              Stock Health Guide
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                <CheckCircle size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 block">Good</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Qty &ge; 5, Days &gt; 7</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 block">Out of Stock</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Qty = 0</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                <AlertTriangle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 block">Low Stock</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Qty &lt; 5</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                <AlertTriangle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 block">Warning</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Expiry &le; 7 days</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 block">Critical</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Expiry &le; 3 days</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 block">Expired</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Passed expiry date</span>
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
