import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { donorApi } from "../../services/api.js";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import useCampRealtime from "../../hooks/useCampRealtime.js";
import {
  MapPin,
  Calendar,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Heart,
  Search,
  Users,
  Building2,
  ListPlus,
  Check,
  Phone,
  Mail,
  ExternalLink,
  X,
  AlertTriangle,
  HeartHandshake,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All Camps" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const QUIZ_QUESTIONS = [
  {
    id: "well_today",
    question: "Do you feel well and healthy today?",
    category: "General Health",
    expected: "Yes",
    disqualificationMessage: "You must feel well and healthy on the day of donation."
  },
  {
    id: "antibiotics",
    question: "Are you currently taking any antibiotics or under treatment for active infection?",
    category: "General Health",
    expected: "No",
    disqualificationMessage: "Antibiotics and active infections defer you from donating."
  },
  {
    id: "last_90_days",
    question: "Have you donated blood in the last 90 days?",
    category: "General Health",
    expected: "No",
    disqualificationMessage: "A minimum gap of 90 days is required between donations."
  },
  {
    id: "tattoo_piercing",
    question: "Have you had a tattoo, body piercing, or acupuncture in the last 6 months?",
    category: "Medical Procedures",
    expected: "No",
    disqualificationMessage: "Tattoos and piercings defer you for 6 months due to infection risks."
  },
  {
    id: "hiv_hepatitis",
    question: "Have you ever tested positive for HIV, Hepatitis B, or Hepatitis C?",
    category: "Medical History",
    expected: "No",
    disqualificationMessage: "History of HIV or Hepatitis B/C disqualifies you from donating blood."
  },
  {
    id: "weight_45",
    question: "Do you weigh at least 45 kg (99 lbs)?",
    category: "Physical Fitness",
    expected: "Yes",
    disqualificationMessage: "Minimum weight requirement for blood donation is 45 kg."
  },
  {
    id: "pregnancy",
    question: "Are you currently pregnant, breastfeeding, or have you given birth in the last 6 months?",
    category: "Physical Fitness",
    expected: "No",
    disqualificationMessage: "Pregnancy or recent childbirth defers you from blood donation."
  }
];

