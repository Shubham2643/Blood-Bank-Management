// src/pages/footer/BloodRequest.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { SOCKET_URL } from "../../config/env.js";
import { publicApi } from "../../services/api.js";
import {
  Droplet,
  AlertCircle,
  Search,
  Hospital,
  MapPin,
  Phone,
  Clock,
  Calendar,
  Users,
  Heart,
  CheckCircle,
  XCircle,
  Loader2,
  Activity,
  Ambulance,
  FileText,
  Shield,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  User,
  Mail,
  Info
} from "lucide-react";
import { toast } from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Vadodara",
  "Rajkot", "Indore", "Bhopal", "Nagpur", "Coimbatore", "Patna",
  "Chandigarh", "Kochi", "Visakhapatnam", "Nashik", "Agra", "Varanasi",
];

const URGENCY_CONFIG = {
  critical: { label: "Critical", color: "#dc2626", bg: "bg-red-50", badge: "bg-red-50 text-red-700 border-red-100", border: "#dc2626" },
  emergency: { label: "Emergency", color: "#ea580c", bg: "bg-orange-50", badge: "bg-orange-50 text-orange-700 border-orange-100", border: "#ea580c" },
  high: { label: "High", color: "#ca8a04", bg: "bg-yellow-50", badge: "bg-yellow-50 text-yellow-750 border-yellow-100", border: "#ca8a04" },
  normal: { label: "Normal", color: "#16a34a", bg: "bg-green-50", badge: "bg-green-50 text-green-700 border-green-100", border: "#16a34a" },
};

