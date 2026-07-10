import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  User,
  Heart,
  Calendar,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Droplet,
  Weight,
  Search,
  Eye,
  Trash2,
} from "lucide-react";
import { adminApi } from "../../services/api.js";

function GetAllDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all");
  const [eligibilityFilter, setEligibilityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDonors, setTotalDonors] = useState(0);

  // Selection
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'delete'|'eligibility', donor }
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Donors
  const fetchDonors = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: currentPage,
        limit: 12, // Fits a grid of 3x4 nicely
      };
      if (bloodGroupFilter !== "all") params.bloodGroup = bloodGroupFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      // Note: city filtering is supported, but not mapped to selector for now

      const { data } = await adminApi.getDonors({ params });
      
      // Filter list client side if eligibility is chosen since DB counts match filter
      let donorList = data.donors || [];
      if (eligibilityFilter === "eligible") {
        donorList = donorList.filter(d => d.isEligible);
      } else if (eligibilityFilter === "ineligible") {
        donorList = donorList.filter(d => !d.isEligible);
      }

      setDonors(donorList);
      setTotalPages(data.pagination?.pages || 1);
      setTotalDonors(data.pagination?.total || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load donors directory");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, bloodGroupFilter, eligibilityFilter, debouncedSearch]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // Open Details Modal
  const handleOpenDetails = async (donor) => {
    try {
      const { data } = await adminApi.getDonorById(donor._id);
      setSelectedDonor(data);
      setDetailModalOpen(true);
    } catch (error) {
      toast.error("Failed to load donor history file");
    }
  };

  // Toggle eligibility
  const handleToggleEligibility = async (donor) => {
    try {
      setActionLoading(true);
      await adminApi.toggleDonorEligibility(donor._id);
      toast.success("Eligibility override updated successfully");
      setConfirmModal(null);
      fetchDonors();
    } catch (error) {
      toast.error("Failed to change eligibility");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Donor
  const handleDeleteDonor = async (donor) => {
    try {
      setActionLoading(true);
      await adminApi.deleteDonor(donor._id);
      toast.success("Donor account deleted");
      setConfirmModal(null);
      fetchDonors();
    } catch (error) {
      toast.error("Failed to delete donor profile");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-600 fill-red-600 animate-pulse" />
            Registered Donors
          </h1>
          <p className="text-gray-500 mt-1">Audit blood groups, verify medical eligibility, and manage donor logs</p>
        </div>
        <button
          onClick={() => fetchDonors(true)}
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
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-all bg-gray-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Blood Group Filter */}
          <select
            value={bloodGroupFilter}
            onChange={(e) => { setBloodGroupFilter(e.target.value); setCurrentPage(1); }}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Groups</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Eligibility Filter */}
          <select
            value={eligibilityFilter}
            onChange={(e) => { setEligibilityFilter(e.target.value); setCurrentPage(1); }}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Eligibility</option>
            <option value="eligible">Eligible Only</option>
            <option value="ineligible">Ineligible Only</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Donors Found</h3>
          <p className="text-gray-500 max-w-sm mt-1">We couldn't find any registered donors matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((donor) => (
            <div
              key={donor._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 font-extrabold flex items-center justify-center text-xs">
                      {donor.bloodGroup}
                    </span>
                    <h3 className="font-bold text-gray-900 leading-snug line-clamp-1">{donor.fullName || donor.user?.name}</h3>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${donor.isEligible ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                    {donor.isEligible ? "ELIGIBLE" : "INELIGIBLE"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span>{donor.email}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> <span>{donor.phone || "N/A"}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> <span>{donor.address?.city}, {donor.address?.state}</span></div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Donations</span>
                    <strong className="text-gray-800 font-bold">{donor.donationHistory?.length || 0} times</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Weight</span>
                    <strong className="text-gray-800 font-bold">{donor.weight || "N/A"} kg</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenDetails(donor)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="View Donation History"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => setConfirmModal({ type: "eligibility", donor })}
                    className={`p-1.5 rounded-lg transition-all ${donor.isEligible ? "text-amber-500 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                    title={donor.isEligible ? "Override Ineligible" : "Override Eligible"}
                  >
                    {donor.isEligible ? <XCircle className="w-4.5 h-4.5" /> : <CheckCircle className="w-4.5 h-4.5" />}
                  </button>
                  <button
                    onClick={() => setConfirmModal({ type: "delete", donor })}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Profile"
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
            Page <strong className="font-semibold text-gray-900">{currentPage}</strong> of <strong className="font-semibold text-gray-900">{totalPages}</strong>
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
              {confirmModal.type === "delete" ? "Delete Donor Profile?" : "Override Donor Eligibility?"}
            </h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete donor account "${confirmModal.donor.fullName || confirmModal.donor.user?.name}"? All donation history logs will be lost.`
                : `Are you sure you want to toggle the eligibility of "${confirmModal.donor.fullName || confirmModal.donor.user?.name}" to ${confirmModal.donor.isEligible ? "INELIGIBLE" : "ELIGIBLE"}?`}
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
                    ? handleDeleteDonor(confirmModal.donor)
                    : handleToggleEligibility(confirmModal.donor)
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

      {/* Donor History Details Modal */}
      {detailModalOpen && selectedDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col justify-between overflow-y-auto max-h-[85vh] animate-scaleIn">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5.5 h-5.5 text-red-600" />
                  Donor Medical Record File
                </h3>
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>

              {/* Basic Info */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
                <span className="w-12 h-12 rounded-full bg-red-50 text-red-600 font-extrabold flex items-center justify-center text-lg border border-red-100 shadow-inner">
                  {selectedDonor.bloodGroup}
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 text-base leading-snug">{selectedDonor.fullName || selectedDonor.user?.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedDonor.email}</p>
                </div>
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-3 gap-3 text-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Age</span>
                  <strong className="text-sm text-gray-800">{selectedDonor.age} yrs</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Weight</span>
                  <strong className="text-sm text-gray-800">{selectedDonor.weight} kg</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Gender</span>
                  <strong className="text-sm text-gray-800">{selectedDonor.gender}</strong>
                </div>
              </div>

              {/* Donation History List */}
              <div className="space-y-2">
                <h5 className="font-semibold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Donation History Logs</h5>
                {selectedDonor.donationHistory?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No past donation instances verified for this donor.</p>
                ) : (
                  <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 text-xs max-h-48 overflow-y-auto">
                    {selectedDonor.donationHistory.map((h, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50/50">
                        <div>
                          <strong className="text-gray-800 block">{h.facility?.name || "Facility Center"}</strong>
                          <span className="text-gray-400 block mt-0.5">Quantity: {h.quantity} ml</span>
                        </div>
                        <span className="text-gray-500 font-medium">
                          {new Date(h.donationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
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
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllDonors;