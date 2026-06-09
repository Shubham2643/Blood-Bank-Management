import React, { useEffect, useState, useCallback, useMemo } from "react";
import { donorApi } from "../../services/api.js";
import {
  Droplet,
  Calendar,
  Search,
  Filter,
  Download,
  MapPin,
  AlertCircle,
  Award,
  TrendingUp,
  Heart,
  Shield,
  Star,
  Share2,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Activity,
  User,
  Mail,
  Phone,
  Loader,
} from "lucide-react";
import { toast } from "react-hot-toast";

const DonorDonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [donorInfo, setDonorInfo] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Statistics state
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalUnits: 0,
    lifeImpact: 0,
    lastDonation: null,
    favoriteLocation: "",
    bloodGroups: {},
    yearlyBreakdown: {},
    averageUnits: 0,
    donationStreak: 0,
  });

  // Blood groups for filter
  const bloodGroups = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Fetch History and Donor Info
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to view your donation history");
        setLoading(false);
        return;
      }

      // Fetch both history and donor profile in parallel
      const [historyRes, profileRes] = await Promise.all([
        donorApi.getHistory(),
        donorApi.getProfile(),
      ]);

      let data =
        historyRes.data.history ||
        historyRes.data.donations ||
        (Array.isArray(historyRes.data) ? historyRes.data : []);

      console.log("Fetched donation history:", data);

      // Sort by date descending initially
      data.sort(
        (a, b) =>
          new Date(b.donationDate || b.date) -
          new Date(a.donationDate || a.date),
      );

      setHistory(data);
      setDonorInfo(profileRes.data.donor || profileRes.data);
      calculateStats(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Failed to load donation history");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate comprehensive statistics
  const calculateStats = (data) => {
    const totalDonations = data.length;
    const totalUnits = data.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
    const lifeImpact = totalUnits * 3;
    const lastDonation =
      data.length > 0 ? data[0].donationDate || data[0].date : null;

    // Blood group distribution
    const bloodGroups = data.reduce((acc, item) => {
      const bg = item.bloodGroup || "Unknown";
      acc[bg] = (acc[bg] || 0) + 1;
      return acc;
    }, {});

    // Yearly breakdown
    const yearlyBreakdown = data.reduce((acc, item) => {
      const year = new Date(item.donationDate || item.date).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    // Find most frequent location
    const locationCount = data.reduce((acc, item) => {
      const location = item.city || item.Faculty || "Unknown";
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    const favoriteLocation = Object.keys(locationCount).reduce(
      (a, b) => (locationCount[a] > locationCount[b] ? a : b),
      "None",
    );

    // Calculate average units
    const averageUnits =
      totalDonations > 0 ? (totalUnits / totalDonations).toFixed(1) : 0;

    // Calculate donation streak (consecutive months)
    let streak = 0;
    if (data.length > 0) {
      const sortedDates = [...data]
        .map((item) => new Date(item.donationDate || item.date))
        .sort((a, b) => b - a);

      const today = new Date();
      const lastDonationMonth = sortedDates[0].getMonth();
      const lastDonationYear = sortedDates[0].getFullYear();

      if (
        today.getMonth() === lastDonationMonth &&
        today.getFullYear() === lastDonationYear
      ) {
        streak = 1;
        // Check consecutive months
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = sortedDates[i - 1];
          const currDate = sortedDates[i];
          const monthDiff =
            (prevDate.getFullYear() - currDate.getFullYear()) * 12 +
            (prevDate.getMonth() - currDate.getMonth());

          if (monthDiff === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    setStats({
      totalDonations,
      totalUnits,
      lifeImpact,
      lastDonation,
      favoriteLocation,
      bloodGroups,
      yearlyBreakdown,
      averageUnits,
      donationStreak: streak,
    });
  };

  // Get donor level based on donations
  const donorLevel = useMemo(() => {
    const count = stats.totalDonations;
    if (count >= 20) {
      return {
        level: "Legend",
        color: "from-yellow-500 to-red-500",
        icon: <Award className="w-5 h-5" />,
        nextMilestone: null,
        progress: 100,
      };
    }
    if (count >= 10) {
      return {
        level: "Hero",
        color: "from-purple-500 to-pink-500",
        icon: <Award className="w-5 h-5" />,
        nextMilestone: 20,
        progress: (count / 20) * 100,
      };
    }
    if (count >= 5) {
      return {
        level: "Champion",
        color: "from-red-500 to-orange-500",
        icon: <Star className="w-5 h-5" />,
        nextMilestone: 10,
        progress: (count / 10) * 100,
      };
    }
    if (count >= 3) {
      return {
        level: "Supporter",
        color: "from-green-500 to-teal-500",
        icon: <TrendingUp className="w-5 h-5" />,
        nextMilestone: 5,
        progress: (count / 5) * 100,
      };
    }
    return {
      level: "Starter",
      color: "from-blue-500 to-cyan-500",
      icon: <Heart className="w-5 h-5" />,
      nextMilestone: 3,
      progress: count > 0 ? (count / 3) * 100 : 0,
    };
  }, [stats.totalDonations]);

  // Filter and sort data
  const applyFilter = useCallback(() => {
    let filteredData = [...history];

    // Time filter
    if (filterType !== "all") {
      const months = {
        last3: 3,
        last6: 6,
        last12: 12,
        last24: 24,
      }[filterType];

      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - months);

      filteredData = filteredData.filter((item) => {
        const donationDate = new Date(item.donationDate || item.date);
        return donationDate >= cutoff;
      });
    }

    // Blood group filter
    if (bloodGroupFilter !== "all") {
      filteredData = filteredData.filter(
        (item) => item.bloodGroup === bloodGroupFilter,
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.Faculty?.toLowerCase().includes(term) ||
          item.bloodGroup?.toLowerCase().includes(term) ||
          item.city?.toLowerCase().includes(term) ||
          item.state?.toLowerCase().includes(term) ||
          new Date(item.donationDate || item.date)
            .toLocaleDateString()
            .includes(term),
      );
    }

    // Sort data
    filteredData.sort((a, b) => {
      const dateA = new Date(a.donationDate || a.date);
      const dateB = new Date(b.donationDate || b.date);

      switch (sortBy) {
        case "date-asc":
          return dateA - dateB;
        case "date-desc":
          return dateB - dateA;
        case "units-desc":
          return (b.quantity || 1) - (a.quantity || 1);
        case "units-asc":
          return (a.quantity || 1) - (b.quantity || 1);
        default:
          return dateB - dateA;
      }
    });

    setFiltered(filteredData);
  }, [history, searchTerm, filterType, sortBy, bloodGroupFilter]);

  // Export to CSV with more details
  const exportToCSV = useCallback(() => {
    const headers = [
      "Date",
      "Day",
      "Time",
      "Location",
      "City",
      "State",
      "Blood Group",
      "Units",
      "Status",
      "Donation Type",
      "Certificate ID",
    ];

    const csvData = filtered.map((item) => {
      const date = new Date(item.donationDate || item.date);
      return [
        date.toLocaleDateString(),
        date.toLocaleDateString("en-US", { weekday: "long" }),
        date.toLocaleTimeString(),
        item.Faculty || "Blood Donation Camp",
        item.city || "N/A",
        item.state || "N/A",
        item.bloodGroup || "N/A",
        item.quantity || 1,
        "Completed",
        item.donationType || "Regular",
        item.certificateId || `DON-${date.getTime()}`,
      ].join(",");
    });

    const csv = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `donation-history-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${filtered.length} records exported successfully!`);
  }, [filtered]);

  // Share donation stats
  const shareStats = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: "My Blood Donation Journey",
          text: `I've donated ${stats.totalUnits} units of blood, impacting ${stats.lifeImpact}+ lives! 🩸`,
          url: window.location.href,
        })
        .catch(() => {
          // Fallback if user cancels
        });
    } else {
      // Fallback for browsers that don't support share
      navigator.clipboard.writeText(
        `I've donated ${stats.totalUnits} units of blood, impacting ${stats.lifeImpact}+ lives! 🩸`,
      );
      toast.success("Stats copied to clipboard!");
    }
  }, [stats]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  // Toggle card expansion
  const toggleExpand = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-16 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Donor Info */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-600 rounded-2xl shadow-lg">
                <Droplet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Donation History
                </h1>
                {donorInfo && (
                  <p className="text-gray-600 mt-1">
                    Welcome back,{" "}
                    <span className="font-semibold text-red-600">
                      {donorInfo.name}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={shareStats}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Share2 className="w-5 h-5 text-red-600" />
              <span>Share Impact</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-red-400 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Donations
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalDonations}
                </p>
                {stats.yearlyBreakdown[new Date().getFullYear()] > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    +{stats.yearlyBreakdown[new Date().getFullYear()]} this year
                  </p>
                )}
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <Droplet className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-green-400 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Units Donated
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalUnits}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg {stats.averageUnits} per donation
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-blue-400 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Lives Impacted
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.lifeImpact}+
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Each unit saves 3 lives
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-purple-400 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Level</p>
                <p className="text-2xl font-bold text-gray-900">
                  {donorLevel.level}
                </p>
                {donorLevel.nextMilestone && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.totalDonations}/{donorLevel.nextMilestone} to next
                  </p>
                )}
              </div>
              <div
                className={`p-3 bg-gradient-to-r ${donorLevel.color} rounded-xl text-white`}
              >
                {donorLevel.icon}
              </div>
            </div>
            {/* Progress bar for next level */}
            {donorLevel.nextMilestone && (
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${donorLevel.color}`}
                    style={{ width: `${donorLevel.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Donation Streak</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.donationStreak}{" "}
                {stats.donationStreak === 1 ? "month" : "months"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Favorite Location</p>
              <p className="text-xl font-bold text-gray-900 truncate max-w-[150px]">
                {stats.favoriteLocation}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Donation</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.lastDonation
                  ? new Date(stats.lastDonation).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "None"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Main Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by date, location, blood group..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="units-desc">Most Units ↓</option>
                  <option value="units-asc">Least Units ↑</option>
                </select>

                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Period
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full border border-gray-300 bg-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="all">All Time</option>
                      <option value="last3">Last 3 Months</option>
                      <option value="last6">Last 6 Months</option>
                      <option value="last12">Last 12 Months</option>
                      <option value="last24">Last 24 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroupFilter}
                      onChange={(e) => setBloodGroupFilter(e.target.value)}
                      className="w-full border border-gray-300 bg-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg === "all" ? "All Blood Groups" : bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {history.length === 0
                  ? "No Donations Yet"
                  : "No Matching Records"}
              </h3>
              <p className="text-gray-600 mb-6">
                {history.length === 0
                  ? "Start your life-saving journey by making your first blood donation."
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              {history.length === 0 && (
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg">
                  Schedule Your First Donation
                </button>
              )}
            </div>
          </div>
        )}

        {/* Donation History Cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-semibold text-red-600">
                  {filtered.length}
                </span>{" "}
                donation{filtered.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-gray-500">
                Total Units:{" "}
                <span className="font-semibold">
                  {filtered.reduce(
                    (sum, item) => sum + (item.quantity || 1),
                    0,
                  )}
                </span>
              </p>
            </div>

            <div className="grid gap-4">
              {filtered.map((item, index) => {
                const date = new Date(item.donationDate || item.date);
                const isRecent = new Date() - date < 30 * 24 * 60 * 60 * 1000;
                const isExpanded = expandedCard === index;

                return (
                  <div
                    key={item._id || index}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Main Card Content */}
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`p-3 rounded-xl ${
                              isRecent
                                ? "bg-green-100 text-green-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <Droplet className="w-6 h-6" />
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {item.bloodGroup || "Blood"} Donation
                              </h3>
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Completed
                              </span>
                              {isRecent && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                  Recent
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-red-500" />
                                <span>
                                  {date.toLocaleDateString("en-IN", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span className="truncate">
                                  {item.city ||
                                    item.Faculty ||
                                    "Unknown location"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-red-500" />
                                <span>{item.quantity || 1} units</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">
                              +{item.quantity || 1}
                            </div>
                            <div className="text-xs text-gray-500">Units</div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Donation Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {item.Faculty && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Faculty:</span>
                              <span className="font-medium text-gray-900">
                                {item.Faculty}
                              </span>
                            </div>
                          )}

                          {item.city && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">City:</span>
                              <span className="font-medium text-gray-900">
                                {item.city}
                                {item.state && `, ${item.state}`}
                              </span>
                            </div>
                          )}

                          {item.bloodGroup && (
                            <div className="flex items-center gap-2 text-sm">
                              <Droplet className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Blood Group:
                              </span>
                              <span className="font-medium text-gray-900">
                                {item.bloodGroup}
                              </span>
                            </div>
                          )}

                          {item.donationType && (
                            <div className="flex items-center gap-2 text-sm">
                              <Activity className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium text-gray-900">
                                {item.donationType}
                              </span>
                            </div>
                          )}

                          {item.certificateId && (
                            <div className="flex items-center gap-2 text-sm">
                              <Award className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Certificate:
                              </span>
                              <span className="font-medium text-gray-900">
                                {item.certificateId}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <Heart className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Lives Impacted:
                            </span>
                            <span className="font-medium text-green-600">
                              {(item.quantity || 1) * 3}
                            </span>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-4 pt-4 border-t flex gap-3">
                          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                            Download Certificate
                          </button>
                          <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                            Share Achievement
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDonationHistory;
