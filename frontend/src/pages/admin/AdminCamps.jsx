import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Building2,
  UserCheck,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  Check,
  ShieldCheck,
  FileText,
  Users,
  Flame
} from "lucide-react";
import { adminApi } from "../../services/api";

// Custom 3D Glassmorphic Filter Bar Dropdown
function CustomFilterDropdown({ value, options, onChange, label, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-slate-50/90 hover:bg-slate-100/90 rounded-2xl px-4 py-2.5 border border-slate-200/80 shadow-2xs transition-all cursor-pointer font-black text-xs text-slate-800 uppercase tracking-wider active:scale-95"
      >
        {Icon && <Icon className="w-4 h-4 text-slate-500 shrink-0" />}
        {label && <span className="text-slate-400 font-extrabold">{label}:</span>}
        <span className="text-slate-850 font-black">{selectedOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white border border-slate-200/90 shadow-2xl py-2 z-50 animate-scaleIn space-y-0.5 ring-1 ring-slate-900/5">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onChange(opt.value);
                }}
                className={`w-full px-4 py-2 text-left text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${isSelected ? "bg-red-50 text-red-700" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Custom 3D Glassmorphic Dropdown Menu Item (Card Status)
function CustomStatusDropdown({ currentStatus, options, onChange, isOpen, onToggle }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) onToggle(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const getStatusBadgeStyle = (st) => {
    const styles = {
      upcoming: "bg-blue-50 text-blue-800 border-blue-200/90",
      ongoing: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      completed: "bg-purple-50 text-purple-800 border-purple-200/90",
      cancelled: "bg-rose-50 text-rose-800 border-rose-200/90",
    };
    return styles[st?.toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="px-3.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-slate-850 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
      >
        <span className={`w-2 h-2 rounded-full ${currentStatus === "ongoing" ? "bg-emerald-500 animate-ping" : currentStatus === "upcoming" ? "bg-blue-500" : currentStatus === "completed" ? "bg-purple-500" : "bg-rose-500"}`} />
        <span className="capitalize">{currentStatus}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl bg-white border border-slate-200/90 shadow-2xl py-2 z-50 animate-scaleIn space-y-0.5 ring-1 ring-slate-900/5">
          {options.map((opt) => {
            const isSelected = opt.value === currentStatus;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onToggle(false);
                  if (opt.value !== currentStatus) onChange(opt.value);
                }}
                className={`w-full px-3.5 py-2 text-left text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${isSelected ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
              >
                <span className={`px-2 py-0.5 rounded-full text-[10px] border font-black ${getStatusBadgeStyle(opt.value)}`}>
                  ● {opt.label}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [openCampId, setOpenCampId] = useState(null);

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

      const res = await adminApi.getCamps({ params });
      const data = res.data?.data || res.data;
      setCamps(data.camps || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || (data.camps || []).length);
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

  const upcomingCount = camps.filter(c => c.status === 'upcoming').length;
  const ongoingCount = camps.filter(c => c.status === 'ongoing').length;
  const completedCount = camps.filter(c => c.status === 'completed').length;

  const campStatusOptions = [
    { label: "Upcoming", value: "upcoming" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const filterStatusOptions = [
    { label: "All Camps", value: "all" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 3D Executive Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 border border-red-400/30 shrink-0">
            <Calendar className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                Blood Donation Camps Directory
              </h1>
              <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200/80 rounded-full font-black text-[10px] uppercase tracking-wider shadow-2xs">
                {totalCount} Total Camps
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Audit, moderate, schedule, and update status of registered blood donation drives
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchCamps(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Sync Camps</span>
        </button>
      </div>

      {/* 4 Executive Clean & Uniform Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Total Scheduled Drives
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black border border-slate-200/80 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalCount}</span>
            <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/80">
              Registered
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Upcoming Drives
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black border border-blue-100 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{upcomingCount}</span>
            <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/80">
              Scheduled
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Ongoing Drives
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{ongoingCount}</span>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
              Active Now
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Completed Drives
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black border border-purple-100 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{completedCount}</span>
            <span className="text-[11px] font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200/80">
              Fulfilled
            </span>
          </div>
        </div>
      </div>

      {/* Glassmorphic Search & Filters Bar */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-5 sm:p-6 shadow-xl shadow-slate-100/80 flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow-2xl transition-all duration-300 relative z-40">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by drive title, hospital, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-xs text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>

        <CustomFilterDropdown
          label="STATUS"
          value={statusFilter}
          options={filterStatusOptions}
          onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
        />
      </div>

      {/* Grid of Camps */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl"></div>
          ))}
        </div>
      ) : camps.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-16 text-center flex flex-col items-center shadow-xl">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-4 border border-red-100 shadow-md">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-850 uppercase tracking-wide">No Donation Camps Found</h3>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mt-1">We couldn't find any blood donation camps matching your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camps.map((camp) => {
            const isDropdownOpen = openCampId === camp._id;
            return (
              <div
                key={camp._id}
                className={`relative p-6 rounded-3xl bg-gradient-to-b from-white via-slate-50/40 to-white border border-slate-200/90 shadow-lg transition-all duration-300 flex flex-col justify-between group ${isDropdownOpen ? "z-50 shadow-2xl scale-[1.01]" : "z-10 hover:z-20 hover:shadow-2xl hover:border-red-400/50 hover:-translate-y-1.5"}`}
              >
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-red-500/15 via-rose-500/10 to-transparent blur-2xl group-hover:scale-150 transition-transform duration-500" />
                </div>

                <div>
                  {/* Top Row: Date Badge & Status Dropdown */}
                  <div className="flex items-center justify-between gap-3 mb-4 relative z-30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black shadow-md shadow-red-600/30 border border-red-400/30 shrink-0 group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        {new Date(camp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <CustomStatusDropdown
                      isOpen={isDropdownOpen}
                      onToggle={(open) => setOpenCampId(open ? camp._id : null)}
                      currentStatus={camp.status}
                      options={campStatusOptions}
                      onChange={(newStatus) => setConfirmModal({ type: "status", camp, value: newStatus })}
                    />
                  </div>

                  {/* Camp Title & Hospital Partner */}
                  <div className="relative z-10 mb-4">
                    <h3 className="font-black text-slate-900 text-base leading-snug tracking-tight truncate" title={camp.title}>
                      {camp.title}
                    </h3>
                    <div className="text-xs font-extrabold text-slate-500 flex items-center gap-1.5 mt-1 truncate">
                      <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{camp.hospital?.name || "Hospital Partner"}</span>
                    </div>
                  </div>

                  {/* Schedule & Venue Telemetry Box */}
                  <div className="space-y-2 text-xs font-extrabold text-slate-700 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 relative z-10 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{camp.time?.start} - {camp.time?.end}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 truncate">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate">{camp.location?.venue}, {camp.location?.city}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between text-xs relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-red-50 text-red-800 px-3 py-1 rounded-xl border border-red-200/80 font-black text-[11px] flex items-center gap-1 shadow-2xs">
                      <Users className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{camp.registeredDonors?.length || 0} Registered</span>
                    </div>
                    <div className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200/80 font-black text-[11px]">
                      Goal: {camp.expectedDonors || 0}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setSelectedCamp(camp); setDetailModalOpen(true); }}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/80 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
                      title="View Camp Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmModal({ type: "delete", camp })}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
                      title="Delete Camp"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-850">
              {confirmModal.type === "delete" ? "Delete Donation Camp?" : "Update Camp Status?"}
            </h3>
            <p className="text-slate-500 mt-2 text-xs font-semibold leading-relaxed">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete blood donation camp "${confirmModal.camp.title}"? This will cancel registrations.`
                : `Are you sure you want to change the status of "${confirmModal.camp.title}" to ${confirmModal.value.toUpperCase()}?`}
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
                    ? handleDeleteCamp(confirmModal.camp)
                    : handleUpdateStatus(confirmModal.camp, confirmModal.value)
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

      {/* Camp Details Modal */}
      {detailModalOpen && selectedCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-slate-900/60 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl shadow-slate-950/20 border border-slate-100 flex flex-col justify-between max-h-[90vh] animate-scaleIn relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-400/30 shrink-0">
                  <Calendar className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-850 tracking-tight">
                    Camp Telemetry Audit File
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    Drive logistics, organizer verification, & donor roster
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="w-9 h-9 rounded-2xl bg-slate-100/90 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200/80 flex items-center justify-center font-black transition-all cursor-pointer active:scale-95"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto py-5 pr-1 relative z-10 space-y-6 text-xs">
              {/* Title & Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${selectedCamp.status === "ongoing" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : selectedCamp.status === "upcoming" ? "bg-blue-50 text-blue-800 border-blue-200" : selectedCamp.status === "completed" ? "bg-purple-50 text-purple-800 border-purple-200" : "bg-rose-50 text-rose-800 border-rose-200"}`}>
                    ● {selectedCamp.status}
                  </span>
                  <span className="text-slate-400 font-extrabold text-[11px]">ID: #{selectedCamp._id?.slice(-6)?.toUpperCase()}</span>
                </div>
                <h4 className="font-black text-slate-900 text-xl leading-snug tracking-tight">{selectedCamp.title}</h4>
                <p className="text-xs text-slate-500 font-bold mt-1.5 leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
                  {selectedCamp.description || "Official blood donation campaign organized with certified medical partner hospital."}
                </p>
              </div>

              {/* 4 Rich Glass Telemetry Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Organizer Partner</span>
                  </div>
                  <strong className="text-sm font-black text-slate-900 block truncate">
                    {selectedCamp.hospital?.name || "Hospital Partner"}
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Scheduled Date</span>
                  </div>
                  <strong className="text-sm font-black text-slate-900 block">
                    {new Date(selectedCamp.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Drive Timing</span>
                  </div>
                  <strong className="text-sm font-black text-slate-900 block">
                    {selectedCamp.time?.start} - {selectedCamp.time?.end}
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Venue Location</span>
                  </div>
                  <strong className="text-xs font-black text-slate-900 block truncate" title={`${selectedCamp.location?.venue}, ${selectedCamp.location?.city}`}>
                    {selectedCamp.location?.venue}, {selectedCamp.location?.city}
                  </strong>
                </div>
              </div>

              {/* 3D Donor Statistics Summary Capsules Bar */}
              <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-4.5 rounded-2xl shadow-xl shadow-slate-900/15 border border-slate-800">
                <div className="text-center border-r border-slate-700/60 pr-2">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Expected Target</span>
                  <strong className="text-lg font-black text-white">{selectedCamp.expectedDonors || 0}</strong>
                </div>
                <div className="text-center border-r border-slate-700/60 pr-2">
                  <span className="text-red-400 text-[10px] font-black uppercase tracking-wider block">Registered</span>
                  <strong className="text-lg font-black text-red-400">{selectedCamp.registeredDonors?.length || 0}</strong>
                </div>
                <div className="text-center">
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider block">Actual Donors</span>
                  <strong className="text-lg font-black text-emerald-400">{selectedCamp.actualDonors || 0}</strong>
                </div>
              </div>

              {/* Registered Donors Roster Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-red-500" />
                    <span>Registered Donors Roster</span>
                  </h5>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-black text-[10px] border border-slate-200">
                    {selectedCamp.registeredDonors?.length || 0} Donors
                  </span>
                </div>

                {selectedCamp.registeredDonors?.length === 0 ? (
                  <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center flex flex-col items-center justify-center">
                    <UserCheck className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-black text-slate-600 uppercase tracking-wide">No Donors Registered Yet</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Donors will appear here as soon as they sign up for this campaign drive.</p>
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto border border-slate-200/80 rounded-2xl divide-y divide-slate-100 text-xs font-bold shadow-2xs">
                    {selectedCamp.registeredDonors?.map((reg, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-black text-[11px] flex items-center justify-center border border-red-200">
                            {reg.donor?.fullName?.charAt(0) || "D"}
                          </div>
                          <span className="font-black text-slate-850">{reg.donor?.fullName || "Registered Donor"}</span>
                        </div>
                        <span className="text-slate-400 text-[10px] px-2.5 py-1 bg-slate-100 rounded-xl border border-slate-200/80">
                          {new Date(reg.registeredAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 mt-2 relative z-10">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-98 shadow-2xs"
              >
                Close Telemetry Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCamps;
