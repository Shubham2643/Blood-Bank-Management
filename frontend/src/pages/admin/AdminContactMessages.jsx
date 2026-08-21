import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  Mail,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Phone,
  User,
  MessageSquare,
  CornerDownRight,
  Send,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Check,
  ShieldAlert,
  Inbox,
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

function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Reply Modal
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Contact Messages
  const fetchMessages = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        type: typeFilter,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await adminApi.getContactMessages({ params });
      const data = res.data?.data || res.data;
      setMessages(data.messages || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || (data.messages || []).length);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contact messages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, statusFilter, typeFilter, debouncedSearch]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Open Reply Modal
  const handleOpenReply = (msg) => {
    setSelectedMessage(msg);
    setReplyText("");
    setReplyModalOpen(true);
  };

  // Submit Reply
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setActionLoading(true);
      await adminApi.replyToContactMessage(selectedMessage._id, { replyText });
      toast.success("Reply sent successfully via email");
      setReplyModalOpen(false);
      fetchMessages();
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setActionLoading(false);
    }
  };

  const getInquiryTypeBadge = (type) => {
    const styles = {
      general: "bg-slate-100 text-slate-700 border-slate-200/90",
      emergency: "bg-rose-50 text-rose-800 border-rose-200/90",
      donation: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
      camp: "bg-blue-50 text-blue-800 border-blue-200/90",
      partnership: "bg-purple-50 text-purple-800 border-purple-200/90",
      feedback: "bg-amber-50 text-amber-800 border-amber-200/90",
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider border shadow-2xs ${styles[type?.toLowerCase()] || "bg-slate-100 text-slate-700"}`}>
        ● {type || "General"}
      </span>
    );
  };

  const unrepliedCount = messages.filter(m => !m.replied).length;
  const repliedCount = messages.filter(m => m.replied).length;
  const emergencyCount = messages.filter(m => m.inquiryType === 'emergency').length;

  const statusFilterOptions = [
    { label: "All Status", value: "all" },
    { label: "Awaiting Reply", value: "unreplied" },
    { label: "Replied", value: "replied" },
  ];

  const typeFilterOptions = [
    { label: "All Types", value: "all" },
    { label: "General", value: "general" },
    { label: "Emergency", value: "emergency" },
    { label: "Donation", value: "donation" },
    { label: "Camp", value: "camp" },
    { label: "Partnership", value: "partnership" },
    { label: "Feedback", value: "feedback" },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 3D Executive Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 border border-red-400/30 shrink-0">
            <Mail className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                Contact Messages & Inquiries
              </h1>
              <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200/80 rounded-full font-black text-[10px] uppercase tracking-wider shadow-2xs">
                {totalCount} Total Messages
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Audit public contact form submissions, emergency requests, & reply directly via email
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchMessages(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh Messages</span>
        </button>
      </div>

      {/* 4 Executive Clean & Uniform Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Total Inquiries
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black border border-slate-200/80 group-hover:scale-110 transition-transform">
              <Inbox className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalCount}</span>
            <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/80">
              Submitted
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Awaiting Reply
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black border border-amber-100 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{unrepliedCount}</span>
            <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80">
              Pending
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Replied Messages
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{repliedCount}</span>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
              Fulfilled
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Emergency Inquiries
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black border border-rose-100 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{emergencyCount}</span>
            <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80">
              High Priority
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
            placeholder="Search by sender name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-xs text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <CustomFilterDropdown
            label="STATUS"
            value={statusFilter}
            options={statusFilterOptions}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
          />

          <CustomFilterDropdown
            label="TYPE"
            value={typeFilter}
            options={typeFilterOptions}
            onChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Main Messages List Table */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 shadow-xl shadow-slate-100/80 overflow-hidden relative z-10 hover:shadow-2xl transition-all duration-300">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-2xl w-full"></div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-850 uppercase tracking-wide">No Contact Messages Found</h3>
            <p className="text-xs font-semibold text-slate-400 max-w-sm mt-1">There are no contact form entries matching your search query or status filter.</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Sender Identity</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Subject Excerpt</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Received Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-600/20 border border-red-400/30 shrink-0 group-hover:scale-110 transition-transform">
                          {msg.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 text-sm truncate">{msg.name}</div>
                          <div className="text-xs font-bold text-slate-400 truncate">{msg.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getInquiryTypeBadge(msg.inquiryType)}</td>
                    <td className="py-4 px-6 font-extrabold text-slate-800 max-w-xs truncate" title={msg.subject}>
                      {msg.subject}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border shadow-2xs uppercase tracking-wider ${msg.replied ? "bg-emerald-50 text-emerald-800 border-emerald-200/90" : "bg-amber-50 text-amber-800 border-amber-200/90"}`}>
                        ● {msg.replied ? "REPLIED" : "AWAITING REPLY"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-400">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenReply(msg)}
                        className="px-4 py-2 bg-slate-100/90 hover:bg-red-50 hover:text-red-700 border border-slate-200/80 text-slate-700 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-2xs active:scale-95 cursor-pointer"
                      >
                        {msg.replied ? "View Thread" : "Reply Email"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500">
              Page <strong className="font-black text-slate-850">{currentPage}</strong> of <strong className="font-black text-slate-850">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
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
      </div>

      {/* Reply Modal */}
      {replyModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-slate-900/60 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col justify-between overflow-y-auto max-h-[85vh] animate-scaleIn relative">
            <form onSubmit={handleSubmitReply} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-850 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  Email Dispatch & Thread Reply
                </h3>
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Inquiry Message Specimen */}
              <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 font-extrabold">
                  <span className="flex items-center gap-1.5 text-slate-850"><User className="w-3.5 h-3.5 text-blue-500" /> {selectedMessage.name} ({selectedMessage.email})</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-red-500" /> {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
                <div className="font-black text-slate-900 text-sm mt-1">{selectedMessage.subject}</div>
                <div className="text-slate-600 font-semibold italic mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
                  "{selectedMessage.message}"
                </div>
              </div>

              {/* Previous Thread replies */}
              {selectedMessage.replies?.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Thread Reply History</span>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {selectedMessage.replies?.map((rep, idx) => (
                      <div key={idx} className="bg-emerald-50/40 border border-emerald-200/70 p-3 rounded-xl text-xs leading-relaxed">
                        <div className="flex justify-between text-[10px] text-emerald-800 font-black uppercase tracking-wider mb-1">
                          <span className="flex items-center gap-1"><CornerDownRight className="w-3 h-3 text-emerald-600" /> Admin Email Dispatch</span>
                          <span>{new Date(rep.repliedAt).toLocaleString()}</span>
                        </div>
                        <span className="text-slate-800 font-extrabold block mt-0.5">"{rep.replyText}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-black uppercase tracking-wider block">Write Email Reply Message</label>
                <textarea
                  placeholder="Type your official reply message here... (An automated email notification will be dispatched to sender)"
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !replyText.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Dispatch Email Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContactMessages;
