// src/pages/footer/InventoryManagement.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import {
  Droplet,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Building,
  Search,
  Filter,
  RefreshCw,
  Download,
  Printer,
  BarChart3,
  PieChart,
  Clock,
  Shield,
  Activity,
  Thermometer,
  FlaskRound as Flask,
  Syringe,
  Heart,
  Info,
  ArrowUp,
  ArrowDown,
  MinusCircle,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Plus,
  Minus as MinusIcon,
  Settings,
  Save,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const InventoryManagement = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedBloodType, setSelectedBloodType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Blood types
  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // Cities
  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
  ];

  // Mock inventory data
  const inventoryData = [
    {
      id: 1,
      bloodBank: "City Central Blood Bank",
      city: "Mumbai",
      address: "123 MG Road, Andheri East, Mumbai - 400069",
      phone: "+91 98765 43210",
      email: "citycentral@example.com",
      lastUpdated: "2026-03-19T10:30:00",
      status: "active",
      inventory: [
        {
          type: "A+",
          units: 45,
          status: "good",
          trend: "down",
          expiryRisk: "low",
        },
        {
          type: "A-",
          units: 12,
          status: "low",
          trend: "down",
          expiryRisk: "medium",
        },
        {
          type: "B+",
          units: 38,
          status: "good",
          trend: "up",
          expiryRisk: "low",
        },
        {
          type: "B-",
          units: 8,
          status: "critical",
          trend: "down",
          expiryRisk: "high",
        },
        {
          type: "O+",
          units: 62,
          status: "excellent",
          trend: "up",
          expiryRisk: "low",
        },
        {
          type: "O-",
          units: 15,
          status: "low",
          trend: "stable",
          expiryRisk: "medium",
        },
        {
          type: "AB+",
          units: 22,
          status: "good",
          trend: "up",
          expiryRisk: "low",
        },
        {
          type: "AB-",
          units: 5,
          status: "critical",
          trend: "down",
          expiryRisk: "high",
        },
      ],
      totalUnits: 207,
      capacity: 500,
      emergencyStock: 50,
      expiringSoon: 15,
    },
    {
      id: 2,
      bloodBank: "Apollo Blood Center",
      city: "Delhi",
      address: "456 Ring Road, Connaught Place, Delhi - 110001",
      phone: "+91 99887 66554",
      email: "apolloblood@example.com",
      lastUpdated: "2026-03-19T09:15:00",
      status: "active",
      inventory: [
        {
          type: "A+",
          units: 32,
          status: "good",
          trend: "stable",
          expiryRisk: "low",
        },
        {
          type: "A-",
          units: 18,
          status: "good",
          trend: "up",
          expiryRisk: "low",
        },
        {
          type: "B+",
          units: 28,
          status: "good",
          trend: "down",
          expiryRisk: "medium",
        },
        {
          type: "B-",
          units: 10,
          status: "low",
          trend: "stable",
          expiryRisk: "medium",
        },
        {
          type: "O+",
          units: 55,
          status: "excellent",
          trend: "up",
          expiryRisk: "low",
        },
        {
          type: "O-",
          units: 20,
          status: "good",
          trend: "up",
          expiryRisk: "low",
        },
        {
          type: "AB+",
          units: 15,
          status: "good",
          trend: "stable",
          expiryRisk: "low",
        },
        {
          type: "AB-",
          units: 7,
          status: "low",
          trend: "down",
          expiryRisk: "high",
        },
      ],
      totalUnits: 185,
      capacity: 400,
      emergencyStock: 40,
      expiringSoon: 12,
    },
    {
      id: 3,
      bloodBank: "Lifeline Blood Bank",
      city: "Bangalore",
      address: "789 Electronic City Phase 1, Bangalore - 560100",
      phone: "+91 97654 32109",
      email: "lifeline@example.com",
      lastUpdated: "2026-03-19T11:45:00",
      status: "active",
      inventory: [
        {
          type: "A+",
          units: 28,
          status: "good",
          trend: "down",
          expiryRisk: "medium",
        },
        {
          type: "A-",
          units: 9,
          status: "low",
          trend: "down",
          expiryRisk: "high",
        },
        {
          type: "B+",
          units: 35,
          status: "good",
          trend: "up",
          expiryRisk: "low",
        },
        {
          type: "B-",
          units: 6,
          status: "critical",
          trend: "down",
          expiryRisk: "high",
        },
        {
          type: "O+",
          units: 48,
          status: "good",
          trend: "stable",
          expiryRisk: "low",
        },
        {
          type: "O-",
          units: 12,
          status: "low",
          trend: "stable",
          expiryRisk: "medium",
        },
        {
          type: "AB+",
          units: 18,
          status: "good",
          trend: "up",
          expiryRisk: "low",
        },
        {
          type: "AB-",
          units: 4,
          status: "critical",
          trend: "down",
          expiryRisk: "high",
        },
      ],
      totalUnits: 160,
      capacity: 350,
      emergencyStock: 35,
      expiringSoon: 20,
    },
  ];

  // Filter inventory
  const filteredInventory = inventoryData.filter((bank) => {
    const matchesSearch =
      searchTerm === "" ||
      bank.bloodBank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = selectedCity === "all" || bank.city === selectedCity;

    // Check if bank has low stock items if filter is active
    const hasLowStock = showLowStock
      ? bank.inventory.some(
          (item) => item.status === "low" || item.status === "critical",
        )
      : true;

    const hasCritical = showCriticalOnly
      ? bank.inventory.some((item) => item.status === "critical")
      : true;

    return matchesSearch && matchesCity && hasLowStock && hasCritical;
  });

  // Calculate global stats
  const totalUnits = inventoryData.reduce(
    (sum, bank) => sum + bank.totalUnits,
    0,
  );
  const totalBanks = inventoryData.length;
  const totalExpiring = inventoryData.reduce(
    (sum, bank) => sum + bank.expiringSoon,
    0,
  );
  const totalEmergency = inventoryData.reduce(
    (sum, bank) => sum + bank.emergencyStock,
    0,
  );

  // Critical counts
  const criticalItems = inventoryData.reduce(
    (count, bank) =>
      count +
      bank.inventory.filter((item) => item.status === "critical").length,
    0,
  );

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      excellent: "bg-green-100 text-green-800 border-green-200",
      good: "bg-blue-100 text-blue-800 border-blue-200",
      low: "bg-yellow-100 text-yellow-800 border-yellow-200",
      critical: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      excellent: "bg-green-500",
      good: "bg-blue-500",
      low: "bg-yellow-500",
      critical: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get expiry risk color
  const getExpiryRiskColor = (risk) => {
    const colors = {
      low: "text-green-600 bg-green-50",
      medium: "text-yellow-600 bg-yellow-50",
      high: "text-red-600 bg-red-50",
    };
    return colors[risk] || "text-gray-600 bg-gray-50";
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Inventory data refreshed successfully!");
    }, 1500);
  };

  // Handle export
  const handleExport = () => {
    toast.success("Inventory report downloaded successfully!");
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>Blood Inventory Management | BloodConnect</title>
        <meta
          name="description"
          content="Real-time blood inventory status across blood banks. Track blood stock levels, expiry dates, and availability."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Red Theme */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Real-Time Blood Stock Tracking
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Blood Inventory Management
              </h1>
              <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                Real-time tracking of blood stock levels across all partner
                blood banks. Monitor availability and plan accordingly.
              </p>

              {/* Summary Stats - Red Theme */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Droplet className="w-6 h-6 mx-auto mb-2 text-red-200" />
                  <div className="text-3xl font-bold mb-1">{totalUnits}</div>
                  <div className="text-sm text-red-200">Total Units</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Building className="w-6 h-6 mx-auto mb-2 text-red-200" />
                  <div className="text-3xl font-bold mb-1">{totalBanks}</div>
                  <div className="text-sm text-red-200">Blood Banks</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-red-200" />
                  <div className="text-3xl font-bold mb-1">{totalExpiring}</div>
                  <div className="text-sm text-red-200">Expiring Soon</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-red-200" />
                  <div className="text-3xl font-bold mb-1">
                    {totalEmergency}
                  </div>
                  <div className="text-sm text-red-200">Emergency Stock</div>
                </div>
              </div>

              {/* Critical Alert */}
              {criticalItems > 0 && (
                <div className="mt-6 bg-red-500/30 backdrop-blur-sm rounded-xl p-4 border border-red-400/50 inline-flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-medium">
                    {criticalItems} blood types critically low across all banks
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters - Red Theme */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-red-500">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search blood bank or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="all">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowLowStock(!showLowStock)}
                  className={`px-4 py-3 rounded-xl transition-colors flex items-center gap-2 ${
                    showLowStock
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                  Low Stock
                </button>

                <button
                  onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                  className={`px-4 py-3 rounded-xl transition-colors flex items-center gap-2 ${
                    showCriticalOnly
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                  Critical
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500 mr-2">Quick Filters:</span>
              <button
                onClick={() => setSelectedBloodType("all")}
                className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                All Types
              </button>
              {bloodTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedBloodType(type)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedBloodType === type
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="container mx-auto px-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-bold text-red-600">
                {filteredInventory.length}
              </span>{" "}
              blood banks
              {searchTerm && <span> matching "{searchTerm}"</span>}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="container mx-auto px-4 pb-12">
          <div className="space-y-6">
            {filteredInventory.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No Blood Banks Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No blood banks match your current filters
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCity("all");
                    setShowLowStock(false);
                    setShowCriticalOnly(false);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredInventory.map((bank) => (
                <div
                  key={bank.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Bank Header - Red Theme */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">{bank.bloodBank}</h2>
                        <p className="text-red-100 flex items-center gap-2 mt-1">
                          <Building className="w-4 h-4" />
                          {bank.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <div className="text-right">
                          <p className="text-sm text-red-200">Last Updated</p>
                          <p className="font-semibold">
                            {formatDate(bank.lastUpdated)} at{" "}
                            {formatTime(bank.lastUpdated)}
                          </p>
                        </div>
                        <div className="h-10 w-px bg-white/30"></div>
                        <div className="text-right">
                          <p className="text-sm text-red-200">Total Units</p>
                          <p className="font-semibold text-2xl">
                            {bank.totalUnits}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="px-6 py-3 bg-gray-50 border-b flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">
                        {bank.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">
                        {bank.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          bank.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {bank.status === "active" ? "● Active" : "○ Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Inventory Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {bank.inventory
                        .filter(
                          (item) =>
                            selectedBloodType === "all" ||
                            item.type === selectedBloodType,
                        )
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                              item.status === "critical"
                                ? "border-red-200 bg-red-50"
                                : item.status === "low"
                                  ? "border-yellow-200 bg-yellow-50"
                                  : item.status === "good"
                                    ? "border-blue-200 bg-blue-50"
                                    : "border-green-200 bg-green-50"
                            }`}
                          >
                            {/* Status Indicator */}
                            <div
                              className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getStatusBadgeColor(item.status)}`}
                            ></div>

                            <div className="flex justify-between items-start mb-2">
                              <span className="text-lg font-bold text-gray-800">
                                {item.type}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}
                              >
                                {item.status}
                              </span>
                            </div>

                            <div className="text-3xl font-bold text-gray-900 mb-2">
                              {item.units}{" "}
                              <span className="text-sm font-normal text-gray-500">
                                units
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Trend</span>
                                <div className="flex items-center gap-1">
                                  {getTrendIcon(item.trend)}
                                  <span className="capitalize">
                                    {item.trend}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  Expiry Risk
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getExpiryRiskColor(item.expiryRisk)}`}
                                >
                                  {item.expiryRisk}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Stock Level</span>
                                <span>
                                  {Math.min(
                                    Math.round((item.units / 100) * 100),
                                    100,
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    item.status === "critical"
                                      ? "bg-red-600"
                                      : item.status === "low"
                                        ? "bg-yellow-600"
                                        : item.status === "good"
                                          ? "bg-blue-600"
                                          : "bg-green-600"
                                  }`}
                                  style={{
                                    width: `${Math.min((item.units / 100) * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Bank Stats - Red Theme */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                          <Package className="w-4 h-4 text-red-500" />
                          Capacity Utilization
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-gray-800">
                            {Math.round(
                              (bank.totalUnits / bank.capacity) * 100,
                            )}
                            %
                          </span>
                          <span className="text-sm text-gray-600">
                            {bank.totalUnits}/{bank.capacity} units
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{
                              width: `${(bank.totalUnits / bank.capacity) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-red-500" />
                          Emergency Stock
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-gray-800">
                            {bank.emergencyStock}
                          </span>
                          <span className="text-sm text-gray-600">
                            units reserved
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">
                            Available for emergencies
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-500" />
                          Expiring Soon
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-red-600">
                            {bank.expiringSoon}
                          </span>
                          <span className="text-sm text-gray-600">
                            units in 7 days
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-gray-600">
                            Priority usage recommended
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex justify-end gap-2">
                      <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2">
                        <Droplet className="w-4 h-4" />
                        Request Blood
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Legend - Red Theme */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-red-500" />
              Inventory Status Guide
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">
                  Excellent (50+ units)
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">
                  Good (20-49 units)
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">Low (10-19 units)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">
                  Critical ({"<"}10 units)
                </span>
              </div>
            </div>
          </div>

          {/* Need Blood Alert */}
          <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Need Blood Urgently?
                  </h3>
                  <p className="text-red-100">
                    If you're a hospital or patient in need, post an emergency
                    blood request
                  </p>
                </div>
              </div>
              <button
                onClick={() => (window.location.href = "/blood-request")}
                className="px-8 py-4 bg-white text-red-600 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg font-semibold whitespace-nowrap"
              >
                Post Blood Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryManagement;
