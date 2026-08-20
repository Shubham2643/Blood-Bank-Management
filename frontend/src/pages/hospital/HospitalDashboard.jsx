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
      "A+": "bg-red-50 text-red-700 border-red-200",
      "A-": "bg-red-50 text-red-600 border-red-200",
      "B+": "bg-blue-50 text-blue-700 border-blue-200",
      "B-": "bg-blue-50 text-blue-600 border-blue-200",
      "O+": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "O-": "bg-emerald-50 text-emerald-600 border-emerald-200",
      "AB+": "bg-purple-50 text-purple-700 border-purple-200",
      "AB-": "bg-purple-50 text-purple-650 border-purple-200"
    };
    return colors[bloodType] || "bg-slate-50 text-slate-700 border-slate-200";
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
        <div className="bg-white rounded-3xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 p-6 sm:p-8 relative overflow-hidden transition-all">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-6 border-b border-slate-100">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white font-black text-3xl shadow-xl flex items-center justify-center border-4 border-white ring-4 ring-red-100">
                {(hospital.name || "H").charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-850 tracking-tight">
                  {hospital.name}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs mx-auto sm:mx-0 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {hospital.status?.toUpperCase() || "APPROVED"}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-700 border border-slate-200/80 uppercase tracking-wider">
                  Type: {hospital.facilityType ? hospital.facilityType.replace('-', ' ').toUpperCase() : "HOSPITAL"}
                </span>
                {hospital.facilityCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black bg-rose-50 text-rose-700 border border-rose-200/80 uppercase tracking-wider">
                    Category: {hospital.facilityCategory}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 transition-all hover:bg-white hover:shadow-md">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl flex-shrink-0 font-bold border border-red-100">
                <Mail className="w-4.5 h-4.5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Support</span>
                <span className="block text-xs font-extrabold text-slate-850 mt-0.5 break-all">
                  {hospital.email || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 transition-all hover:bg-white hover:shadow-md">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl flex-shrink-0 font-bold border border-rose-100">
                <Phone className="w-4.5 h-4.5 text-rose-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Contact Number</span>
                <span className="block text-xs font-extrabold text-slate-850 mt-0.5">
                  {hospital.phone || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 transition-all hover:bg-white hover:shadow-md">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0 font-bold border border-amber-100">
                <Clock className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Operating Hours</span>
                <span className="block text-xs font-extrabold text-slate-850 mt-0.5">
                  {hospital.operatingHours ? `${hospital.operatingHours.open || "09:00"} - ${hospital.operatingHours.close || "18:00"}` : "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 transition-all hover:bg-white hover:shadow-md">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0 font-bold border border-emerald-100">
                <MapPin className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Facility Address</span>
                <span className="block text-xs font-extrabold text-slate-850 mt-0.5 truncate" title={hospital.address}>
                  {hospital.address ? `${hospital.address.street || ""}, ${hospital.address.city || ""}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Executive 3D Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Card 1: Total Units */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-red-50/30 to-white rounded-3xl border border-red-150/80 p-6 shadow-xl shadow-red-500/5 hover:shadow-2xl hover:shadow-red-500/15 hover:border-red-300 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Reserves</span>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/30 flex items-center justify-center flex-shrink-0 ring-2 ring-red-100 group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6 fill-white animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-850 tracking-tight">{stats.totalUnits}</span>
                <span className="text-xs font-extrabold text-red-600 uppercase tracking-wider">Units</span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Live Total Stock
              </p>
            </div>
          </div>

          {/* Card 2: Types In Stock */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white rounded-3xl border border-blue-150/80 p-6 shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/15 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blood Groups</span>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center flex-shrink-0 ring-2 ring-blue-100 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">{stats.bloodTypesInStock}</span>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">/ 8 Types</span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Groups In Stock
              </p>
            </div>
          </div>

          {/* Card 3: Low Stock Warning */}
          <div className={`relative overflow-hidden bg-gradient-to-br from-white via-amber-50/40 to-white rounded-3xl border border-amber-200/90 p-6 shadow-xl shadow-amber-500/5 hover:shadow-2xl hover:shadow-amber-500/15 hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between ${
            stats.lowStock > 0 ? "ring-2 ring-amber-500/40" : ""
          }`}>
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Status</span>
              <div className={`w-12 h-12 rounded-2xl text-white shadow-lg flex items-center justify-center flex-shrink-0 ring-2 ring-amber-100 group-hover:scale-110 transition-transform ${
                stats.lowStock > 0 
                  ? "bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 shadow-orange-600/40 animate-pulse" 
                  : "bg-gradient-to-tr from-amber-500 to-orange-600 shadow-amber-600/30"
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl sm:text-4xl font-black tracking-tight ${stats.lowStock > 0 ? "text-amber-600" : "text-slate-850"}`}>{stats.lowStock}</span>
                <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">Alerts</span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${stats.lowStock > 0 ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                {stats.lowStock > 0 ? "Action Required" : "Optimal Levels"}
              </p>
            </div>
          </div>

          {/* Card 4: Expiring Soon */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-white rounded-3xl border border-purple-150/80 p-6 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/15 hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shelf-Life Risk</span>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center flex-shrink-0 ring-2 ring-purple-100 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-purple-600 tracking-tight">{stats.expiringSoon}</span>
                <span className="text-xs font-extrabold text-purple-700 uppercase tracking-wider">Batches</span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Expiring &lt; 7 Days
              </p>
            </div>
          </div>

          {/* Card 5: Fulfillment Rate */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-white rounded-3xl border border-emerald-150/80 p-6 shadow-xl shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/15 hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Efficiency</span>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center flex-shrink-0 ring-2 ring-emerald-100 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">{stats.fulfillmentRate}%</span>
                <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">Fulfilled</span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Success Ratio
              </p>
            </div>
          </div>
        </div>

        {/* Central Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Blood Stock Status Visual Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/20 rounded-full blur-3xl -z-10" />
            
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                      <Droplet className="w-5 h-5 fill-red-600 animate-pulse" />
                    </div>
                    Blood Reserve & Stock Levels
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Live laboratory blood inventory status for emergency hospital allocation.
                  </p>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <span className="px-3.5 py-1.5 rounded-2xl bg-red-50 text-red-700 font-extrabold text-xs uppercase tracking-wider border border-red-150 shadow-2xs">
                    Total: <strong className="text-sm font-black text-red-800">{inventoryList.reduce((sum, item) => sum + item.quantity, 0)}</strong> Units
                  </span>
                  <Link
                    to="/hospital/inventory"
                    className="text-xs font-extrabold text-red-600 hover:text-red-700 bg-red-50/80 hover:bg-red-100/80 border border-red-200/80 px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <span>Manage Stock</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {inventoryList.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-50 to-red-50/30 rounded-3xl p-8 text-center border border-slate-150 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-md border border-red-100">
                    <Droplet className="w-8 h-8 fill-red-600 animate-pulse" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-850 uppercase tracking-wide">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inventoryList.map((item) => {
                    const status = getStockStatusConfig(item.quantity, item.expiryDate);
                    const maxQty = 30; // Max visual scaling reference
                    const percentage = Math.min((item.quantity / maxQty) * 100, 100);

                    return (
                      <div key={item._id} className="p-4 border border-slate-150 rounded-2xl bg-white hover:bg-slate-50/70 hover:shadow-md transition-all flex flex-col justify-between group">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md border-2 border-white ring-2 ${getBloodTypeBg(item.bloodGroup)}`}>
                              {item.bloodGroup}
                            </span>
                            <div>
                              <span className="block font-black text-slate-850 text-base leading-tight">{item.quantity} Units</span>
                              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Whole Blood Reserve</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        {/* Visual Capacity Fill Bar */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4 shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.quantity < 5 ? "bg-red-500" : item.quantity < 10 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-extrabold">
                          <span>Expires: {new Date(item.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          <span className="text-slate-500 font-black">{Math.round(percentage)}% Capacity</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Requests Summary & circular SVG dial */}
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-100/20 rounded-full blur-3xl -z-10" />

            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    Request Summary
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Real-time allocation status breakdown.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/70 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Total Requests</span>
                  </div>
                  <span className="text-xs font-black text-slate-850 bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                    {stats.totalRequests}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-amber-50/40 border border-amber-100 transition-all hover:bg-amber-50/80 hover:shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                      <Clock className="w-4 h-4 animate-pulse" />
                    </div>
                    <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">Pending Approvals</span>
                  </div>
                  <span className="text-xs font-black text-amber-800 bg-amber-100/90 px-3 py-1 rounded-xl border border-amber-200 shadow-2xs">
                    {stats.pendingRequests}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100 transition-all hover:bg-emerald-50/80 hover:shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">Approved & Filled</span>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                    {stats.acceptedRequests}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-rose-50/40 border border-rose-100 transition-all hover:bg-rose-50/80 hover:shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-rose-900 uppercase tracking-wider">Rejected / Cancelled</span>
                  </div>
                  <span className="text-xs font-black text-rose-800 bg-rose-100/90 px-3 py-1 rounded-xl border border-rose-200 shadow-2xs">
                    {stats.rejectedRequests}
                  </span>
                </div>
              </div>

              {/* Circular fulfillment SVG dial */}
              <div className="mt-6 bg-gradient-to-br from-slate-50 to-rose-50/30 border border-slate-150 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
                <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-md flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-slate-100 fill-none"
                      strokeWidth="6"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-rose-600 fill-none transition-all duration-1000 ease-out"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 - (2 * Math.PI * 32 * Number(stats.fulfillmentRate || 0)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xs font-black text-slate-850 leading-none">
                      {stats.fulfillmentRate}%
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-[11px] font-black text-slate-850 uppercase tracking-wider">Fulfillment Rate</span>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-semibold">
                    Percentage of emergency requests successfully fulfilled by blood labs.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/hospital/blood-request-create"
              className="w-full mt-6 py-3.5 px-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Blood Request</span>
            </Link>
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
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <History className="w-5 h-5" />
                  </div>
                  Activity Timeline
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Audit trail of hospital inventory operations.
                </p>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <div className="bg-slate-50/70 rounded-2xl p-8 text-center border border-slate-100 my-2">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">No Activity Recorded Yet</h4>
                <p className="text-xs text-slate-400 font-medium mt-1">System activity logs will appear here in real-time as operations occur.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {recentActivity.map((activity, idx) => {
                  let indicatorBg = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]";
                  if (activity.eventType?.toLowerCase().includes("request")) {
                    indicatorBg = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
                  } else if (activity.eventType?.toLowerCase().includes("stock") || activity.eventType?.toLowerCase().includes("inventory")) {
                    indicatorBg = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
                  } else if (activity.eventType?.toLowerCase().includes("alert") || activity.eventType?.toLowerCase().includes("critical")) {
                    indicatorBg = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
                  }

                  return (
                    <div key={idx} className="flex gap-4 relative pb-4 last:pb-0 group">
                      {idx < recentActivity.length - 1 && (
                        <span className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-slate-100" />
                      )}
                      <div className="w-9 h-9 bg-slate-50 border border-slate-150 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 shadow-xs">
                        <span className={`h-2.5 w-2.5 rounded-full ${indicatorBg}`} />
                      </div>
                      <div className="flex-1 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-850 uppercase tracking-wider">
                            {activity.eventType?.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 font-semibold leading-relaxed">{activity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Security & Access Log */}
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  Security & Access Log
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  System authentication & login history.
                </p>
              </div>
            </div>

            {loginHistory.length === 0 ? (
              <div className="bg-slate-50/70 rounded-2xl p-8 text-center border border-slate-100 my-2">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">No Login Logs Recorded</h4>
                <p className="text-xs text-slate-400 font-medium mt-1">Authentication audit logs will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loginHistory.map((login, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 border border-slate-200/60 rounded-xl text-slate-600">
                        <LogIn size={15} />
                      </div>
                      <div>
                        <span className="block font-black text-sm text-slate-850">{login.ip}</span>
                        <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                          {new Date(login.date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider shadow-2xs">
                      SUCCESS
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HospitalDashboard;