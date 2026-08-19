import { useEffect, useState, useCallback } from "react";
import { hospitalApi } from "../../services/api.js";
import { getAuthToken } from "../../utils/auth.js";
import { toast } from "react-hot-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar, 
  RefreshCw, 
  Search, 
  AlertTriangle, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Droplet,
  FileText,
  Building,
  X
} from "lucide-react";
import { SOCKET_URL } from "../../config/env.js";
import { io } from "socket.io-client";

const HospitalRequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 8;

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    totalUnits: 0
  });

  const loadHistory = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      
      const params = {
        page,
        limit,
        status: activeTab === "all" ? undefined : activeTab
      };

      const res = await hospitalApi.getRequests(params);
      
      if (res.data?.success) {
        const payload = res.data.data;
        const fetchedRequests = payload.requests || [];
        setRequests(fetchedRequests);
        
        if (payload.pagination) {
          setTotalPages(payload.pagination.pages || 1);
          setTotalItems(payload.pagination.total || 0);
        }

        // Calculate Stats
        const responseStats = payload.stats || [];
        let totalCount = 0;
        let pendingCount = 0;
        let acceptedCount = 0;
        let rejectedCount = 0;
        let unitsSum = 0;

        responseStats.forEach(stat => {
          const count = stat.count || 0;
          totalCount += count;
          unitsSum += stat.totalUnits || 0;

          if (stat._id === "pending") pendingCount = count;
          else if (stat._id === "accepted") acceptedCount = count;
          else if (stat._id === "rejected") rejectedCount = count;
        });

        setStats({
          total: totalCount,
          pending: pendingCount,
          accepted: acceptedCount,
          rejected: rejectedCount,
          totalUnits: unitsSum
        });
      }
    } catch (err) {
      console.error("Load history error:", err);
      toast.error("Failed to load request history");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Connect to Socket.io for real-time request update tracking
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"]
    });

    socket.on("request-processed", (data) => {
      if (data.status === "accepted") {
        toast.success(`Blood request for ${data.bloodType} was ACCEPTED! 🎉`);
      } else if (data.status === "rejected") {
        toast.error(`Blood request for ${data.bloodType} was REJECTED.`);
      }
      loadHistory(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [loadHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory(true);
    setRefreshing(false);
    toast.success("Requests reloaded");
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: { color: "bg-amber-50 text-amber-800 border-amber-200/90", icon: Clock, label: "Pending" },
      accepted: { color: "bg-emerald-50 text-emerald-800 border-emerald-200/90", icon: CheckCircle, label: "Accepted" },
      rejected: { color: "bg-rose-50 text-rose-800 border-rose-200/90", icon: XCircle, label: "Rejected" },
      completed: { color: "bg-blue-50 text-blue-800 border-blue-200/90", icon: CheckCircle, label: "Completed" }
    };
    return config[status] || config.pending;
  };

  const getUrgencyConfig = (urgency) => {
    const config = {
      normal: "bg-slate-100 text-slate-700 border border-slate-200/60",
      urgent: "bg-amber-100 text-amber-900 border border-amber-200 font-bold",
      emergency: "bg-rose-100 text-rose-900 border border-rose-200 font-extrabold animate-pulse"
    };
    return config[urgency] || config.normal;
  };

  // Filter requests locally by search term
  const filteredRequests = requests.filter(req => {
    const labName = req.labId?.name?.toLowerCase() || "";
    const bloodType = req.bloodType?.toLowerCase() || "";
    const notes = req.notes?.toLowerCase() || "";
    const matchesSearch = 
      labName.includes(searchTerm.toLowerCase()) || 
      bloodType.includes(searchTerm.toLowerCase()) ||
      notes.includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Signature Crimson-Rose Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 p-7 sm:p-9 text-white shadow-2xl shadow-red-900/30 border border-red-500/30 mb-8">
          {/* Geometric Vector Rings Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center md:items-end">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-center text-center sm:text-left">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-white text-red-600 font-black flex items-center justify-center shadow-2xl ring-4 ring-white/20 flex-shrink-0">
                <Calendar className="w-9 h-9 sm:w-10 sm:h-10 text-red-600 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-white/15 text-white border border-white/20 font-black text-[10px] uppercase tracking-widest backdrop-blur-md">
                    Real-time Audit Log
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                  Request History
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-red-100/90 mt-1 max-w-xl">
                  Track and monitor raised blood component requests and fulfillment status in real-time.
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-5 py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-2xl font-black text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2.5 cursor-pointer hover:scale-105 shadow-md flex-shrink-0 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-white ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Reload Data"}</span>
            </button>
          </div>
        </div>

        {/* Executive 3D Specimen Stats Cards Grid (5 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          {/* Card 1: Total Requests */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-slate-500/15 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Total Requests</span>
                <span className="text-3xl sm:text-4xl font-black text-slate-850 tracking-tight mt-2 block">{stats.total}</span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-700/25 ring-4 ring-slate-50 border border-white/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full shadow-2xs">
                All Raised Requests
              </span>
            </div>
          </div>

          {/* Card 2: Pending Approvals */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Pending</span>
                <span className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight mt-2 block">{stats.pending}</span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-amber-50 border border-white/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Awaiting Lab
              </span>
            </div>
          </div>

          {/* Card 3: Accepted Requests */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Accepted</span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight mt-2 block">{stats.accepted}</span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-50 border border-white/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Dispatched
              </span>
            </div>
          </div>

          {/* Card 4: Rejected Requests */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 relative overflow-hidden group hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-rose-500/20 via-red-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Rejected</span>
                <span className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight mt-2 block">{stats.rejected}</span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/25 ring-4 ring-rose-50 border border-white/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                Declined
              </span>
            </div>
          </div>

          {/* Card 5: Total Units Requested */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Total Volume</span>
                <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight mt-2 block">{stats.totalUnits} <span className="text-xs font-black text-blue-400 uppercase">Units</span></span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 ring-4 ring-blue-50 border border-white/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Droplet className="w-6 h-6 fill-white" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                Cumulative Blood
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-100/90 border border-slate-100/90 p-5 mb-7 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Status Floating Pill Group */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            {["all", "pending", "accepted", "rejected"].map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer active:scale-95 border ${
                    isSelected
                      ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/25 border-red-500 scale-105"
                      : "bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/80 shadow-2xs hover:border-red-200"
                  }`}
                >
                  {tab === "all" ? "All Requests" : tab}
                </button>
              );
            })}
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-80">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-red-50 text-red-600 border border-red-100/80 shadow-2xs pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search blood type, lab, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl pl-12 pr-10 py-3 text-xs font-extrabold text-slate-850 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-semibold shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Requests Table & Empty State */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-100/80 border border-slate-100/90 overflow-hidden hover:shadow-2xl transition-all duration-300">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-slate-500 font-extrabold text-xs uppercase tracking-wider">Loading requests history...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-md border border-red-100">
                <Calendar className="w-8 h-8 text-red-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-slate-850 uppercase tracking-wide mb-1">No requests found</h3>
              <p className="text-slate-500 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                {searchTerm 
                  ? "No matching requests found. Try adjusting your search keywords." 
                  : `You have no ${activeTab !== "all" ? activeTab : ""} blood requests recorded.`}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider">
                      <th className="p-4.5 text-left">Blood Lab</th>
                      <th className="p-4.5 text-left">Blood Type</th>
                      <th className="p-4.5 text-left">Units Needed</th>
                      <th className="p-4.5 text-left">Urgency</th>
                      <th className="p-4.5 text-left">Notes</th>
                      <th className="p-4.5 text-left">Status</th>
                      <th className="p-4.5 text-left">Raised At</th>
                      <th className="p-4.5 text-left">Processed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((request) => {
                      const statusConfig = getStatusConfig(request.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <tr key={request._id} className="hover:bg-slate-50/60 transition-colors text-slate-700 text-sm">
                          <td className="p-4.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-600/20 border border-red-400/30">
                                {request.labId?.name?.charAt(0) || "L"}
                              </div>
                              <div className="min-w-0">
                                <span className="block font-black text-slate-850 truncate" title={request.labId?.name}>
                                  {request.labId?.name || "Unknown Lab"}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-0.5">
                                  <MapPin size={11} className="text-red-500 shrink-0" />
                                  {request.labId?.address?.city || "Unknown City"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4.5 font-bold">
                            <span className="px-3 py-1 bg-red-50 border border-red-200/80 text-red-700 rounded-xl text-xs font-black shadow-2xs">
                              {request.bloodType}
                            </span>
                          </td>
                          <td className="p-4.5">
                            <span className="text-base font-black text-slate-850">{request.units}</span>
                            <span className="text-xs font-bold text-slate-400 ml-1 uppercase">units</span>
                          </td>
                          <td className="p-4.5">
                            <div className="flex flex-col items-start gap-1">
                              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${getUrgencyConfig(request.urgency)}`}>
                                {request.urgency ? request.urgency.toUpperCase() : "NORMAL"}
                              </span>
                              {request.geofencedAlerts?.donorCount > 0 && (
                                <span className="text-[9px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-0.5 font-black flex items-center gap-1 shadow-2xs" title={`Alerted: ${request.geofencedAlerts?.notifiedDonors?.map(d => `${d.name} (${d.distance}km)`).join(', ') || ''}`}>
                                  🚨 Alerted {request.geofencedAlerts.donorCount} Donors
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4.5 max-w-[200px] truncate text-xs font-semibold text-slate-600" title={request.notes}>
                            {request.notes || <span className="text-slate-300 italic">No notes</span>}
                          </td>
                          <td className="p-4.5">
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 border shadow-2xs ${statusConfig.color}`}>
                              <StatusIcon size={13} />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="p-4.5 text-xs text-slate-500">
                            <span className="block font-extrabold text-slate-800">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">
                              {new Date(request.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="p-4.5 text-xs text-slate-500">
                            {request.processedAt ? (
                              <>
                                <span className="block font-extrabold text-slate-800">
                                  {new Date(request.processedAt).toLocaleDateString()}
                                </span>
                                <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">
                                  {new Date(request.processedAt).toLocaleTimeString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-300 italic font-semibold">Not processed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              {totalPages > 1 && (
                <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-extrabold">
                    Showing <span className="font-black text-slate-850">{(page - 1) * limit + 1}</span> to{" "}
                    <span className="font-black text-slate-850">
                      {Math.min(page * limit, totalItems)}
                    </span>{" "}
                    of <span className="font-black text-slate-850">{totalItems}</span> requests
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2 border border-slate-200 rounded-2xl bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-2 border border-slate-200 rounded-2xl bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalRequestHistory;