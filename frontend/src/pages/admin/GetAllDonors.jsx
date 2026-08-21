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
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  Activity,
  FileText
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
        limit: 12,
      };
      if (bloodGroupFilter !== "all") params.bloodGroup = bloodGroupFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await adminApi.getDonors({ params });
      const data = res.data?.data || res.data;
      
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
      const res = await adminApi.getDonorById(donor._id);
      const data = res.data?.data || res.data;
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

  const eligibleCount = donors.filter(d => d.isEligible).length;
  const ineligibleCount = donors.filter(d => !d.isEligible).length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 3D Executive Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 border border-red-400/30 shrink-0">
            <Heart className="w-7 h-7 text-white fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                Registered Donors Directory
              </h1>
              <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200/80 rounded-full font-black text-[10px] uppercase tracking-wider shadow-2xs">
                {totalDonors} Donors
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Audit blood groups, verify medical eligibility, and manage donor logs across all regions
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchDonors(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Sync Donors</span>
        </button>
      </div>

      {/* 4 Executive Clean & Uniform Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Total Donors
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black border border-slate-200/80 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalDonors}</span>
            <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/70">
              Registered
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Medically Eligible
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{eligibleCount}</span>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
              Ready to Donate
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Ineligible / Deferred
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black border border-rose-100 group-hover:scale-110 transition-transform">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{ineligibleCount}</span>
            <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80">
              Restricted
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Active Donor Pool
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black border border-blue-100 group-hover:scale-110 transition-transform">
              <Droplet className="w-5 h-5 text-blue-600 fill-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalDonors}</span>
            <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/80">
              Active Status
            </span>
          </div>
        </div>
      </div>

      {/* Glassmorphic Filters & Search Bar */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-5 sm:p-6 shadow-xl shadow-slate-100/80 flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow-2xl transition-all duration-300">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-xs text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Blood Group Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
            <select
              value={bloodGroupFilter}
              onChange={(e) => { setBloodGroupFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Blood Groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Eligibility Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <select
              value={eligibilityFilter}
              onChange={(e) => { setEligibilityFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Eligibility</option>
              <option value="eligible">Eligible Only</option>
              <option value="ineligible">Ineligible Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clean & Balanced Donors Specimen Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-3xl"></div>
          ))}
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-16 text-center flex flex-col items-center shadow-xl">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-4 border border-red-100 shadow-md">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-850 uppercase tracking-wide">No Registered Donors Found</h3>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mt-1">We couldn't find any registered donors matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((donor) => (
            <div
              key={donor._id}
              className="relative p-6 rounded-3xl bg-white border border-slate-100/90 shadow-lg shadow-slate-100/80 hover:shadow-2xl hover:border-red-300/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-red-500/10 to-rose-500/5 blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

              <div>
                {/* Header: 3D Specimen Avatar + Name + Eligibility Badge */}
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    {/* Glowing 3D Blood Type Avatar */}
                    <div className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center font-black text-white shadow-lg border-2 border-white ring-2 ring-slate-100 shrink-0 group-hover:scale-110 transition-transform ${getBloodTypeBg(donor.bloodGroup)}`}>
                      <span className="text-base font-black leading-none">{donor.bloodGroup}</span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-black text-slate-900 text-base leading-snug tracking-tight truncate" title={donor.fullName || donor.user?.name}>
                        {donor.fullName || donor.user?.name}
                      </h3>
                      <span className="block text-[11px] text-slate-400 font-extrabold mt-0.5 truncate">
                        {donor.email}
                      </span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 shadow-2xs ${donor.isEligible ? "bg-emerald-50 text-emerald-800 border-emerald-200/90" : "bg-rose-50 text-rose-800 border-rose-200/90"}`}>
                    {donor.isEligible ? "● ELIGIBLE" : "● INELIGIBLE"}
                  </span>
                </div>

                {/* Telemetry Details Box */}
                <div className="space-y-2 text-xs font-extrabold text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 relative z-10">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{donor.phone || "Phone N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{donor.address?.city || "Unknown City"}, {donor.address?.state || "State"}</span>
                  </div>
                </div>
              </div>

              {/* Footer Vitals & Action Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-800 font-extrabold px-2.5 py-1 rounded-xl border border-slate-200/70 text-[11px]">
                    Donated: <strong className="text-slate-950 font-black">{donor.donationHistory?.length || 0}x</strong>
                  </span>
                  <span className="bg-slate-100 text-slate-850 font-extrabold px-2.5 py-1 rounded-xl border border-slate-200/70 text-[11px]">
                    Weight: <strong className="text-slate-950 font-black">{donor.weight || "N/A"} kg</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenDetails(donor)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200/80 cursor-pointer active:scale-95 shadow-2xs"
                    title="View Donation History"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmModal({ type: "eligibility", donor })}
                    className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 shadow-2xs ${donor.isEligible ? "text-amber-700 bg-amber-50 border-amber-200/90 hover:bg-amber-100" : "text-emerald-700 bg-emerald-50 border-emerald-200/90 hover:bg-emerald-100"}`}
                    title={donor.isEligible ? "Override Ineligible" : "Override Eligible"}
                  >
                    {donor.isEligible ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setConfirmModal({ type: "delete", donor })}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-200/80 cursor-pointer active:scale-95 shadow-2xs"
                    title="Delete Profile"
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
            Page <strong className="font-black text-slate-850">{currentPage}</strong> of <strong className="font-black text-slate-850">{totalPages}</strong>
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

      {/* 3D Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-850">
              {confirmModal.type === "delete" ? "Delete Donor Profile?" : "Override Donor Eligibility?"}
            </h3>
            <p className="text-slate-500 mt-2 text-xs font-semibold leading-relaxed">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete donor account "${confirmModal.donor.fullName || confirmModal.donor.user?.name}"? All donation history logs will be lost.`
                : `Are you sure you want to toggle the eligibility of "${confirmModal.donor.fullName || confirmModal.donor.user?.name}" to ${confirmModal.donor.isEligible ? "INELIGIBLE" : "ELIGIBLE"}?`}
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
                    ? handleDeleteDonor(confirmModal.donor)
                    : handleToggleEligibility(confirmModal.donor)
                }
                disabled={actionLoading}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${confirmModal.type === "delete" ? "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"}`}
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donor History Medical File Modal */}
      {detailModalOpen && selectedDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col justify-between overflow-y-auto max-h-[85vh] animate-scaleIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-850 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  Donor Medical Record File
                </h3>
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Basic Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg border-2 border-white ring-2 ring-slate-100 ${getBloodTypeBg(selectedDonor.bloodGroup)}`}>
                  {selectedDonor.bloodGroup}
                </div>
                <div>
                  <h4 className="font-black text-slate-850 text-base leading-snug">{selectedDonor.fullName || selectedDonor.user?.name}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{selectedDonor.email}</p>
                </div>
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-3 gap-3 text-center bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Age</span>
                  <strong className="text-sm font-black text-slate-850">{selectedDonor.age} yrs</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Weight</span>
                  <strong className="text-sm font-black text-slate-850">{selectedDonor.weight} kg</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Gender</span>
                  <strong className="text-sm font-black text-slate-850">{selectedDonor.gender}</strong>
                </div>
              </div>

              {/* Donation History List */}
              <div className="space-y-3">
                <h5 className="font-black text-xs uppercase tracking-wider text-slate-400">Verified Donation Telemetry Logs</h5>
                {selectedDonor.donationHistory?.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold italic p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
                    No past donation instances verified for this donor profile.
                  </p>
                ) : (
                  <div className="border border-slate-200/70 rounded-2xl divide-y divide-slate-100 text-xs max-h-48 overflow-y-auto font-bold">
                    {selectedDonor.donationHistory.map((h, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50/60">
                        <div>
                          <strong className="text-slate-850 font-black block">{h.facility?.name || "Facility Center"}</strong>
                          <span className="text-slate-400 text-[11px] block mt-0.5">Quantity: {h.quantity} ml</span>
                        </div>
                        <span className="text-slate-600 font-bold px-2.5 py-1 bg-slate-100 rounded-lg">
                          {new Date(h.donationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
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
                Close Medical File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllDonors;