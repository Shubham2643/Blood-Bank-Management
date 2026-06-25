// src/pages/footer/FindCamps.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
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
import { publicApi, donorApi } from "../../services/api.js";
import { getUser } from "../../utils/auth.js";
import useCampRealtime from "../../hooks/useCampRealtime.js";

const DEFAULT_CAMP_IMAGE =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";

const campImages = [
  "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=500&q=80"
];

const getCampImage = (campId, campTitle) => {
  const key = String(campId || campTitle || "");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % campImages.length;
  return campImages[index];
};

// Backend camp model fields differ from this page's mock camp structure.
// This mapper normalizes backend camps into the UI shape used below.
const normalizeBackendCamp = (camp) => {
  const registeredCount = camp.registeredDonors?.length ?? 0;
  const totalSlots = camp.expectedDonors ?? 0;

  // Infer camp type based on title and description
  const titleAndDesc = `${camp.title || ""} ${camp.description || ""}`.toLowerCase();
  let type = "hospital";
  if (titleAndDesc.includes("rotary") || titleAndDesc.includes("lions") || titleAndDesc.includes("community") || titleAndDesc.includes("foundation") || titleAndDesc.includes("club")) {
    type = "community";
  } else if (titleAndDesc.includes("corporate") || titleAndDesc.includes("office") || titleAndDesc.includes("tech mahindra") || titleAndDesc.includes("bank") || titleAndDesc.includes("workplace")) {
    type = "corporate";
  } else if (titleAndDesc.includes("university") || titleAndDesc.includes("college") || titleAndDesc.includes("student") || titleAndDesc.includes("school") || titleAndDesc.includes("campus")) {
    type = "educational";
  } else if (titleAndDesc.includes("temple") || titleAndDesc.includes("church") || titleAndDesc.includes("mosque") || titleAndDesc.includes("religious")) {
    type = "religious";
  }

  const facilities = camp.facilities && camp.facilities.length > 0
    ? camp.facilities
    : [
        "Pre-donation physical screening",
        "Free blood group & hemoglobin testing",
        "Post-donation refreshments & energy drinks",
        "Donor appreciation certificate & card",
        "Physician consultation on duty"
      ];

  return {
    id: camp._id,
    name: camp.title,
    organizer: camp.hospital?.name || camp.facility?.name || "Blood Camp Organizer",
    type,
    date: camp.date,
    startTime: camp.time?.start || "09:00",
    endTime: camp.time?.end || "17:00",
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
        : ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    contactPerson: camp.contactPerson || camp.hospital?.name || "Camp Coordinator",
    phone: camp.hospital?.phone || camp.contactPhone || "9876543210",
    email: camp.hospital?.email || camp.contactEmail || "contact@lifedrop.org",
    facilities,
    status: "active",
    image: camp.image && camp.image !== DEFAULT_CAMP_IMAGE ? camp.image : getCampImage(camp._id || camp.id, camp.title),
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

const FindCamps = () => {
  const navigate = useNavigate();
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State management
  const [camps, setCamps] = useState([]);
  const [bookingPass, setBookingPass] = useState(null);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const campsPerPage = 9;

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
          setLastUpdated(new Date());
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

  // 60-second polling for continuous real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCamps({ silent: true });
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchCamps]);

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
  }, [
    searchTerm,
    selectedCity,
    selectedDate,
    selectedType,
    camps,
    showNearest,
    nearestCamps,
  ]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCity, selectedDate, selectedType, showNearest]);

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
  const registerForCamp = async (camp) => {
    const user = getUser();
    if (!user) {
      toast.error("Please login to register for a camp");
      return;
    }
    if (user.role !== "donor") {
      toast.error("Only registered donors can book camp slots");
      return;
    }

    try {
      await donorApi.registerForCamp(camp.id);
      toast.success(`Successfully registered for ${camp.name}!`);

      setBookingPass({
        camp,
        user,
        passId: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
        bookingDate: new Date().toLocaleDateString(),
      });

      fetchCamps({ silent: true });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to register for camp");
    }
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
      hospital: "bg-blue-50 border border-blue-100 text-blue-700",
      community: "bg-emerald-50 border border-emerald-100 text-emerald-700",
      corporate: "bg-purple-50 border border-purple-100 text-purple-700",
      educational: "bg-amber-50 border border-amber-100 text-amber-700",
      religious: "bg-orange-50 border border-orange-100 text-orange-700",
      public: "bg-gray-50 border border-gray-200 text-gray-700",
      commercial: "bg-rose-50 border border-rose-100 text-rose-700",
    };
    return colors[type] || "bg-gray-50 border border-gray-100 text-gray-600";
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Find Blood Donation Camps Near You | LifeDrop</title>
        <meta
          name="description"
          content="Find blood donation camps near you in Ahmedabad, Mumbai, Surat, Rajkot and other cities. Search by city, date, and camp type. Register online and save lives in your community."
        />
        <meta
          name="keywords"
          content="blood donation camps, blood drive near me, donate blood, find blood camp, Ahmedabad blood bank, Mumbai blood donation, Surat blood camp, Rajkot blood bank"
        />
      </Helmet>
      <Header />
      <main className="flex-grow mt-16 sm:mt-20">
        {/* Hero Section */}
        <div className="relative pt-16 pb-20 bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-128 h-128 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-sm">
                Find Blood Donation Camps
              </h1>
              <p className="text-lg md:text-xl text-red-100 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                Locate life-saving blood donation camps near you. Find locations in Ahmedabad, Mumbai, Surat, Rajkot, and more. Register online, reserve your slot, and make a difference.
              </p>

              {/* Search Bar & Filters Trigger */}
              <div className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-2 gap-2 border border-red-100/20 focus-within:ring-2 focus-within:ring-white/50">
                  <div className="flex-1 flex items-center px-4 py-2">
                    <Search className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search by city, camp name, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-1 outline-none text-gray-800 bg-transparent placeholder-gray-400 font-medium"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-6 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 ${
                      showFilters 
                        ? "bg-gray-800 text-white shadow-md" 
                        : "bg-red-600 hover:bg-red-700 text-white hover:shadow-lg hover:shadow-red-600/20"
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="container mx-auto px-4 -mt-6 relative z-20">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                  <Filter className="w-5 h-5 text-red-500" />
                  Filter Search Results
                </h3>
                <button
                  onClick={() => {
                    setSelectedCity("all");
                    setSelectedDate("all");
                    setSelectedType("all");
                    setSearchTerm("");
                  }}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline transition-all"
                >
                  Reset All Filters
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    City/Location
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 text-gray-700 font-medium cursor-pointer"
                  >
                    <option value="all">All Cities</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date Range
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 text-gray-700 font-medium cursor-pointer"
                  >
                    <option value="all">Any Date</option>
                    <option value="today">Today Only</option>
                    <option value="tomorrow">Tomorrow Only</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Camp Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 text-gray-700 font-medium cursor-pointer"
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-red-50 rounded-full text-red-700 text-sm font-bold border border-red-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>Found {filteredCamps.length} Camps</span>
                {lastUpdated && (
                  <span className="text-xs text-red-500 font-medium ml-1">
                    (Updated {lastUpdated.toLocaleTimeString()})
                  </span>
                )}
              </div>
              {searchTerm && (
                <span className="text-sm text-gray-500 font-medium hidden md:inline">
                  for "{searchTerm}"
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={getUserLocation}
                disabled={locationLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                {locationLoading ? "Detecting Location..." : "Camps Near Me"}
              </button>

              {/* Show Nearest Toggle Button */}
              {userLocation && (
                <button
                  onClick={() => setShowNearest(!showNearest)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 ${
                    showNearest
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  {showNearest ? "Showing Nearest" : "Sort By Distance"}
                </button>
              )}

              <div className="h-6 w-px bg-gray-200 hidden xs:block"></div>

              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid" 
                      ? "bg-white text-red-600 shadow-sm font-bold" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  aria-label="Grid View"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list" 
                      ? "bg-white text-red-600 shadow-sm font-bold" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading camps near you...</p>
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
                className="px-6 py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold shadow-md hover:shadow-red-600/10 active:scale-95"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentCamps.map((camp) => (
                    <div
                      key={camp.id}
                      className="bg-white rounded-3xl border border-gray-100/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full overflow-hidden group"
                    >
                      {/* Camp Image */}
                      <div className="relative h-52 overflow-hidden bg-gray-100">
                        <img
                          src={camp.image}
                          alt={camp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                          <button
                            onClick={() => toggleSaveCamp(camp.id)}
                            className="p-2.5 bg-white/90 backdrop-blur-md text-gray-700 hover:text-red-600 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                            title={savedCamps.includes(camp.id) ? "Saved" : "Save Camp"}
                          >
                            {savedCamps.includes(camp.id) ? (
                              <BookmarkCheck className="w-4 h-4 text-red-600 fill-red-600" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => shareCamp(camp)}
                            className="p-2.5 bg-white/90 backdrop-blur-md text-gray-700 hover:text-red-600 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                            title="Share Camp"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="absolute bottom-4 left-4 z-10">
                          <span
                            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getCampTypeColor(camp.type)}`}
                          >
                            {camp.type}
                          </span>
                        </div>
                      </div>

                      {/* Camp Details */}
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300 mb-2 line-clamp-1">
                          {camp.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium mb-5 flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-gray-400" />
                          {camp.organizer}
                        </p>

                        <div className="space-y-4 mb-6 flex-grow">
                          {/* Date details */}
                          <div className="flex gap-3">
                            <div className="p-2 bg-red-50 text-red-600 rounded-xl h-fit">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col justify-center">
                              <p className="text-sm font-semibold text-gray-800">
                                {formatDate(camp.date)}
                              </p>
                              <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                                <Clock className="w-3.5 h-3.5" />
                                {camp.startTime} - {camp.endTime}
                              </p>
                            </div>
                          </div>

                          {/* Address details */}
                          <div className="flex gap-3">
                            <div className="p-2 bg-red-50 text-red-600 rounded-xl h-fit">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col justify-center">
                              <p className="text-sm font-medium text-gray-600 line-clamp-2 leading-relaxed">
                                {camp.address}
                              </p>
                              {camp.landmark && (
                                <p className="text-xs text-gray-400 mt-1 font-medium">
                                  Landmark: {camp.landmark}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Distance Indicator */}
                          {showNearest && camp.distance && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg w-fit">
                              <Navigation className="w-3.5 h-3.5" />
                              <span>{camp.distance.toFixed(1)} km away</span>
                            </div>
                          )}

                          {/* Slots Progress bar */}
                          <div className="pt-2 border-t border-gray-50">
                            <div className="flex justify-between items-center text-xs font-semibold mb-2">
                              <span className="text-gray-500">Available Slots</span>
                              <span className={`${camp.availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {camp.availableSlots} / {camp.totalSlots}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${(camp.availableSlots / camp.totalSlots) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Blood Types Needed */}
                        <div className="mb-6">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                            Blood Types Needed:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {camp.bloodTypes.map((type, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => registerForCamp(camp)}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-600/20 active:scale-[0.98]"
                          >
                            <Heart className="w-4 h-4" />
                            Register
                          </button>
                          <button
                            onClick={() => setSelectedCamp(camp)}
                            className="px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm active:scale-[0.98]"
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
                <div className="space-y-6">
                  {currentCamps.map((camp) => (
                    <div
                      key={camp.id}
                      className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 p-6"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Camp Image */}
                        <div className="lg:w-64 h-40 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                          <img
                            src={camp.image}
                            alt={camp.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                            <button
                              onClick={() => toggleSaveCamp(camp.id)}
                              className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-600 rounded-full shadow transition-all duration-200"
                            >
                              {savedCamps.includes(camp.id) ? (
                                <BookmarkCheck className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Camp Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-0.5">
                                  {camp.name}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                                  <Building className="w-4 h-4 text-gray-400" />
                                  {camp.organizer}
                                </p>
                              </div>
                              <span
                                className={`w-fit px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getCampTypeColor(camp.type)}`}
                              >
                                {camp.type}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-4">
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                                  <Calendar className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-semibold text-gray-800">
                                  {formatDate(camp.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                                  <Clock className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-gray-600 font-medium">
                                  {camp.startTime} - {camp.endTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-gray-600 font-medium line-clamp-1">
                                  {camp.address}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                                  <Users className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                  {camp.availableSlots} / {camp.totalSlots} slots available
                                </span>
                              </div>

                              {/* Distance in List View */}
                              {showNearest && camp.distance && (
                                <div className="flex items-center gap-2.5 col-span-1 sm:col-span-2">
                                  <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                                    <Navigation className="w-4 h-4" />
                                  </div>
                                  <span className="text-sm text-green-600 font-bold">
                                    {camp.distance.toFixed(1)} km away from you
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => registerForCamp(camp)}
                              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:shadow-red-600/10 active:scale-[0.98]"
                            >
                              <Heart className="w-4 h-4" />
                              Register Now
                            </button>
                            <button
                              onClick={() => shareCamp(camp)}
                              className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold flex items-center gap-1.5"
                            >
                              <Share2 className="w-4 h-4" /> Share
                            </button>
                            <button
                              onClick={() => setSelectedCamp(camp)}
                              className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold ml-auto"
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
                <div className="flex justify-center items-center gap-2.5 mt-12">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === i + 1
                          ? "bg-red-600 text-white shadow-md shadow-red-600/10"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
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
                    className="px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100/50 animate-in zoom-in-95 duration-200">
              {/* Modal Header with Image */}
              <div className="relative h-64 bg-gray-100">
                <img
                  src={selectedCamp.image}
                  alt={selectedCamp.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <button
                  onClick={() => setSelectedCamp(null)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md text-gray-800 hover:text-red-600 rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-105"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6 z-10">
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${getCampTypeColor(selectedCamp.type)}`}
                  >
                    {selectedCamp.type}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                  {selectedCamp.name}
                </h2>
                <p className="text-sm text-gray-500 font-semibold mb-6 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-gray-400" />
                  Organized by {selectedCamp.organizer}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-5">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Date & Time</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(selectedCamp.date)}
                        </p>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">
                          {selectedCamp.startTime} - {selectedCamp.endTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Location</p>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {selectedCamp.address}
                        </p>
                        {selectedCamp.landmark && (
                          <p className="text-xs text-gray-400 mt-1 font-semibold">
                            Landmark: {selectedCamp.landmark}
                          </p>
                        )}

                        {/* Distance in Modal */}
                        {showNearest && selectedCamp.distance && (
                          <p className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5" />
                            {selectedCamp.distance.toFixed(1)} km from your location
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-gray-800 text-sm">Slot Availability</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedCamp.availableSlots} slots available out of {selectedCamp.totalSlots}
                        </p>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full"
                            style={{
                              width: `${(selectedCamp.availableSlots / selectedCamp.totalSlots) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Contact Details</p>
                        {selectedCamp.contactPerson && (
                          <p className="text-sm text-gray-700 mt-1 font-medium">
                            {selectedCamp.contactPerson}
                          </p>
                        )}
                        {selectedCamp.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1 font-medium">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {selectedCamp.phone}
                          </p>
                        )}
                        {selectedCamp.email && (
                          <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1 font-medium break-all">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {selectedCamp.email}
                          </p>
                        )}
                        {!selectedCamp.contactPerson && !selectedCamp.phone && !selectedCamp.email && (
                          <p className="text-sm text-gray-400 mt-1 italic">
                            No contact information provided.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                        <Droplet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Blood Types Needed</p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {selectedCamp.bloodTypes.length > 0 ? (
                            selectedCamp.bloodTypes.map((type, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg"
                              >
                                {type}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400 italic">All groups welcome</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Facilities Provided</p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {selectedCamp.facilities.length > 0 ? (
                            selectedCamp.facilities.map((facility, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg"
                              >
                                {facility}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400 italic">Standard blood drive setup</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Preview */}
                <div className="mb-8">
                  <button
                    onClick={() =>
                      window.open(
                        `https://maps.google.com/?q=${selectedCamp.address}`,
                      )
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center gap-2.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-bold"
                  >
                    <Map className="w-5 h-5 text-red-500" />
                    Open Location in Google Maps
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => {
                      registerForCamp(selectedCamp);
                      setSelectedCamp(null);
                    }}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-600/20 active:scale-95"
                  >
                    <Heart className="w-5 h-5" />
                    Register for this Camp
                  </button>
                  <button
                    onClick={() => toggleSaveCamp(selectedCamp.id)}
                    className={`px-6 py-4 border rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all ${
                      savedCamps.includes(selectedCamp.id)
                        ? "border-red-600 text-red-600 hover:bg-red-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    <Bookmark className="w-5 h-5" />
                    {savedCamps.includes(selectedCamp.id)
                      ? "Saved in Wishlist"
                      : "Save to Wishlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="relative bg-gradient-to-br from-red-700 via-red-600 to-red-800 py-16 mt-20 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Can't Find a Camp Near You?
            </h2>
            <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
              Become a community leader! Partner with LifeDrop to host a voluntary blood donation drive at your college, workplace, or neighborhood. We handle all logistics.
            </p>
            <button
              onClick={() => navigate("/partner-with-us")}
              className="px-8 py-4 bg-white text-red-600 font-bold rounded-2xl hover:bg-red-50 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-2.5 shadow-lg"
            >
              <Heart className="w-5 h-5 text-red-600 fill-red-600 animate-pulse" />
              Organize a Camp
            </button>
          </div>
        </div>

        {/* Booking Pass Modal */}
        {bookingPass && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
              <div className="bg-red-600 px-6 py-5 text-white text-center relative">
                <Heart className="w-10 h-10 mx-auto mb-1 animate-pulse" />
                <h3 className="text-lg font-extrabold uppercase tracking-wider">Donation Booking Pass</h3>
                <p className="text-xs text-red-100">Centralized e-Raktkosh Network</p>
                <button
                  onClick={() => setBookingPass(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <span>Pass ID: <span className="text-slate-800">{bookingPass.passId}</span></span>
                  <span>Date: <span className="text-slate-800">{bookingPass.bookingDate}</span></span>
                </div>

                <hr className="border-dashed border-slate-200" />

                {/* Donor Details */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Donor Information</h4>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-slate-800 flex justify-between">
                      <span className="text-slate-500">Name:</span> 
                      <span>{bookingPass.user?.name || bookingPass.user?.fullName}</span>
                    </p>
                    <p className="text-xs text-slate-500 flex justify-between font-medium">
                      <span>Email:</span>
                      <span className="text-slate-700">{bookingPass.user?.email}</span>
                    </p>
                    <p className="text-xs text-slate-500 flex justify-between font-medium">
                      <span>Blood Group:</span>
                      <span className="text-red-600 font-extrabold">{bookingPass.user?.bloodGroup || "Pending check"}</span>
                    </p>
                  </div>
                </div>

                {/* Camp Details */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Appointment Details</h4>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-slate-800 flex justify-between">
                      <span className="text-slate-500">Venue:</span>
                      <span className="text-right max-w-[200px] truncate">{bookingPass.camp.name}</span>
                    </p>
                    <p className="text-xs text-slate-500 flex justify-between font-medium">
                      <span>Address:</span>
                      <span className="text-right max-w-[200px] truncate text-slate-700">{bookingPass.camp.address}</span>
                    </p>
                    <p className="text-xs text-slate-500 flex justify-between font-medium">
                      <span>Slot Time:</span>
                      <span className="text-slate-700">{bookingPass.camp.startTime} – {bookingPass.camp.endTime}</span>
                    </p>
                  </div>
                </div>

                <hr className="border-dashed border-slate-200" />

                {/* Fake Barcode Graphic */}
                <div className="flex flex-col items-center gap-1.5 justify-center py-2">
                  <div className="flex gap-0.5 justify-center items-center h-10">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2].map((w, i) => (
                      <span key={i} className="bg-slate-800 h-full" style={{ width: `${w}px` }}></span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-widest">{bookingPass.passId}</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-grow bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Printer className="w-4 h-4" /> Print Pass
                  </button>
                  <button
                    onClick={() => setBookingPass(null)}
                    className="flex-grow bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center transition-all shadow-md shadow-red-600/10"
                  >
                    Okay, Got It
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FindCamps;
