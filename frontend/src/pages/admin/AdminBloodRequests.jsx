import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Building,
  Building2,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FlaskConical,
  ShieldCheck,
  Activity,
  HeartHandshake,
  Droplet,
  Flame,
  ChevronDown,
  Check
} from "lucide-react";
import { adminApi } from "../../services/api";

// Custom 3D Glassmorphic Dropdown Menu Item
function CustomStatusDropdown({ currentStatus, options, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusBadgeStyle = (st) => {
    const styles = {
      pending: "bg-amber-50 text-amber-800 border-amber-200/90",
      accepted: "bg-blue-50 text-blue-800 border-blue-200/90",
      active: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      completed: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      fulfilled: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      rejected: "bg-rose-50 text-rose-800 border-rose-200/90",
      cancelled: "bg-slate-100 text-slate-700 border-slate-200/90",
      expired: "bg-slate-100 text-slate-700 border-slate-200/90",
      available: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      reserved: "bg-amber-50 text-amber-800 border-amber-200/90",
      used: "bg-slate-100 text-slate-700 border-slate-200/90",
    };
    return styles[st?.toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-slate-850 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
      >
        <span className="capitalize">{currentStatus}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl bg-white border border-slate-200/90 shadow-2xl py-2 z-50 animate-scaleIn space-y-0.5 ring-1 ring-slate-900/5">
          {options.map((opt) => {
            const isSelected = opt.value === currentStatus;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (opt.value !== currentStatus) onChange(opt.value);
                }}
                className={`w-full px-3.5 py-2 text-left text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${isSelected ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
              >
                <span className={`px-2 py-0.5 rounded-full text-[10px] border font-black ${getStatusBadgeStyle(opt.value)}`}>
                  ● {opt.label}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminBloodRequests() {
  const [activeTab, setActiveTab] = useState("hospital");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");

  // Selection
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { request, status }
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Requests
  const fetchRequests = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: currentPage,
        limit: 10,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (urgencyFilter !== "all") params.urgency = urgencyFilter;
      if (bloodTypeFilter !== "all") params.bloodType = bloodTypeFilter;

      let res;
      if (activeTab === "hospital") {
        res = await adminApi.getBloodRequests({ params });
      } else {
        res = await adminApi.getPublicRequests({ params });
      }

      const data = res.data?.data || res.data;
      setRequests(data.requests || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || (data.requests || []).length);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load blood requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, currentPage, statusFilter, urgencyFilter, bloodTypeFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Tab switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setStatusFilter("all");
    setUrgencyFilter("all");
    setBloodTypeFilter("all");
  };

  // Handle Update Status
  const handleUpdateStatus = async (request, status) => {
    try {
      setActionLoading(true);
      await adminApi.updateRequestStatus(request._id, { status });
      toast.success("Request status overridden successfully");
      setConfirmModal(null);
      fetchRequests();
    } catch (error) {
      toast.error("Failed to update request status");
    } finally {
      setActionLoading(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      normal: "bg-blue-50 text-blue-800 border-blue-200/90",
      high: "bg-amber-50 text-amber-800 border-amber-200/90",
      urgent: "bg-amber-50 text-amber-800 border-amber-200/90",
      emergency: "bg-rose-50 text-rose-800 border-rose-200/90",
      critical: "bg-rose-50 text-rose-800 border-rose-200/90",
    };
    return (
      <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border shadow-2xs ${styles[urgency?.toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
        ● {urgency?.toUpperCase() || "NORMAL"}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-800 border-amber-200/90",
      accepted: "bg-blue-50 text-blue-800 border-blue-200/90",
      active: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      completed: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      fulfilled: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      rejected: "bg-rose-50 text-rose-800 border-rose-200/90",
      cancelled: "bg-slate-100 text-slate-700 border-slate-200/90",
      expired: "bg-slate-100 text-slate-700 border-slate-200/90",
    };
    return (
      <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border shadow-2xs ${styles[status?.toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
        ● {status?.toUpperCase()}
      </span>
    );
  };

  const getBloodTypeBg = (bloodType) => {
    const colors = {
      "A+": "bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-red-600/30 border-red-400/40",
      "A-": "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30 border-rose-400/40",
      "B+": "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-600/30 border-blue-400/40",
      "B-": "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/30 border-sky-400/40",
      "O+": "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-600/30 border-emerald-400/40",
      "O-": "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/30 border-teal-400/40",
      "AB+": "bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-purple-600/30 border-purple-400/40",
      "AB-": "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/30 border-indigo-400/40"
    };
    return colors[bloodType] || "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-slate-600/30 border-slate-400/40";
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const emergencyCount = requests.filter(r => r.urgency === 'emergency' || r.urgency === 'critical' || r.urgency === 'high').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted' || r.status === 'completed' || r.status === 'active').length;

  const hospitalStatusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "rejected" },
  ];

  const publicStatusOptions = [
    { label: "Active", value: "active" },
    { label: "Fulfilled", value: "fulfilled" },
    { label: "Expired", value: "expired" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 3D Executive Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 border border-red-400/30 shrink-0">
            <FileText className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                Blood Requests & Dispatch Directory
              </h1>
              <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200/80 rounded-full font-black text-[10px] uppercase tracking-wider shadow-2xs">
                {totalCount} Total Requests
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Audit, verify, and override hospital and public emergency blood requests across accredited labs
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchRequests(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Sync Requests</span>
        </button>
      </div>

      {/* 4 Executive Clean & Uniform Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Total Requests
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black border border-slate-200/80 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalCount}</span>
            <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/80">
              Directory Total
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Pending Review
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black border border-amber-100 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{pendingCount}</span>
            <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80">
              Awaiting Action
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Urgent & Emergency
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black border border-rose-100 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{emergencyCount}</span>
            <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80">
              High Priority
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Accepted / Active
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{acceptedCount}</span>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
              Dispatched
            </span>
          </div>
        </div>
      </div>

      {/* Segmented 3D Tabs */}
      <div className="flex items-center gap-3 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 w-fit">
        <button
          onClick={() => handleTabChange("hospital")}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${activeTab === "hospital" ? "bg-white text-red-600 shadow-md border border-slate-100" : "text-slate-500 hover:text-slate-850"}`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hospital Requests</span>
        </button>
        <button
          onClick={() => handleTabChange("public")}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${activeTab === "public" ? "bg-white text-red-600 shadow-md border border-slate-100" : "text-slate-500 hover:text-slate-850"}`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Public Emergency Needs</span>
        </button>
      </div>

      {/* Glassmorphic Filters */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-5 sm:p-6 shadow-xl shadow-slate-100/80 flex flex-wrap gap-4 items-center justify-between hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              {activeTab === "hospital" ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </>
              ) : (
                <>
                  <option value="active">Active</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => { setUrgencyFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Urgency</option>
              <option value="normal">Normal</option>
              <option value="high">High / Urgent</option>
              <option value="emergency">Emergency / Critical</option>
            </select>
          </div>

          {/* Blood Type Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
            <select
              value={bloodTypeFilter}
              onChange={(e) => { setBloodTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main requests table */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 shadow-xl shadow-slate-100/80 overflow-hidden hover:shadow-2xl transition-all duration-300">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-2xl w-full"></div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-850 uppercase tracking-wide">No Requests Found</h3>
            <p className="text-xs font-semibold text-slate-400 max-w-sm mt-1">There are currently no blood requests matching your active filters.</p>
          </div>
        ) : activeTab === "hospital" ? (
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-100 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-3 sm:px-4">Hospital</th>
                  <th className="py-3.5 px-3 sm:px-4">Assigned Lab</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center">Group</th>
                  <th className="py-3.5 px-2 sm:px-3">Units</th>
                  <th className="py-3.5 px-3 sm:px-4">Urgency</th>
                  <th className="py-3.5 px-3 sm:px-4">Status</th>
                  <th className="py-3.5 px-3 sm:px-4">Requested At</th>
                  <th className="py-3.5 px-3 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-black text-slate-900 truncate max-w-[130px]" title={req.hospitalId?.name}>
                          {req.hospitalId?.name || "Unknown Hospital"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-slate-600 font-extrabold truncate max-w-[140px]" title={req.labId?.name}>
                      {req.labId?.name || "Pending Assignment"}
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 text-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-md border-2 border-white ring-1 ring-slate-100 mx-auto ${getBloodTypeBg(req.bloodType)}`}>
                        {req.bloodType}
                      </div>
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 font-black text-slate-900">{req.units} Units</td>
                    <td className="py-3.5 px-3 sm:px-4">{getUrgencyBadge(req.urgency)}</td>
                    <td className="py-3.5 px-3 sm:px-4">{getStatusBadge(req.status)}</td>
                    <td className="py-3.5 px-3 sm:px-4 text-slate-500 font-semibold text-xs">
                      {new Date(req.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <CustomStatusDropdown
                        currentStatus={req.status}
                        options={hospitalStatusOptions}
                        onChange={(newStatus) => setConfirmModal({ request: req, status: newStatus })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-100 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-3 sm:px-4">Patient</th>
                  <th className="py-3.5 px-3 sm:px-4">Hospital Location</th>
                  <th className="py-3.5 px-2 sm:px-3">City</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center">Group</th>
                  <th className="py-3.5 px-2 sm:px-3">Units</th>
                  <th className="py-3.5 px-3 sm:px-4">Urgency</th>
                  <th className="py-3.5 px-3 sm:px-4">Status</th>
                  <th className="py-3.5 px-3 sm:px-4">Required By</th>
                  <th className="py-3.5 px-3 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="font-black text-slate-900 truncate max-w-[120px]">{req.patientName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-slate-600 font-extrabold truncate max-w-[130px]">{req.hospital}</td>
                    <td className="py-3.5 px-2 sm:px-3 text-slate-500 font-bold truncate max-w-[90px]">{req.city}</td>
                    <td className="py-3.5 px-2 sm:px-3 text-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-md border-2 border-white ring-1 ring-slate-100 mx-auto ${getBloodTypeBg(req.bloodType)}`}>
                        {req.bloodType}
                      </div>
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 font-black text-slate-900">{req.units} Units</td>
                    <td className="py-3.5 px-3 sm:px-4">{getUrgencyBadge(req.urgency)}</td>
                    <td className="py-3.5 px-3 sm:px-4">{getStatusBadge(req.status)}</td>
                    <td className="py-3.5 px-3 sm:px-4 text-slate-600 font-bold">
                      {new Date(req.requiredBy).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <CustomStatusDropdown
                        currentStatus={req.status}
                        options={publicStatusOptions}
                        onChange={(newStatus) => setConfirmModal({ request: req, status: newStatus })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500">
              Showing page <strong className="font-black text-slate-850">{currentPage}</strong> of <strong className="font-black text-slate-850">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-2xs"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-850">Update Request Status</h3>
            <p className="text-slate-500 mt-2 text-xs font-semibold leading-relaxed">
              Are you sure you want to change the status of this blood request to <strong className="text-slate-900 uppercase font-black">{confirmModal.status}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(confirmModal.request, confirmModal.status)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBloodRequests;
