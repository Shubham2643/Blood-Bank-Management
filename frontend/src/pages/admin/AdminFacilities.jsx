import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Building,
  Building2,
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
  ShieldCheck,
  Award,
  ExternalLink,
  AlertTriangle,
  FileCheck
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
      pending: "bg-amber-50 text-amber-900 border-amber-200/90 shadow-2xs",
      approved: "bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-2xs",
      rejected: "bg-rose-50 text-rose-800 border-rose-200/90 shadow-2xs",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${configs[status] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  const getFacilityAvatarBg = (type) => {
    return type === "blood-lab" 
      ? "bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-purple-600/30"
      : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-600/30";
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 3D Executive Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 border border-red-400/30 shrink-0">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                Facility Verifications & Accreditation
              </h1>
              <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200/80 rounded-full font-black text-[10px] uppercase tracking-wider shadow-2xs">
                {stats.total} Total Facilities
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Audit, verify, and authenticate medical facilities, blood laboratories, and emergency hospitals
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchFacilities(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Sync Facilities</span>
        </button>
      </div>

      {/* 4 Executive 3D Glassmorphic Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-100/90 shadow-xl shadow-slate-100/80 flex items-center justify-between hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Registered</span>
              <span className="text-2xl font-black text-slate-850 mt-0.5 block">{stats.total}</span>
            </div>
          </div>
          <span className="text-xs font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            Facilities
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-amber-50/70 backdrop-blur-xl border border-amber-200/80 shadow-xl shadow-amber-100/50 flex items-center justify-between hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="block text-[11px] font-black text-amber-900 uppercase tracking-wider">Pending Review</span>
              <span className="text-2xl font-black text-amber-950 mt-0.5 block">{stats.pending}</span>
            </div>
          </div>
          <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-200">
            Action Needed
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-50/70 backdrop-blur-xl border border-emerald-200/80 shadow-xl shadow-emerald-100/50 flex items-center justify-between hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-black text-emerald-900 uppercase tracking-wider">Approved</span>
              <span className="text-2xl font-black text-emerald-950 mt-0.5 block">{stats.approved}</span>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200">
            Verified
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-rose-50/70 backdrop-blur-xl border border-rose-200/80 shadow-xl shadow-rose-100/50 flex items-center justify-between hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-black text-rose-900 uppercase tracking-wider">Rejected</span>
              <span className="text-2xl font-black text-rose-950 mt-0.5 block">{stats.rejected}</span>
            </div>
          </div>
          <span className="text-xs font-black text-rose-800 bg-rose-100 px-2.5 py-1 rounded-xl border border-rose-200">
            Dismissed
          </span>
        </div>
      </div>

      {/* Main split dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Filter and List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Glassmorphic Filters & Search Bar */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-5 shadow-xl shadow-slate-100/80 flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow-2xl transition-all duration-300">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Search name, email, reg..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-xs text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex gap-2.5 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3.5 py-2 font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3.5 py-2 font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="hospital">Hospitals</option>
                <option value="blood-lab">Blood Labs</option>
              </select>
            </div>
          </div>

          {/* List Panel */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 shadow-xl shadow-slate-100/80 overflow-hidden divide-y divide-slate-100 hover:shadow-2xl transition-all duration-300">
            {loading ? (
              <div className="p-8 space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-2xl w-full"></div>
                ))}
              </div>
            ) : facilities.length === 0 ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-4 border border-red-100 shadow-md">
                  <Building2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-slate-850 text-base uppercase tracking-wide">No Verification Requests Found</h4>
                <p className="text-xs font-semibold text-slate-400 mt-1 max-w-sm">No facility registration requests match your selected filter criteria.</p>
              </div>
            ) : (
              facilities.map((fac) => (
                <div
                  key={fac._id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-slate-50/80 ${selectedFacility?._id === fac._id ? "bg-red-50/20 border-l-4 border-l-red-600 shadow-sm" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-md border-2 border-white ring-2 ring-slate-100 ${getFacilityAvatarBg(fac.facilityType)}`}>
                      {fac.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-850 text-sm">{fac.name}</h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-0.5">
                        <span className="uppercase text-[10px] font-black text-slate-600 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200/60">{fac.facilityType}</span>
                        <span>·</span>
                        <span className="truncate max-w-[180px]">{fac.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(fac.status)}
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="bg-slate-50/60 px-6 py-4 flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-500">
                  Page <strong className="font-black text-slate-850">{currentPage}</strong> of <strong className="font-black text-slate-850">{totalPages}</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-2xs"
                  >
                    Prev
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
        </div>

        {/* Right Side: Selected Document Telemetry Inspector */}
        <div className="lg:col-span-5">
          {selectedFacility ? (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100/80 space-y-6 sticky top-6 hover:shadow-2xl transition-all duration-300">
              {/* Header */}
              <div className="pb-4 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h3 className="font-black text-slate-850 text-base flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-red-600" />
                    Facility Verification File
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">Registration accreditation dossier</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200/80">
                    {selectedFacility.facilityType}
                  </span>
                  {getStatusBadge(selectedFacility.status)}
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4 text-xs font-bold">
                <div>
                  <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider">Official Medical Facility Name</span>
                  <strong className="text-slate-850 text-base font-black mt-0.5 block">{selectedFacility.name}</strong>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider">Contact Phone</span>
                    <strong className="text-slate-800 text-sm font-black mt-0.5 block">{selectedFacility.phone || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider">Facility Category</span>
                    <strong className="text-slate-800 text-sm font-black capitalize mt-0.5 block">{selectedFacility.facilityCategory || "Private"}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider">Government Registration Number</span>
                  <strong className="text-slate-800 font-mono text-xs block bg-slate-100 p-2.5 rounded-xl border border-slate-200/70 mt-1">{selectedFacility.registrationNumber}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider mb-2">Legal Proof Documents</span>
                  {selectedFacility.documents?.registrationProof?.url ? (
                    <button
                      onClick={() => handleViewDocument(selectedFacility.documents.registrationProof.url)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 hover:text-red-800 rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                    >
                      <FileText className="w-4.5 h-4.5 text-red-600" />
                      <span>Inspect Official Registration Proof</span>
                      <ExternalLink size={14} className="text-red-500" />
                    </button>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-400 text-xs font-semibold italic text-center">
                      No registration proof documents attached to file.
                    </div>
                  )}
                </div>

                {selectedFacility.address && (
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span>Registered Facility Location</span>
                    </span>
                    <span className="text-slate-700 text-xs font-bold leading-relaxed block bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      {selectedFacility.address.street}, {selectedFacility.address.city}, {selectedFacility.address.state} - {selectedFacility.address.pincode}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Only show if pending */}
              {selectedFacility.status === "pending" ? (
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <button
                    onClick={() => setConfirmModal({ type: "approve", facilityId: selectedFacility._id })}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-600/25 border border-emerald-500/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 cursor-pointer"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve Medical Accreditation</span>
                  </button>

                  <div className="space-y-2 pt-1">
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Rejection Reason</label>
                    <textarea
                      placeholder="Specify official reason for registration rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-slate-50/50"
                      rows={3}
                    />
                    <button
                      onClick={() => setConfirmModal({ type: "reject", facilityId: selectedFacility._id })}
                      disabled={!rejectionReason.trim()}
                      className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl disabled:opacity-50 transition-all shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject Registration</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-2xl text-center text-xs text-slate-500 font-extrabold leading-relaxed">
                  ✓ Verification Complete. Registration file is authenticated & active.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 p-16 text-center text-slate-400 shadow-sm flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-4 border border-slate-200/80 shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-black text-slate-700 text-sm uppercase tracking-wide">Facility Inspection Telemetry</h4>
              <p className="text-xs font-semibold text-slate-400 max-w-xs mt-1">Select any facility from the list on the left to inspect documents and process accreditation status.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-850">
              {confirmModal.type === "approve" ? "Approve Medical Accreditation?" : "Reject Facility Registration?"}
            </h3>
            <p className="text-slate-500 mt-2 text-xs font-semibold leading-relaxed">
              {confirmModal.type === "approve"
                ? "Are you sure you want to verify and activate this facility? The facility will be granted immediate access to their portal."
                : `Are you sure you want to reject this facility registration? Reason: "${rejectionReason}"`}
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all"
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
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${confirmModal.type === "approve" ? "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800" : "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800"}`}
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
