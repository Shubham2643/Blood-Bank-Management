import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Building,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { adminApi } from "../../services/api";

function AdminBloodRequests() {
  const [activeTab, setActiveTab] = useState("hospital");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

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

      setRequests(res.data.requests || []);
      setTotalPages(res.data.pagination?.pages || 1);
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
      normal: "bg-blue-50 text-blue-700 border-blue-100",
      high: "bg-orange-50 text-orange-700 border-orange-100",
      urgent: "bg-orange-50 text-orange-700 border-orange-100",
      emergency: "bg-red-50 text-red-700 border-red-100",
      critical: "bg-red-50 text-red-700 border-red-100",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${styles[urgency?.toLowerCase()] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
        {urgency?.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700 border-amber-100",
      accepted: "bg-blue-50 text-blue-700 border-blue-100",
      active: "bg-emerald-50 text-emerald-700 border-emerald-100",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      fulfilled: "bg-emerald-50 text-emerald-700 border-emerald-100",
      rejected: "bg-red-50 text-red-700 border-red-100",
      cancelled: "bg-gray-50 text-gray-500 border-gray-100",
      expired: "bg-gray-50 text-gray-500 border-gray-100",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${styles[status?.toLowerCase()] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-red-600" />
            Blood Requests Directory
          </h1>
          <p className="text-gray-500 mt-1">Audit and override hospital and public emergency blood requests</p>
        </div>
        <button
          onClick={() => fetchRequests(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 font-medium text-sm transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabChange("hospital")}
          className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all ${activeTab === "hospital" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Hospital Requests
        </button>
        <button
          onClick={() => handleTabChange("public")}
          className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all ${activeTab === "public" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Public Emergency Needs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center">
        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
          <span className="text-xs text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
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
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
          <span className="text-xs text-gray-500">Urgency:</span>
          <select
            value={urgencyFilter}
            onChange={(e) => { setUrgencyFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Urgency</option>
            <option value="normal">Normal</option>
            <option value="high">High / Urgent</option>
            <option value="emergency">Emergency / Critical</option>
          </select>
        </div>

        {/* Blood Type Filter */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100 font-medium text-sm text-gray-700">
          <span className="text-xs text-gray-500">Blood Type:</span>
          <select
            value={bloodTypeFilter}
            onChange={(e) => { setBloodTypeFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Groups</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main requests table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded w-full"></div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Requests Found</h3>
            <p className="text-gray-500 max-w-sm mt-1">There are currently no blood requests matching your filters.</p>
          </div>
        ) : activeTab === "hospital" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">Hospital</th>
                  <th className="py-4 px-6">Assigned Lab</th>
                  <th className="py-4 px-6">Blood Group</th>
                  <th className="py-4 px-6">Units</th>
                  <th className="py-4 px-6">Urgency</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Requested At</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-900">{req.hospitalId?.name || "Unknown Hospital"}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-gray-600">{req.labId?.name || "Pending Assignment"}</td>
                    <td className="py-4.5 px-6">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 font-bold border border-red-100">
                        {req.bloodType}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 font-bold text-gray-700">{req.units} Units</td>
                    <td className="py-4.5 px-6">{getUrgencyBadge(req.urgency)}</td>
                    <td className="py-4.5 px-6">{getStatusBadge(req.status)}</td>
                    <td className="py-4.5 px-6 text-gray-500">
                      {new Date(req.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={req.status}
                          onChange={(e) => setConfirmModal({ request: req, status: e.target.value })}
                          className="bg-transparent text-xs text-gray-500 hover:text-red-600 border-none cursor-pointer focus:outline-none focus:ring-0"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Hospital Location</th>
                  <th className="py-4 px-6">City</th>
                  <th className="py-4 px-6">Blood Group</th>
                  <th className="py-4 px-6">Units Required</th>
                  <th className="py-4 px-6">Urgency</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Required By</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-900">{req.patientName}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-gray-600">{req.hospital}</td>
                    <td className="py-4.5 px-6 text-gray-500 flex items-center gap-1 mt-2.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {req.city}
                    </td>
                    <td className="py-4.5 px-6">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 font-bold border border-red-100">
                        {req.bloodType}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 font-bold text-gray-700">{req.units} Units</td>
                    <td className="py-4.5 px-6">{getUrgencyBadge(req.urgency)}</td>
                    <td className="py-4.5 px-6">{getStatusBadge(req.status)}</td>
                    <td className="py-4.5 px-6 text-gray-600">
                      {new Date(req.requiredBy).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={req.status}
                          onChange={(e) => setConfirmModal({ request: req, status: e.target.value })}
                          className="bg-transparent text-xs text-gray-500 hover:text-red-600 border-none cursor-pointer focus:outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="fulfilled">Fulfilled</option>
                          <option value="expired">Expired</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing page <strong className="font-semibold text-gray-900">{currentPage}</strong> of <strong className="font-semibold text-gray-900">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scaleIn">
            <h3 className="text-lg font-bold text-gray-900">Update Request Status</h3>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              Are you sure you want to change the status of this request to <strong>{confirmModal.status.toUpperCase()}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(confirmModal.request, confirmModal.status)}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
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
