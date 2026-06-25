import { useState, useEffect } from "react";
import {
  Users,
  Hospital,
  Droplet,
  Calendar,
  Heart,
  TrendingUp,
  Activity,
  Shield,
  Beaker,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  Eye,
  MoreVertical,
  FileText,
  Mail,
  Phone,
  MapPin,
  Award,
  Star,
  Zap,
  Bell,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { adminApi } from "../../services/api.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
  ArcElement,
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [selectedChart, setSelectedChart] = useState("line");
  const [selectedBloodChart, setSelectedBloodChart] = useState("doughnut"); // New state for blood chart type
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // States for contact messages
  const [activeTab, setActiveTab] = useState("overview");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchStats = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);

      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await adminApi.getDashboard();
      const data = res.data?.data || res.data;

      // Format time for recent activity
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

      // Build real-time dashboard state from backend data
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
      };

      // Format recent activity times
      const formattedActivity = (data?.recentActivity || []).map((activity) => ({
        ...activity,
        time: formatTimeAgo(activity.time),
      }));

      setStats(dashboardData);
      setRecentActivities(formattedActivity);
      setAlerts(data?.alerts || []);

      if (showToast) {
        toast.success("Dashboard updated successfully!");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchContactMessages = async (showToast = false) => {
    try {
      setLoadingMessages(true);
      const res = await adminApi.getContactMessages();
      const messagesData = res.data?.data || res.data || [];
      setMessages(messagesData);
      if (showToast) {
        toast.success("Messages updated successfully!");
      }
    } catch (err) {
      console.error("Fetch contact messages error:", err);
      toast.error("Failed to load contact messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    try {
      setSendingReply(true);
      const res = await adminApi.replyToContactMessage(selectedMessage._id, {
        replyText: replyText.trim(),
      });
      toast.success("Reply email sent successfully!");
      
      const updatedMessage = res.data?.data || res.data;
      if (updatedMessage && updatedMessage._id) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
        );
        setSelectedMessage(updatedMessage);
      } else {
        await fetchContactMessages();
        setSelectedMessage(null);
      }
      setReplyText("");
    } catch (err) {
      console.error("Send reply error:", err);
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const openReplyModal = (message) => {
    setSelectedMessage(message);
    setReplyText("");
  };

  const closeReplyModal = () => {
    if (sendingReply) return;
    setSelectedMessage(null);
    setReplyText("");
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (msg.message && msg.message.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "replied" && msg.replied) ||
      (statusFilter === "pending" && !msg.replied);

    const matchesType =
      typeFilter === "all" || msg.inquiryType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "emergency":
        return "bg-red-50 text-red-700 border border-red-200";
      case "donation":
        return "bg-green-50 text-green-700 border border-green-200";
      case "camp":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "partnership":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "feedback":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  // Chart configurations
  const lineChartData = {
    labels: stats?.chartData?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Donations",
        data: stats?.chartData?.donations || [65, 78, 90, 85, 92, 88, 95],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
      {
        label: "Requests",
        data: stats?.chartData?.requests || [45, 52, 48, 60, 55, 42, 38],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // Bar chart for blood type distribution
  const barChartData = {
    labels: stats?.bloodTypeDistribution?.labels || ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    datasets: [
      {
        label: "Inventory %",
        data: stats?.bloodTypeDistribution?.data || [28, 7, 20, 5, 35, 8, 4, 3],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(239, 68, 68, 0.6)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(16, 185, 129, 0.6)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(245, 158, 11, 0.6)",
        ],
        borderColor: "white",
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: stats?.bloodTypeDistribution?.labels || ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    datasets: [
      {
        data: stats?.bloodTypeDistribution?.data || [28, 7, 20, 5, 35, 8, 4, 3],
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
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Percentage (%)",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">
            Loading Admin Dashboard
          </h2>
          <p className="text-gray-500 mt-2">Analyzing system data...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({
    icon,
    label,
    value,
    subtitle,
    trend,
    color = "red",
    onClick,
  }) => {
    const colorClasses = {
      red: {
        border: "border-l-red-400",
        bg: "bg-red-100",
        text: "text-red-600",
        hover: "hover:bg-red-50",
      },
      blue: {
        border: "border-l-blue-400",
        bg: "bg-blue-100",
        text: "text-blue-600",
        hover: "hover:bg-blue-50",
      },
      green: {
        border: "border-l-green-400",
        bg: "bg-green-100",
        text: "text-green-600",
        hover: "hover:bg-green-50",
      },
      purple: {
        border: "border-l-purple-400",
        bg: "bg-purple-100",
        text: "text-purple-600",
        hover: "hover:bg-purple-50",
      },
      amber: {
        border: "border-l-amber-400",
        bg: "bg-amber-100",
        text: "text-amber-600",
        hover: "hover:bg-amber-50",
      },
    };

    const colors = colorClasses[color] || colorClasses.red;

    return (
      <div
        className={`bg-white rounded-2xl shadow-lg border-l-4 ${colors.border} p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${colors.hover}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-800">
              {value?.toLocaleString()}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3 text-xs">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-green-600 font-medium">{trend}%</span>
            <span className="text-gray-500">from last month</span>
          </div>
        )}
      </div>
    );
  };

  const AlertCard = ({ alert }) => {
    const severityColors = {
      high: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: AlertTriangle,
      },
      medium: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        icon: Clock,
      },
      low: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: Bell,
      },
    };

    const colors = severityColors[alert.severity] || severityColors.medium;
    const Icon = colors.icon;

    return (
      <div
        className={`${colors.bg} border ${colors.border} rounded-xl p-4 flex items-start gap-3`}
      >
        <Icon className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`font-medium ${colors.text}`}>{alert.message}</p>
          <p className="text-sm text-gray-600 mt-1">{alert.location}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
        >
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
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div
          className={`w-2 h-2 rounded-full ${statusColors[activity.status]?.split(" ")[1] || "bg-gray-300"}`}
        ></div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-800">{activity.action}</p>
            <span className="text-xs text-gray-500">{activity.time}</span>
          </div>
          <p className="text-sm text-gray-600">by {activity.user}</p>
        </div>
        <Eye className="w-4 h-4 text-gray-400 hover:text-red-600 cursor-pointer transition-colors" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive overview of the blood bank management system
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {activeTab === "overview" && (
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              )}

              <button
                onClick={() => {
                  if (activeTab === "overview") {
                    fetchStats(true);
                  } else {
                    fetchContactMessages(true);
                  }
                }}
                disabled={activeTab === "overview" ? refreshing : loadingMessages}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    (activeTab === "overview" ? refreshing : loadingMessages) ? "animate-spin" : ""
                  }`}
                />
                {(activeTab === "overview" ? refreshing : loadingMessages) ? "Refreshing..." : "Refresh"}
              </button>

              {activeTab === "overview" && (
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>
          </div>

          {/* Alerts Section */}
          {activeTab === "overview" && alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border border-gray-200 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-5 font-semibold text-sm rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Activity className="w-4 h-4" />
            System Overview
          </button>
          <button
            onClick={() => {
              setActiveTab("messages");
              fetchContactMessages();
            }}
            className={`py-2 px-5 font-semibold text-sm rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "messages"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Mail className="w-4 h-4" />
            Contact Messages
          </button>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="Total Donors"
                value={stats?.totalDonors ?? 0}
                subtitle="Active donors"
                trend="+12"
                color="red"
              />
              <StatCard
                icon={<Hospital className="w-6 h-6" />}
                label="Facilities"
                value={stats?.totalFacilities ?? 0}
                subtitle="Hospitals & Labs"
                trend="+5"
                color="blue"
              />
              <StatCard
                icon={<Droplet className="w-6 h-6" />}
                label="Total Donations"
                value={stats?.totalDonations ?? 0}
                subtitle="Blood units"
                trend="+8"
                color="green"
              />
              <StatCard
                icon={<Calendar className="w-6 h-6" />}
                label="Upcoming Camps"
                value={stats?.upcomingCamps ?? 0}
                subtitle="This month"
                trend="+3"
                color="purple"
              />
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Activity Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-600" />
                    Activity Overview
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedChart("line")}
                      className={`p-2 rounded-lg ${selectedChart === "line" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedChart("bar")}
                      className={`p-2 rounded-lg ${selectedChart === "bar" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  {stats && (selectedChart === "line" ? (
                    <Line data={lineChartData} options={chartOptions} />
                  ) : (
                    <Bar data={lineChartData} options={chartOptions} />
                  ))}
                </div>
              </div>

              {/* Blood Type Distribution - Now using barChartData */}
              <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-red-600" />
                    Blood Type Distribution
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedBloodChart("doughnut")}
                      className={`p-2 rounded-lg ${selectedBloodChart === "doughnut" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
                      title="Doughnut Chart"
                    >
                      <PieChart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedBloodChart("bar")}
                      className={`p-2 rounded-lg ${selectedBloodChart === "bar" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
                      title="Bar Chart"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  {stats && (selectedBloodChart === "doughnut" ? (
                    <Doughnut
                      data={doughnutData}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: { position: "right" },
                        },
                      }}
                    />
                  ) : (
                    <Bar data={barChartData} options={barChartOptions} />
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity and Top Donors */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    Recent Activity
                  </h2>
                  <button className="text-sm text-red-600 hover:text-red-700">
                    View all
                  </button>
                </div>
                <div className="space-y-2">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Donors */}
              <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-red-600" />
                    Top Donors
                  </h2>
                  <button className="text-sm text-red-600 hover:text-red-700">
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {stats?.topDonors?.length > 0 ? (
                    stats.topDonors.map((donor, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                            {donor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{donor.name}</p>
                            <p className="text-xs text-gray-500">
                              {donor.bloodGroup} · Last: {donor.lastDonation}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{donor.donations}</p>
                          <p className="text-xs text-gray-500">donations</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No donation records yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4">
              <QuickActionCard
                icon={<Users className="w-5 h-5" />}
                title="Manage Donors"
                description="View and manage donor database"
                href="/admin/donors"
                color="red"
              />
              <QuickActionCard
                icon={<Hospital className="w-5 h-5" />}
                title="Manage Facilities"
                description="Approve and manage facilities"
                href="/admin/facilities"
                color="blue"
              />
              <QuickActionCard
                icon={<Droplet className="w-5 h-5" />}
                title="Donation Reports"
                description="View donation analytics"
                href="/admin/reports"
                color="green"
              />
              <QuickActionCard
                icon={<Calendar className="w-5 h-5" />}
                title="Blood Camps"
                description="Monitor camp activities"
                href="/admin/camps"
                color="purple"
              />
            </div>
          </>
        ) : (
          /* Messages Grid */
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Inquiry & Feedback Messages</h2>
                <p className="text-sm text-gray-500 mt-1">Read and reply to user inquiries, emergency notifications, and camp partnerships.</p>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full md:w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="replied">Replied</option>
                  <option value="pending">Pending Reply</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="emergency">Emergency</option>
                  <option value="donation">Donation</option>
                  <option value="camp">Camp</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
            </div>

            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm mt-3">Fetching contact messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">No messages found</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mt-1">
                  There are no messages matching your current search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Message Summary</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredMessages.map((msg) => (
                      <tr key={msg._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-800">{msg.name}</div>
                          <div className="text-xs text-gray-500 break-all">{msg.email}</div>
                          {msg.phone && <div className="text-xs text-gray-400">{msg.phone}</div>}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getTypeBadgeClass(msg.inquiryType)}`}>
                            {msg.inquiryType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-gray-800 truncate">{msg.subject || "No Subject"}</div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">{msg.message}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {msg.replied ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Replied ({msg.replies?.length || 0})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openReplyModal(msg)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                              msg.replied
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                                : "bg-red-600 text-white hover:bg-red-700 hover:shadow"
                            }`}
                          >
                            {msg.replied ? "View & Reply" : "Reply"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reply Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-red-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-bold text-gray-800">Message Reply Portal</h3>
                </div>
                <button
                  onClick={closeReplyModal}
                  className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="block text-gray-500 uppercase font-semibold">Sender</span>
                    <span className="block font-semibold text-gray-800 mt-0.5 truncate">{selectedMessage.name}</span>
                  </div>
                  <div className="col-span-1">
                    <span className="block text-gray-500 uppercase font-semibold">Email</span>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="block font-semibold text-red-600 hover:underline mt-0.5 break-all"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <span className="block text-gray-500 uppercase font-semibold">Phone</span>
                    <span className="block font-semibold text-gray-800 mt-0.5">{selectedMessage.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 uppercase font-semibold">Submitted At</span>
                    <span className="block font-semibold text-gray-800 mt-0.5">
                      {new Date(selectedMessage.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-400">User's Message</h4>
                  <div className="bg-red-50 bg-opacity-50 border border-red-100 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 text-sm mb-1">{selectedMessage.subject || "No Subject"}</p>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Reply History */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400">Previous Replies</h4>
                    <div className="space-y-3">
                      {selectedMessage.replies.map((reply, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm relative">
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                            <span className="font-semibold">Administrator Response</span>
                            <span>
                              {new Date(reply.repliedAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{reply.replyText}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Reply Form */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label htmlFor="replyText" className="block text-xs font-bold uppercase text-gray-400">
                    Write Response Email
                  </label>
                  <textarea
                    id="replyText"
                    rows="5"
                    placeholder="Type your response to the user. This message will be recorded in the database and sent directly to the user's email address..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none bg-white"
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={closeReplyModal}
                  disabled={sendingReply}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {sendingReply ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Reply...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Response
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon, title, description, href, color = "red" }) => {
  const colorClasses = {
    red: "hover:bg-red-50 border-red-200 text-red-600",
    blue: "hover:bg-blue-50 border-blue-200 text-blue-600",
    green: "hover:bg-green-50 border-green-200 text-green-600",
    purple: "hover:bg-purple-50 border-purple-200 text-purple-600",
  };

  return (
    <div
      onClick={() => (window.location.href = href)}
      className={`bg-white rounded-2xl shadow-lg border p-6 cursor-pointer transition-all hover:shadow-xl group ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-current bg-opacity-10`}>{icon}</div>
        <h3 className="font-semibold text-gray-800 group-hover:text-current transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex items-center justify-end text-sm group-hover:text-current">
        View <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
};

export default AdminDashboard;
