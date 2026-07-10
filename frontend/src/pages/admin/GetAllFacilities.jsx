import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Building,
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
        limit: 12, // fits 3x4 grid
        status: statusFilter,
        type: typeFilter,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const { data } = await adminApi.getFacilities({ params });
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
      const { data } = await adminApi.getFacilityById(fac._id);
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
      pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
      approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
      rejected: "bg-red-50 text-red-700 border-red-100",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${styles[status] || "bg-gray-50 text-gray-700"}`}>
        {status}
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
            Facilities Directory
          </h1>
          <p className="text-gray-500 mt-1">Audit blood stock centers, hospitals, emergency labs, and locations</p>
        </div>
        <button
          onClick={() => fetchFacilities(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 font-medium text-sm transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or registration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-all bg-gray-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="hospital">Hospitals Only</option>
            <option value="blood-lab">Blood Labs Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected / Suspended</option>
          </select>
        </div>
      </div>

      {/* Grid of facilities */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Facilities Found</h3>
          <p className="text-gray-500 max-w-sm mt-1">We couldn't find any hospitals or labs matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold">
                      {fac.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-bold text-gray-900 leading-snug line-clamp-1">{fac.name}</h3>
                  </div>
                  {getStatusBadge(fac.status)}
                </div>

                <div className="mt-4 space-y-2 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span>{fac.email}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> <span>{fac.phone || "N/A"}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> <span className="line-clamp-1">{fac.address?.city}, {fac.address?.state}</span></div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 block text-[9px] uppercase font-bold">Type</span>
                  <strong className="text-gray-700 font-bold uppercase">{fac.facilityType}</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenDetails(fac)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="View Documents & Logs"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>
                  {fac.status === "approved" && (
                    <button
                      onClick={() => setConfirmModal({ type: "suspend", facility: fac })}
                      className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                      title="Suspend Facility"
                    >
                      <AlertTriangle className="w-4.5 h-4.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmModal({ type: "delete", facility: fac })}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Facility"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-6">
          <span className="text-sm text-gray-500">
            Page <strong className="font-semibold text-gray-900">{currentPage}</strong> of <strong className="font-semibold text-gray-900">{totalPages}</strong> ({totalFacilities} total facilities)
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scaleIn">
            <h3 className="text-lg font-bold text-gray-900">
              {confirmModal.type === "delete" ? "Delete Facility Account?" : "Suspend Facility Account?"}
            </h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete facility "${confirmModal.facility.name}"? This deletes the profile and the login user permanently.`
                : `Are you sure you want to suspend facility "${confirmModal.facility.name}"? They will lose access to stock logs and requests immediately.`}
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
                  confirmModal.type === "delete"
                    ? handleDeleteFacility(confirmModal.facility)
                    : handleSuspendFacility(confirmModal.facility)
                }
                disabled={actionLoading}
                className={`px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 ${confirmModal.type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col justify-between overflow-y-auto max-h-[85vh] animate-scaleIn">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building className="w-5.5 h-5.5 text-red-600" />
                  Facility File Audit
                </h3>
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>

              {/* Title & Badge */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg leading-tight">{selectedFacility.name}</h4>
                  <span className="text-xs text-gray-400 font-semibold uppercase mt-1 block">Reg: {selectedFacility.registrationNumber}</span>
                </div>
                {getStatusBadge(selectedFacility.status)}
              </div>

              {/* Basic Fields */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Email Address</span>
                  <strong className="text-gray-800 break-all ml-4">{selectedFacility.email}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Contact Phone</span>
                  <strong className="text-gray-800">{selectedFacility.phone || "N/A"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Category</span>
                  <strong className="text-gray-800 capitalize">{selectedFacility.facilityCategory || "Not specified"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Facility Type</span>
                  <strong className="text-gray-800 uppercase font-bold text-red-600">{selectedFacility.facilityType}</strong>
                </div>
                {selectedFacility.address && (
                  <div className="border-t border-gray-100 pt-3 mt-1.5 text-xs text-gray-600">
                    <span className="text-gray-500 font-medium block mb-1">Registered Address</span>
                    {selectedFacility.address.street}, {selectedFacility.address.city}, {selectedFacility.address.state} - {selectedFacility.address.pincode}
                  </div>
                )}
              </div>

              {/* History / Timeline logs */}
              <div>
                <h5 className="font-semibold text-gray-900 text-xs uppercase tracking-wider text-gray-400 mb-2">History & Event logs</h5>
                {selectedFacility.history?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No historical events recorded.</p>
                ) : (
                  <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 text-xs max-h-32 overflow-y-auto">
                    {selectedFacility.history?.map((h, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between">
                        <div>
                          <strong className="text-gray-700 block">{h.eventType}</strong>
                          <span className="text-gray-500 mt-0.5 block">{h.description}</span>
                        </div>
                        <span className="text-gray-400">{new Date(h.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-5">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-sm"
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