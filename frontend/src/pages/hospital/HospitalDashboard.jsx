import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  CalendarDays,
  Activity,
  Droplet,
  Clock,
  History,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Mail,
  LogIn,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Award,
  Bell,
  Plus,
  ClipboardList,
  XCircle
} from "lucide-react";
import { hospitalApi } from "../../services/api.js";
import { getAuthToken } from "../../utils/auth.js";
import { toast } from "react-hot-toast";
import { SOCKET_URL } from "../../config/env.js";
import { io } from "socket.io-client";
import DemandForecastChart from "../../components/analytics/DemandForecastChart";

const HospitalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const token = getAuthToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await hospitalApi.getDashboard();
      if (res.data?.success) {
        setData(res.data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error("Invalid dashboard response");
      }
    } catch (err) {
      console.error("Error fetching hospital dashboard data:", err);
      toast.error(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Periodic Auto-refresh (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Connect to Socket.io for real-time updates
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    console.log("🔌 Connecting to Socket.io on Hospital Dashboard...");
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected on Hospital Dashboard:", socket.id);
      setIsSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected on Hospital Dashboard");
      setIsSocketConnected(false);
    });

    socket.on("request-processed", (eventData) => {
      console.log("🔔 Real-time event: request-processed", eventData);
      toast.success(`Request for ${eventData.bloodType} (${eventData.units} units) was ${eventData.status}!`);
      fetchDashboardData(true);
    });

    socket.on("stock-updated", (eventData) => {
      console.log("🔔 Real-time event: stock-updated", eventData);
      toast.success("Stock level updated by blood lab!");
      fetchDashboardData(true);
    });

    socket.on("new-request", (eventData) => {
      console.log("🔔 Real-time event: new-request", eventData);
      toast.success("New request registered!");
      fetchDashboardData(true);
    });

    return () => {
      console.log("🔌 Disconnecting Socket.io from Hospital Dashboard...");
      socket.disconnect();
    };
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(true);
    setRefreshing(false);
    toast.success("Dashboard updated");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative mb-6 flex justify-center">
            <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-rose-500 rounded-full blur animate-pulse" />
            <div className="relative p-4 bg-white rounded-full shadow-md">
              <Building2 className="w-12 h-12 text-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Loading Hospital Dashboard
          </h2>
          <p className="text-slate-500 font-medium">Retrieving real-time hospital insights...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.hospital) {
    return (
      <div className="space-y-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Failed to load hospital data</h2>
          <p className="text-slate-500 mb-4">Please try refreshing the page or contact support.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 mx-auto shadow-md transition-all font-bold active:scale-95"
          >
            <RefreshCw size={18} />
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const { hospital, stats, inventoryList = [], recentRequests = [], recentDonors = [] } = data;

  const getLoginHistory = () => {
    if (!hospital.history) return [];
    return hospital.history
      .filter(event => event.eventType === "Login")
      .slice(0, 5)
      .map(login => ({
        date: login.date,
        description: login.description || "System login",
        ip: login.description?.match(/\d+\.\d+\.\d+\.\d+/)?.[0] || "Hospital Login"
      }));
  };

  const getRecentActivity = () => {
    if (!hospital.history) return [];
    return hospital.history
      .filter(event => event.eventType !== "Login")
      .slice(0, 8)
      .map(activity => ({
        date: activity.date,
        eventType: activity.eventType,
        description: activity.description,
        referenceId: activity.referenceId
      }));
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

  const getStockStatusConfig = (quantity, expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry <= today) {
      return { label: "Expired", color: "bg-red-50 text-red-800 border-red-200", icon: AlertTriangle };
    }
    
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 3) {
      return { label: "Critical Expiry", color: "bg-red-50 text-red-700 border-red-200 animate-pulse", icon: AlertTriangle };
    } else if (daysUntilExpiry <= 7) {
      return { label: "Warning Expiry", color: "bg-yellow-50 text-yellow-800 border-yellow-200", icon: AlertTriangle };
    } else if (quantity < 5) {
      return { label: "Low Stock", color: "bg-orange-50 text-orange-800 border-orange-200", icon: AlertCircle };
    } else {
      return { label: "Optimal", color: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: CheckCircle };
    }
  };

  const loginHistory = getLoginHistory();
  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Signature Crimson-Rose Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 p-6 sm:p-8 text-white shadow-xl shadow-red-900/20 border border-red-500/30">
          {/* Geometric Vector Rings Background Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center md:items-end">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-end text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-red-600 font-black flex items-center justify-center shadow-2xl ring-4 ring-white/20 flex-shrink-0">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                    Hospital Control Center
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
                  Real-time blood stock synchronization & emergency response center • Last synced at {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-2xl font-black text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 shadow-md flex-shrink-0 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-white ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Dashboard"}</span>
            </button>
          </div>
        </div>

        {/* Low Stock Warning Banner */}
        {stats.lowStock > 0 && (
          <div className="bg-rose-50/90 border-2 border-rose-200 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden shadow-md">
            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-200 rounded-full blur-3xl opacity-60" />
            <div className="p-3 bg-rose-600 text-white rounded-2xl flex-shrink-0 animate-pulse relative z-10 shadow-md shadow-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <h4 className="font-extrabold text-red-950 text-sm uppercase tracking-wide">Critical Blood Shortage Detected</h4>
              <p className="text-red-800 text-xs mt-0.5 font-bold">
                {stats.lowStock} blood type{stats.lowStock > 1 ? "s are" : " is"} critically low in inventory. Please request replenishments immediately to prevent shortages.
              </p>
            </div>
          </div>
        )}

        {/* AI Predictive Demand & Shortage Forecast */}
        <DemandForecastChart />

        {/* Executive Hospital Identity Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-100/90 border border-slate-100/90 p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-6 border-b border-slate-100">
            {/* 3D Specimen Avatar Badge */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white font-black text-3xl shadow-xl shadow-red-600/30 flex items-center justify-center border-4 border-white ring-4 ring-red-50 relative group">
                {(hospital.name || "H").charAt(0).toUpperCase()}
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full ring-2 ring-white" title="Operational Ready" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-850 tracking-tight">
                  {hospital.name}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs mx-auto sm:mx-0 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {hospital.status?.toUpperCase() || "APPROVED"}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-extrabold bg-slate-100/90 text-slate-700 border border-slate-200 uppercase tracking-wider">
                  Type: {hospital.facilityType ? hospital.facilityType.replace('-', ' ').toUpperCase() : "HOSPITAL"}
                </span>
                {hospital.facilityCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200/80 uppercase tracking-wider">
                    Category: {hospital.facilityCategory}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4 Contact & Operational Info Pills */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-b from-slate-50/90 to-white border border-slate-200/70 transition-all hover:border-red-200 hover:shadow-md group">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0 font-bold border border-red-100 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Support</span>
                <span className="block text-xs font-black text-slate-850 mt-0.5 truncate" title={hospital.email}>
                  {hospital.email || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-b from-slate-50/90 to-white border border-slate-200/70 transition-all hover:border-rose-200 hover:shadow-md group">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0 font-bold border border-rose-100 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-rose-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Contact Line</span>
                <span className="block text-xs font-black text-slate-850 mt-0.5">
                  {hospital.phone || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-b from-slate-50/90 to-white border border-slate-200/70 transition-all hover:border-amber-200 hover:shadow-md group">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0 font-bold border border-amber-100 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Operating Hours</span>
                <span className="block text-xs font-black text-slate-850 mt-0.5">
                  {hospital.operatingHours ? `${hospital.operatingHours.open || "09:00"} - ${hospital.operatingHours.close || "18:00"}` : "24 / 7 Emergency"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-b from-slate-50/90 to-white border border-slate-200/70 transition-all hover:border-emerald-200 hover:shadow-md group">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 font-bold border border-emerald-100 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Facility Address</span>
                <span className="block text-xs font-black text-slate-850 mt-0.5 truncate" title={hospital.address}>
                  {hospital.address ? `${hospital.address.street || ""}, ${hospital.address.city || ""}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Executive 3D Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Card 1: Total Units */}
          <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Reserves</span>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/30 flex items-center justify-center shrink-0 ring-4 ring-red-50 group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6 fill-white animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-850 tracking-tight">{stats.totalUnits}</span>
                <span className="text-xs font-black text-red-600 uppercase tracking-wider">Units</span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Live Total Stock
              </p>
            </div>
          </div>

          {/* Card 2: Types In Stock */}
          <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blood Groups</span>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center shrink-0 ring-4 ring-blue-50 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">{stats.bloodTypesInStock}</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">/ 8 Types</span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Groups In Stock
              </p>
            </div>
          </div>

          {/* Card 3: Low Stock Warning */}
          <div className={`relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between ${
            stats.lowStock > 0 ? "ring-2 ring-amber-500/40" : ""
          }`}>
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Status</span>
              <div className={`w-12 h-12 rounded-2xl text-white shadow-lg flex items-center justify-center shrink-0 ring-4 ring-amber-50 group-hover:scale-110 transition-transform ${
                stats.lowStock > 0 
                  ? "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-orange-600/40 animate-pulse" 
                  : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-600/30"
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl sm:text-4xl font-black tracking-tight ${stats.lowStock > 0 ? "text-amber-600" : "text-slate-850"}`}>{stats.lowStock}</span>
                <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Alerts</span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${stats.lowStock > 0 ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                {stats.lowStock > 0 ? "Action Required" : "Optimal Levels"}
              </p>
            </div>
          </div>

          {/* Card 4: Expiring Soon */}
          <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shelf-Life Risk</span>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center shrink-0 ring-4 ring-purple-50 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-purple-600 tracking-tight">{stats.expiringSoon}</span>
                <span className="text-xs font-black text-purple-700 uppercase tracking-wider">Batches</span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Expiring &lt; 7 Days
              </p>
            </div>
          </div>

          {/* Card 5: Emergency Fulfillment Efficiency */}
          <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Efficiency</span>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center shrink-0 ring-4 ring-emerald-50 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">{stats.fulfillmentRate}%</span>
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Fulfilled</span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Success Ratio
              </p>
            </div>
          </div>
        </div>

        {/* 1. Full-Width Blood Stock Status Visual Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 relative overflow-hidden mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-100/20 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-red-600/25 shrink-0 border border-red-400/30">
                  <Droplet className="w-5.5 h-5.5 fill-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-850 tracking-tight">
                    Blood Reserve & Stock Levels
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    Live laboratory blood inventory status for emergency hospital allocation
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-4 py-2 rounded-2xl bg-red-50 text-red-700 font-extrabold text-xs uppercase tracking-wider border border-red-200/80 shadow-2xs">
                  Total: <strong className="text-sm font-black text-red-800">{inventoryList.reduce((sum, item) => sum + item.quantity, 0)}</strong> Units
                </span>
                <Link
                  to="/hospital/inventory"
                  className="text-xs font-extrabold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 px-5 py-2.5 rounded-2xl transition-all flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer active:scale-95 border border-red-500/30"
                >
                  <span>Manage Stock</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {inventoryList.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-50 to-red-50/30 rounded-3xl p-10 text-center border border-slate-200/60 relative overflow-hidden shadow-inner">
                <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-md border border-red-100">
                  <Droplet className="w-8 h-8 fill-red-600 animate-pulse" />
                </div>
                <h4 className="text-base font-black text-slate-850 uppercase tracking-wide">
                  Hospital Blood Reserve Is Empty
                </h4>
                <p className="text-xs text-slate-500 font-semibold mt-1 max-w-sm mx-auto leading-relaxed">
                  No active blood inventory units currently deposited in your hospital reserve. Create an emergency request to order supplies from verified blood labs.
                </p>
                
                <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
                  <Link
                    to="/hospital/blood-request-create"
                    className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus size={16} />
                    <span>Create Blood Request</span>
                  </Link>
                  <Link
                    to="/hospital/inventory"
                    className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Deposit Local Stock</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {inventoryList.map((item) => {
                  const status = getStockStatusConfig(item.quantity, item.expiryDate);
                  const maxQty = 30; // Max visual scaling reference
                  const percentage = Math.min((item.quantity / maxQty) * 100, 100);

                  return (
                    <div
                      key={item._id}
                      className="relative p-5 rounded-3xl bg-gradient-to-b from-white via-slate-50/50 to-white border border-slate-200/80 shadow-md shadow-slate-200/50 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                    >
                      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br from-red-500/10 to-rose-500/5 blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                      <div>
                        {/* Header: 3D Blood Specimen Circle & Status Badge */}
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-lg border-2 border-white ring-2 ring-slate-100 group-hover:scale-110 transition-transform ${getBloodTypeBg(item.bloodGroup)}`}>
                            {item.bloodGroup}
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        {/* Units & Category Title */}
                        <div className="relative z-10">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-slate-850 tracking-tight">{item.quantity}</span>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Units</span>
                          </div>
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Whole Blood Reserve</span>
                        </div>

                        {/* Capacity Fill Gauge Bar */}
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-4 p-0.5 border border-slate-200/60 shadow-inner relative z-10">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 shadow-md ${
                              item.quantity < 5 ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30" : item.quantity < 10 ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30" : "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Footer Info */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 relative z-10">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} className="text-slate-400" />
                          <span>Expires: {new Date(item.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </span>
                        <span className="text-slate-700 font-black px-2 py-0.5 bg-slate-100/90 rounded-md border border-slate-200/70">{Math.round(percentage)}% Capacity</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. Full-Width Request Summary & Emergency Allocation Board */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 relative overflow-hidden mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-red-600/25 shrink-0 border border-red-400/30">
                  <TrendingUp className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-850 tracking-tight">
                    Request Summary & Emergency Allocation
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    Real-time emergency request status breakdown and laboratory fulfillment telemetry
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3.5 py-1.5 bg-red-50 text-red-700 border border-red-200/80 rounded-full font-black text-xs uppercase tracking-wider shadow-2xs">
                  Live Status
                </span>
                <Link
                  to="/hospital/blood-request-create"
                  className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-2xl shadow-md shadow-red-600/20 border border-red-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Create Blood Request</span>
                </Link>
              </div>
            </div>

            {/* 4 Executive Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between transition-all hover:bg-white hover:shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Raised</span>
                    <span className="text-2xl font-black text-slate-850 mt-0.5 block">{stats.totalRequests}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                  Requests
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between transition-all hover:bg-amber-50 hover:shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-black text-amber-800 uppercase tracking-wider">Pending</span>
                    <span className="text-2xl font-black text-amber-900 mt-0.5 block">{stats.pendingRequests}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-200">
                  Action Needed
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between transition-all hover:bg-emerald-50 hover:shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-black text-emerald-800 uppercase tracking-wider">Approved</span>
                    <span className="text-2xl font-black text-emerald-900 mt-0.5 block">{stats.acceptedRequests}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200">
                  Fulfilled
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between transition-all hover:bg-rose-50 hover:shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-black text-rose-800 uppercase tracking-wider">Rejected</span>
                    <span className="text-2xl font-black text-rose-900 mt-0.5 block">{stats.rejectedRequests}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-rose-800 bg-rose-100 px-2.5 py-1 rounded-xl border border-rose-200">
                  Cancelled
                </span>
              </div>
            </div>

            {/* Full-Width Fulfillment Success Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-rose-50/30 to-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider mb-2">
                <span className="text-slate-700">Lab Allocation & Fulfillment Efficiency</span>
                <span className="text-rose-600 font-black">{stats.fulfillmentRate}% Success Ratio</span>
              </div>
              <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 transition-all duration-700 shadow-xs"
                  style={{ width: `${Math.min(100, Number(stats.fulfillmentRate || 0))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requests History & Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Blood Requests */}
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-red-100/20 rounded-full blur-3xl -z-10" />

            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                      <Activity className="w-5 h-5" />
                    </div>
                    Recent Blood Requests
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Latest requests submitted to blood laboratories.
                  </p>
                </div>

                <Link
                  to="/hospital/blood-request-history"
                  className="text-xs font-extrabold text-red-600 hover:text-red-700 bg-red-50/80 hover:bg-red-100/80 border border-red-200/80 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 flex-shrink-0"
                >
                  <span>Full History</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {recentRequests.length === 0 ? (
                <div className="bg-slate-50/70 rounded-2xl p-8 text-center border border-slate-100 my-4">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                  <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">No Blood Requests Raised Yet</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">Submit an emergency request to order components from verified labs.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRequests.slice(0, 5).map((request) => (
                    <div key={request._id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-850">{request.bloodType}</span>
                          <span className="text-xs text-slate-500 font-extrabold">• {request.units} units</span>
                          {request.urgency === "emergency" && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-800 animate-pulse border border-red-200/80">EMERGENCY</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-semibold">
                          <Building2 size={13} className="text-slate-400" />
                          <span>{request.labId?.name || "Verified Blood Laboratory"}</span>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                        request.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        request.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {request.status?.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Donors / Contact Directory */}
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-100/20 rounded-full blur-3xl -z-10" />

            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                      <Users className="w-5 h-5" />
                    </div>
                    Recent Local Donors
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Verified registered donor directory associations.
                  </p>
                </div>

                <Link
                  to="/hospital/donors"
                  className="text-xs font-extrabold text-red-600 hover:text-red-700 bg-red-50/80 hover:bg-red-100/80 border border-red-200/80 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 flex-shrink-0"
                >
                  <span>Directory</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {recentDonors.length === 0 ? (
                <div className="bg-slate-50/70 rounded-2xl p-8 text-center border border-slate-100 my-4">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">No Recent Donor Associations Found</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">Explore the local donor directory to connect with eligible donors.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDonors.slice(0, 5).map((donor) => (
                    <div key={donor._id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-md border-2 border-white ring-2 ${getBloodTypeBg(donor.bloodGroup)}`}>
                          {donor.bloodGroup}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-850">{donor.user?.name || donor.email}</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            Last donation: {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "Never"}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs uppercase tracking-wider">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Logs & Security Access Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Activities Timeline */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-red-600/25 shrink-0 border border-red-400/30">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-850 tracking-tight">
                      Activity Timeline
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                      Real-time audit trail of hospital inventory operations
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200/80 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  Live Sync
                </span>
              </div>

              {recentActivity.length === 0 ? (
                <div className="bg-gradient-to-b from-slate-50/80 to-white rounded-3xl p-8 text-center border border-slate-200/60 my-2 shadow-inner">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200/80 shadow-xs">
                    <History className="w-7 h-7 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">No Activity Recorded Yet</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
                    System activity logs will stream here in real-time as stock allocations and emergency requests occur.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                  {recentActivity.map((activity, idx) => {
                    let indicatorBg = "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]";
                    if (activity.eventType?.toLowerCase().includes("request")) {
                      indicatorBg = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]";
                    } else if (activity.eventType?.toLowerCase().includes("stock") || activity.eventType?.toLowerCase().includes("inventory")) {
                      indicatorBg = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]";
                    } else if (activity.eventType?.toLowerCase().includes("alert") || activity.eventType?.toLowerCase().includes("critical")) {
                      indicatorBg = "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]";
                    }

                    return (
                      <div key={idx} className="flex gap-4 relative pb-4 last:pb-0 group">
                        {idx < recentActivity.length - 1 && (
                          <span className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-slate-100" />
                        )}
                        <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center shrink-0 relative z-10 shadow-2xs">
                          <span className={`h-2.5 w-2.5 rounded-full ${indicatorBg}`} />
                        </div>
                        <div className="flex-1 bg-gradient-to-b from-slate-50/90 to-white p-4 rounded-2xl border border-slate-200/70 hover:border-slate-300 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-black text-xs text-slate-850 uppercase tracking-wider">
                              {activity.eventType?.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1.5 font-bold leading-relaxed">{activity.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Security & Access Log */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0 border border-emerald-400/30">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-850 tracking-tight">
                      Security & Access Log
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                      System authentication & session audit logs
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Encrypted SSL
                </span>
              </div>

              {loginHistory.length === 0 ? (
                <div className="bg-gradient-to-b from-slate-50/80 to-white rounded-3xl p-8 text-center border border-slate-200/60 my-2 shadow-inner">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200/80 shadow-xs">
                    <ShieldCheck className="w-7 h-7 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">No Login Logs Recorded</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Authentication audit logs will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {loginHistory.map((login, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50/90 to-white hover:border-emerald-200 hover:shadow-md transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <LogIn size={18} />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-slate-850 tracking-tight">Hospital Session Login</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-2">
                            <span>{new Date(login.date).toLocaleString()}</span>
                            {login.ip && <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[9px]">{login.ip}</span>}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider shadow-2xs flex items-center gap-1">
                        ✓ AUTHENTICATED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HospitalDashboard;