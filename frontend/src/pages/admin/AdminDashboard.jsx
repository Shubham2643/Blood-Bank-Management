import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Hospital,
  Droplet,
  Calendar,
  Heart,
  TrendingUp,
  Activity,
  Shield,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Download,
  Search,
  Eye,
  Mail,
  MessageSquare,
  Send,
  X,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { adminApi } from "../../services/api.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config/env.js";
import { getAuthToken } from "../../utils/auth.js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Subcomponents moved outside to optimize rendering
const StatCard = ({ icon, label, value, subtitle, trend, color = "red", onClick }) => {
  const colorClasses = {
    red: { border: "border-l-red-400", bg: "bg-red-100", text: "text-red-600", hover: "hover:bg-red-50" },
    blue: { border: "border-l-blue-400", bg: "bg-blue-100", text: "text-blue-600", hover: "hover:bg-blue-50" },
    green: { border: "border-l-green-400", bg: "bg-green-100", text: "text-green-600", hover: "hover:bg-green-50" },
    purple: { border: "border-l-purple-400", bg: "bg-purple-100", text: "text-purple-600", hover: "hover:bg-purple-50" },
    amber: { border: "border-l-amber-400", bg: "bg-amber-100", text: "text-amber-600", hover: "hover:bg-amber-50" },
  };

  const colors = colorClasses[color] || colorClasses.red;

  return (
    <div
      className={`bg-white rounded-2xl shadow-md border-l-4 ${colors.border} p-6 hover:shadow-lg transition-all duration-300 cursor-pointer ${colors.hover}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value?.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>{icon}</div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3 text-xs">
          <TrendingUp className={`w-3.5 h-3.5 ${trend.startsWith("-") ? "text-red-500 rotate-180" : "text-emerald-500"}`} />
          <span className={`font-semibold ${trend.startsWith("-") ? "text-red-600" : "text-emerald-600"}`}>{trend}%</span>
          <span className="text-gray-500">from last period</span>
        </div>
      )}
    </div>
  );
};

const AlertCard = ({ alert }) => {
  const severityColors = {
    critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: AlertTriangle },
    warning: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", icon: Clock },
    info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: BellIcon },
  };

  // Safe fallback if lucide-react icon is missing
  function BellIcon(props) {
    return <Clock {...props} />;
  }

  const colors = severityColors[alert.type] || severityColors.warning;
  const Icon = colors.icon;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`font-medium ${colors.text}`}>{alert.message}</p>
        <p className="text-xs text-gray-500 mt-1">{alert.location}</p>
      </div>
      <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
        {alert.severity}
      </span>
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const statusColors = {
    success: "text-green-600 bg-green-100",
    warning: "text-yellow-600 bg-yellow-100",
    info: "text-blue-600 bg-blue-100",
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className={`w-2.5 h-2.5 rounded-full ${statusColors[activity.status]?.split(" ")[1] || "bg-gray-300"}`}></div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-800 text-sm">{activity.action}</p>
          <span className="text-[10px] text-gray-400 font-medium">{activity.time}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">by {activity.user}</p>
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon, title, description, onClick, color = "red" }) => {
  const colorClasses = {
    red: "hover:bg-red-50 border-red-100 text-red-600",
    blue: "hover:bg-blue-50 border-blue-100 text-blue-600",
    green: "hover:bg-green-50 border-green-100 text-green-600",
    purple: "hover:bg-purple-50 border-purple-100 text-purple-600",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border p-5 cursor-pointer transition-all hover:shadow-md group ${colorClasses[color] || colorClasses.red}`}
    >
      <div className="flex items-center gap-3 mb-2.5">
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-red-500 group-hover:text-white transition-all duration-200">
          {icon}
        </div>
        <h3 className="font-bold text-gray-800 group-hover:text-current transition-colors text-sm">{title}</h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <div className="flex items-center justify-end text-xs font-semibold group-hover:text-current">
        View <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [selectedChart, setSelectedChart] = useState("line");
  const [selectedBloodChart, setSelectedBloodChart] = useState("doughnut");
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStats = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const res = await adminApi.getDashboard({ params: { timeRange } });
      const data = res.data?.data || res.data;

      const formatTimeAgo = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      };

      const dashboardData = {
        ...data?.overview,
        bloodTypeDistribution: (data?.bloodTypeDistribution && Array.isArray(data.bloodTypeDistribution)) ? {
          labels: data.bloodTypeDistribution.map(item => item._id),
          data: data.bloodTypeDistribution.map(item => item.quantity),
        } : {
          labels: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
          data: [0, 0, 0, 0, 0, 0, 0, 0],
        },
        chartData: data?.chartData || {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          donations: [0, 0, 0, 0, 0, 0, 0],
          requests: [0, 0, 0, 0, 0, 0, 0],
        },
        topDonors: data?.topDonors || [],
        trends: data?.trends || { donors: "0", facilities: "0", donations: "0", requests: "0" },
      };

      const formattedActivity = (data?.recentActivity || []).map((activity) => ({
        ...activity,
        time: formatTimeAgo(activity.time),
      }));

      setStats(dashboardData);
      setRecentActivities(formattedActivity);
      setAlerts(data?.alerts || []);
      setLastUpdated(new Date());

      if (showToast) {
        toast.success("Dashboard statistics updated!");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load admin dashboard statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  // Load stats
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Socket connection for real-time dashboard events
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socket = io(`${SOCKET_URL}/admin`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Connected to admin socket updates");
    });

    const events = [
      "new-facility-registration",
      "new-donor-registration",
      "new-blood-request",
      "admin-stats-update",
    ];

    events.forEach((event) => {
      socket.on(event, (data) => {
        toast.success(data.message || `System Update: ${event}`, { icon: "🔔" });
        fetchStats();
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchStats]);

  // Auto-refresh stats every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Export Dashboard to CSV
  const handleExport = () => {
    if (!stats) return;
    const csvData = [
      ["Metric", "Value"],
      ["Total Donors", stats.totalDonors || 0],
      ["Total Facilities", stats.totalFacilities || 0],
      ["Total Donations", stats.totalDonations || 0],
      ["Upcoming Camps", stats.upcomingCamps || 0],
      ["Active Donors", stats.activeDonors || 0],
      ["Available Blood Units", stats.totalBloodUnits || 0],
      ["Pending Requests", stats.pendingRequests || 0],
      ["Pending Facilities", stats.pendingFacilities || 0],
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary report exported successfully");
  };

  // Chart configuration data
  const lineChartData = {
    labels: stats?.chartData?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Donations",
        data: stats?.chartData?.donations || Array(stats?.chartData?.labels?.length || 7).fill(0),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.05)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Requests",
        data: stats?.chartData?.requests || Array(stats?.chartData?.labels?.length || 7).fill(0),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.05)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const barChartData = {
    labels: stats?.bloodTypeDistribution?.labels || ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    datasets: [
      {
        label: "Quantity (Units)",
        data: stats?.bloodTypeDistribution?.data || Array(8).fill(0),
        backgroundColor: [
          "rgba(239, 68, 68, 0.85)",
          "rgba(239, 68, 68, 0.65)",
          "rgba(59, 130, 246, 0.85)",
          "rgba(59, 130, 246, 0.65)",
          "rgba(16, 185, 129, 0.85)",
          "rgba(16, 185, 129, 0.65)",
          "rgba(245, 158, 11, 0.85)",
          "rgba(245, 158, 11, 0.65)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutData = {
    labels: stats?.bloodTypeDistribution?.labels || ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    datasets: [
      {
        data: stats?.bloodTypeDistribution?.data || Array(8).fill(0),
        backgroundColor: [
          "#ef4444",
          "#f87171",
          "#3b82f6",
          "#60a5fa",
          "#10b981",
          "#34d399",
          "#f59e0b",
          "#fbbf24",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { weight: "bold" } },
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-red-600" />
            System Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time analytics and statistics dashboard. Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3.5 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-semibold text-gray-700 cursor-pointer shadow-sm"
          >
            <option value="day">Today</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Annual</option>
          </select>

          <button
            onClick={() => handleExport()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4.5 h-4.5" />
            Export
          </button>

          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 font-medium text-sm transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* System Alerts Row */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.slice(0, 4).map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Donors"
          value={stats?.totalDonors ?? 0}
          subtitle={`${stats?.activeDonors ?? 0} Eligible Donors`}
          trend={stats?.trends?.donors}
          color="red"
          onClick={() => navigate("/admin/donors")}
        />
        <StatCard
          icon={<Hospital className="w-6 h-6" />}
          label="Facilities"
          value={stats?.totalFacilities ?? 0}
          subtitle={`${stats?.pendingFacilities ?? 0} Pending Verification`}
          trend={stats?.trends?.facilities}
          color="blue"
          onClick={() => navigate("/admin/facilities")}
        />
        <StatCard
          icon={<Droplet className="w-6 h-6" />}
          label="Total Donations"
          value={stats?.totalDonations ?? 0}
          subtitle="Collected Units"
          trend={stats?.trends?.donations}
          color="green"
          onClick={() => navigate("/admin/reports")}
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Upcoming Camps"
          value={stats?.upcomingCamps ?? 0}
          subtitle="Scheduled events"
          trend={stats?.trends?.requests}
          color="purple"
          onClick={() => navigate("/admin/camps")}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              Activity Trend (Donations vs Requests)
            </h3>
            <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50 text-xs">
              <button
                onClick={() => setSelectedChart("line")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${selectedChart === "line" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Line
              </button>
              <button
                onClick={() => setSelectedChart("bar")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${selectedChart === "bar" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Bar
              </button>
            </div>
          </div>
          <div className="h-64">
            {selectedChart === "line" ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <Bar data={lineChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Blood Stock Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <PieChart className="w-5 h-5 text-red-600" />
              Available Blood Stock Distribution
            </h3>
            <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50 text-xs">
              <button
                onClick={() => setSelectedBloodChart("doughnut")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${selectedBloodChart === "doughnut" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Doughnut
              </button>
              <button
                onClick={() => setSelectedBloodChart("bar")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${selectedBloodChart === "bar" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Bar
              </button>
            </div>
          </div>
          <div className="h-64 relative flex justify-center items-center">
            {selectedBloodChart === "doughnut" ? (
              <Doughnut
                data={doughnutData}
                options={{
                  ...chartOptions,
                  plugins: { ...chartOptions.plugins, legend: { position: "right", labels: { boxWidth: 10 } } },
                }}
              />
            ) : (
              <Bar
                data={barChartData}
                options={{
                  ...chartOptions,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Lists Row: Activity and Top Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              System Activity Log
            </h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => <ActivityItem key={act.id} activity={act} />)
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">No activity recorded today.</div>
            )}
          </div>
        </div>

        {/* Top Donors */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Leaderboard: Top Donors
            </h3>
            <button
              onClick={() => navigate("/admin/donors")}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-0.5"
            >
              Manage Donors <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3.5">
            {stats?.topDonors?.length > 0 ? (
              stats.topDonors.map((donor, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-all text-sm border border-gray-100/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center font-extrabold text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-gray-800">{donor.name}</div>
                      <div className="text-[11px] text-gray-500">Group: {donor.bloodGroup} · Last: {donor.lastDonation}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-800 block">{donor.donations}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">donations</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">No donor activity recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard
          icon={<Users className="w-5 h-5" />}
          title="Users Settings"
          description="Manage active/inactive accounts"
          onClick={() => navigate("/admin/users")}
          color="purple"
        />
        <QuickActionCard
          icon={<Hospital className="w-5 h-5" />}
          title="Verify Facilities"
          description="Approve new hospital requests"
          onClick={() => navigate("/admin/verification")}
          color="blue"
        />
        <QuickActionCard
          icon={<Droplet className="w-5 h-5" />}
          title="Global Stock"
          description="Blood inventory & component audit"
          onClick={() => navigate("/admin/blood-inventory")}
          color="green"
        />
        <QuickActionCard
          icon={<Mail className="w-5 h-5" />}
          title="User Messages"
          description="Awaiting email responses"
          onClick={() => navigate("/admin/messages")}
          color="red"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
