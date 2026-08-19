import React, { useEffect, useState } from "react";
import { bloodLabApi } from "../../services/api.js";
import {
  Droplet,
  Calendar,
  Users,
  Activity,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building2,
  Shield,
  LogIn,
  AlertCircle,
  RefreshCw,
  Beaker,
  Heart,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";

const BloodLabDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [stock, setStock] = useState([]);
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const [dashboardRes, stockRes, profileRes] = await Promise.all([
        bloodLabApi.getDashboard().catch((err) => {
          console.error("Dashboard API Error:", err.response?.status, err.message);
          throw err;
        }),
        bloodLabApi.getStock().catch((err) => {
          console.error("Stock API Error:", err.response?.status, err.message);
          throw err;
        }),
        bloodLabApi.getHistory().catch((err) => {
          console.error("History API Error:", err.response?.status, err.message);
          return bloodLabApi.getDashboard();
        }),
      ]);

      const dashboardData = dashboardRes.data.data;
      setDashboard(dashboardData);

      // Handle different response structures for stock
      let stockData = [];
      if (stockRes.data.data) {
        stockData = stockRes.data.data;
      } else if (stockRes.data.stock) {
        stockData = stockRes.data.stock;
      } else if (Array.isArray(stockRes.data)) {
        stockData = stockRes.data;
      }
      setStock(stockData);

      // Handle different response structures for lab/history
      const FacilityProfile = dashboardData?.Facility || {};

      let historyData = [];
      if (profileRes.data.activity) {
        historyData = profileRes.data.activity;
      } else {
        historyData = FacilityProfile.history || [];
      }

      setLab({
        ...FacilityProfile,
        history: historyData,
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
      const message = error.response?.data?.message || "Failed to load dashboard data";
      toast.error(message);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success("Dashboard updated");
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Beaker className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Blood Lab Dashboard
          </h2>
          <p className="text-gray-500">Preparing your medical insights...</p>
        </div>
      </div>
    );
  }

  const totalUnits = stock.reduce(
    (sum, blood) => sum + (blood.quantity || 0),
    0
  );
  const criticalStock = stock.filter(
    (blood) => (blood.quantity || 0) < 10
  ).length;

  const loginHistory = lab?.history?.filter((h) => h.eventType === "Login") || [];

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
              <Beaker className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                Blood Lab Control Center
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-red-100/90 mt-1">
                Comprehensive real-time overview of your blood laboratory operations, donor testing, and stock reserves.
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-2xl font-black text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 shadow-md flex-shrink-0 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-white ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>
        </div>
      </div>

      {/* Alert Banner for Critical Stock */}
      {criticalStock > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Low Stock Alert</p>
            <p className="text-red-600 text-sm">
              {criticalStock} blood type{criticalStock > 1 ? "s have" : " has"} critically low inventory
            </p>
          </div>
        </div>
      )}

      {/* Lab Profile Card */}
      {lab && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 mb-8 transition-all duration-300 hover:shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-50/30 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-6 border-b border-slate-100">
            <div className="relative flex-shrink-0 group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-rose-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-rose-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-md border-4 border-white">
                {(lab.name || "L").charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {lab.name}
              </h2>
              <div className="flex flex-wrap gap-2.5 mt-2.5 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {lab.status?.toUpperCase() || "ACTIVE"}
                </span>
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200/60">
                  Blood Lab / Facility
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80 hover:border-red-100 hover:bg-red-50/10 hover:shadow-sm transition-all duration-300">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                <span className="block text-sm font-semibold text-slate-700 mt-0.5 break-all leading-snug">
                  {lab.email || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80 hover:border-red-100 hover:bg-red-50/10 hover:shadow-sm transition-all duration-300">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                <span className="block text-sm font-semibold text-slate-700 mt-0.5 break-all leading-snug">
                  {lab.phone || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80 hover:border-red-100 hover:bg-red-50/10 hover:shadow-sm transition-all duration-300">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Hours</span>
                <span className="block text-sm font-semibold text-slate-700 mt-0.5 leading-snug">
                  {lab.operatingHours ? `${lab.operatingHours.open || "09:00"} - ${lab.operatingHours.close || "18:00"}` : "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80 hover:border-red-100 hover:bg-red-50/10 hover:shadow-sm transition-all duration-300">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Location</span>
                <span className="block text-sm font-semibold text-slate-700 mt-0.5 truncate leading-snug">
                  {lab.address ? `${lab.address.city || ""}, ${lab.address.state || ""}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Calendar className="w-6 h-6" />}
          label="Total Camps"
          value={dashboard?.stats?.totalCamps || 0}
          trend={dashboard?.stats?.campsTrend}
          color="blue"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          label="Total Donors"
          value={dashboard?.stats?.totalDonors || 0}
          trend={dashboard?.stats?.donorsTrend}
          color="green"
        />
        <MetricCard
          icon={<Droplet className="w-6 h-6" />}
          label="Blood Units"
          value={totalUnits}
          subtitle={`${criticalStock} critical`}
          color="red"
          alert={criticalStock > 0}
        />
        <MetricCard
          icon={<Activity className="w-6 h-6" />}
          label="Active Camps"
          value={dashboard?.stats?.upcomingCamps || 0}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Blood Stock Section */}
        <Section
          title="Blood Inventory Reserves"
          icon={<Droplet className="w-5 h-5 text-red-600 fill-red-600" />}
          subtitle="Real-time blood stock levels & capacity status"
        >
          {stock.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {stock.map((blood) => {
                const bloodType = blood.bloodGroup || blood.bloodType;
                const quantity = blood.quantity || 0;
                return (
                  <BloodStockItem
                    key={blood._id}
                    bloodType={bloodType}
                    quantity={quantity}
                    critical={quantity < 10}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Droplet className="w-8 h-8 text-red-400" />}
              message="No blood stock data available"
            />
          )}
        </Section>

        {/* Recent Camps Section */}
        <Section
          title="Recent Blood Donation Camps"
          icon={<Calendar className="w-5 h-5 text-rose-600" />}
          subtitle="Latest organized donation drives & mobile units"
        >
          {dashboard?.recentCamps?.length > 0 ? (
            <div className="space-y-3.5">
              {dashboard.recentCamps.slice(0, 4).map((camp) => (
                <CampCard key={camp._id} camp={camp} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-rose-400" />}
              message="No recent camps organized"
            />
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Access History Section */}
        <Section
          title="Security & System Access Log"
          icon={<Shield className="w-5 h-5 text-blue-600" />}
          subtitle="Authentication audit log & portal sessions"
        >
          {loginHistory.length > 0 ? (
            <div className="space-y-3">
              {loginHistory
                .slice(-5)
                .reverse()
                .map((h, idx) => (
                  <LoginHistoryItem key={h._id || idx} history={h} />
                ))}
            </div>
          ) : (
            <EmptyState
              icon={<LogIn className="w-8 h-8 text-blue-400" />}
              message="No login history available"
            />
          )}
        </Section>

        {/* Activity History Section */}
        <Section
          title="Recent Operations & Activity"
          icon={<Activity className="w-5 h-5 text-emerald-600" />}
          subtitle="Real-time laboratory workflow events"
        >
          {lab?.history?.length > 0 ? (
            <div className="space-y-3">
              {lab.history
                .slice(-5)
                .reverse()
                .map((h, idx) => (
                  <ActivityHistoryItem key={h._id || idx} history={h} />
                ))}
            </div>
          ) : (
            <EmptyState
              icon={<Activity className="w-8 h-8 text-emerald-400" />}
              message="No recent activity recorded"
            />
          )}
        </Section>
      </div>
    </div>
  );
};

// Reusable Components
const MetricCard = ({
  icon,
  label,
  value,
  subtitle,
  trend,
  color,
  alert = false,
}) => {
  const colorClasses = {
    blue: { border: "border-l-blue-500", bg: "bg-blue-50 text-blue-600", shadow: "shadow-blue-500/10" },
    green: { border: "border-l-emerald-500", bg: "bg-emerald-50 text-emerald-600", shadow: "shadow-emerald-500/10" },
    red: { border: "border-l-red-500", bg: "bg-red-50 text-red-600", shadow: "shadow-red-500/10" },
    purple: { border: "border-l-purple-500", bg: "bg-purple-50 text-purple-600", shadow: "shadow-purple-500/10" },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-white rounded-3xl shadow-lg ${colors.shadow} border border-slate-100 border-l-4 ${alert ? "border-l-red-500" : colors.border} p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
          <p className="text-3xl font-black text-slate-850 tracking-tight">
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p className={`text-xs ${alert ? "text-red-600 font-extrabold" : "text-slate-500 font-semibold"} mt-1.5`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl ${alert ? "bg-red-100 text-red-600" : colors.bg} shadow-sm`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-3.5 text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-600">{trend}%</span>
          <span className="text-slate-400 font-medium">from last month</span>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, icon, subtitle, children, className = "" }) => (
  <div className={`bg-white rounded-3xl shadow-xl border border-slate-100/80 p-6 sm:p-7 ${className}`}>
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
      <div>
        <h3 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            {icon}
          </div>
          {title}
        </h3>
        {subtitle && <p className="text-xs font-semibold text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const BloodStockItem = ({ bloodType, quantity, critical = false }) => {
  const maxCapacity = 100;
  const percentage = Math.min(100, Math.round((quantity / maxCapacity) * 100));

  return (
    <div className="p-4 border border-slate-100/90 rounded-2xl bg-slate-50/40 hover:bg-white hover:shadow-md hover:border-red-150 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
            critical 
              ? "bg-red-100 text-red-600 shadow-sm shadow-red-500/20" 
              : "bg-emerald-100/80 text-emerald-700 shadow-sm shadow-emerald-500/20"
          }`}>
            <Droplet className={`w-4 h-4 ${critical ? "fill-red-600 animate-pulse" : "fill-emerald-600"}`} />
          </div>
          <div>
            <span className="font-extrabold text-slate-850 text-base tracking-tight">{bloodType}</span>
            <span className={`block text-[10px] font-extrabold uppercase tracking-wider ${
              critical ? "text-red-600" : quantity > 40 ? "text-emerald-600" : "text-amber-600"
            }`}>
              {critical ? "Critical Low" : quantity > 40 ? "Adequate" : "Moderate"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`font-black text-lg ${critical ? "text-red-600" : "text-slate-850"}`}>
            {quantity}
          </span>
          <span className="text-xs font-bold text-slate-400 ml-1">units</span>
        </div>
      </div>

      {/* Capacity Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-200/60 overflow-hidden mt-2">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            critical ? "bg-gradient-to-r from-red-500 to-rose-600" : "bg-gradient-to-r from-emerald-500 to-teal-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const CampCard = ({ camp }) => {
  const normalizedStatus = String(camp.status).toLowerCase();
  const statusClass =
    normalizedStatus === "upcoming"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : normalizedStatus === "completed"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className="flex items-center justify-between p-4 border border-slate-100/90 rounded-2xl bg-slate-50/40 hover:bg-white hover:shadow-md hover:border-red-150 transition-all duration-300">
      <div className="flex-1 min-w-0 pr-3">
        <h4 className="font-extrabold text-slate-850 text-sm truncate">{camp.title}</h4>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {new Date(camp.date).toLocaleDateString()}
          </span>
          {camp.expectedDonors && (
            <span className="flex items-center gap-1 text-slate-500 font-bold">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {camp.expectedDonors} donors
            </span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${statusClass}`}>
          {camp.status?.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

const LoginHistoryItem = ({ history }) => (
  <div className="flex items-center justify-between p-3.5 border border-slate-100/90 rounded-2xl bg-slate-50/40 hover:bg-white hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
        <LogIn className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-slate-850">System Access</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {history.description || "Successful login"}
        </p>
      </div>
    </div>
    <span className="text-[11px] text-slate-400 font-bold flex-shrink-0">
      {new Date(history.date).toLocaleString()}
    </span>
  </div>
);

const ActivityHistoryItem = ({ history }) => {
  const getIcon = (eventType) => {
    switch (eventType) {
      case "Login":
        return <LogIn className="w-4 h-4" />;
      case "Stock Update":
        return <Droplet className="w-4 h-4" />;
      case "Blood Camp":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getColor = (eventType) => {
    switch (eventType) {
      case "Login":
        return "bg-blue-50 text-blue-600";
      case "Stock Update":
        return "bg-emerald-50 text-emerald-600";
      case "Blood Camp":
        return "bg-purple-50 text-purple-600";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 border border-slate-100/90 rounded-2xl bg-slate-50/40 hover:bg-white hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${getColor(history.eventType)}`}>
          {getIcon(history.eventType)}
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-850">
            {history.eventType}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {history.description || "Activity recorded"}
          </p>
        </div>
      </div>
      <span className="text-[11px] text-slate-400 font-bold flex-shrink-0">
        {new Date(history.date).toLocaleString()}
      </span>
    </div>
  );
};

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-10 text-slate-400">
    <div className="bg-slate-50 border border-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
      {icon}
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{message}</p>
  </div>
);

export default BloodLabDashboard;
