import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Download,
  Eye,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { adminApi } from "../../services/api.js";

const FacilityApproval = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Separate loading states
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFacilities, setTotalFacilities] = useState(0);

  // Confirmations
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'approve'|'reject', facilityId }

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Clear rejection reason on selection change
  useEffect(() => {
    setRejectionReason("");
  }, [selectedFacility?._id]);

  // Fetch Facilities
  const fetchFacilities = useCallback(
    async (showToast = false) => {
      try {
        if (showToast) setRefreshing(true);
        else setLoading(true);

        const params = {
          page: currentPage,
          limit: 10,
          status: statusFilter,
          type: typeFilter,
        };
        if (debouncedSearch) params.search = debouncedSearch;

        const res = await adminApi.getFacilities({ params });
        const data = res.data?.data || res.data;
        const facilitiesList = data.facilities || [];

        setFacilities(facilitiesList);
        setTotalPages(data.pagination?.pages || 1);
        setTotalFacilities(data.pagination?.total || 0);

        // Fetch dashboard stats just to sync facility status overview
        const dashRes = await adminApi.getDashboard();
        const dashData = dashRes.data?.data || dashRes.data;
        if (dashData?.overview) {
          setStats({
            total: dashData.overview.totalFacilities || 0,
            pending: dashData.overview.pendingFacilities || 0,
            approved: dashData.overview.approvedFacilities || 0,
            rejected: (dashData.overview.totalFacilities - dashData.overview.approvedFacilities - dashData.overview.pendingFacilities) || 0,
          });
        }

        if (showToast) {
          toast.success("Facility list refreshed");
        }
      } catch (error) {
        console.error("Fetch facilities error:", error);
        toast.error("Failed to load facilities directory");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, statusFilter, typeFilter, debouncedSearch]
  );

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const handleApprove = async (facilityId) => {
    try {
      setApproveLoading(true);
      const res = await adminApi.approveFacility(facilityId);
      if (res.status >= 200 && res.status < 300) {
        toast.success("Facility account approved successfully!");
        setConfirmModal(null);
        setSelectedFacility(null);
        fetchFacilities();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve facility");
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async (facilityId) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setRejectLoading(true);
      const res = await adminApi.rejectFacility(facilityId, { rejectionReason });
      if (res.status >= 200 && res.status < 300) {
        toast.success("Facility registration rejected");
        setConfirmModal(null);
        setSelectedFacility(null);
        fetchFacilities();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject facility");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleViewDocument = (documentUrl) => {
    if (!documentUrl) {
      toast.error("Document proof is not uploaded");
      return;
    }
    window.open(documentUrl, "_blank");
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
      approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
      rejected: "bg-red-50 text-red-700 border-red-100",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${configs[status] || "bg-gray-50 text-gray-700"}`}>
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
            <Building className="w-7 h-7 text-red-600" />
            Facility Verifications
          </h1>
          <p className="text-gray-500 mt-1">Approve or reject medical facilities, blood labs, and emergency hospitals</p>
        </div>
        <button
          onClick={() => fetchFacilities(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 font-medium text-sm transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <span className="text-gray-500 text-xs block font-semibold uppercase">Total Registered</span>
          <strong className="text-2xl font-bold text-gray-900 mt-1 block">{stats.total}</strong>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm border-l-yellow-400 border-l-4">
          <span className="text-gray-500 text-xs block font-semibold uppercase text-yellow-600">Pending Review</span>
          <strong className="text-2xl font-bold text-yellow-600 mt-1 block">{stats.pending}</strong>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm border-l-emerald-400 border-l-4">
          <span className="text-gray-500 text-xs block font-semibold uppercase text-emerald-600">Approved</span>
          <strong className="text-2xl font-bold text-emerald-600 mt-1 block">{stats.approved}</strong>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm border-l-red-400 border-l-4">
          <span className="text-gray-500 text-xs block font-semibold uppercase text-red-600">Rejected</span>
          <strong className="text-2xl font-bold text-red-600 mt-1 block">{stats.rejected}</strong>
        </div>
      </div>

      {/* Main split dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Filter and List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters & Search */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search name, email, reg..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-all bg-gray-50/50"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="hospital">Hospitals</option>
                <option value="blood-lab">Blood Labs</option>
              </select>
            </div>
          </div>

          {/* List panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {loading ? (
              <div className="p-10 space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl w-full"></div>
                ))}
              </div>
            ) : facilities.length === 0 ? (
              <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                <Building className="w-12 h-12 mb-3" />
                <h4 className="font-bold text-gray-700 text-sm">No registration requests found</h4>
              </div>
            ) : (
              facilities.map((fac) => (
                <div
                  key={fac._id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-4.5 flex items-center justify-between cursor-pointer transition-all hover:bg-gray-50/50 ${selectedFacility?._id === fac._id ? "bg-red-50/10 border-l-red-500 border-l-4" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-extrabold text-sm">
                      {fac.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{fac.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <span className="capitalize font-semibold text-gray-600">{fac.facilityType}</span>
                        <span>·</span>
                        <span>{fac.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(fac.status)}
                    <Eye className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">
                  Page <strong className="font-semibold text-gray-900">{currentPage}</strong> of <strong className="font-semibold text-gray-900">{totalPages}</strong>
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Selected details Panel */}
        <div className="lg:col-span-1">
          {selectedFacility ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6 sticky top-6">
              {/* Header */}
              <div className="pb-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Verification File</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
                    {selectedFacility.facilityType}
                  </span>
                  {getStatusBadge(selectedFacility.status)}
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-400 block text-xs font-bold uppercase">Official Name</span>
                  <strong className="text-gray-800 text-base">{selectedFacility.name}</strong>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 block text-xs font-bold uppercase">Phone</span>
                    <strong className="text-gray-700">{selectedFacility.phone || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-bold uppercase">Category</span>
                    <strong className="text-gray-700 capitalize">{selectedFacility.facilityCategory || "Private"}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs font-bold uppercase">Registration Number</span>
                  <strong className="text-gray-700 font-mono text-xs">{selectedFacility.registrationNumber}</strong>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs font-bold uppercase">Verification Documents</span>
                  {selectedFacility.documents?.registrationProof?.url ? (
                    <button
                      onClick={() => handleViewDocument(selectedFacility.documents.registrationProof.url)}
                      className="mt-2.5 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      View Registration Proof
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs italic mt-1.5 block">No registration proof documents uploaded.</span>
                  )}
                </div>

                {selectedFacility.address && (
                  <div className="border-t border-gray-100 pt-4">
                    <span className="text-gray-400 block text-xs font-bold uppercase mb-1">Registered Address</span>
                    <span className="text-gray-600 text-xs leading-relaxed block">
                      {selectedFacility.address.street}, {selectedFacility.address.city}, {selectedFacility.address.state} - {selectedFacility.address.pincode}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Only show if pending */}
              {selectedFacility.status === "pending" ? (
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <button
                    onClick={() => setConfirmModal({ type: "approve", facilityId: selectedFacility._id })}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4.5 h-4.5" />
                    Approve Facility
                  </button>

                  <div className="space-y-2 pt-1">
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Rejection Reason</label>
                    <textarea
                      placeholder="Specify reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      rows={3}
                    />
                    <button
                      onClick={() => setConfirmModal({ type: "reject", facilityId: selectedFacility._id })}
                      disabled={!rejectionReason.trim()}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4.5 h-4.5" />
                      Reject Registration
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl text-center text-xs text-gray-500 font-medium leading-relaxed">
                  No pending action required. Registration file is verified and finalized.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center text-gray-400">
              <Building className="w-12 h-12 mx-auto mb-3" />
              <p className="text-xs font-semibold">Select a facility to view full documents & review registration status</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scaleIn">
            <h3 className="text-lg font-bold text-gray-900">
              {confirmModal.type === "approve" ? "Approve Facility Request?" : "Reject Facility Request?"}
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              {confirmModal.type === "approve"
                ? "Are you sure you want to verify and activate this facility? The facility will be notified and granted immediate access to their dashboard."
                : `Are you sure you want to reject this facility registration request? Reason: "${rejectionReason}"`}
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmModal.type === "approve"
                    ? handleApprove(confirmModal.facilityId)
                    : handleReject(confirmModal.facilityId)
                }
                disabled={approveLoading || rejectLoading}
                className={`px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 ${confirmModal.type === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {(approveLoading || rejectLoading) && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityApproval;
