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
  EyeOff, 
  ChevronLeft, 
  ChevronRight, 
  Filter 
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
        toast.success(`Blood request for ${data.bloodType} was ACCEPTED!`);
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
      pending: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, label: "Pending" },
      accepted: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Accepted" },
      rejected: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, label: "Rejected" },
      completed: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle, label: "Completed" }
    };
    return config[status] || config.pending;
  };

  const getUrgencyConfig = (urgency) => {
    const config = {
      normal: "bg-slate-100 text-slate-700",
      urgent: "bg-orange-100 text-orange-800 animate-pulse font-bold",
      emergency: "bg-red-100 text-red-800 animate-ping font-extrabold"
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
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-tr from-red-500 to-rose-600 rounded-2xl shadow-md text-white">
                <Calendar className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-800">Request History</h1>
            </div>
            <p className="text-gray-500">Track and monitor raised blood requests in real-time</p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all font-semibold shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Reload Data"}
          </button>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-slate-400">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Requests</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-amber-500">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-emerald-500">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accepted Requests</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.accepted}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-red-500">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected Requests</span>
            <div className="text-2xl font-black text-red-600 mt-1">{stats.rejected}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-blue-500">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Units Requested</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{stats.totalUnits} Units</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Status Tabs */}
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
            {["all", "pending", "accepted", "rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                  activeTab === tab
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by blood type, lab, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100/80 overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-slate-500 font-semibold">Loading requests data...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No requests found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                {searchTerm 
                  ? "No matching requests found. Try adjusting your search query." 
                  : `You have no ${activeTab !== "all" ? activeTab : ""} requests recorded.`}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
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
                        <tr key={request._id} className="hover:bg-slate-50/40 transition-colors text-slate-700 text-sm">
                          <td className="p-4.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                {request.labId?.name?.charAt(0) || "L"}
                              </div>
                              <div className="min-w-0">
                                <span className="block font-semibold text-slate-800 truncate" title={request.labId?.name}>
                                  {request.labId?.name || "Unknown Lab"}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                  <MapPin size={10} />
                                  {request.labId?.address?.city || "Unknown City"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4.5 font-bold">
                            <span className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs">
                              {request.bloodType}
                            </span>
                          </td>
                          <td className="p-4.5">
                            <span className="text-base font-extrabold text-slate-800">{request.units}</span>
                            <span className="text-xs text-slate-400 ml-1">units</span>
                          </td>
                          <td className="p-4.5">
                            <div className="flex flex-col items-start gap-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getUrgencyConfig(request.urgency)}`}>
                                {request.urgency ? request.urgency.toUpperCase() : "NORMAL"}
                              </span>
                              {request.geofencedAlerts?.donorCount > 0 && (
                                <span className="text-[9px] text-red-600 bg-red-50 border border-red-100 rounded px-1 py-0.5 font-black flex items-center gap-0.5" title={`Alerted: ${request.geofencedAlerts.notifiedDonors.map(d => `${d.name} (${d.distance}km)`).join(', ')}`}>
                                  🚨 Alerted {request.geofencedAlerts.donorCount} Donors
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4.5 max-w-[200px] truncate text-xs text-slate-500" title={request.notes}>
                            {request.notes || <span className="text-slate-300 italic">No notes</span>}
                          </td>
                          <td className="p-4.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border ${statusConfig.color}`}>
                              <StatusIcon size={12} />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="p-4.5 text-xs text-slate-500">
                            <span className="block font-medium text-slate-700">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              {new Date(request.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="p-4.5 text-xs text-slate-500">
                            {request.processedAt ? (
                              <>
                                <span className="block font-medium text-slate-700">
                                  {new Date(request.processedAt).toLocaleDateString()}
                                </span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">
                                  {new Date(request.processedAt).toLocaleTimeString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-300 italic">Not processed</span>
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
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">
                    Showing <span className="font-bold text-slate-700">{(page - 1) * limit + 1}</span> to{" "}
                    <span className="font-bold text-slate-700">
                      {Math.min(page * limit, totalItems)}
                    </span>{" "}
                    of <span className="font-bold text-slate-700">{totalItems}</span> requests
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
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