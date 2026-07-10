import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Clock,
  MapPin,
  Building,
  UserCheck,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { adminApi } from "../../services/api";

function AdminCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selection
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'delete'|'status', camp, value }
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Camps
  const fetchCamps = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: currentPage,
        limit: 9, // Grid Layout fits 9 cards well
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const { data } = await adminApi.getCamps({ params });
      setCamps(data.camps || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load blood camps");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  // Handle Delete Camp
  const handleDeleteCamp = async (camp) => {
    try {
      setActionLoading(true);
      await adminApi.deleteCamp(camp._id);
      toast.success("Camp deleted successfully");
      setConfirmModal(null);
      fetchCamps();
    } catch (error) {
      toast.error("Failed to delete camp");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async (camp, status) => {
    try {
      setActionLoading(true);
      await adminApi.updateCampStatus(camp._id, { status });
      toast.success("Camp status updated");
      setConfirmModal(null);
      fetchCamps();
    } catch (error) {
      toast.error("Failed to update camp status");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const styles = {
      upcoming: "bg-blue-50 text-blue-700 border-blue-100",
      ongoing: "bg-emerald-50 text-emerald-700 border-emerald-100",
      completed: "bg-gray-50 text-gray-500 border-gray-100",
      cancelled: "bg-red-50 text-red-700 border-red-100",
    };
    return styles[status?.toLowerCase()] || "bg-gray-50 text-gray-500";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-red-600" />
            Blood Donation Camps
          </h1>
          <p className="text-gray-500 mt-1">Audit, moderate, and update status of scheduled blood camps</p>
        </div>
        <button
          onClick={() => fetchCamps(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 font-medium text-sm transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100 w-full md:w-auto">
          <span className="text-xs text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Camps</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Grid of Camps */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : camps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Camps Found</h3>
          <p className="text-gray-500 max-w-sm mt-1">We couldn't find any blood donation camps matching your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camps.map((camp) => (
            <div
              key={camp._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(camp.status)}`}>
                    {camp.status.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1">
                    <select
                      value={camp.status}
                      onChange={(e) => setConfirmModal({ type: "status", camp, value: e.target.value })}
                      className="bg-transparent text-[11px] text-gray-500 hover:text-red-600 border-none cursor-pointer focus:outline-none"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mt-3 text-base leading-snug line-clamp-2">{camp.title}</h3>
                <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                  <Building className="w-3.5 h-3.5" />
                  {camp.hospital?.name || "Hospital Partner"}
                </div>

                <div className="mt-4 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(camp.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{camp.time?.start} - {camp.time?.end}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="line-clamp-1">{camp.location?.venue}, {camp.location?.city}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Registered</span>
                    <strong className="text-sm font-bold text-gray-800">{camp.registeredDonors?.length || 0} Donors</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Expected</span>
                    <strong className="text-sm font-bold text-gray-800">{camp.expectedDonors || 0}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setSelectedCamp(camp); setDetailModalOpen(true); }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="View Camp Details"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => setConfirmModal({ type: "delete", camp })}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Camp"
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
            Showing page <strong className="font-semibold text-gray-900">{currentPage}</strong> of <strong className="font-semibold text-gray-900">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all disabled:opacity-50"
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
              {confirmModal.type === "delete" ? "Delete Donation Camp?" : "Update Camp Status?"}
            </h3>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete blood donation camp "${confirmModal.camp.title}"? This will cancel registrations.`
                : `Are you sure you want to change the status of "${confirmModal.camp.title}" to ${confirmModal.value.toUpperCase()}?`}
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
                    ? handleDeleteCamp(confirmModal.camp)
                    : handleUpdateStatus(confirmModal.camp, confirmModal.value)
                }
                disabled={actionLoading}
                className={`px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 ${confirmModal.type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camp Details Modal */}
      {detailModalOpen && selectedCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col justify-between overflow-y-auto max-h-[85vh] animate-scaleIn">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5.5 h-5.5 text-red-600" />
                  Camp Details
                </h3>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>

              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(selectedCamp.status)}`}>
                  {selectedCamp.status.toUpperCase()}
                </span>
                <h4 className="font-bold text-gray-900 mt-2.5 text-lg leading-snug">{selectedCamp.title}</h4>
                <p className="text-gray-500 text-sm mt-1">{selectedCamp.description || "No description provided."}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Organizer</span>
                  <strong className="text-gray-800">{selectedCamp.hospital?.name || "Hospital Partner"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Date</span>
                  <strong className="text-gray-800">
                    {new Date(selectedCamp.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Timing</span>
                  <strong className="text-gray-800">{selectedCamp.time?.start} - {selectedCamp.time?.end}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Venue Address</span>
                  <strong className="text-gray-800 text-right leading-tight block max-w-[200px]">
                    {selectedCamp.location?.venue}, {selectedCamp.location?.city}, {selectedCamp.location?.state}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-red-50/10 border border-red-50/30 p-3.5 rounded-xl text-center">
                <div>
                  <span className="text-gray-500 text-[10px] font-bold uppercase block">Expected</span>
                  <strong className="text-base text-gray-800">{selectedCamp.expectedDonors || 0}</strong>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] font-bold uppercase block">Registered</span>
                  <strong className="text-base text-red-600">{selectedCamp.registeredDonors?.length || 0}</strong>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] font-bold uppercase block">Actual Donors</span>
                  <strong className="text-base text-emerald-600">{selectedCamp.actualDonors || 0}</strong>
                </div>
              </div>

              {/* Registered Donors List */}
              <div>
                <h5 className="font-semibold text-gray-900 text-xs uppercase tracking-wider text-gray-400 mb-2">Registered Donors List</h5>
                {selectedCamp.registeredDonors?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No donors registered for this camp yet.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 text-xs">
                    {selectedCamp.registeredDonors.map((reg, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between">
                        <span className="font-bold text-gray-800">{reg.donor?.fullName || "Registered Donor"}</span>
                        <span className="text-gray-400">Registered: {new Date(reg.registeredAt).toLocaleDateString()}</span>
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
                Close Camp Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCamps;
