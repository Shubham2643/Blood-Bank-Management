import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { adminApi } from "../../services/api";

function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

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

      const { data } = await adminApi.getContactMessages({ params });
      setMessages(data.messages || data.data?.messages || []);
      setTotalPages(data.pagination?.pages || 1);
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
      general: "bg-gray-100 text-gray-700",
      emergency: "bg-rose-50 text-rose-700 border border-rose-100",
      donation: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      camp: "bg-blue-50 text-blue-700 border border-blue-100",
      partnership: "bg-purple-50 text-purple-700 border border-purple-100",
      feedback: "bg-amber-50 text-amber-700 border border-amber-100",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${styles[type?.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
        {type || "General"}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-red-600" />
            Contact Messages & Inquiries
          </h1>
          <p className="text-gray-500 mt-1">Review contact form submissions and reply directly via email</p>
        </div>
        <button
          onClick={() => fetchMessages(true)}
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
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="unreplied">Awaiting Reply</option>
            <option value="replied">Replied</option>
          </select>

          {/* Inquiry Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="emergency">Emergency</option>
            <option value="donation">Donation</option>
            <option value="camp">Camp</option>
            <option value="partnership">Partnership</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>
      </div>

      {/* Main Messages List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded w-full"></div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Messages Found</h3>
            <p className="text-gray-500 max-w-sm mt-1">There are no contact form entries matching your search/filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">Sender Details</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date Received</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {messages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold">
                          {msg.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{msg.name}</div>
                          <div className="text-xs text-gray-500 font-medium">{msg.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getInquiryTypeBadge(msg.inquiryType)}</td>
                    <td className="py-4 px-6 text-gray-700 font-medium max-w-xs truncate">{msg.subject}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${msg.replied ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                        {msg.replied ? "REPLIED" : "AWAITING REPLY"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenReply(msg)}
                        className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-all shadow-sm"
                      >
                        {msg.replied ? "View thread" : "Reply Email"}
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
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
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
      </div>

      {/* Reply Modal */}
      {replyModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col justify-between overflow-y-auto max-h-[85vh] animate-scaleIn">
            <form onSubmit={handleSubmitReply} className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5.5 h-5.5 text-red-600" />
                  Reply to Inquiry
                </h3>
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>

              {/* Inquiry Message */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1.5 text-sm">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selectedMessage.name}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
                <div className="font-bold text-gray-900 mt-1">{selectedMessage.subject}</div>
                <div className="text-gray-600 text-xs italic mt-1 leading-relaxed">"{selectedMessage.message}"</div>
              </div>

              {/* Previous Thread replies */}
              {selectedMessage.replies?.length > 0 && (
                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Reply History</span>
                  <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                    {selectedMessage.replies.map((rep, idx) => (
                      <div key={idx} className="bg-emerald-50/20 border border-emerald-50/50 p-2.5 rounded-lg text-xs leading-relaxed">
                        <div className="flex justify-between text-[9px] text-emerald-700 font-semibold mb-1">
                          <span className="flex items-center gap-1"><CornerDownRight className="w-3 h-3" /> Replied by Admin</span>
                          <span>{new Date(rep.repliedAt).toLocaleString()}</span>
                        </div>
                        <span className="text-gray-700 font-medium">"{rep.replyText}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Write Reply Message</label>
                <textarea
                  placeholder="Type your reply here... (An email will be dispatched to the sender)"
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !replyText.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send Reply
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
