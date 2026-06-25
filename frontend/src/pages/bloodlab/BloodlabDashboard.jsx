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
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <Beaker className="w-6 h-6 text-red-600" />
            </div>
            Blood Lab Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive overview of your blood laboratory operations
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-4 lg:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
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
          title="Blood Inventory"
          icon={<Droplet className="w-5 h-5 text-red-600" />}
          subtitle="Current blood stock levels"
        >
          {stock.length > 0 ? (
            <div className="space-y-3">
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
              icon={<Droplet className="w-8 h-8" />}
              message="No blood stock data available"
            />
          )}
        </Section>

        {/* Recent Camps Section */}
        <Section
          title="Recent Blood Donation Camps"
          icon={<Calendar className="w-5 h-5 text-red-600" />}
          subtitle="Latest organized camps"
        >
          {dashboard?.recentCamps?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recentCamps.slice(0, 4).map((camp) => (
                <CampCard key={camp._id} camp={camp} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              message="No recent camps organized"
            />
          )}
        </Section>
      </div>

      {/* Access History Section */}
      <Section
        title="Access History"
        icon={<Shield className="w-5 h-5 text-red-600" />}
        subtitle="Recent login activity"
        className="mt-8"
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
            icon={<LogIn className="w-8 h-8" />}
            message="No login history available"
          />
        )}
      </Section>

      {/* Activity History Section */}
      {lab?.history?.length > 0 && (
        <Section
          title="Recent Activity"
          icon={<Activity className="w-5 h-5 text-red-600" />}
          subtitle="All laboratory activities"
          className="mt-8"
        >
          <div className="space-y-3">
            {lab.history
              .slice(-5)
              .reverse()
              .map((h, idx) => (
                <ActivityHistoryItem key={h._id || idx} history={h} />
              ))}
          </div>
        </Section>
      )}
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
    blue: { border: "border-l-blue-400", bg: "bg-blue-50 text-blue-600" },
    green: { border: "border-l-emerald-400", bg: "bg-emerald-50 text-emerald-600" },
    red: { border: "border-l-red-400", bg: "bg-red-50 text-red-600" },
    purple: { border: "border-l-purple-400", bg: "bg-purple-50 text-purple-600" },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-white rounded-2xl shadow-md border-l-4 ${alert ? "border-l-red-400" : colors.border} p-5 relative overflow-hidden hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-800">
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p className={`text-xs ${alert ? "text-red-600 font-bold" : "text-gray-500"} mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${alert ? "bg-red-55 text-red-600" : colors.bg}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3 text-xs">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span className="text-emerald-600 font-medium">{trend}%</span>
          <span className="text-gray-400">from last month</span>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, icon, subtitle, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-red-50 p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {icon} {title}
        </h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const BloodStockItem = ({ bloodType, quantity, critical = false }) => (
  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${critical ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
        <Droplet className="w-4 h-4" />
      </div>
      <span className="font-semibold text-gray-850">{bloodType}</span>
    </div>
    <div className="text-right">
      <span className={`font-black text-lg ${critical ? "text-red-600" : "text-slate-800"}`}>
        {quantity} units
      </span>
      {critical && <p className="text-xs text-red-500 font-medium mt-0.5">Low stock</p>}
    </div>
  </div>
);

const CampCard = ({ camp }) => {
  const normalizedStatus = String(camp.status).toLowerCase();
  const statusClass =
    normalizedStatus === "upcoming"
      ? "bg-yellow-50 text-yellow-700 border-yellow-250/50"
      : normalizedStatus === "completed"
        ? "bg-emerald-50 text-emerald-700 border-emerald-250/50"
        : "bg-slate-50 text-slate-650 border-slate-250/50";

  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 mb-1">{camp.title}</h4>
        <p className="text-xs text-gray-500">
          {new Date(camp.date).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusClass}`}>
          {camp.status?.toUpperCase()}
        </span>
        {camp.expectedDonors && (
          <p className="text-xs text-gray-400 mt-1 font-semibold">
            {camp.expectedDonors} donors
          </p>
        )}
      </div>
    </div>
  );
};

const LoginHistoryItem = ({ history }) => (
  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
        <LogIn className="w-3 h-3" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">System Access</p>
        <p className="text-xs text-gray-550 mt-0.5">
          {history.description || "Successful login"}
        </p>
      </div>
    </div>
    <span className="text-xs text-gray-400 font-medium">
      {new Date(history.date).toLocaleString()}
    </span>
  </div>
);

const ActivityHistoryItem = ({ history }) => {
  const getIcon = (eventType) => {
    switch (eventType) {
      case "Login":
        return <LogIn className="w-3 h-3" />;
      case "Stock Update":
        return <Droplet className="w-3 h-3" />;
      case "Blood Camp":
        return <Calendar className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
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
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${getColor(history.eventType)}`}>
          {getIcon(history.eventType)}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {history.eventType}
          </p>
          <p className="text-xs text-gray-550 mt-0.5">
            {history.description || "Activity recorded"}
          </p>
        </div>
      </div>
      <span className="text-xs text-gray-400 font-medium">
        {new Date(history.date).toLocaleString()}
      </span>
    </div>
  );
};

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-8 text-gray-500">
    <div className="bg-gray-50 border border-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
      {icon}
    </div>
    <p className="text-sm font-semibold text-gray-400">{message}</p>
  </div>
);

export default BloodLabDashboard;
