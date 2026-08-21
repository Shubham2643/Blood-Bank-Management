import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Building,
  Building2,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  FlaskConical,
  ShieldCheck,
  Award,
  FileText,
  Users
} from "lucide-react";
import { adminApi } from "../../services/api.js";

function GetAllFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFacilities, setTotalFacilities] = useState(0);

  // Selection
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'delete'|'suspend', facility }
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Facilities
  const fetchFacilities = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: currentPage,
        limit: 12,
        status: statusFilter,
        type: typeFilter,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await adminApi.getFacilities({ params });
      const data = res.data?.data || res.data;
      setFacilities(data.facilities || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalFacilities(data.pagination?.total || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load facilities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, statusFilter, typeFilter, debouncedSearch]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  // View details
  const handleOpenDetails = async (fac) => {
    try {
      const res = await adminApi.getFacilityById(fac._id);
      const data = res.data?.data || res.data;
      setSelectedFacility(data);
      setDetailModalOpen(true);
    } catch (error) {
      toast.error("Failed to load facility info");
    }
  };

  // Suspend facility
  const handleSuspendFacility = async (fac) => {
    try {
      setActionLoading(true);
      await adminApi.suspendFacility(fac._id);
      toast.success("Facility status set to SUSPENDED");
      setConfirmModal(null);
      fetchFacilities();
    } catch (error) {
      toast.error("Failed to suspend facility");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete facility
  const handleDeleteFacility = async (fac) => {
    try {
      setActionLoading(true);
      await adminApi.deleteFacility(fac._id);
      toast.success("Facility and user account deleted successfully");
      setConfirmModal(null);
      fetchFacilities();
    } catch (error) {
      toast.error("Failed to delete facility");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-800 border-amber-200/90",
      approved: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      rejected: "bg-rose-50 text-rose-800 border-rose-200/90",
      suspended: "bg-rose-50 text-rose-800 border-rose-200/90",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-2xs ${styles[status] || "bg-slate-50 text-slate-700"}`}>
        ● {status}
      </span>
    );
  };

  const hospitalsCount = facilities.filter(f => f.facilityType === 'hospital').length;
  const labsCount = facilities.filter(f => f.facilityType === 'blood-lab').length;
  const approvedCount = facilities.filter(f => f.status === 'approved').length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 3D Executive Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 border border-red-400/30 shrink-0">
            <Building2 className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                Facilities & Healthcare Directory
              </h1>
              <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200/80 rounded-full font-black text-[10px] uppercase tracking-wider shadow-2xs">
                {totalFacilities} Facilities
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Audit blood stock centers, accredited hospitals, emergency labs, and verification status
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

      {/* 4 Executive Clean & Uniform Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Total Facilities
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black border border-slate-200/80 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalFacilities}</span>
            <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/70">
              Registered
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Hospitals
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black border border-blue-100 group-hover:scale-110 transition-transform">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{hospitalsCount}</span>
            <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/80">
              Accredited
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Blood Labs
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black border border-purple-100 group-hover:scale-110 transition-transform">
              <FlaskConical className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{labsCount}</span>
            <span className="text-[11px] font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200/80">
              Testing Hubs
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Approved Status
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{approvedCount}</span>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Glassmorphic Filters & Search Bar */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-5 sm:p-6 shadow-xl shadow-slate-100/80 flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow-2xl transition-all duration-300 relative z-40">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by name, email, or registration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-xs text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <Building2 className="w-4 h-4 text-slate-500" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Facility Types</option>
              <option value="hospital">Hospitals Only</option>
              <option value="blood-lab">Blood Labs Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Verification Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected / Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of facilities */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-3xl"></div>
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-16 text-center flex flex-col items-center shadow-xl">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-4 border border-red-100 shadow-md">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-850 uppercase tracking-wide">No Facilities Found</h3>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mt-1">We couldn't find any hospitals or labs matching your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac._id}
              className="relative p-6 rounded-3xl bg-gradient-to-b from-white via-slate-50/40 to-white border border-slate-200/90 shadow-lg shadow-slate-100/80 hover:shadow-2xl hover:border-red-400/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
            >
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none ${fac.facilityType === "blood-lab" ? "bg-gradient-to-br from-purple-500/15 to-pink-500/10" : "bg-gradient-to-br from-blue-500/15 to-indigo-500/10"}`} />

              <div>
                {/* Top Row: Type Pill & Status Badge */}
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className={`px-3 py-1 rounded-xl font-black text-[10px] uppercase tracking-wider border flex items-center gap-1.5 shadow-2xs ${fac.facilityType === "blood-lab" ? "bg-purple-50 text-purple-800 border-purple-200/90" : "bg-blue-50 text-blue-800 border-blue-200/90"}`}>
                    {fac.facilityType === "blood-lab" ? (
                      <>
                        <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                        <span>BLOOD LAB</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>HOSPITAL</span>
                      </>
                    )}
                  </span>

                  {getStatusBadge(fac.status)}
                </div>

                {/* Identity Row: 3D Role Avatar & Name */}
                <div className="flex items-center gap-3.5 mb-4 relative z-10">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-xl border-2 border-white ring-2 ring-slate-100 shrink-0 group-hover:scale-110 transition-transform ${fac.facilityType === "blood-lab" ? "bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 shadow-purple-600/30" : "bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 shadow-blue-600/30"}`}>
                    {fac.facilityType === "blood-lab" ? <FlaskConical className="w-6 h-6 text-white" /> : <Building2 className="w-6 h-6 text-white" />}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 text-base leading-snug tracking-tight truncate" title={fac.name}>
                      {fac.name}
                    </h3>
                    <span className="block text-[11px] font-bold text-slate-400 mt-0.5 truncate">
                      {fac.email}
                    </span>
                  </div>
                </div>

                {/* Telemetry Contact Box */}
                <div className="space-y-2 text-xs font-extrabold text-slate-600 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 relative z-10 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{fac.phone || "Phone N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{fac.address?.city || "Unknown City"}, {fac.address?.state || "State"}</span>
                  </div>
                </div>
              </div>

              {/* Footer ID Badge & Action Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
                <span className="bg-slate-100 text-slate-700 font-extrabold px-3 py-1 rounded-xl border border-slate-200/80 text-[11px]">
                  Reg: <strong className="text-slate-900 font-black">{fac.registrationNumber || "VERIFIED"}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenDetails(fac)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200/80 cursor-pointer active:scale-95 shadow-2xs"
                    title="View Documents & Logs"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {fac.status === "approved" && (
                    <button
                      onClick={() => setConfirmModal({ type: "suspend", facility: fac })}
                      className="p-2 text-amber-600 hover:bg-amber-50 border border-amber-200/90 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
                      title="Suspend Facility"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmModal({ type: "delete", facility: fac })}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-200/80 cursor-pointer active:scale-95 shadow-2xs"
                    title="Delete Facility"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-4 shadow-xl flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-500">
            Page <strong className="font-black text-slate-850">{currentPage}</strong> of <strong className="font-black text-slate-850">{totalPages}</strong> ({totalFacilities} facilities)
          </span>
          <div className="flex gap-2">
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

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-850">
              {confirmModal.type === "delete" ? "Delete Facility Account?" : "Suspend Facility Account?"}
            </h3>
            <p className="text-slate-500 mt-2 text-xs font-semibold leading-relaxed">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete facility "${confirmModal.facility.name}"? This deletes the profile and the login user permanently.`
                : `Are you sure you want to suspend facility "${confirmModal.facility.name}"? They will lose access to stock logs and requests immediately.`}
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
                  confirmModal.type === "delete"
                    ? handleDeleteFacility(confirmModal.facility)
                    : handleSuspendFacility(confirmModal.facility)
                }
                disabled={actionLoading}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${confirmModal.type === "delete" ? "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800" : "bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800"}`}
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col justify-between overflow-y-auto max-h-[85vh] animate-scaleIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-850 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  Facility Record Audit File
                </h3>
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Title & Badge */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight">{selectedFacility.name}</h4>
                  <span className="text-xs text-slate-400 font-extrabold uppercase mt-1 block">Reg: {selectedFacility.registrationNumber}</span>
                </div>
                {getStatusBadge(selectedFacility.status)}
              </div>

              {/* Basic Fields */}
              <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-3.5 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Address</span>
                  <strong className="text-slate-850 break-all ml-4">{selectedFacility.email}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Phone</span>
                  <strong className="text-slate-850">{selectedFacility.phone || "N/A"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category</span>
                  <strong className="text-slate-850 capitalize">{selectedFacility.facilityCategory || "Not specified"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility Type</span>
                  <strong className="text-red-600 uppercase font-black">{selectedFacility.facilityType}</strong>
                </div>
                {selectedFacility.address && (
                  <div className="border-t border-slate-200/70 pt-3 mt-1.5 text-slate-600">
                    <span className="text-slate-400 font-extrabold block mb-1 uppercase text-[10px]">Registered Address</span>
                    {selectedFacility.address.street}, {selectedFacility.address.city}, {selectedFacility.address.state} - {selectedFacility.address.pincode}
                  </div>
                )}
              </div>

              {/* History / Timeline logs */}
              <div>
                <h5 className="font-black text-xs uppercase tracking-wider text-slate-400 mb-2">History & Verification Telemetry</h5>
                {selectedFacility.history?.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold italic p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">No historical events recorded.</p>
                ) : (
                  <div className="border border-slate-200/70 rounded-2xl divide-y divide-slate-100 text-xs max-h-32 overflow-y-auto font-bold">
                    {selectedFacility.history?.map((h, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50/60">
                        <div>
                          <strong className="text-slate-850 font-black block">{h.eventType}</strong>
                          <span className="text-slate-500 mt-0.5 block">{h.description}</span>
                        </div>
                        <span className="text-slate-400 text-[11px] px-2 py-1 bg-slate-100 rounded-lg">{new Date(h.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-all text-xs uppercase tracking-wider"
              >
                Close Audit File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllFacilities;