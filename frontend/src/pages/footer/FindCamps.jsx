// src/pages/footer/FindCamps.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Heart,
  Navigation,
  Phone,
  Mail,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Droplet,
  AlertCircle,
  Loader2,
  CheckCircle,
  X,
  SlidersHorizontal,
  Grid3x3,
  List,
  Eye,
  Download,
  Printer,
  Info,
  Compass,
  Route,
  Map,
  Globe,
  Building,
  Home,
  Activity,
  Award,
  Star,
  UserCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { publicApi } from "../../services/api.js";
import useCampRealtime from "../../hooks/useCampRealtime.js";

const FindCamps = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State management
  const [camps, setCamps] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [nearestCamps, setNearestCamps] = useState([]);
  const [showNearest, setShowNearest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [savedCamps, setSavedCamps] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const campsPerPage = 9;

  const DEFAULT_CAMP_IMAGE =
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";

  // Backend camp model fields differ from this page's mock camp structure.
  // This mapper normalizes backend camps into the UI shape used below.
  const normalizeBackendCamp = (camp) => {
    const registeredCount = camp.registeredDonors?.length ?? 0;
    const totalSlots = camp.expectedDonors ?? 0;
    return {
      id: camp._id,
      name: camp.title,
      organizer: camp.hospital?.name || camp.faculty?.name || "Blood Camp",
      type: "hospital", // Backend doesn't store "community/hospital" separately for public camps
      date: camp.date,
      startTime: camp.time?.start,
      endTime: camp.time?.end,
      city: camp.location?.city || "",
      address: camp.location
        ? `${camp.location.venue}, ${camp.location.city}, ${camp.location.state} - ${camp.location.pincode}`
        : "",
      landmark: camp.location?.venue || "",
      coordinates: camp.coordinates,
      totalSlots,
      availableSlots: Math.max(totalSlots - registeredCount, 0),
      bloodTypes: Array.isArray(camp.bloodTypesNeeded)
        ? camp.bloodTypesNeeded
        : Array.isArray(camp.bloodTypes)
          ? camp.bloodTypes
          : [],
      contactPerson: "",
      phone: "",
      email: "",
      facilities: [],
      status: "active",
      image: camp.image || DEFAULT_CAMP_IMAGE,
      // Keep registeredDonors info available for other UI if needed
      registeredCount,
      // Distance is computed client-side (if coordinates exist)
      distance: undefined,
    };
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Cities for filter
  const cities = [
    "Ahmedabad",
    "Mumbai",
    "Surat",
    "Rajkot",
    "Vadodara",
    "Gandhinagar",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Anand",
    "Navsari",
    "Vapi",
    "Mehsana",
    "Bharuch",
    "All Cities",
  ];

  // Real blood bank and donation center data
  const fetchCamps = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const res = await publicApi.getUpcomingCamps();
      if (res.status >= 200 && res.status < 300) {
        const data = res.data;
        if (Array.isArray(data?.camps) && data.camps.length > 0) {
          const normalized = data.camps.map(normalizeBackendCamp);
          setCamps(normalized);
          setFilteredCamps(normalized);
          return;
        }
      }
      setCamps([]);
      setFilteredCamps([]);
    } catch (e) {
      console.warn("Real camps fetch failed:", e);
      setCamps([]);
      setFilteredCamps([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  useCampRealtime(
    ({ event, title } = {}) => {
      fetchCamps({ silent: true });
      if (event === "new-camp" && title) {
        toast.success(`New camp added: ${title}`, { icon: "🩸" });
      }
    },
    { publicOnly: true },
  );

  useEffect(() => {
    const saved = localStorage.getItem("savedCamps");
    if (saved) {
      setSavedCamps(JSON.parse(saved));
    }
  }, []);

  // Filter camps based on search and filters
  useEffect(() => {
    let filtered =
      showNearest && nearestCamps.length > 0 ? nearestCamps : camps;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (camp) =>
          camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          camp.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          camp.address.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // City filter
    if (selectedCity !== "all") {
      filtered = filtered.filter((camp) => camp.city === selectedCity);
    }

    // Date filter
    if (selectedDate !== "all") {
      const today = new Date();
      if (selectedDate === "today") {
        filtered = filtered.filter(
          (camp) => new Date(camp.date).toDateString() === today.toDateString(),
        );
      } else if (selectedDate === "tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(
          (camp) =>
            new Date(camp.date).toDateString() === tomorrow.toDateString(),
        );
      } else if (selectedDate === "week") {
        const weekLater = new Date(today);
        weekLater.setDate(weekLater.getDate() + 7);
        filtered = filtered.filter((camp) => {
          const date = new Date(camp.date);
          return date >= today && date <= weekLater;
        });
      }
    }

    // Camp type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((camp) => camp.type === selectedType);
    }

    setFilteredCamps(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    searchTerm,
    selectedCity,
    selectedDate,
    selectedType,
    camps,
    showNearest,
    nearestCamps,
  ]);

  // Get user location
  const getUserLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);

          // Calculate distances and sort camps
          const campsWithDistance = camps.map((camp) => {
            const lat = camp.coordinates?.lat;
            const lng = camp.coordinates?.lng;
            if (typeof lat === "number" && typeof lng === "number") {
              return {
                ...camp,
                distance: calculateDistance(location.lat, location.lng, lat, lng),
              };
            }

            return { ...camp, distance: undefined };
          });

          // Sort by distance and set as nearest camps (only if we have any coordinates)
          const validDistanceCamps = campsWithDistance.filter(
            (c) => typeof c.distance === "number",
          );
          if (validDistanceCamps.length > 0) {
            const sortedByDistance = validDistanceCamps.sort(
              (a, b) => a.distance - b.distance,
            );
            setNearestCamps(sortedByDistance);
            setShowNearest(true);
          } else {
            setNearestCamps([]);
            setShowNearest(false);
          }

          toast.success(`Found ${camps.length} camps near you!`);
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Unable to get your location. Please enable location services.",
          );
          setLocationLoading(false);
        },
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setLocationLoading(false);
    }
  };

  // Save/unsave camp
  const toggleSaveCamp = (campId) => {
    let updatedSaved;
    if (savedCamps.includes(campId)) {
      updatedSaved = savedCamps.filter((id) => id !== campId);
      toast.success("Camp removed from saved list");
    } else {
      updatedSaved = [...savedCamps, campId];
      toast.success("Camp saved successfully!");
    }
    setSavedCamps(updatedSaved);
    localStorage.setItem("savedCamps", JSON.stringify(updatedSaved));
  };

  // Register for camp
  const registerForCamp = (camp) => {
    toast.success(
      `Successfully registered for ${camp.name}! Check your email for confirmation.`,
    );
  };

  // Share camp
  const shareCamp = (camp) => {
    if (navigator.share) {
      navigator.share({
        title: camp.name,
        text: `Blood donation camp at ${camp.name} on ${camp.date}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(
        `${camp.name} - ${camp.date} at ${camp.address}`,
      );
      toast.success("Camp details copied to clipboard!");
    }
  };

  // Get camp type badge color
  const getCampTypeColor = (type) => {
    const colors = {
      hospital: "bg-blue-100 text-blue-800",
      community: "bg-green-100 text-green-800",
      corporate: "bg-purple-100 text-purple-800",
      educational: "bg-yellow-100 text-yellow-800",
      religious: "bg-orange-100 text-orange-800",
      public: "bg-gray-100 text-gray-800",
      commercial: "bg-pink-100 text-pink-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Format date
  const formatDate = (dateStr) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  // Pagination
  const indexOfLastCamp = currentPage * campsPerPage;
  const indexOfFirstCamp = indexOfLastCamp - campsPerPage;
  const currentCamps = filteredCamps.slice(indexOfFirstCamp, indexOfLastCamp);
  const totalPages = Math.ceil(filteredCamps.length / campsPerPage);

  return (
    <>
      <Helmet>
        <title>Find Blood Donation Camps Near You | BloodConnect</title>
        <meta
          name="description"
          content="Find blood donation camps near you in Ahmedabad, Mumbai, Surat, Rajkot and other cities. Search by city, date, and camp type. Register online and save lives in your community."
        />
        <meta
          name="keywords"
          content="blood donation camps, blood drive near me, donate blood, find blood camp, Ahmedabad blood bank, Mumbai blood donation, Surat blood camp, Rajkot blood bank"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Find Blood Donation Camps
              </h1>
              <p className="text-xl text-red-100 mb-8">
                Locate blood donation camps near you in Ahmedabad, Mumbai,
                Surat, Rajkot and other cities. Register online and save lives.
                Every drop counts!
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center bg-white rounded-2xl shadow-2xl p-1">
                  <div className="flex-1 flex items-center px-4">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by city, camp name, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-4 outline-none text-gray-800 rounded-2xl"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Filter className="w-5 h-5" />
                    Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="container mx-auto px-4 -mt-8 relative z-20">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-red-500" />
                  Filter Camps
                </h3>
                <button
                  onClick={() => {
                    setSelectedCity("all");
                    setSelectedDate("all");
                    setSelectedType("all");
                    setSearchTerm("");
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Cities</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">Any Date</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camp Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Types</option>
                    <option value="hospital">Hospital</option>
                    <option value="community">Community</option>
                    <option value="corporate">Corporate</option>
                    <option value="educational">Educational</option>
                    <option value="religious">Religious</option>
                    <option value="public">Public</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Stats and View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div className="text-gray-600 mb-4 sm:mb-0">
              Found{" "}
              <span className="font-bold text-red-600">
                {filteredCamps.length}
              </span>{" "}
              camps
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {showNearest && <span> (sorted by nearest)</span>}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={getUserLocation}
                disabled={locationLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                {locationLoading ? "Detecting..." : "Near Me"}
              </button>

              {/* Show Nearest Toggle Button */}
              {userLocation && (
                <button
                  onClick={() => setShowNearest(!showNearest)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showNearest
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  {showNearest ? "Showing Nearest" : "Show Nearest"}
                </button>
              )}

              <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading camps near you...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && filteredCamps.length === 0 && (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Camps Found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search for a different location
              </p>
              <button
                onClick={() => {
                  setSelectedCity("all");
                  setSelectedDate("all");
                  setSelectedType("all");
                  setSearchTerm("");
                  setShowNearest(false);
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Camps Display */}
          {!loading && filteredCamps.length > 0 && (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentCamps.map((camp) => (
                    <div
                      key={camp.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                    >
                      {/* Camp Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={camp.image}
                          alt={camp.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button
                            onClick={() => toggleSaveCamp(camp.id)}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                          >
                            {savedCamps.includes(camp.id) ? (
                              <BookmarkCheck className="w-4 h-4 text-red-600" />
                            ) : (
                              <Bookmark className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => shareCamp(camp)}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getCampTypeColor(camp.type)}`}
                          >
                            {camp.type.charAt(0).toUpperCase() +
                              camp.type.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Camp Details */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {camp.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {camp.organizer}
                        </p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {formatDate(camp.date)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {camp.startTime} - {camp.endTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">
                                {camp.address}
                              </p>
                              {camp.landmark && (
                                <p className="text-xs text-gray-500">
                                  Landmark: {camp.landmark}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Distance Indicator */}
                          {showNearest && camp.distance && (
                            <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
                              <Navigation className="w-3 h-3" />
                              <span>{camp.distance.toFixed(1)} km away</span>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">
                                  Available Slots
                                </span>
                                <span className="font-semibold text-gray-800">
                                  {camp.availableSlots}/{camp.totalSlots}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{
                                    width: `${(camp.availableSlots / camp.totalSlots) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Blood Types Needed */}
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">
                            Blood Types Needed:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {camp.bloodTypes.map((type, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => registerForCamp(camp)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                          >
                            <Heart className="w-4 h-4" />
                            Register
                          </button>
                          <button
                            onClick={() => setSelectedCamp(camp)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {currentCamps.map((camp) => (
                    <div
                      key={camp.id}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Camp Image */}
                        <div className="md:w-48 h-32 rounded-xl overflow-hidden">
                          <img
                            src={camp.image}
                            alt={camp.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Camp Details */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">
                                {camp.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {camp.organizer}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getCampTypeColor(camp.type)} mt-2 md:mt-0`}
                            >
                              {camp.type.charAt(0).toUpperCase() +
                                camp.type.slice(1)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-gray-600">
                                {formatDate(camp.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-gray-600">
                                {camp.startTime} - {camp.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-gray-600">
                                {camp.city}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-gray-600">
                                {camp.availableSlots} slots available
                              </span>
                            </div>

                            {/* Distance in List View */}
                            {showNearest && camp.distance && (
                              <div className="flex items-center gap-2 col-span-2">
                                <Navigation className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">
                                  {camp.distance.toFixed(1)} km away
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => registerForCamp(camp)}
                              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2"
                            >
                              <Heart className="w-4 h-4" />
                              Register
                            </button>
                            <button
                              onClick={() => toggleSaveCamp(camp.id)}
                              className={`px-4 py-2 border rounded-xl transition-colors text-sm font-semibold flex items-center gap-2 ${
                                savedCamps.includes(camp.id)
                                  ? "border-red-600 text-red-600 hover:bg-red-50"
                                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <Bookmark className="w-4 h-4" />
                              {savedCamps.includes(camp.id) ? "Saved" : "Save"}
                            </button>
                            <button
                              onClick={() => setSelectedCamp(camp)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === i + 1
                          ? "bg-red-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Camp Details Modal */}
        {selectedCamp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header with Image */}
              <div className="relative h-64">
                <img
                  src={selectedCamp.image}
                  alt={selectedCamp.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedCamp(null)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getCampTypeColor(selectedCamp.type)}`}
                  >
                    {selectedCamp.type.charAt(0).toUpperCase() +
                      selectedCamp.type.slice(1)}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedCamp.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  Organized by {selectedCamp.organizer}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Date & Time</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(selectedCamp.date)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedCamp.startTime} - {selectedCamp.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Location</p>
                        <p className="text-sm text-gray-600">
                          {selectedCamp.address}
                        </p>
                        {selectedCamp.landmark && (
                          <p className="text-sm text-gray-500">
                            Landmark: {selectedCamp.landmark}
                          </p>
                        )}

                        {/* Distance in Modal */}
                        {showNearest && selectedCamp.distance && (
                          <p className="text-sm text-green-600 mt-1">
                            <Navigation className="w-3 h-3 inline mr-1" />
                            {selectedCamp.distance.toFixed(1)} km from your
                            location
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Capacity</p>
                        <p className="text-sm text-gray-600">
                          {selectedCamp.availableSlots} slots available out of{" "}
                          {selectedCamp.totalSlots}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${(selectedCamp.availableSlots / selectedCamp.totalSlots) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Contact</p>
                        <p className="text-sm text-gray-600">
                          {selectedCamp.contactPerson}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedCamp.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedCamp.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Droplet className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">
                          Blood Types Needed
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedCamp.bloodTypes.map((type, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Facilities</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedCamp.facilities.map((facility, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Preview */}
                <div className="mb-6">
                  <button
                    onClick={() =>
                      window.open(
                        `https://maps.google.com/?q=${selectedCamp.address}`,
                      )
                    }
                    className="w-full p-4 bg-gray-100 rounded-xl flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Map className="w-5 h-5 text-red-500" />
                    View on Google Maps
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      registerForCamp(selectedCamp);
                      setSelectedCamp(null);
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Heart className="w-5 h-5" />
                    Register for this Camp
                  </button>
                  <button
                    onClick={() => toggleSaveCamp(selectedCamp.id)}
                    className={`px-6 py-3 border rounded-xl font-semibold flex items-center justify-center gap-2 ${
                      savedCamps.includes(selectedCamp.id)
                        ? "border-red-600 text-red-600 hover:bg-red-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Bookmark className="w-5 h-5" />
                    {savedCamps.includes(selectedCamp.id)
                      ? "Saved"
                      : "Save Camp"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 py-16 mt-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Can't Find a Camp Near You?
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Organize a blood donation camp in your area and become a community
              hero
            </p>
            <button
              onClick={() => (window.location.href = "/organize-camp")}
              className="px-8 py-4 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Organize a Camp
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FindCamps;