// ─── Helper ────────────────────────────────────────────────────────────────────
const timeAgo = (dateString) => {
  const secs = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const EMPTY_FORM = {
  patientName: "", bloodType: "", units: "", hospital: "", city: "",
  contactPerson: "", phone: "", email: "", urgency: "normal",
  requiredBy: "", reason: "", additionalInfo: "",
};

// ─── RespondModal ─────────────────────────────────────────────────────────────
const RespondModal = ({ request, onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Please enter your name"); return; }
    setLoading(true);
    await onSubmit(request._id, form);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              Respond as Donor
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
              {request.bloodType} Needed · {request.hospital}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-red-900 flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-red-500" /> Case Details Summary
            </p>
            <p className="text-xs text-red-700 font-semibold leading-relaxed">
              <strong>{request.units} units of {request.bloodType}</strong> requested at {request.hospital}, {request.city}.<br />
              Primary Contact: <strong>{request.contactPerson}</strong> ({request.phone})
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Your Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Your Phone (optional)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-grow px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-100 hover:shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                Confirm Response
              </button>
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 font-bold text-sm active:scale-95 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

// ─── RequestCard ──────────────────────────────────────────────────────────────
const RequestCard = ({ request, onRespond, isNew }) => {
  const urgency = URGENCY_CONFIG[request.urgency] || URGENCY_CONFIG.normal;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden relative group ${
        isNew ? "ring-2 ring-red-400 ring-offset-2" : ""
      }`}
    >
      {/* Visual colored left border indicator strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: urgency.border }} />

      {isNew && (
        <div className="bg-red-600 text-white text-[10px] font-black px-4 py-1 flex items-center gap-1.5 uppercase tracking-wider relative z-10">
          <Activity className="w-3.5 h-3.5 animate-pulse" /> NEW DISPATCHED REQUEST
        </div>
      )}

      <div className="p-5 sm:p-6 pl-7 sm:pl-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          {/* Left Grid Detail panel */}
          <div className="flex-1 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-rose-100">
                <Droplet className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2.5">
                  <h3 className="text-base font-black text-slate-800 tracking-tight">
                    {request.bloodType} Blood Needed
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1 ${urgency.badge}`}>
                    {request.urgency === "critical" || request.urgency === "emergency"
                      ? <AlertTriangle className="w-3 h-3" />
                      : <AlertCircle className="w-3 h-3" />}
                    {urgency.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-1">
                  <Hospital className="w-3.5 h-3.5 text-slate-400" /> {request.hospital}
                  <span className="text-slate-300">•</span>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {request.city}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Patient Name</p>
                <p className="text-xs font-bold text-slate-700 truncate">{request.patientName}</p>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Units Required</p>
                <p className="text-xs font-bold text-slate-700">{request.units} units</p>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Required By</p>
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(request.requiredBy).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Time Posted</p>
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {timeAgo(request.createdAt)}
                </p>
              </div>
            </div>

            {request.reason && (
              <div className="flex items-start gap-2 bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/65 text-xs text-slate-500 font-semibold leading-relaxed">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span><strong>Clinical Reason:</strong> {request.reason}</span>
              </div>
            )}
          </div>

          {/* Right Action panel */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3.5 lg:min-w-[150px] shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 justify-between lg:justify-start">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>{request.donorsResponded?.length ?? 0} Responses</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRespond(request)}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-100 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5" /> Donate Blood
              </button>
              <a
                href={`tel:${request.phone}`}
                className="p-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors active:scale-95 cursor-pointer"
                title="Call contact person"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const BloodRequest = () => {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Pre-fill search/filters from query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get("type");
    if (typeParam) {
      setSearchTerm(typeParam);
    }
  }, [location.search]);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connected, setConnected] = useState(false);
  const [newIds, setNewIds] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBloodType, setFilterBloodType] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");

  // Forms & modals
  const [showForm, setShowForm] = useState(false);
  const [respondTarget, setRespondTarget] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const socketRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await publicApi.getBloodRequests({ status: "active" });
      setRequests(res.data.requests || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch blood requests:", err);
      if (!silent) toast.error("Failed to load blood requests. Is the server running?");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Socket.io real-time ────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new-blood-request", (newReq) => {
      setRequests((prev) => {
        if (prev.find((r) => r._id === newReq._id)) return prev;
        return [newReq, ...prev];
      });
      setNewIds((prev) => new Set([...prev, newReq._id]));
      setTimeout(() => {
        setNewIds((prev) => { const s = new Set(prev); s.delete(newReq._id); return s; });
      }, 8000);
      toast.success(`🩸 New ${newReq.bloodType} blood request in ${newReq.city}!`);
      setLastUpdated(new Date());
    });

    socket.on("blood-request-updated", ({ id, donorsResponded }) => {
      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, donorsResponded: Array(donorsResponded).fill({}) } : r
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filtered = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      r.patientName?.toLowerCase().includes(term) ||
      r.hospital?.toLowerCase().includes(term) ||
      r.city?.toLowerCase().includes(term);
    const matchBT = filterBloodType === "all" || r.bloodType === filterBloodType;
    const matchCity = filterCity === "all" || r.city?.toLowerCase() === filterCity.toLowerCase();
    const matchUrg = filterUrgency === "all" || r.urgency === filterUrgency;
    return matchSearch && matchBT && matchCity && matchUrg;
  });

  // Sort by urgency priority
  const urgencyOrder = { critical: 0, emergency: 1, high: 2, normal: 3 };
  const sorted = [...filtered].sort((a, b) =>
    (urgencyOrder[a.urgency] ?? 4) - (urgencyOrder[b.urgency] ?? 4)
  );

  // ── Submit new request ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const required = ["patientName","bloodType","units","hospital","city","contactPerson","phone","requiredBy"];
    const missing = required.filter((k) => !formData[k]);
    if (missing.length) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await publicApi.postBloodRequest(formData);
      toast.success("✅ Blood request posted! Donors nearby will be notified.");
      setShowForm(false);
      setFormData(EMPTY_FORM);
      fetchRequests(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit request. Please try again.";
      toast.error(msg);
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Respond to request ──────────────────────────────────────────────────────
  const handleRespond = async (id, data) => {
    try {
      const res = await publicApi.respondToBloodRequest(id, data);
      toast.success(`🙏 Thank you! The hospital will contact you. ${res.data.donorsResponded} donor(s) have responded.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register your response.");
    }
  };

  const clearFilters = () => {
    setFilterBloodType("all");
    setFilterCity("all");
    setFilterUrgency("all");
    setSearchTerm("");
  };

  const stats = {
    total: requests.length,
    urgent: requests.filter((r) => r.urgency === "critical" || r.urgency === "emergency").length,
    cities: [...new Set(requests.map((r) => r.city))].length,
    responded: requests.reduce((sum, r) => sum + (r.donorsResponded?.length ?? 0), 0),
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Helmet>
        <title>Blood Request Portal – Urgent Blood Needs | LifeDrop</title>
        <meta name="description" content="View and respond to urgent blood requests across India. Post requirements or help save lives by connecting with hospitals in real time." />
      </Helmet>
      <Header />
      
      <main className="flex-grow">
        
        {/* ── Hero Section ── */}
        <div className="bg-gradient-to-br from-red-700 via-red-600 to-rose-700 text-white relative overflow-hidden pt-24 pb-12 sm:pb-16">
          {/* Background soft blurs */}
          <div className="absolute inset-0">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                <Ambulance className="w-4 h-4 animate-bounce" />
                Emergency Blood Dispatch
                <span className={`ml-1 w-2.5 h-2.5 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-slate-400"}`} />
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight leading-none">
                Emergency Blood Request Portal
              </h1>
              
              <p className="text-sm sm:text-base text-red-100 max-w-xl mx-auto font-semibold">
                Every second counts. Post urgent blood requirements or check below to see active emergencies you can respond to right now.
              </p>

              {/* Glassmorphic Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6">
                {[
                  { label: "Active Emergency", value: loading ? "…" : stats.total },
                  { label: "Urgent Cases", value: loading ? "…" : stats.urgent },
                  { label: "Cities Reached", value: loading ? "…" : stats.cities },
                  { label: "Total Donors Joined", value: loading ? "…" : stats.responded },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-black tracking-tight">{value}</div>
                    <div className="text-[10px] font-bold text-red-200 mt-1 uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="container mx-auto px-4 py-8 max-w-5xl">

          {/* Action Header bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <button
                id="post-request-btn"
                onClick={() => setShowForm(true)}
                className="px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md shadow-rose-100 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <AlertCircle className="w-4 h-4" />
                Post Blood Request
              </button>
              <button
                onClick={() => fetchRequests(true)}
                disabled={refreshing}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
                title="Refresh listings"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Connection Status Label */}
            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
              connected 
                ? "bg-green-50 text-green-700 border-green-100" 
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              {connected ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
              {connected ? "Live Dispatch active" : "Offline"}
              {lastUpdated && (
                <span className="ml-1 text-slate-400 font-semibold">· Updated {timeAgo(lastUpdated)}</span>
              )}
            </div>
          </div>

          {/* Filter Deck */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-sm">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                id="search-requests"
                placeholder="Search case, hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold"
              />
            </div>
            
            <div className="relative">
              <select
                id="filter-blood-type"
                value={filterBloodType}
                onChange={(e) => setFilterBloodType(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold bg-white cursor-pointer appearance-none animate-none"
              >
                <option value="all">All Blood Types</option>
                {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="relative">
              <select
                id="filter-city"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold bg-white cursor-pointer appearance-none animate-none"
              >
                <option value="all">All Cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="relative">
              <select
                id="filter-urgency"
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold bg-white cursor-pointer appearance-none animate-none"
              >
                <option value="all">All Urgency</option>
                <option value="critical">Critical</option>
                <option value="emergency">Emergency</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          {!loading && (
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-xs font-bold text-slate-455">
                Showing <strong>{sorted.length}</strong> of <strong>{requests.length}</strong> active emergency cases
              </p>
              {(filterBloodType !== "all" || filterCity !== "all" || filterUrgency !== "all" || searchTerm) && (
                <button onClick={clearFilters} className="text-xs font-extrabold text-red-600 hover:text-red-750 cursor-pointer">
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
              <p className="text-slate-400 text-xs font-semibold">Syncing active requests board…</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && sorted.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Droplet className="w-8 h-8 text-red-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Active Cases Found</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto font-semibold mb-6">
                {requests.length === 0
                  ? "There are currently no active blood requests listed. Be the first to post if you have an urgent need."
                  : "No requests match your current search parameters."}
              </p>
              <div className="flex items-center justify-center gap-3">
                {requests.length > 0 && (
                  <button onClick={clearFilters} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all">
                    Clear Active Filters
                  </button>
                )}
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-100 cursor-pointer active:scale-95 transition-all"
                >
                  Post a Request
                </button>
              </div>
            </div>
          )}

          {/* Request Cases Listing */}
          {!loading && sorted.length > 0 && (
            <div className="space-y-4">
              {sorted.map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  onRespond={(r) => setRespondTarget(r)}
                  isNew={newIds.has(req._id)}
                />
              ))}
            </div>
          )}

          {/* Guidelines info Row */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: "Verified Requests", desc: "All dispatches are authenticated against hospital databases to ensure donor safety." },
              { icon: Activity, title: "Instant Notification", desc: "Dispatched requests stream instantly to near donors via real-time WebSocket links." },
              { icon: CheckCircle, title: "Eligible Donors", desc: "Please confirm your health criteria matches the requirements before responding." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-150 text-slate-400 group-hover:text-red-500 group-hover:bg-red-50/50 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      
      <Footer />

      {/* ── Post Request Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-50/90 backdrop-blur-md border-b border-slate-100 px-6 py-4.5 flex justify-between items-center rounded-t-3xl z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-1 bg-red-50 text-red-500 rounded-lg">
                    <Ambulance size={16} />
                  </div>
                  Post Urgent Blood Request
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Dispatched instantly to nearby compatible donors</p>
              </div>
              <button onClick={() => { setShowForm(false); setFormError(""); }} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-red-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" /> {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Patient Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name *</label>
                  <input type="text" name="patientName" value={formData.patientName}
                    onChange={(e) => setFormData(p => ({ ...p, patientName: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold" required />
                </div>

                {/* Blood Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Type *</label>
                  <select name="bloodType" value={formData.bloodType}
                    onChange={(e) => setFormData(p => ({ ...p, bloodType: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold bg-white cursor-pointer appearance-none animate-none" required>
                    <option value="">Select Blood Type</option>
                    {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Units */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Units Required *</label>
                  <input type="number" name="units" value={formData.units} min="1"
                    onChange={(e) => setFormData(p => ({ ...p, units: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold" required />
                </div>

                {/* Urgency */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Urgency Level *</label>
                  <select name="urgency" value={formData.urgency}
                    onChange={(e) => setFormData(p => ({ ...p, urgency: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold bg-white cursor-pointer appearance-none animate-none">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                {/* Hospital */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital Name *</label>
                  <input type="text" name="hospital" value={formData.hospital}
                    onChange={(e) => setFormData(p => ({ ...p, hospital: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold" required />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">City *</label>
                  <select name="city" value={formData.city}
                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold bg-white cursor-pointer appearance-none animate-none" required>
                    <option value="">Select City</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Contact Person */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Person *</label>
                  <input type="text" name="contactPerson" value={formData.contactPerson}
                    onChange={(e) => setFormData(p => ({ ...p, contactPerson: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold" required />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Phone *</label>
                  <input type="tel" name="phone" value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold" required />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email (optional)</label>
                  <input type="email" name="email" value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold" />
                </div>

                {/* Required By */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Required By *</label>
                  <input type="date" name="requiredBy" value={formData.requiredBy}
                    onChange={(e) => setFormData(p => ({ ...p, requiredBy: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-sm font-semibold bg-white" required />
                </div>

                {/* Reason */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</label>
                  <textarea name="reason" value={formData.reason} rows={2}
                    onChange={(e) => setFormData(p => ({ ...p, reason: e.target.value }))}
                    placeholder="e.g. Heart surgery scheduled, Emergency ICU case, Thalassemia treatment…"
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-xs font-semibold leading-relaxed resize-none" />
                </div>

                {/* Additional Info */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Information</label>
                  <textarea name="additionalInfo" value={formData.additionalInfo} rows={2}
                    onChange={(e) => setFormData(p => ({ ...p, additionalInfo: e.target.value }))}
                    placeholder="Any specific donor directions, facility locations, or instruction flags…"
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 text-xs font-semibold leading-relaxed resize-none" />
                </div>
              </div>

              {/* Geofence notice for post request */}
              {(formData.urgency === "critical" || formData.urgency === "emergency") && (
                <div className="bg-rose-50 border border-rose-100 text-red-800 text-xs px-4 py-3 rounded-2xl flex items-start gap-2.5 font-semibold animate-in fade-in duration-200">
                  <Info className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">🚨 Geofenced Broadcast Active</span>
                    <span className="text-red-700 leading-normal block mt-0.5">
                      Submitting a Critical/Emergency level request will trigger geofenced push and SMS messages to matched blood donors in a 10km radius of the hospital city. Use responsibly.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  id="submit-blood-request"
                  disabled={submitting}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-100 hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-60 transition-all"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                  {submitting ? "Posting Request…" : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError(""); }}
                  className="px-6 py-3.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 text-sm font-bold active:scale-95 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Respond Modal ── */}
      {respondTarget && (
        <RespondModal
          request={respondTarget}
          onClose={() => setRespondTarget(null)}
          onSubmit={handleRespond}
        />
      )}
    </div>
  );
};

export default BloodRequest;
