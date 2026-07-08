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
  console.log("CampCard render:", camp.title, "isRegistered:", camp.isRegistered, "registeredDonors:", camp.registeredDonors, "currentDonorId:", currentDonorId);
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
  // const isOngoing = camp.status === 'Ongoing';

  const statusColor = isCancelled
    ? "bg-red-100 text-red-600 border-red-200"
    : isCompleted
    ? "bg-gray-100 text-gray-600 border-gray-200"
    : "bg-green-100 text-green-600 border-green-200";

  // --- Using schema fields: date and time {start, end} ---
  const campDate = new Date(camp.date);
  const dateStr = campDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const timeStr = `${camp.time?.start || 'N/A'} - ${camp.time?.end || 'N/A'}`;
  
  // --- Using schema fields: expectedDonors and actualDonors ---
  const expectedDonors = camp.expectedDonors || 0;
  const actualDonors = camp.actualDonors || 0; 
  
  const slotsAvailable = expectedDonors > 0 ? expectedDonors - actualDonors : 0;
  const isFull = slotsAvailable <= 0 && expectedDonors > 0 && !isCompleted && !isCancelled;

  // 1. Full Address including Pincode
  const { venue, city, state, pincode } = camp.location || {};
  const locationStr = `${venue}, ${city}, ${state} - ${pincode}`;
  
  // Assuming the populated hospital object has a 'name' field from the Facility model
  const hospitalName = camp.hospital?.name || 'Associated Facility Missing';

  // Donor Capacity Logic
  const renderDonorCapacity = () => {
    if (isUpcoming) {
      return (
        <span className="font-medium text-gray-600">
          {expectedDonors} Expected Donors (Capacity)
        </span>
      );
    } 
    
    // For Ongoing, Completed, or Cancelled (where data might be relevant)
    return (
      <span className="font-medium text-gray-600">
        {actualDonors} Achieved / {expectedDonors} Expected
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl p-6 border-2 overflow-hidden ${
      isCancelled ? 'border-red-200 opacity-70' : 'border-red-100'
    }`}>
      {/* Header with status badge */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <h4 className={`text-xl font-bold leading-tight ${
          isCancelled ? 'text-gray-500' : 'text-gray-800'
        }`}>
          {camp.title}
        </h4>
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${statusColor} self-start sm:self-auto`}>
          {camp.status}
        </span>
      </div>
      
      {/* Hospital/Facility Name */}
      <div className="flex items-center gap-3 text-sm text-gray-700 mb-3 font-semibold">
        <Building2 className="w-4 h-4 text-red-500 flex-shrink-0" />
        <span className="truncate">{hospitalName}</span>
      </div>

      {/* Primary Camp details */}
      <div className="space-y-3 text-sm text-gray-600 mb-4">
        {/* Full Address Display */}
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="leading-relaxed block">{locationStr}</span>
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold mt-1 transition-colors"
              >
                Get Directions <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{dateStr}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{timeStr}</span>
        </div>
        {camp.hospital?.phone && (
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>Contact: {camp.hospital.phone}</span>
          </div>
        )}
        {camp.hospital?.email && (
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="truncate block max-w-[200px]">Email: {camp.hospital.email}</span>
          </div>
        )}
      </div>

      {/* Donor Metrics Summary */}
      <div className="pt-4 border-t border-gray-100 flex flex-col justify-between items-start gap-3">
        {/* Donor Capacity Display (Updated logic) */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-red-500" />
          <span className="font-semibold text-gray-700">Capacity:</span>
          {renderDonorCapacity()}
        </div>
        
        {/* Remaining Need - Only visible if not Completed or Cancelled */}
        {!isCompleted && !isCancelled && (
            <div className="flex items-center gap-2 text-sm">
                <ListPlus className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-gray-700">Remaining Need:</span>
                <span className={`font-bold ${
                    isFull ? 'text-red-600' : 'text-green-600'
                }`}>
                    {isFull ? 'Full (Capacity Reached)' : `${slotsAvailable} slots remaining`}
                </span>
            </div>
        )}
        
        {/* Description Section (Always visible) */}
        <div className="pt-4 border-t border-gray-100 w-full mt-3">
          {/* Description */}
          <div>
            <h5 className="font-bold text-gray-800 mb-1 flex items-center gap-2"><Droplet className="w-4 h-4" /> Description</h5>
            <p className="text-gray-600 text-sm italic whitespace-pre-wrap">{camp.description || 'No detailed description provided for this camp.'}</p>
          </div>
        </div>

        {/* Register Button - Only if status is Upcoming */}
        {isUpcoming && (
          <div className="mt-6 w-full space-y-2">
            {isRegistered ? (
              <>
                <button
                  disabled
                  className="w-full bg-green-50 text-green-700 font-semibold py-2.5 px-4 rounded-xl border border-green-200 flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                >
                  <Check className="w-4 h-4" /> Already Registered
                </button>
                <button
                  onClick={() => onSimulateDonation(camp._id)}
                  disabled={simulatingId === camp._id}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer border border-red-500 animate-fade-in"
                >
                  {simulatingId === camp._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Droplet className="w-4 h-4 text-white animate-pulse" />
                  )}
                  Simulate Donation & Get Certificate
                </button>
              </>
            ) : (
              <button
                onClick={() => onRegister(camp._id)}
                disabled={registeringId === camp._id}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {registeringId === camp._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
                Register & Donate
              </button>
            )}
          </div>
        )}
      </div>
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
    <div className="space-y-6">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Blood Donation Camps
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Find local opportunities to donate blood and save lives.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Maps Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-red-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-red-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-50/20 to-rose-50/20">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600 animate-pulse" />
                Interactive Camp Finder Map
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter your city/ZIP to auto-center the map, locate pins, and get real-time driving directions.
              </p>
            </div>
            
            {/* Map Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] sm:min-w-[260px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Enter city or ZIP code..."
                  value={mapSearchTerm}
                  onChange={(e) => setMapSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMapSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                />
              </div>
              <button
                onClick={handleMapSearch}
                disabled={isSearchingMap || !mapSearchTerm.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer h-[38px]"
              >
                {isSearchingMap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Search
              </button>
              <button
                onClick={handleGpsLocate}
                disabled={isLocatingGps}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer h-[38px]"
              >
                {isLocatingGps ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                Locate Me
              </button>
              {(nearestCamp || mapGeocodedLocation) && (
                <button
                  onClick={handleClearMapRoute}
                  className="bg-gray-150 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-gray-350 h-[38px]"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row h-[480px]">
            {/* Map Container */}
            <div className="flex-1 relative bg-gray-50 h-[280px] lg:h-full">
              <div id="camp-leaflet-map" className="w-full h-full relative" style={{ zIndex: 1 }} />
            </div>

            {/* Route/Directions Sidebar */}
            <div className="w-full lg:w-96 p-6 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col justify-between bg-slate-50/50 h-[200px] lg:h-full overflow-y-auto">
              {nearestCamp && routeInfo ? (
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide block mb-1">
                        Nearest Camp Found
                      </span>
                      <h4 className="font-bold text-gray-800 text-sm leading-tight">
                        {nearestCamp.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                        <span className="truncate">{nearestCamp.location?.venue}, {nearestCamp.location?.city}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
                        <span className="text-[10px] text-gray-500 block mb-0.5">Driving Distance</span>
                        <span className="text-base font-extrabold text-slate-800">
                          {routeInfo.distance} km
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
                        <span className="text-[10px] text-gray-500 block mb-0.5">Estimated Time</span>
                        <span className="text-base font-extrabold text-slate-800">
                          {routeInfo.duration} mins
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${mapGeocodedLocation.lat},${mapGeocodedLocation.lng}&destination=${nearestCamp.coordinates?.lat},${nearestCamp.coordinates?.lng}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-xl text-center text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in Google Maps
                      </a>
                      <button
                        onClick={() => {
                          if (nearestCamp.status.toLowerCase() === "upcoming") {
                            handleRegisterForCamp(nearestCamp._id);
                          } else {
                            toast.error(`Camp status is "${nearestCamp.status}". Registration is only available for upcoming camps.`);
                          }
                        }}
                        className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 font-semibold py-2 rounded-xl text-center text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        Register for Camp
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-2.5 flex gap-2 text-[10px] text-blue-800">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5 animate-bounce" />
                      <div className="overflow-hidden">
                        <span className="font-semibold block mb-0.5">Your Search Center:</span>
                        <span className="text-gray-600 truncate block max-w-full">
                          {mapGeocodedLocation.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full py-2 px-4">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3 text-red-500 border border-red-100 animate-pulse">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">
                    Route Finder & Directions
                  </h4>
                  <p className="text-[11px] text-gray-500 max-w-[240px] leading-relaxed">
                    Type your city/ZIP code above or click "Locate Me" to compute the driving route to the nearest camp.
                  </p>
                  <div className="mt-4 p-2.5 bg-white rounded-xl border border-gray-100 text-[10px] text-gray-500 text-left space-y-1 w-full shadow-sm">
                    <div className="flex items-center gap-1 font-semibold text-gray-700 mb-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>Map Legend</span>
                    </div>
                    <p>🔴 Red pins: Camp Locations</p>
                    <p>🔵 Blue pin: Your Search Area</p>
                    <p>🛣️ Dashed red line: Driving Route path</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls and Filtering */}
        <div className="bg-white rounded-2xl shadow-md border border-red-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search camps, locations, hospital name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <Filter className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <select
                  value={filter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  disabled={loading}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchCamps()}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2.5 rounded-xl transition-all duration-200 border border-red-200 font-medium min-w-[120px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
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
    </div>
  );
};

export default DonorCampsList;