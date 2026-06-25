
import {
  Home,
  Heart,
  Building,
  Shield,
  FileText,
  MapPin,
  Award,
  Activity,
  UserPlus,
  LogIn,
  Download,
  Printer,
  Share2,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Globe,
  Link as LinkIcon,
  Code,
  Layout,
  Settings,
  History,
  BarChart3,
  X,
  Lock,
  Copy,
  Check,
  Grid,
  List,
  GitBranch,
  TrendingUp,
  Box,
  Image,
  Zap,
  Database,
  Layers,
  AlertCircle,
  Download as DownloadIcon,
  Printer as PrinterIcon,
  Share2 as ShareIcon,
  ChevronUp as ChevronUpIcon,
  SortAsc,
  SortDesc,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Mail as MailIcon,
  Package,
  ArrowRight as ArrowRightIcon,
  Image as ImageIcon,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Scale as ScaleIcon,
  Layers as LayersIcon,
  FolderTree as FolderTreeIcon,
  GitBranch as GitBranchIcon,
  Wind as WindIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon,
  Thermometer as ThermometerIcon,
  Droplets as DropletsIcon,
  Leaf as LeafIcon,
  TreePine as TreePineIcon,
  Mountain as MountainIcon,
  Home as HomeIcon,
  Tent as TentIcon,
  Castle as CastleIcon,
  Church as ChurchIcon,
  Hospital as HospitalIcon,
  School as SchoolIcon,
  University as UniversityIcon,
  Landmark as LandmarkIcon,
  Store as StoreIcon,
  Factory as FactoryIcon,
  Warehouse as WarehouseIcon,
  Power as PowerIcon,
  Plug as PlugIcon,
  Cable as CableIcon,
  Satellite as SatelliteIcon,
  Antenna as AntennaIcon,
  Phone as PhoneIcon,
  MessageSquare as MessageSquareIcon,
  Send as SendIcon,
  CreditCard as CreditCardIcon,
  Package as PackageIcon,
  Truck as TruckIcon,
  Archive as ArchiveIcon,
  Cpu as CpuIcon,
  HardDrive as HardDriveIcon,
  Wifi as WifiIcon,
  Battery as BatteryIcon,
  Monitor as MonitorIcon2,
  Smartphone as SmartphoneIcon2,
  Tablet as TabletIcon2,
  Laptop as LaptopIcon2,
  Sun as SunIcon2,
  Moon as MoonIcon2,
  Cloud as CloudIcon2,
  Wind as WindIcon2,
  Droplets as DropletsIcon2,
  Thermometer as ThermometerIcon2,
  Leaf as LeafIcon2,
  TreePine as TreePineIcon2,
  Mountain as MountainIcon2,
  Tent as TentIcon2,
  Castle as CastleIcon2,
  Church as ChurchIcon2,
  Hospital as HospitalIcon2,
  School as SchoolIcon2,
  University as UniversityIcon2,
  Landmark as LandmarkIcon2,
  Store as StoreIcon2,
  Factory as FactoryIcon2,
  Warehouse as WarehouseIcon2,
  Power as PowerIcon2,
  Plug as PlugIcon2,
  Cable as CableIcon2,
  Satellite as SatelliteIcon2,
  Antenna as AntennaIcon2,
  Users2,
  Tent,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { API_BASE_URL } from "../../config/env.js";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// ==================== Configuration ====================
const CONFIG = {
  APP_NAME: "LifeDrop",
  API_VERSION: "2.1.0",
  BASE_URL: API_BASE_URL,
  COLORS: {
    primary: "#DC2626",
    secondary: "#4F46E5",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  },
  CATEGORIES: {
    public: { name: "Public", color: "#3B82F6", icon: Globe },
    auth: { name: "Authentication", color: "#8B5CF6", icon: Lock },
    donor: { name: "Donor Portal", color: "#DC2626", icon: Heart },
    hospital: { name: "Hospital Portal", color: "#10B981", icon: Building },
    lab: { name: "Lab Portal", color: "#F59E0B", icon: Activity },
    admin: { name: "Admin Portal", color: "#6B7280", icon: Shield },
    api: { name: "API", color: "#EC4899", icon: Code },
    utility: { name: "Utility", color: "#6B7280", icon: Settings },
  },
};

// ==================== Mock Data ====================
const generatePageNodes = () => [
  // Public Pages
  {
    id: "home",
    name: "Home",
    path: "/",
    description: "Landing page with platform overview",
    category: "public",
    icon: Home,
    color: CONFIG.CATEGORIES.public.color,
    protected: false,
    metadata: { version: "2.0", lastModified: "2024-01-15" },
  },
  {
    id: "about",
    name: "About Us",
    path: "/about",
    description: "Company mission and team",
    category: "public",
    icon: Users2,
    color: CONFIG.CATEGORIES.public.color,
    protected: false,
  },
  {
    id: "contact",
    name: "Contact",
    path: "/contact",
    description: "Get in touch with us",
    category: "public",
    icon: MailIcon,
    color: CONFIG.CATEGORIES.public.color,
    protected: false,
  },
  {
    id: "camps",
    name: "Find Camps",
    path: "/camps",
    description: "Search for blood donation camps",
    category: "public",
    icon: MapPin,
    color: CONFIG.CATEGORIES.public.color,
    protected: false,
  },
  {
    id: "emergency",
    name: "Emergency",
    path: "/emergency",
    description: "Emergency blood requests",
    category: "public",
    icon: AlertCircle,
    color: CONFIG.CATEGORIES.public.color,
    protected: false,
  },

  // Auth Pages
  {
    id: "login",
    name: "Login",
    path: "/login",
    description: "Sign in to your account",
    category: "auth",
    icon: LogIn,
    color: CONFIG.CATEGORIES.auth.color,
    protected: false,
  },
  {
    id: "register-donor",
    name: "Register as Donor",
    path: "/register/donor",
    description: "Create donor account",
    category: "auth",
    icon: UserPlus,
    color: CONFIG.CATEGORIES.auth.color,
    protected: false,
  },
  {
    id: "register-hospital",
    name: "Register as Hospital",
    path: "/register/hospital",
    description: "Register hospital account",
    category: "auth",
    icon: Building,
    color: CONFIG.CATEGORIES.auth.color,
    protected: false,
  },

  // Donor Portal
  {
    id: "donor-dashboard",
    name: "Donor Dashboard",
    path: "/donor",
    description: "Main donor interface",
    category: "donor",
    icon: Layout,
    color: CONFIG.CATEGORIES.donor.color,
    protected: true,
    roles: ["donor"],
    children: [
      {
        id: "donor-profile",
        name: "Profile",
        path: "/donor/profile",
        description: "Manage profile",
        category: "donor",
        icon: UserPlus,
        color: CONFIG.CATEGORIES.donor.color,
        protected: true,
      },
      {
        id: "donor-history",
        name: "Donation History",
        path: "/donor/history",
        description: "View past donations",
        category: "donor",
        icon: History,
        color: CONFIG.CATEGORIES.donor.color,
        protected: true,
      },
      {
        id: "donor-certificates",
        name: "Certificates",
        path: "/donor/certificates",
        description: "Download certificates",
        category: "donor",
        icon: Award,
        color: CONFIG.CATEGORIES.donor.color,
        protected: true,
      },
    ],
  },

  // Hospital Portal
  {
    id: "hospital-dashboard",
    name: "Hospital Dashboard",
    path: "/hospital",
    description: "Main hospital interface",
    category: "hospital",
    icon: Building,
    color: CONFIG.CATEGORIES.hospital.color,
    protected: true,
    roles: ["hospital"],
    children: [
      {
        id: "hospital-requests",
        name: "Blood Requests",
        path: "/hospital/blood-request-create",
        description: "Request blood units",
        category: "hospital",
        icon: FileText,
        color: CONFIG.CATEGORIES.hospital.color,
        protected: true,
      },
      {
        id: "hospital-inventory",
        name: "Inventory",
        path: "/hospital/inventory",
        description: "Manage blood stock",
        category: "hospital",
        icon: Package,
        color: CONFIG.CATEGORIES.hospital.color,
        protected: true,
      },
    ],
  },

  // Lab Portal
  {
    id: "lab-dashboard",
    name: "Lab Dashboard",
    path: "/lab",
    description: "Main laboratory interface",
    category: "lab",
    icon: Activity,
    color: CONFIG.CATEGORIES.lab.color,
    protected: true,
    roles: ["lab"],
    children: [
      {
        id: "lab-inventory",
        name: "Inventory",
        path: "/lab/inventory",
        description: "Manage blood inventory",
        category: "lab",
        icon: Database,
        color: CONFIG.CATEGORIES.lab.color,
        protected: true,
      },
      {
        id: "lab-camps",
        name: "Blood Camps",
        path: "/lab/camps",
        description: "Organize donation camps",
        category: "lab",
        icon: Tent,
        color: CONFIG.CATEGORIES.lab.color,
        protected: true,
      },
    ],
  },

  // Admin Portal
  {
    id: "admin-dashboard",
    name: "Admin Dashboard",
    path: "/admin",
    description: "System overview",
    category: "admin",
    icon: Shield,
    color: CONFIG.CATEGORIES.admin.color,
    protected: true,
    roles: ["admin"],
    children: [
      {
        id: "admin-verification",
        name: "Verification",
        path: "/admin/verification",
        description: "Verify facilities",
        category: "admin",
        icon: CheckCircle,
        color: CONFIG.CATEGORIES.admin.color,
        protected: true,
      },
      {
        id: "admin-analytics",
        name: "Analytics",
        path: "/admin/analytics",
        description: "Platform analytics",
        category: "admin",
        icon: BarChart3,
        color: CONFIG.CATEGORIES.admin.color,
        protected: true,
      },
    ],
  },
];

const generateApiEndpoints = () => [
  // Auth Endpoints
  {
    id: "auth-login",
    method: "POST",
    path: "/auth/login",
    description: "Authenticate user and get token",
    auth: false,
    rateLimit: "10/min",
    tags: ["auth"],
    version: "v2",
  },
  {
    id: "auth-register-donor",
    method: "POST",
    path: "/auth/register/donor",
    description: "Register new donor account",
    auth: false,
    rateLimit: "5/min",
    tags: ["auth", "donor"],
    version: "v2",
  },
  {
    id: "auth-refresh",
    method: "POST",
    path: "/auth/refresh",
    description: "Refresh access token",
    auth: true,
    rateLimit: "20/min",
    tags: ["auth"],
    version: "v2",
  },

  // Donor Endpoints
  {
    id: "donors-list",
    method: "GET",
    path: "/donors",
    description: "List all donors",
    auth: true,
    rateLimit: "100/min",
    cache: "5 min",
    tags: ["donors", "admin"],
    version: "v2",
  },
  {
    id: "donor-details",
    method: "GET",
    path: "/donors/:id",
    description: "Get donor details",
    auth: true,
    rateLimit: "100/min",
    cache: "1 min",
    tags: ["donors"],
    version: "v2",
  },

  // Hospital Endpoints
  {
    id: "hospitals-list",
    method: "GET",
    path: "/hospitals",
    description: "List all hospitals",
    auth: true,
    rateLimit: "100/min",
    cache: "10 min",
    tags: ["hospitals", "public"],
    version: "v2",
  },
  {
    id: "hospital-requests",
    method: "POST",
    path: "/hospitals/:id/requests",
    description: "Create blood request",
    auth: true,
    rateLimit: "30/min",
    tags: ["hospitals", "requests"],
    version: "v2",
  },

  // Blood Requests
  {
    id: "requests-list",
    method: "GET",
    path: "/requests",
    description: "List blood requests",
    auth: true,
    rateLimit: "100/min",
    cache: "1 min",
    tags: ["requests"],
    version: "v2",
  },
  {
    id: "requests-emergency",
    method: "GET",
    path: "/requests/emergency",
    description: "Get emergency requests",
    auth: false,
    rateLimit: "200/min",
    cache: "30 sec",
    tags: ["requests", "public"],
    version: "v2",
  },

  // Camps
  {
    id: "camps-list",
    method: "GET",
    path: "/camps",
    description: "List all camps",
    auth: false,
    rateLimit: "200/min",
    cache: "15 min",
    tags: ["camps", "public"],
    version: "v2",
  },
  {
    id: "camps-create",
    method: "POST",
    path: "/camps",
    description: "Create new camp",
    auth: true,
    rateLimit: "10/min",
    tags: ["camps", "lab"],
    version: "v2",
  },
];

// ==================== Components ====================

// Global Header & Footer imported from components

// Search Bar Component
const SearchBar = ({ value, onChange, onFocus, placeholder = "Search..." }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Focus management with useRef
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div
      className={`relative flex-1 transition-all duration-300 ${isFocused ? "scale-105" : ""}`}
    >
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all outline-none text-gray-900 shadow-lg"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, color, trend, icon: Icon }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          {Icon && <Icon className="w-6 h-6" style={{ color }} />}
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            <TrendingUp
              className={`w-4 h-4 ${trend < 0 ? "rotate-180" : ""}`}
            />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
};

// Page Card Component
const PageCard = ({ page, onCopy }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Intersection Observer for lazy loading with useRef and useEffect
  useEffect(() => {
    const currentElement = cardRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add a fade-in effect when card becomes visible
            entry.target.classList.add("opacity-100");
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    if (currentElement) {
      observer.observe(currentElement);
    }

    // Cleanup function uses the stored variable
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group hover:scale-105 transition-all duration-300 opacity-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(page.path)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 rounded-xl transition-all"
            style={{ backgroundColor: `${page.color}20` }}
          >
            <page.icon className="w-6 h-6" style={{ color: page.color }} />
          </div>
          {page.protected && (
            <div className="px-2 py-1 bg-purple-100 rounded-lg">
              <Lock className="w-4 h-4 text-purple-600" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-500 transition-colors">
          {page.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {page.description}
        </p>

        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${page.color}15`,
              color: page.color,
            }}
          >
            {CONFIG.CATEGORIES[page.category]?.name || page.category}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(page.path);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
            <ArrowRightIcon
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Tree View Component
const TreeView = ({ nodes, level = 0, onCopy }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const treeRef = useRef(null);

  // Auto-expand based on search with useEffect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "e") {
        // Ctrl+E to expand all nodes
        const allNodeIds = new Set();
        const collectIds = (nodeList) => {
          nodeList.forEach((node) => {
            if (node.children) {
              allNodeIds.add(node.id);
              collectIds(node.children);
            }
          });
        };
        collectIds(nodes);
        setExpandedNodes(allNodeIds);
        toast.success("All nodes expanded");
      } else if (e.ctrlKey && e.key === "c") {
        // Ctrl+C to collapse all nodes
        setExpandedNodes(new Set());
        toast.success("All nodes collapsed");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes]);

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  return (
    <div ref={treeRef} className="space-y-2">
      {nodes.map((node) => (
        <div key={node.id}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            style={{ marginLeft: level * 24 }}
          >
            <button
              onClick={() => toggleNode(node.id)}
              className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {expandedNodes.has(node.id) && node.children ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              )}
            </button>

            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: node.color }}
            />

            <div className="flex-1 flex items-center gap-3">
              <node.icon className="w-4 h-4 text-gray-500" />
              <button
                onClick={() => (window.location.href = node.path)}
                className="text-sm font-medium text-gray-900 hover:text-red-500 transition-colors"
              >
                {node.name}
              </button>
              <span className="text-xs text-gray-500 hidden md:inline">
                {node.path}
              </span>
            </div>

            {node.protected && <Lock className="w-3 h-3 text-purple-500" />}

            <button
              onClick={() => onCopy(node.path)}
              className="p-1 rounded-lg hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Copy className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          {expandedNodes.has(node.id) && node.children && (
            <TreeView nodes={node.children} level={level + 1} onCopy={onCopy} />
          )}
        </div>
      ))}
    </div>
  );
};

// API Card Component
const ApiCard = ({ endpoint }) => {
  const methodColors = {
    GET: "bg-green-100 text-green-700 border-green-200",
    POST: "bg-blue-100 text-blue-700 border-blue-200",
    PUT: "bg-yellow-100 text-yellow-700 border-yellow-200",
    DELETE: "bg-red-100 text-red-700 border-red-200",
    PATCH: "bg-purple-100 text-purple-700 border-purple-200",
  };

  const cardRef = useRef(null);

  // Highlight effect on hover with useRef
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      card.style.transform = "scale(1.05)";
      card.style.boxShadow =
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
    };

    const handleMouseLeave = () => {
      card.style.transform = "scale(1)";
      card.style.boxShadow =
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 text-xs font-mono rounded-full border ${methodColors[endpoint.method]}`}
            >
              {endpoint.method}
            </span>
            <code className="text-sm font-mono text-gray-800 break-all">
              {endpoint.path}
            </code>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{endpoint.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {endpoint.auth && (
            <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 rounded-full">
              <Lock className="w-3 h-3" />
              Auth
            </span>
          )}
          {endpoint.rateLimit && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
              <Zap className="w-3 h-3" />
              {endpoint.rateLimit}
            </span>
          )}
          {endpoint.cache && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full">
              <Database className="w-3 h-3" />
              {endpoint.cache}
            </span>
          )}
          <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full">
            v{endpoint.version}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {endpoint.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export Modal
const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState("json");
  const [includeApis, setIncludeApis] = useState(true);
  const [includePages, setIncludePages] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(true);
  const modalRef = useRef(null);

  // Handle click outside to close with useRef and useEffect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key with useEffect
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Export Sitemap</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["json", "xml", "csv"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    format === f
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
              <input
                type="checkbox"
                checked={includePages}
                onChange={(e) => setIncludePages(e.target.checked)}
                className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Include Pages</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
              <input
                type="checkbox"
                checked={includeApis}
                onChange={(e) => setIncludeApis(e.target.checked)}
                className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Include APIs</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
              <input
                type="checkbox"
                checked={prettyPrint}
                onChange={(e) => setPrettyPrint(e.target.checked)}
                className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Pretty Print</span>
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onExport(format, { includeApis, includePages, prettyPrint });
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== Main Component ====================
const Sitemap = () => {
  const [pages] = useState(generatePageNodes);
  const [apis] = useState(generateApiEndpoints);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedPath, setCopiedPath] = useState(null);
  const [stats] = useState({
    totalPages: 45,
    totalApis: 67,
    totalComponents: 128,
    totalAssets: 342,
    lastUpdated: new Date().toISOString(),
    uptime: 99.98,
    performance: 95,
    security: 98,
  });

  const navigate = useNavigate();
  const mainRef = useRef(null);

  // Scroll to top on mount with useEffect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Save scroll position with useRef and useEffect
  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        sessionStorage.setItem(
          "sitemapScrollPosition",
          mainRef.current.scrollTop,
        );
      }
    };

    const scrollPosition = sessionStorage.getItem("sitemapScrollPosition");
    if (scrollPosition && mainRef.current) {
      mainRef.current.scrollTop = parseInt(scrollPosition, 10);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Analytics tracking with useEffect
  useEffect(() => {
    // Track page view
    const trackPageView = () => {
      console.log("Page view tracked:", {
        page: "Sitemap",
        timestamp: new Date().toISOString(),
        viewMode,
        activeFilter,
        searchQuery: searchQuery || "none",
      });

      // Here you would typically send to your analytics service
      // analytics.track('Sitemap View', { viewMode, activeFilter });
    };

    trackPageView();
  }, [viewMode, activeFilter, searchQuery]);

  // Filter and sort pages
  const filteredPages = useMemo(() => {
    let filtered = pages;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (page) =>
          page.name.toLowerCase().includes(query) ||
          page.description.toLowerCase().includes(query) ||
          page.path.toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (activeFilter !== "all") {
      if (activeFilter === "public") {
        filtered = filtered.filter((page) => !page.protected);
      } else if (activeFilter === "protected") {
        filtered = filtered.filter((page) => page.protected);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [pages, searchQuery, activeFilter, sortOrder]);

  const filteredApis = useMemo(() => {
    let filtered = apis;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (api) =>
          api.description.toLowerCase().includes(query) ||
          api.path.toLowerCase().includes(query) ||
          api.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    filtered.sort((a, b) => {
      const comparison = a.path.localeCompare(b.path);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [apis, searchQuery, sortOrder]);

  // Handlers
  const handleCopyPath = useCallback((path) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    toast.success(`Copied: ${path}`);
    setTimeout(() => setCopiedPath(null), 2000);
  }, []);

  const handleExport = useCallback(
    (format, options) => {
      try {
        const data = {
          pages: options.includePages ? pages : [],
          apis: options.includeApis ? apis : [],
          metadata: {
            exportedAt: new Date().toISOString(),
            version: CONFIG.API_VERSION,
            app: CONFIG.APP_NAME,
          },
        };

        let content;
        let mimeType;
        let extension;

        if (format === "json") {
          content = JSON.stringify(data, null, options.prettyPrint ? 2 : 0);
          mimeType = "application/json";
          extension = "json";
        } else if (format === "xml") {
          content = `<?xml version="1.0" encoding="UTF-8"?>
<sitemap>
  <metadata>
    <exportedAt>${new Date().toISOString()}</exportedAt>
    <version>${CONFIG.API_VERSION}</version>
    <app>${CONFIG.APP_NAME}</app>
  </metadata>
  ${
    options.includePages
      ? "<pages>" +
        pages
          .map(
            (p) => `
    <page>
      <name>${p.name}</name>
      <path>${p.path}</path>
      <description>${p.description}</description>
      <category>${p.category}</category>
      <protected>${p.protected}</protected>
    </page>`,
          )
          .join("") +
        "</pages>"
      : ""
  }
  ${
    options.includeApis
      ? "<apis>" +
        apis
          .map(
            (a) => `
    <api>
      <method>${a.method}</method>
      <path>${a.path}</path>
      <description>${a.description}</description>
      <auth>${a.auth}</auth>
      <version>${a.version}</version>
    </api>`,
          )
          .join("") +
        "</apis>"
      : ""
  }
</sitemap>`;
          mimeType = "application/xml";
          extension = "xml";
        } else {
          const rows = [];
          if (options.includePages) {
            rows.push("Type,Name,Path,Description,Category,Protected");
            pages.forEach((p) => {
              rows.push(
                `Page,${p.name},${p.path},${p.description},${p.category},${p.protected}`,
              );
            });
          }
          if (options.includeApis) {
            rows.push("Type,Method,Path,Description,Auth,Version");
            apis.forEach((a) => {
              rows.push(
                `API,${a.method},${a.path},${a.description},${a.auth},${a.version}`,
              );
            });
          }
          content = rows.join("\n");
          mimeType = "text/csv";
          extension = "csv";
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sitemap-${new Date().toISOString().split("T")[0]}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success(`Exported as ${format.toUpperCase()}`);
      } catch (error) {
        toast.error("Export failed");
        console.error("Export error:", error);
      }
    },
    [pages, apis],
  );

  const handlePrint = useCallback(() => {
    window.print();
    toast.success("Print dialog opened");
  }, []);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${CONFIG.APP_NAME} Sitemap`,
          text: "Complete navigation guide",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Sharing failed");
      }
    }
  }, []);

  return (
    <div
      ref={mainRef}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50"
    >
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-500 rounded-full filter blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
              <Layers className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">
                Version {CONFIG.API_VERSION}
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              Site{" "}
              <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                Map
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Navigate through our complete platform architecture. Find pages,
              APIs, and resources with ease.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search pages, APIs, or paths..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Pages"
            value={stats.totalPages}
            icon={Layers}
            color={CONFIG.COLORS.primary}
            trend={12}
          />
          <StatsCard
            title="API Endpoints"
            value={stats.totalApis}
            icon={Code}
            color={CONFIG.COLORS.secondary}
            trend={8}
          />
          <StatsCard
            title="Components"
            value={stats.totalComponents}
            icon={Box}
            color={CONFIG.COLORS.success}
            trend={5}
          />
          <StatsCard
            title="Assets"
            value={stats.totalAssets}
            icon={Image}
            color={CONFIG.COLORS.warning}
            trend={-2}
          />
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-2xl shadow-lg">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { value: "all", label: "All", icon: Layers },
              { value: "public", label: "Public", icon: Globe },
              { value: "protected", label: "Protected", icon: Lock },
              { value: "api", label: "API", icon: Code },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeFilter === filter.value
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <filter.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{filter.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-5 h-5" />
              ) : (
                <SortDesc className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { value: "grid", icon: Grid },
                { value: "list", icon: List },
                { value: "tree", icon: GitBranch },
              ].map((view) => (
                <button
                  key={view.value}
                  onClick={() => setViewMode(view.value)}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === view.value
                      ? "bg-white text-red-500 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-12">
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <PageCard key={page.id} page={page} onCopy={handleCopyPath} />
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="space-y-2">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: page.color }}
                  />
                  <page.icon className="w-4 h-4 text-gray-500" />
                  <button
                    onClick={() => navigate(page.path)}
                    className="flex-1 text-sm text-gray-900 hover:text-red-500 transition-colors text-left"
                  >
                    {page.name}
                  </button>
                  <span className="text-xs text-gray-500 hidden md:inline">
                    {page.path}
                  </span>
                  {page.protected && (
                    <Lock className="w-3 h-3 text-purple-500" />
                  )}
                  <button
                    onClick={() => handleCopyPath(page.path)}
                    className="p-1 rounded-lg hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copiedPath === page.path ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === "tree" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <TreeView nodes={filteredPages} onCopy={handleCopyPath} />
          </div>
        )}

        {/* API Section */}
        {activeFilter !== "public" && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Code className="w-6 h-6 text-red-500" />
              API Endpoints
              <span className="text-sm font-normal text-gray-500">
                ({filteredApis.length} available)
              </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredApis.map((api) => (
                <ApiCard key={api.id} endpoint={api} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <button
          onClick={() => setShowExportModal(true)}
          className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-gray-700 hover:text-red-500"
          title="Export"
        >
          <Download className="w-6 h-6" />
        </button>
        <button
          onClick={handlePrint}
          className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-gray-700 hover:text-red-500"
          title="Print"
        >
          <Printer className="w-6 h-6" />
        </button>
        <button
          onClick={handleShare}
          className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-gray-700 hover:text-red-500"
          title="Share"
        >
          <Share2 className="w-6 h-6" />
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="p-4 bg-red-500 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
          title="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      <Footer />
    </div>
  );
};

export default Sitemap;
