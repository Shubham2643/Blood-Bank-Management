import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  LogOut,
  Menu,
  X,
  User,
  BarChart3,
  Droplet,
  Activity,
  History,
  Building,
  Shield,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Loader2,
  Search,
  Home,
  Users,
  Mail,
  Phone,
  Clock,
  MapPin,
  Heart,
  Award,
  TrendingUp,
  CheckCircle,
  FileText,
} from "lucide-react";
import { getUser, logout, getAuthToken } from "../../utils/auth";
import { authApi, adminApi } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config/env.js";

const DashboardLayout = ({ userRole = "donor" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [adminMetrics, setAdminMetrics] = useState({
    verification: 0,
    users: 0,
    donors: 0,
    facilities: 0,
    bloodInventory: 0,
    bloodRequests: 0,
    camps: 0,
    messages: 0,
    reports: 0,
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);
  const notificationRef = useRef(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  const navigate = useNavigate();
  const location = useLocation();

  const getGradientByRole = () => {
    if (userRole === "donor") return "from-red-600 to-rose-600";
    if (userRole === "hospital") return "from-blue-600 to-sky-600";
    if (userRole === "blood-lab") return "from-emerald-600 to-teal-600";
    if (userRole === "admin") return "from-purple-600 to-indigo-600";
    return "from-slate-700 to-slate-900";
  };

  const renderTitle = () => {
    const title = config.title;
    if (!title) return null;
    return (
      <h1 className={`text-lg sm:text-xl font-extrabold bg-gradient-to-r ${getGradientByRole()} bg-clip-text text-transparent tracking-tight leading-tight flex items-center`}>
        {title}
      </h1>
    );
  };

  // Blood Bank Theme Colors
  const theme = {
    primary: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    accent: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
  };

  // Enhanced Sidebar menus with icons and badges
  const menuConfig = {
    donor: {
      title: "Blood Donor Portal",
      subtitle: "Be a Hero, Save Lives",
      shortTitle: "Donor",
      icon: User,
      color: "red",
      stats: { label: "Next Donation", value: "Eligible" },
      items: [
        {
          path: "/donor",
          label: "Dashboard",
          icon: BarChart3,
          badge: null,
          description: "Overview of your donations",
        },
        {
          path: "/donor/profile",
          label: "My Profile",
          icon: User,
          badge: null,
          description: "Manage your information",
        },
        {
          path: "/donor/history",
          label: "Donation History",
          icon: History,
          badge: "New",
          description: "View past donations",
        },
        {
          path: "/donor/camps",
          label: "Blood Camps",
          icon: Calendar,
          badge: null,
          description: "Find nearby camps",
        },
        {
          path: "/donor/certificates",
          label: "Certificates",
          icon: Award,
          badge: null,
          description: "Download certificates",
        },
      ],
    },
    hospital: {
      title: "Hospital Management",
      subtitle: "Blood Request & Inventory",
      shortTitle: "Hospital",
      icon: Building,
      color: "blue",
      stats: { label: "Blood Units", value: "Critical" },
      items: [
        {
          path: "/hospital",
          label: "Dashboard",
          icon: BarChart3,
          badge: null,
          description: "Hospital overview",
        },
        {
          path: "/hospital/blood-request-create",
          label: "Blood Requests",
          icon: FileText,
          badge: "Urgent",
          description: "Request blood units",
        },
        {
          path: "/hospital/inventory",
          label: "Inventory",
          icon: Droplet,
          badge: null,
          description: "Track blood stock",
        },
        {
          path: "/hospital/donors",
          label: "Donor Directory",
          icon: Users,
          badge: null,
          description: "Find donors",
        },
        {
          path: "/hospital/profile",
          label: "Profile",
          icon: User,
          badge: null,
          description: "Hospital profile",
        },
        {
          path: "/hospital/blood-request-history",
          label: "Request History",
          icon: History,
          badge: null,
          description: "View past requests",
        },
      ],
    },
    "blood-lab": {
      title: "Blood Lab Center",
      subtitle: "Testing & Quality Control",
      shortTitle: "Lab",
      icon: Activity,
      color: "green",
      items: [
        {
          path: "/lab",
          label: "Dashboard",
          icon: BarChart3,
          badge: null,
          description: "Lab overview",
        },
        {
          path: "/lab/inventory",
          label: "Inventory",
          icon: Droplet,
          badge: null,
          description: "Manage blood stock",
        },
        {
          path: "/lab/donor",
          label: "Donors",
          icon: Users,
          badge: null,
          description: "Manage donors",
        },
        {
          path: "/lab/camps",
          label: "Camps",
          icon: Calendar,
          badge: null,
          description: "Organize camps",
        },
        {
          path: "/lab/camp-donations",
          label: "Camp Donations",
          icon: Heart,
          badge: "Vitals",
          description: "Check-in registered camp donors",
        },
        {
          path: "/lab/testing",
          label: "Testing & Screening",
          icon: Shield,
          badge: "Mandatory",
          description: "Mandatory screening tests on bags",
        },
        {
          path: "/lab/requests",
          label: "Requests",
          icon: FileText,
          badge: null,
          description: "Blood requests",
        },
        {
          path: "/lab/profile",
          label: "Profile",
          icon: User,
          badge: null,
          description: "Lab information",
        },
      ],
    },
    admin: {
      title: "Admin Panel",
      subtitle: "System Administration",
      shortTitle: "Admin",
      icon: Shield,
      color: "purple",
      stats: { label: "Users", value: "1,234" },
      items: [
        {
          path: "/admin",
          label: "Overview",
          icon: BarChart3,
          badge: null,
          description: "System overview",
        },
        {
          path: "/admin/verification",
          label: "Verification",
          icon: Shield,
          badge: null,
          description: "Verify facilities",
        },
        {
          path: "/admin/users",
          label: "Users",
          icon: Users,
          badge: null,
          description: "Manage users",
        },
        {
          path: "/admin/donors",
          label: "Donors",
          icon: Heart,
          badge: null,
          description: "Manage donors",
        },
        {
          path: "/admin/facilities",
          label: "Facilities",
          icon: Building,
          badge: null,
          description: "Manage facilities",
        },
        {
          path: "/admin/blood-inventory",
          label: "Blood Inventory",
          icon: Droplet,
          badge: null,
          description: "Global blood inventory",
        },
        {
          path: "/admin/blood-requests",
          label: "Blood Requests",
          icon: FileText,
          badge: null,
          description: "Manage blood requests",
        },
        {
          path: "/admin/camps",
          label: "Camps",
          icon: Calendar,
          badge: null,
          description: "Manage blood camps",
        },
        {
          path: "/admin/messages",
          label: "Messages",
          icon: Mail,
          badge: null,
          description: "Contact messages",
        },
        {
          path: "/admin/reports",
          label: "Reports",
          icon: TrendingUp,
          badge: null,
          description: "System reports",
        },
      ],
    },
  };

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);

    const user = getUser();
    if (!user) {
      logout();
      navigate("/login");
      return;
    }

    try {
      // Fetch fresh user data
      const response = await authApi.getProfile();
      const data = response.data;
      const profileData = data.data || data;
      const user = profileData.user || profileData;

      if (
        !user?.role ||
        user.role.toLowerCase() !== userRole.toLowerCase()
      ) {
        toast.error("Unauthorized access");
        logout();
        navigate("/login");
        return;
      }

      setUserData(user);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  }, [userRole, navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const handleUserUpdate = () => {
      fetchUserData();
    };
    window.addEventListener("user-profile-updated", handleUserUpdate);
    return () => {
      window.removeEventListener("user-profile-updated", handleUserUpdate);
    };
  }, [fetchUserData]);

  const fetchAdminMetrics = useCallback(async () => {
    if (userRole !== "admin") return;
    try {
      const response = await adminApi.getSidebarMetrics();
      if (response.data?.success) {
        setAdminMetrics(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch admin sidebar metrics:", error);
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole !== "admin" || !userData) return;

    fetchAdminMetrics();

    const token = getAuthToken();
    if (!token) return;

    const socket = io(`${SOCKET_URL}/admin`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("DashboardLayout: Connected to admin socket updates");
    });

    socket.on("admin-sidebar-metrics", (metrics) => {
      setAdminMetrics(metrics);
    });

    const events = [
      "new-facility-registration",
      "new-donor-registration",
      "new-blood-request",
      "admin-stats-update",
    ];
    events.forEach((event) => {
      socket.on(event, () => {
        fetchAdminMetrics();
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [userRole, userData, fetchAdminMetrics]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const normalizedRole = userRole?.toLowerCase();
  const config = menuConfig[normalizedRole] || {
    title: "Dashboard",
    subtitle: "Welcome",
    shortTitle: "App",
    icon: BarChart3,
    color: "red",
    items: [],
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

  const getBadgeValue = (label) => {
    if (userRole !== "admin") return null;
    switch (label) {
      case "Verification":
        return adminMetrics.verification > 0 ? adminMetrics.verification.toString() : null;
      case "Users":
        return adminMetrics.users > 0 ? adminMetrics.users.toLocaleString() : null;
      case "Donors":
        return adminMetrics.donors > 0 ? adminMetrics.donors.toLocaleString() : null;
      case "Facilities":
        return adminMetrics.facilities > 0 ? adminMetrics.facilities.toLocaleString() : null;
      case "Blood Inventory":
        return adminMetrics.bloodInventory > 0 ? `${adminMetrics.bloodInventory} units` : null;
      case "Blood Requests":
        return adminMetrics.bloodRequests > 0 ? adminMetrics.bloodRequests.toString() : null;
      case "Camps":
        return adminMetrics.camps > 0 ? adminMetrics.camps.toString() : null;
      case "Messages":
        return adminMetrics.messages > 0 ? adminMetrics.messages.toString() : null;
      case "Reports":
        return adminMetrics.reports > 0 ? adminMetrics.reports.toString() : null;
      default:
        return null;
    }
  };

  const getBadgeColor = (badge, label) => {
    if (userRole === "admin") {
      if (label === "Verification") return "bg-amber-500 text-white font-bold";
      if (label === "Blood Requests") return "bg-rose-500 text-white font-bold animate-pulse";
      if (label === "Messages") return "bg-indigo-500 text-white font-bold";
      if (label === "Blood Inventory") return "bg-emerald-500 text-white font-bold";
      if (label === "Camps") return "bg-sky-500 text-white font-bold";
      return "bg-slate-500 text-white font-bold";
    }
    if (badge === "New") return "bg-green-500 text-white font-bold";
    if (badge === "Urgent") return "bg-red-500 text-white font-bold";
    if (badge === "Critical") return "bg-orange-500 text-white font-bold";
    return "bg-blue-500 text-white font-bold";
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">
            Loading Dashboard
          </h2>
          <p className="text-gray-500 mt-2">
            Preparing your personalized experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 to-white">
      <header
        className={`flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-100/80 px-4 sm:px-6 py-4 sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-[0_4px_20px_rgba(239,68,68,0.03)] border-red-100/50 bg-white/80" : "shadow-sm shadow-slate-100/20"
        }`}
      >
        {/* Left Section */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-red-50/80 hover:text-red-600 border border-slate-100 transition-all"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
 
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 via-rose-500 to-rose-600 text-white shadow-md shadow-red-500/10">
              <config.icon size={18} />
            </div>
            <div className="hidden sm:block">
              {renderTitle()}
              <p className={`text-[10px] font-semibold tracking-wide mt-0.5 ${
                userRole === "donor" ? "text-rose-500/70" :
                userRole === "hospital" ? "text-sky-500/70" :
                userRole === "blood-lab" ? "text-teal-500/70" :
                userRole === "admin" ? "text-indigo-500/70" :
                "text-slate-400"
              }`}>
                {config.subtitle}
              </p>
            </div>
          </div>
        </div>
 
        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Search */}
          <div className="hidden md:block relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors duration-300 group-focus-within:text-red-500 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-12 py-2.5 bg-slate-50/80 backdrop-blur-xl border border-slate-200/80 hover:border-slate-300 hover:bg-white rounded-2xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:bg-white focus:ring-[3px] focus:ring-red-500/15 focus:border-red-400 focus:outline-none w-64 focus:w-96 transition-all duration-300 shadow-sm hover:shadow"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none transition-opacity duration-300 group-focus-within:opacity-0">
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white/80 border border-slate-200 rounded-md shadow-sm">
                {isMac ? <span className="text-xs">⌘</span> : <span className="text-[9px] font-medium mr-[1px]">Ctrl</span>}K
              </kbd>
            </div>
          </div>
 
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-xl text-slate-500 hover:text-red-600 hover:bg-white hover:shadow-sm hover:border-slate-300 focus:ring-[3px] focus:ring-red-500/15 focus:border-red-400 transition-all duration-300 shadow-sm"
          >
            <Search size={18} />
          </button>
 
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl border border-slate-100/80 bg-slate-50/30 hover:bg-red-50/40 hover:border-red-100/50 text-slate-500 hover:text-red-600 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md shadow-red-500/20 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
 
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right animate-scale-in">
                <div className="p-3.5 bg-red-50/50 border-b border-red-100/60 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const Icon = getNotificationIcon(notif.type);
                      return (
                        <div
                          key={notif._id || notif.id}
                          className={`p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all duration-200 ${
                            !notif.read ? "bg-red-50/30 border border-red-50/20" : "border border-transparent"
                          }`}
                          onClick={() => markAsRead(notif._id || notif.id)}
                        >
                          <div className="flex gap-3">
                            <div className={`p-1.5 rounded-lg ${
                              notif.type === "success" ? "bg-green-50" : notif.type === "warning" ? "bg-yellow-50" : "bg-blue-50"
                            }`}>
                              <Icon
                                className={`w-4 h-4 ${
                                  notif.type === "success"
                                    ? "text-green-600"
                                    : notif.type === "warning"
                                      ? "text-yellow-600"
                                      : "text-blue-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">
                                {notif.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                {formatTimeAgo(notif.createdAt) || notif.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm font-medium">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
 
          {/* User Profile */}
          <div 
            onClick={() => navigate(`/${userRole}/profile`)}
            className="flex items-center gap-2.5 p-1 pr-3 rounded-xl border border-slate-100/80 bg-slate-50/30 hover:bg-red-50/30 hover:border-red-100/50 cursor-pointer transition-all duration-300 group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-rose-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-red-500/15">
                {(userData?.name || userData?.fullName || "U").charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="hidden lg:block text-left">
              <span className="font-bold block text-xs text-slate-700 group-hover:text-red-600 transition-colors leading-tight">
                {userData?.name || userData?.fullName || "User"}
              </span>
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1 mt-0.5">
                {userRole.replace("-", " ")}
              </span>
            </div>
          </div>
 
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/30 text-slate-400 hover:text-red-600 hover:bg-red-50/40 hover:border-red-100/50 transition-all duration-300 hover:scale-105 hidden sm:block cursor-pointer"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden p-4 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto pt-14 lg:pt-0 ${
            sidebarCollapsed ? "w-16" : "w-64"
          } bg-white shadow-xl border-r border-red-100 transition-all duration-300 ease-in-out flex flex-col transform lg:transform-none`}
        >
          {/* Sidebar Header */}
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center p-2" : "justify-between p-4"} border-b border-red-100`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <config.icon size={20} className="text-red-600" />
                </div>
                <div>
                  <h2
                    className="font-bold text-sm"
                    style={{ color: theme.primary[700] }}
                  >
                    {config.shortTitle}
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: theme.secondary[500] }}
                  >
                    Portal
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-red-100 transition-colors"
              style={{ color: theme.primary[600] }}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>
          </div>

          {/* User Quick Info */}
          {!sidebarCollapsed && userData && (
            <div className="p-4 border-b border-red-100 bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                  {userData.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                     {userData.name}
                  </p>
                  {config.stats && (
                    <p className="text-xs text-gray-500">
                      {config.stats.label}:{" "}
                      <span className="font-semibold text-red-600">
                        {config.stats.value}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className={`flex-1 ${sidebarCollapsed ? "p-2" : "p-4"} overflow-y-auto`}>
            <div className="flex flex-col gap-1">
              {config.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const badge = userRole === "admin" ? getBadgeValue(item.label) : item.badge;
                return (
                  <div key={item.path} className="relative group">
                    <button
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center ${
                        sidebarCollapsed ? "justify-center p-2.5" : "gap-3 p-3"
                      } w-full min-h-[44px] rounded-xl transition-all duration-200 ${
                        isActive
                          ? "shadow-md transform scale-[1.02] text-white"
                          : "hover:shadow-md hover:transform hover:scale-[1.02] hover:bg-red-50 text-gray-700 hover:text-red-700"
                      }`}
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${theme.primary[500]}, ${theme.primary[600]})`
                          : "transparent",
                      }}
                      title={sidebarCollapsed ? item.label : ""}
                    >
                      <Icon
                        size={20}
                        className="flex-shrink-0"
                        style={{
                          color: isActive ? "white" : theme.primary[600],
                        }}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left whitespace-nowrap text-sm">
                            {item.label}
                          </span>
                          {badge && (
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(badge, item.label)}`}
                            >
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && badge && (
                        <span
                          className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${getBadgeColor(badge, item.label).replace("text-white", "")}`}
                        />
                      )}
                    </button>

                    {/* Tooltip for collapsed sidebar */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-800">
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-[10px] opacity-75 mt-0.5">
                          {item.description}
                        </div>
                        {badge && (
                          <div
                            className={`mt-1.5 text-[10px] ${getBadgeColor(badge, item.label)} inline-block px-1.5 py-0.5 rounded font-bold`}
                          >
                            {badge}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer Section */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-red-100">
              <div className="p-3 rounded-lg text-center bg-gradient-to-br from-red-50 to-red-100">
                <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">
                  Blood Bank MS
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Save Lives, Donate Blood
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 transition-all duration-300 min-h-[calc(100vh-80px)]">
          <div className="h-full overflow-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
            {/* Page Header with Breadcrumb */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-1.5 hover:text-red-600 transition-colors focus:outline-none cursor-pointer"
                  title="Back to Main Home Page"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
                <ChevronRight className="w-3 h-3" />
                <button
                  onClick={() => navigate(`/${userRole}`)}
                  className="hover:text-red-600 transition-colors focus:outline-none cursor-pointer"
                  title={`Back to ${config.title} Dashboard`}
                >
                  {config.title}
                </button>
                <ChevronRight className="w-3 h-3" />
                <span className="text-red-600 font-medium">
                  {config.items.find((item) => item.path === location.pathname)
                    ?.label || "Dashboard"}
                </span>
              </div>
            </div>

            {/* Render Child Routes */}
            <Outlet context={{ userData, theme, config }} />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Footer Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-red-100 shadow-lg z-40">
        <div className="flex justify-around items-center p-2">
          {config.items.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const badge = userRole === "admin" ? getBadgeValue(item.label) : item.badge;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 min-h-[48px] rounded-lg transition-all flex-1 mx-0.5 ${
                  isActive ? "bg-red-50 text-red-600" : "text-gray-600"
                }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  )}
                </div>
                <span className="text-[10px] sm:text-xs mt-1 truncate max-w-full">
                  {item.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