const CampCard = ({ camp, onRegister, onSimulateDonation, registeringId, simulatingId, currentDonorId }) => {
  const normalizedStatus = String(camp.status).toLowerCase();
  const isCompleted = normalizedStatus === "completed";
  const isCancelled = normalizedStatus === "cancelled";
  const isUpcoming = normalizedStatus === "upcoming";

  const hasCoordinates = camp.coordinates && camp.coordinates.lat && camp.coordinates.lng;
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${camp.coordinates.lat},${camp.coordinates.lng}`
    : null;

  const isRegistered = camp.isRegistered || (currentDonorId && camp.registeredDonors?.some(
    (reg) =>
      (reg.donor && reg.donor.toString() === currentDonorId.toString()) ||
      (reg._id && reg._id.toString() === currentDonorId.toString())
  )) || false;

  const statusBadgeStyle = isCancelled
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : isCompleted
    ? "bg-slate-100 text-slate-600 border-slate-200"
    : isUpcoming
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

  const campDate = new Date(camp.date);
  const dateStr = campDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const timeStr = `${camp.time?.start || 'N/A'} - ${camp.time?.end || 'N/A'}`;
  
  const expectedDonors = camp.expectedDonors || 0;
  const actualDonors = camp.actualDonors || 0; 
  
  const slotsAvailable = expectedDonors > 0 ? expectedDonors - actualDonors : 0;
  const isFull = slotsAvailable <= 0 && expectedDonors > 0 && !isCompleted && !isCancelled;
  const capacityPct = expectedDonors > 0 ? Math.min(100, Math.round((actualDonors / expectedDonors) * 100)) : 0;

  const { venue, city, state, pincode } = camp.location || {};
  const locationStr = `${venue}, ${city}, ${state} - ${pincode}`;
  const hospitalName = camp.hospital?.name || 'Associated Healthcare Facility';

  return (
    <div className={`bg-white rounded-3xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 p-6 sm:p-7 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${
      isCancelled ? 'opacity-70 bg-slate-50/50' : ''
    }`}>
      <div className="space-y-4">
        {/* Header with Title & Status Badge */}
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1 min-w-0">
            <h4 className="text-lg sm:text-xl font-black text-slate-850 tracking-tight leading-snug line-clamp-2">
              {camp.title}
            </h4>
            <div className="flex items-center gap-2 text-xs font-extrabold text-red-600">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{hospitalName}</span>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full border shadow-2xs flex-shrink-0 ${statusBadgeStyle}`}>
            {camp.status}
          </span>
        </div>

        {/* Location & Directions */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-2xs flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Venue Location</span>
              <span className="block text-xs font-bold text-slate-800 leading-relaxed">{locationStr}</span>
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-black text-red-600 hover:text-red-700 mt-1 transition-colors"
                >
                  Get Directions <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Date</span>
              <span className="block text-xs font-extrabold text-slate-800 truncate">{dateStr}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Time</span>
              <span className="block text-xs font-extrabold text-slate-800 truncate">{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Capacity Gauge */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Donor Capacity</span>
            <span className="text-slate-800">
              {actualDonors} / {expectedDonors} Donors ({capacityPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-rose-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${capacityPct}%` }}
            />
          </div>
          {!isCompleted && !isCancelled && (
            <p className="text-[11px] font-bold text-right">
              {isFull ? (
                <span className="text-rose-600">Capacity Full</span>
              ) : (
                <span className="text-emerald-600">{slotsAvailable} slots remaining</span>
              )}
            </p>
          )}
        </div>

        {/* Description */}
        {camp.description && (
          <p className="text-xs font-medium text-slate-500 italic line-clamp-2">
            "{camp.description}"
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {isUpcoming && (
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
          {isRegistered ? (
            <>
              <button
                disabled
                className="w-full bg-emerald-50 text-emerald-700 font-black py-3 px-4 rounded-2xl border border-emerald-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-not-allowed"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Registered Lifesaver
              </button>
              <button
                onClick={() => onSimulateDonation(camp._id)}
                disabled={simulatingId === camp._id}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black py-3 px-4 rounded-2xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer hover:scale-105"
              >
                {simulatingId === camp._id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Droplet className="w-4 h-4 text-white fill-white animate-pulse" />
                )}
                <span>Simulate Donation & Get Certificate</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => onRegister(camp._id)}
              disabled={registeringId === camp._id || isFull}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-2xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer hover:scale-105"
            >
              {registeringId === camp._id ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Heart className="w-4 h-4 text-white fill-white" />
              )}
              <span>{isFull ? "Camp Capacity Reached" : "Register & Donate"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const DonorCampsList = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeringId, setRegisteringId] = useState(null);
  const [simulatingId, setSimulatingId] = useState(null);
  const [donorId, setDonorId] = useState(null);

  // Pre-Screening Quiz States
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizCampId, setQuizCampId] = useState(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [_quizAnswers, setQuizAnswers] = useState({});
  const [quizIneligible, setQuizIneligible] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Map and Routing States
  const [mapSearchTerm, setMapSearchTerm] = useState("");
  const [mapGeocodedLocation, setMapGeocodedLocation] = useState(null);
  const [nearestCamp, setNearestCamp] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Haversine formula to compute distance in km
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find nearest camp from the active camps list
  const findNearestCampToCoordinates = useCallback((lat, lng) => {
    let closestCamp = null;
    let minDistance = Infinity;

    camps.forEach((camp) => {
      if (camp.coordinates && camp.coordinates.lat && camp.coordinates.lng) {
        const dist = calculateHaversineDistance(lat, lng, camp.coordinates.lat, camp.coordinates.lng);
        if (dist < minDistance) {
          minDistance = dist;
          closestCamp = camp;
        }
      }
    });

    return closestCamp;
  }, [camps]);

  // Draw user location pin
  const updateUserMarker = (coords) => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
    }

    const userIcon = window.L.divIcon({
      className: "custom-user-icon",
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-500 shadow-md transform -translate-y-1">
          <div class="w-3.5 h-3.5 bg-blue-500 rounded-full animate-ping absolute"></div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600 fill-current z-10" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const marker = window.L.marker([coords.lat, coords.lng], { icon: userIcon });
    marker.bindPopup(`<div class="font-sans text-xs font-semibold text-gray-700">${coords.label}</div>`);
    marker.addTo(mapRef.current);
    userMarkerRef.current = marker;
  };

  // Draw straight line path as fallback
  const drawStraightLineRoute = (start, camp) => {
    const dist = calculateHaversineDistance(start.lat, start.lng, camp.coordinates.lat, camp.coordinates.lng);
    setNearestCamp(camp);
    setRouteInfo({
      distance: dist.toFixed(1),
      duration: Math.round((dist / 35) * 60),
    });

    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
      const line = window.L.polyline(
        [[start.lat, start.lng], [camp.coordinates.lat, camp.coordinates.lng]],
        { color: "#dc2626", weight: 4, dashArray: "5, 5" }
      );
      routeLayerRef.current.addLayer(line);

      const bounds = window.L.latLngBounds([
        [start.lat, start.lng],
        [camp.coordinates.lat, camp.coordinates.lng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Fetch real-time driving route from OSRM
  const fetchDrivingRoute = async (start, camp) => {
    if (!camp.coordinates || !camp.coordinates.lat || !camp.coordinates.lng) {
      toast.error("This camp does not have valid coordinates.");
      return;
    }

    const toastId = toast.loading("Calculating driving directions...");
    try {
      const startLng = start.lng;
      const startLat = start.lat;
      const endLng = camp.coordinates.lng;
      const endLat = camp.coordinates.lat;

      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const res = await axios.get(url);

      if (res.data && res.data.routes && res.data.routes.length > 0) {
        toast.success("Driving route calculated!", { id: toastId });
        const route = res.data.routes[0];

        setNearestCamp(camp);
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60),
        });

        if (routeLayerRef.current) {
          routeLayerRef.current.clearLayers();

          const polyline = window.L.geoJSON(route.geometry, {
            style: {
              color: "#dc2626",
              weight: 5,
              opacity: 0.8,
              dashArray: "2, 8",
            },
          });

          routeLayerRef.current.addLayer(polyline);

          const bounds = window.L.latLngBounds([
            [startLat, startLng],
            [endLat, endLng],
          ]);
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        throw new Error("No routes found");
      }
    } catch (err) {
      console.error("OSRM Routing Error:", err);
      toast.error("Unable to calculate driving route. Falling back to straight-line route.", { id: toastId });
      drawStraightLineRoute(start, camp);
    }
  };

  // Calculate route triggered by user actions
  const calculateRouteToCamp = useCallback(async (camp, customStartCoords = null) => {
    const start = customStartCoords || mapGeocodedLocation;
    if (!start) {
      const toastId = toast.loading("Locating you first using browser GPS...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.dismiss(toastId);
          const gpsCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label: "Your Current Location (GPS)",
          };
          setMapGeocodedLocation(gpsCoords);
          updateUserMarker(gpsCoords);
          fetchDrivingRoute(gpsCoords, camp);
        },
        (error) => {
          toast.dismiss(toastId);
          console.error("GPS error:", error);
          toast.error("Please search your City or ZIP code first in the finder bar.");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
      return;
    }

    fetchDrivingRoute(start, camp);
  }, [mapGeocodedLocation]);

  // Handle map search via Nominatim
  const handleMapSearch = async () => {
    if (!mapSearchTerm.trim()) return;

    setIsSearchingMap(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchTerm)}&limit=1`;
      const res = await axios.get(url);

      if (res.data && res.data.length > 0) {
        const first = res.data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        const label = first.display_name;

        const coords = { lat, lng, label };
        setMapGeocodedLocation(coords);
        updateUserMarker(coords);

        mapRef.current.setView([lat, lng], 13);

        const closest = findNearestCampToCoordinates(lat, lng);
        if (closest) {
          fetchDrivingRoute(coords, closest);
        } else {
          toast.success(`Location set: ${first.name || "Searched area"}. No camps found.`);
        }
      } else {
        toast.error("Location not found. Please try a different city name or ZIP code.");
      }
    } catch (err) {
      console.error("Geocoding Error:", err);
      toast.error("Failed to connect to Nominatim Geolocation services.");
    } finally {
      setIsSearchingMap(false);
    }
  };

  // Handle GPS locator
  const handleGpsLocate = () => {
    setIsLocatingGps(true);
    const toastId = toast.loading("Requesting GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss(toastId);
        toast.success("Location updated!");
        setIsLocatingGps(false);

        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Your Current Location (GPS)",
        };

        setMapGeocodedLocation(coords);
        updateUserMarker(coords);
        mapRef.current.setView([coords.lat, coords.lng], 13);

        const closest = findNearestCampToCoordinates(coords.lat, coords.lng);
        if (closest) {
          fetchDrivingRoute(coords, closest);
        } else {
          toast.info("No camps found nearby.");
        }
      },
      (err) => {
        toast.dismiss(toastId);
        console.error("GPS error:", err);
        toast.error("GPS coordinates access denied or timed out.");
        setIsLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Clear map routing
  const handleClearMapRoute = () => {
    setMapGeocodedLocation(null);
    setNearestCamp(null);
    setRouteInfo(null);
    setMapSearchTerm("");

    if (userMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    }

    const validCamps = camps.filter((c) => c.coordinates && c.coordinates.lat && c.coordinates.lng);
    if (validCamps.length > 0 && mapRef.current) {
      const bounds = window.L.latLngBounds(
        validCamps.map((c) => [c.coordinates.lat, c.coordinates.lng])
      );
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  // Register handleCalculateRouteToCamp globally for Leaflet popup handlers
  useEffect(() => {
    window.handleCalculateRouteToCamp = (campId) => {
      const targetCamp = camps.find((c) => c._id === campId);
      if (targetCamp) {
        calculateRouteToCamp(targetCamp);
      }
    };
    return () => {
      delete window.handleCalculateRouteToCamp;
    };
  }, [camps, calculateRouteToCamp]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!window.L) {
      console.error("Leaflet.js is not loaded.");
      return;
    }

    if (!mapRef.current) {
      const map = window.L.map("camp-leaflet-map", {
        center: [23.0225, 72.5714], // Ahmedabad default
        zoom: 12,
        zoomControl: true,
      });

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;
      markersLayerRef.current = window.L.layerGroup().addTo(map);
      routeLayerRef.current = window.L.layerGroup().addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update camp pinpoints when camps list changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const campIcon = window.L.divIcon({
      className: "custom-camp-icon",
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 border-2 border-red-500 shadow-md transform -translate-y-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    camps.forEach((camp) => {
      if (camp.coordinates && camp.coordinates.lat && camp.coordinates.lng) {
        const marker = window.L.marker(
          [camp.coordinates.lat, camp.coordinates.lng],
          { icon: campIcon }
        );

        const popupContent = `
          <div class="p-2 font-sans">
            <h4 class="font-bold text-red-800 text-sm mb-1">${camp.title}</h4>
            <p class="text-xs text-gray-700 mb-1"><b>Venue:</b> ${camp.location.venue}, ${camp.location.city}</p>
            <p class="text-xs text-gray-600 mb-2"><b>Date:</b> ${new Date(camp.date).toLocaleDateString()}</p>
            <div class="flex gap-1.5 mt-2">
              <button 
                onclick="window.handleCalculateRouteToCamp('${camp._id}')" 
                class="bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold py-1.5 px-3 rounded shadow cursor-pointer transition-colors border-none"
              >
                Directions Here
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersLayerRef.current.addLayer(marker);
      }
    });

    const validCamps = camps.filter((c) => c.coordinates && c.coordinates.lat && c.coordinates.lng);
    if (validCamps.length > 0 && !userMarkerRef.current) {
      const bounds = window.L.latLngBounds(
        validCamps.map((c) => [c.coordinates.lat, c.coordinates.lng])
      );
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [camps]);

  // Fetch donor profile to get donor ID for registration check
  useEffect(() => {
    const fetchDonorProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await donorApi.getProfile();
          const profilePayload = res.data.data || res.data;
          const donorData = profilePayload.profile || profilePayload.donor || profilePayload;
          if (donorData && donorData._id) {
            setDonorId(donorData._id);
          }
        }
      } catch (err) {
        console.error("Error fetching donor profile:", err);
      }
    };
    fetchDonorProfile();
  }, []);

  const handleRegisterForCamp = (campId) => {
    // Open Pre-Screening Quiz Modal
    setQuizCampId(campId);
    setCurrentQuizIndex(0);
    setQuizAnswers({});
    setQuizIneligible(false);
    setQuizFinished(false);
    setShowQuizModal(true);
  };

  const executeCampRegistration = async () => {
    setShowQuizModal(false);
    setRegisteringId(quizCampId);
    try {
      const res = await donorApi.registerForCamp(quizCampId);
      if (res.data && res.data.success) {
        toast.success(res.data.message || "Successfully registered for the camp!");
        await fetchCamps({ silent: true });
      } else {
        toast.error("Failed to register for camp");
      }
    } catch (err) {
      console.error("Camp registration error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to register for camp");
    } finally {
      setRegisteringId(null);
      setQuizCampId(null);
    }
  };

  const handleQuizAnswer = (answer) => {
    const currentQuestion = QUIZ_QUESTIONS[currentQuizIndex];
    const isDisqualified = answer !== currentQuestion.expected;
    
    setQuizAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));

    if (isDisqualified) {
      setQuizIneligible(true);
      return;
    }

    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleSimulateDonation = async (campId) => {
    setSimulatingId(campId);
    try {
      const res = await donorApi.simulateCampDonation(campId);
      if (res.data && res.data.success) {
        toast.success(res.data.message || "Donation simulated successfully!");
        navigate("/donor/certificates");
      } else {
        toast.error("Failed to simulate donation");
      }
    } catch (err) {
      console.error("Donation simulation error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to simulate donation");
    } finally {
      setSimulatingId(null);
    }
  };
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
    currentPage: 1,
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchCamps = useCallback(async ({ silent = false } = {}) => {
    // NOTE: Using localStorage token as per original code. This should be replaced with a proper auth flow (e.g., Firebase auth) in a production environment.
    const token = localStorage.getItem("token"); 
    if (!token) {
      setError("Authentication required. Please log in to view camps.");
      toast.error("Authentication token missing.");
      setCamps([]);
      return;
    }
    
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const statusParam = filter === 'all' ? '' : filter;
      // NOTE: In your backend, ensure the API handler is using Mongoose .populate('hospital', 'name')
      // to include the Facility name in the response data.
      const params = {
        ...(statusParam && { status: statusParam }),
        page: pagination.page,
        limit: pagination.limit,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      };

      const response = await api.get("/donor/camps", { params });

      const { data: responseData } = response.data;

      console.log("✅ Camps fetched successfully:", responseData);
      
      if (responseData && responseData.camps) {
        setCamps(responseData.camps);
        // Assuming pagination data is available in response.data.pagination
        setPagination(prev => ({ 
          ...prev, 
          total: responseData.pagination?.total || responseData.camps.length,
          totalPages: responseData.pagination?.pages || 1,
          currentPage: responseData.pagination?.page || 1
        }));
      } else {
        console.error("API response missing expected data:", response.data);
        throw new Error("Invalid response structure received from server.");
      }
      
    } catch (err) {
      console.error("❌ Fetch Camps Error:", err);
      let message = err.response?.data?.message || err.message || "Failed to fetch camps.";
      
      if (err.response?.status === 401 || err.response?.status === 403) {
          message = "Authentication failed or unauthorized. Please log in again.";
      }
      
      toast.error(message);
      setError(message);
      setCamps([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 1, currentPage: 1 }));
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.page, pagination.limit, debouncedSearchTerm]); // Include searchTerm in dependencies

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  useCampRealtime(
    ({ event, title } = {}) => {
      fetchCamps({ silent: true });
      if (event === "new-camp" && title) {
        toast.success(`New camp available: ${title}`, { icon: "🩸" });
      } else if (event === "camp-updated" && title) {
        toast(`${title} was updated`, { icon: "📋" });
      } else if (event === "camp-deleted" && title) {
        toast(`${title} was removed`, { icon: "🗑️" });
      }
    },
    { enabled: Boolean(localStorage.getItem("token")) },
  );

  // Filtering is now handled on the backend via the 'q' parameter in fetchCamps
  // We use the full 'camps' list here which should be the filtered result from the API
  const displayedCamps = camps;


  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const totalPages = useMemo(() => pagination.totalPages, [pagination.totalPages]);
  const currentPage = useMemo(() => pagination.currentPage, [pagination.currentPage]);

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <Toaster />
      
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-rose-700 to-red-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-red-600/40">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center md:items-end">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-end text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-red-600 font-black flex items-center justify-center shadow-2xl ring-4 ring-white/20 flex-shrink-0">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-red-600 text-red-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                Blood Donation Camps
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-red-100/90 mt-1">
                Find nearby blood donation camps, locate live GPS driving routes, and register to save lives!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md text-white border border-white/20 text-xs font-black">
              {camps.length} Active Camps Available
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Camps Leaflet Map Card */}
      <div className="bg-white rounded-3xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 overflow-hidden">
        {/* Map Card Control Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/80">
          <div>
            <h2 className="text-lg font-black text-slate-850 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600 animate-bounce" />
              <span>Interactive Camp Finder Map</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Enter your city or ZIP code to auto-center the map, locate pins, and calculate live driving directions.
            </p>
          </div>
          
          {/* Map Search Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px] sm:min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter city or ZIP code..."
                value={mapSearchTerm}
                onChange={(e) => setMapSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMapSearch()}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-extrabold text-slate-850 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
              />
            </div>
            <button
              onClick={handleMapSearch}
              disabled={isSearchingMap || !mapSearchTerm.trim()}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer hover:scale-105"
            >
              {isSearchingMap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search</span>
            </button>
            <button
              onClick={handleGpsLocate}
              disabled={isLocatingGps}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer hover:scale-105"
            >
              {isLocatingGps ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
              <span>Locate Me</span>
            </button>
            {(nearestCamp || mapGeocodedLocation) && (
              <button
                onClick={handleClearMapRoute}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer border border-slate-200/80"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[480px]">
          {/* Map Container */}
          <div className="flex-1 relative bg-slate-100 h-[280px] lg:h-full">
            <div id="camp-leaflet-map" className="w-full h-full relative" style={{ zIndex: 1 }} />
          </div>

          {/* Route/Directions Sidebar */}
          <div className="w-full lg:w-96 p-6 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-between bg-slate-50/50 h-[200px] lg:h-full overflow-y-auto">
            {nearestCamp && routeInfo ? (
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="space-y-4">
                  <div className="p-4 bg-red-50/80 rounded-2xl border border-red-100 space-y-1">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-wider block">
                      Nearest Camp Found
                    </span>
                    <h4 className="font-extrabold text-slate-850 text-sm leading-snug">
                      {nearestCamp.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <span className="truncate">{nearestCamp.location?.venue}, {nearestCamp.location?.city}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-2xs text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Distance</span>
                      <span className="text-base font-black text-slate-850">
                        {routeInfo.distance} km
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-2xs text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Duration</span>
                      <span className="text-base font-black text-slate-850">
                        {routeInfo.duration} mins
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${mapGeocodedLocation.lat},${mapGeocodedLocation.lng}&destination=${nearestCamp.coordinates?.lat},${nearestCamp.coordinates?.lng}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-black py-3 rounded-2xl text-center text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/20 cursor-pointer hover:scale-105"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Google Maps</span>
                    </a>
                    <button
                      onClick={() => {
                        if (nearestCamp.status.toLowerCase() === "upcoming") {
                          handleRegisterForCamp(nearestCamp._id);
                        } else {
                          toast.error(`Camp status is "${nearestCamp.status}". Registration is only available for upcoming camps.`);
                        }
                      }}
                      className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-black py-3 rounded-2xl text-center text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      <span>Register for Camp</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3 flex gap-2 text-[11px] text-blue-800 font-medium">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 animate-bounce" />
                    <div className="overflow-hidden min-w-0">
                      <span className="font-black block mb-0.5 uppercase tracking-wider text-[10px]">Your Search Center:</span>
                      <span className="text-slate-600 font-semibold truncate block">
                        {mapGeocodedLocation.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-4 px-4 space-y-3">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100 shadow-2xs animate-pulse">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-slate-850 text-sm">Route Finder & Directions</h4>
                  <p className="text-xs text-slate-400 font-medium max-w-[240px] mt-1 leading-relaxed">
                    Type your city/ZIP code above or click "Locate Me" to compute driving directions to the nearest camp.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200/70 text-[11px] text-slate-500 text-left space-y-1.5 w-full shadow-2xs">
                  <div className="flex items-center gap-1.5 font-black text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Map Legend</span>
                  </div>
                  <p>🔴 Red pins: Active Camp Locations</p>
                  <p>🔵 Blue pin: Your Search Area</p>
                  <p>🛣️ Dashed line: Driving Route Path</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Results Summary */}
        {!loading && camps.length > 0 && (
          <div className="mb-4 px-2">
            <p className="text-sm text-gray-600">
              Showing {displayedCamps.length} camps
              {searchTerm && (
                <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
              . Total found: {pagination.total}.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center p-12 bg-white rounded-2xl shadow-lg border border-red-100">
            <Loader2 className="w-8 h-8 text-red-500 mx-auto animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading camps...</p>
            <p className="text-sm text-gray-500 mt-1">Finding the best donation opportunities for you</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && camps.length === 0 && (
          <div className="text-center p-8 sm:p-12 bg-red-50 rounded-2xl shadow-lg border border-red-300">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplet className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-red-700 font-semibold mb-2">Unable to Load Camps</p>
            <p className="text-sm text-red-600 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchCamps()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Camp List */}
        {!loading && displayedCamps.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {displayedCamps.map((camp) => (
                <CampCard
                  key={camp._id}
                  camp={camp}
                  onRegister={handleRegisterForCamp}
                  onSimulateDonation={handleSimulateDonation}
                  registeringId={registeringId}
                  simulatingId={simulatingId}
                  currentDonorId={donorId}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 bg-white p-4 rounded-2xl shadow-md border border-red-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="p-2.5 border border-red-300 rounded-xl text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-gray-700 text-sm font-medium min-w-[100px] text-center">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="p-2.5 border border-red-300 rounded-xl text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" /> 
                </button>
              </div>
              
              <span className="text-sm text-gray-500 text-center sm:text-left">
                {pagination.total} Total Camps • {pagination.limit} per page
              </span>
            </div>
          </>
        )}

        {/* No Search/Filter Results State */}
        {!loading && displayedCamps.length === 0 && !error && (
          <div className="text-center p-8 sm:p-12 bg-white rounded-2xl shadow-lg border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplet className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm ? 'No Matching Camps Found' : 'No Camps Available'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm 
                ? `No camps found matching "${searchTerm}" with the current filter.`
                : "There are no camps matching the current filter. Try adjusting your filter."
              }
            </p>
            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl transition-colors font-medium"
              >
                Show All Camps
              </button>
            )}
          </div>
        )}
        {/* Pre-Screening Quiz Modal */}
        {showQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-red-100 animate-in fade-in zoom-in-95 duration-205">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-red-50/30">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Donor Pre-Screening Quiz
                  </h3>
                </div>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {!quizIneligible && !quizFinished && (
                  <div className="space-y-6">
                    {/* Progress indicator */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <span>{QUIZ_QUESTIONS[currentQuizIndex].category}</span>
                      <span>Question {currentQuizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                    </div>

                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 transition-all duration-300"
                        style={{ width: `${((currentQuizIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                      ></div>
                    </div>

                    {/* Question Card */}
                    <div className="py-4">
                      <h4 className="text-lg font-bold text-slate-800 leading-snug">
                        {QUIZ_QUESTIONS[currentQuizIndex].question}
                      </h4>
                    </div>

                    {/* Option Buttons */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={() => handleQuizAnswer("Yes")}
                        className="py-3 px-6 rounded-2xl border-2 border-slate-200 hover:border-red-600 hover:bg-red-50/10 text-slate-700 hover:text-red-700 font-bold transition-all text-center focus:outline-none cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleQuizAnswer("No")}
                        className="py-3 px-6 rounded-2xl border-2 border-slate-200 hover:border-red-600 hover:bg-red-50/10 text-slate-700 hover:text-red-700 font-bold transition-all text-center focus:outline-none cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                {/* Ineligibility Warning Panel */}
                {quizIneligible && (
                  <div className="space-y-6 text-center py-4">
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">
                        Ineligibility Alert
                      </h4>
                      <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                        {QUIZ_QUESTIONS[currentQuizIndex].disqualificationMessage}
                      </p>
                      <p className="text-slate-500 mt-4 text-xs">
                        Based on safety guidelines, you do not meet the criteria to donate blood at this time.
                      </p>
                    </div>
                    <div className="pt-4">
                      <button
                        onClick={() => setShowQuizModal(false)}
                        className="w-full bg-slate-850 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Close Quiz
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Panel */}
                {quizFinished && (
                  <div className="space-y-6 text-center py-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">
                        Pre-Screening Cleared!
                      </h4>
                      <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                        You have successfully passed the pre-screening eligibility checks. You are fit and ready to donate!
                      </p>
                      <p className="text-slate-500 mt-2 text-xs">
                        Click below to complete your registration slot.
                      </p>
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button
                        onClick={() => setShowQuizModal(false)}
                        className="flex-1 py-3 px-4 border border-slate-250 rounded-xl hover:bg-slate-50 text-slate-600 font-semibold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={executeCampRegistration}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Proceed & Register
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default DonorCampsList;