import { useEffect, useState, useCallback } from "react";
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
  Bell
} from "lucide-react";
import { hospitalApi } from "../../services/api.js";
import { getAuthToken } from "../../utils/auth.js";
import { toast } from "react-hot-toast";
import { SOCKET_URL } from "../../config/env.js";
import { io } from "socket.io-client";

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
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-tr from-red-500 to-rose-600 rounded-xl text-white shadow-md shadow-rose-100">
                  <Building2 className="w-5 h-5" />
                </div>
                Hospital Control Center
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
              Real-time synchronization active • Last synced at {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl text-slate-600 px-4 py-2.5 hover:bg-slate-50 transition-all shadow-sm font-bold text-sm active:scale-95 shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </div>

        {/* Low Stock Warning Banner */}
        {stats.lowStock > 0 && (
          <div className="bg-rose-50/60 border border-rose-100 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-60" />
            <div className="p-2.5 bg-rose-500 text-white rounded-xl flex-shrink-0 animate-pulse relative z-10 shadow-md shadow-rose-150">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <h4 className="font-extrabold text-red-900 text-sm">Critical Blood Shortage Detected</h4>
              <p className="text-red-700 text-xs mt-0.5 font-semibold">
                {stats.lowStock} blood type{stats.lowStock > 1 ? "s are" : " is"} critically low in inventory. Please request replenishments immediately to prevent shortages.
              </p>
            </div>
          </div>
        )}

        {/* Hospital Hero Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-100/20 to-transparent rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-6 border-b border-slate-100">
            <div className="relative flex-shrink-0 group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-red-500 to-rose-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-3xl shadow-md border-4 border-white">
                {(hospital.name || "H").charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-center sm:justify-start">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {hospital.name}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/60 mx-auto sm:mx-0 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {hospital.status?.toUpperCase() || "ACTIVE"}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3.5 justify-center sm:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200/50">
                  Type: {hospital.facilityType ? hospital.facilityType.replace('-', ' ').toUpperCase() : "HOSPITAL"}
                </span>
                {hospital.facilityCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/50">
                    Category: {hospital.facilityCategory}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-red-100 hover:bg-red-50/5 transition-all group">
              <div className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 flex-shrink-0 group-hover:text-red-500 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Support</span>
                <span className="block text-xs font-bold text-slate-700 mt-0.5 break-all">
                  {hospital.email || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-red-100 hover:bg-red-50/5 transition-all group">
              <div className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 flex-shrink-0 group-hover:text-red-500 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</span>
                <span className="block text-xs font-bold text-slate-700 mt-0.5">
                  {hospital.phone || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-red-100 hover:bg-red-50/5 transition-all group">
              <div className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 flex-shrink-0 group-hover:text-red-500 transition-colors">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operating Hours</span>
                <span className="block text-xs font-bold text-slate-700 mt-0.5">
                  {hospital.operatingHours ? `${hospital.operatingHours.open || "09:00"} - ${hospital.operatingHours.close || "18:00"}` : "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-red-100 hover:bg-red-50/5 transition-all group">
              <div className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 flex-shrink-0 group-hover:text-red-500 transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Facility Address</span>
                <span className="block text-xs font-bold text-slate-700 mt-0.5 truncate" title={hospital.address}>
                  {hospital.address ? `${hospital.address.street || ""}, ${hospital.address.city || ""}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-red-50 group-hover:scale-125 transition-transform duration-500 opacity-60" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalUnits}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Blood Units</div>
              </div>
              <div className="p-3 bg-gradient-to-tr from-red-500 to-rose-600 rounded-xl text-white shadow-md shadow-rose-100">
                <Droplet className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-50 group-hover:scale-125 transition-transform duration-500 opacity-60" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-3xl font-black text-blue-600 tracking-tight">{stats.bloodTypesInStock}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Types In Stock</div>
              </div>
              <div className="p-3 bg-gradient-to-tr from-blue-50 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-100">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className={`relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group ${stats.lowStock > 0 ? "border-l-4 border-l-orange-500" : ""}`}>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-orange-50 group-hover:scale-125 transition-transform duration-500 opacity-60" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className={`text-3xl font-black tracking-tight ${stats.lowStock > 0 ? "text-orange-500" : "text-slate-800"}`}>{stats.lowStock}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Low Stock Warning</div>
              </div>
              <div className={`p-3 rounded-xl text-white shadow-md ${stats.lowStock > 0 ? "bg-gradient-to-tr from-orange-500 to-red-500 shadow-orange-100 animate-bounce" : "bg-gradient-to-tr from-amber-500 to-orange-600 shadow-amber-100"}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-50 group-hover:scale-125 transition-transform duration-500 opacity-60" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-3xl font-black text-purple-600 tracking-tight">{stats.expiringSoon}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Expiring Soon</div>
              </div>
              <div className="p-3 bg-gradient-to-tr from-purple-500 to-indigo-650 rounded-xl text-white shadow-md shadow-purple-100">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-50 group-hover:scale-125 transition-transform duration-500 opacity-60" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-3xl font-black text-emerald-600 tracking-tight">{stats.fulfillmentRate}%</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fulfillment Rate</div>
              </div>
              <div className="p-3 bg-gradient-to-tr from-emerald-50 to-teal-600 rounded-xl text-white shadow-md shadow-emerald-100">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Central Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Blood Stock Status Visual Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                    <Droplet className="w-4 h-4" />
                  </div>
                  Blood Stock Levels
                </h3>
                <button
                  onClick={() => window.location.href = '/hospital/blood-stock'}
                  className="text-xs font-bold text-red-600 hover:text-red-750 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
                >
                  Manage Stock <ChevronRight size={14} />
                </button>
              </div>

              {inventoryList.length === 0 ? (
                <div className="text-center py-16">
                  <Droplet className="w-16 h-16 text-slate-200 mx-auto mb-4 animate-pulse" />
                  <p className="text-slate-500 font-bold text-sm">Your blood stock is currently empty</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Create a request to order blood components from verified labs.</p>
                  <button
                    onClick={() => window.location.href = '/hospital/blood-request-create'}
                    className="mt-5 px-5 py-2.5 bg-red-650 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-700 transition-all hover:shadow-lg active:scale-95"
                  >
                    Create Blood Request
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inventoryList.map((item) => {
                    const status = getStockStatusConfig(item.quantity, item.expiryDate);
                    const maxQty = 30; // Max visual scaling reference
                    const percentage = Math.min((item.quantity / maxQty) * 100, 100);

                    return (
                      <div key={item._id} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all flex flex-col justify-between group">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border text-xs ${getBloodTypeBg(item.bloodGroup)}`}>
                              {item.bloodGroup}
                            </span>
                            <div>
                              <span className="block font-black text-slate-800 text-sm leading-tight">{item.quantity} Units</span>
                              <span className="block text-[9px] text-slate-400 font-bold uppercase mt-0.5">Quantity</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        {/* Custom visual bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.quantity < 5 ? "bg-red-500" : item.quantity < 10 ? "bg-orange-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 text-[9px] text-slate-400 font-bold">
                          <span>Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                          <span className="text-slate-300">Max: 30u</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Requests Summary & circular SVG dial */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                Request Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Requests Raised</span>
                  <span className="text-sm font-extrabold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{stats.totalRequests}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
                  <span className="text-sm font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">{stats.pendingRequests}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Approved & Filled</span>
                  <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{stats.acceptedRequests}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Rejected / Cancelled</span>
                  <span className="text-sm font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">{stats.rejectedRequests}</span>
                </div>
              </div>

              {/* Circular fulfillment SVG dial */}
              <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-slate-100 fill-none"
                      strokeWidth="5"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-rose-500 fill-none transition-all duration-1000 ease-out"
                      strokeWidth="5"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 - (2 * Math.PI * 32 * Number(stats.fulfillmentRate || 0)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xs font-black text-slate-800 leading-none">
                      {stats.fulfillmentRate}%
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment Rate</span>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-semibold">
                    Percentage of requests filled by blood laboratories successfully.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/hospital/blood-request-create'}
              className="w-full mt-6 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-sm"
            >
              Create Blood Request
            </button>
          </div>
        </div>

        {/* Requests History & Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Blood Requests */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                Recent Blood Requests
              </h3>
              <button
                onClick={() => window.location.href = '/hospital/blood-request-history'}
                className="text-xs font-bold text-red-600 hover:text-red-750 flex items-center gap-0.5 bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
              >
                Full History <ChevronRight size={14} />
              </button>
            </div>

            {recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">No blood requests raised yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentRequests.slice(0, 5).map((request) => (
                  <div key={request._id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-800">{request.bloodType}</span>
                        <span className="text-xs text-slate-400 font-bold">• {request.units} units</span>
                        {request.urgency === "emergency" && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-100 text-red-800 animate-pulse border border-red-200">EMERGENCY</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                        <Building2 size={12} className="text-slate-400" />
                        {request.labId?.name || "Unknown Lab"}
                      </div>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      request.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      request.status === 'rejected' ? 'bg-red-50 text-red-750 border-red-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {request.status?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Donors / Contact Timeline */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                Recent Local Donors
              </h3>
              <button
                onClick={() => window.location.href = '/hospital/donors'}
                className="text-xs font-bold text-red-600 hover:text-red-750 flex items-center gap-0.5 bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
              >
                Directory <ChevronRight size={14} />
              </button>
            </div>

            {recentDonors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">No recent donor associations found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentDonors.slice(0, 5).map((donor) => (
                  <div key={donor._id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${getBloodTypeBg(donor.bloodGroup)}`}>
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{donor.user?.name || donor.email}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                          Last donation: {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-100">Verified</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Logs & Logins */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Activities Timeline */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <History className="w-4 h-4" />
              </div>
              Activity Timeline
            </h3>

            {recentActivity.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm font-semibold">No activity recorded</div>
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
                      <div className="w-9 h-9 bg-slate-50 border border-slate-150 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                        <span className={`h-2.5 w-2.5 rounded-full ${indicatorBg}`} />
                      </div>
                      <div className="flex-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
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

          {/* Login Logs */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              Security & Security Logins
            </h3>

            {loginHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm font-semibold">No login logs found</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {loginHistory.map((login, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl text-slate-500">
                        <LogIn size={14} />
                      </div>
                      <div>
                        <span className="block font-bold text-sm text-slate-700">{login.ip}</span>
                        <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                          {new Date(login.date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                      Success
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