import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Users,
  Search,
  Filter,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Shield,
  MapPin,
  Heart,
  Building,
  ShieldCheck,
  UserCheck,
  UserX,
  Sparkles,
  Building2,
  Clock
} from "lucide-react";
import { adminApi } from "../../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selection/Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'delete'|'toggle', user }
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Users
  const fetchUsers = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: currentPage,
        limit: 10,
        role: roleFilter,
        status: statusFilter,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await adminApi.getUsers({ params });
      const data = res.data?.data || res.data;
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalUsers(data.pagination?.total || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, roleFilter, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle View Details
  const handleViewDetails = async (user) => {
    try {
      const res = await adminApi.getUserById(user._id);
      const data = res.data?.data || res.data;
      setSelectedUser(data);
      setDetailModalOpen(true);
    } catch (error) {
      toast.error("Failed to load user details");
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (user) => {
    try {
      setActionLoading(true);
      const res = await adminApi.toggleUserActive(user._id);
      const data = res.data?.data || res.data;
      toast.success(data.message || res.data?.message || "User status updated");
      setConfirmModal(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user) => {
    try {
      setActionLoading(true);
      await adminApi.deleteUser(user._id);
      toast.success("User deleted successfully");
      setConfirmModal(null);
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const config = {
      donor: "bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-2xs",
      hospital: "bg-blue-50 text-blue-800 border-blue-200/90 shadow-2xs",
      "blood-lab": "bg-purple-50 text-purple-800 border-purple-200/90 shadow-2xs",
      admin: "bg-rose-50 text-rose-800 border-rose-200/90 shadow-2xs",
    };
    return (
      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${config[role] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
        {role === "blood-lab" ? "Blood Lab" : role}
      </span>
    );
  };

  const getRoleAvatarBg = (role) => {
    const avatars = {
      donor: "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-600/25",
      hospital: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-600/25",
      "blood-lab": "bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-purple-600/25",
      admin: "bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-red-600/25",
    };
    return avatars[role] || "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-slate-600/25";
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 3D Executive Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 border border-red-400/30 shrink-0">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                User Management
              </h1>
              <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200/80 rounded-full font-black text-[10px] uppercase tracking-wider shadow-2xs">
                {totalUsers} Registered
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Manage, activate, and moderate accounts across donors, hospitals, labs, and admins
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchUsers(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Sync Users</span>
        </button>
      </div>

      {/* Glassmorphic Filters & Search Bar */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-5 sm:p-6 shadow-xl shadow-slate-100/80 flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow-2xl transition-all duration-300">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-xs text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="donor">Donors</option>
              <option value="hospital">Hospitals</option>
              <option value="blood-lab">Blood Labs</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3.5 py-2 border border-slate-200/80">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Luxury 3D Specimen Table */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 shadow-xl shadow-slate-100/80 overflow-hidden hover:shadow-2xl transition-all duration-300">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                    <div className="h-3 bg-slate-200 rounded w-44"></div>
                  </div>
                </div>
                <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                <div className="h-8 bg-slate-200 rounded-2xl w-28"></div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-850 uppercase tracking-wide">No Registered Users Found</h3>
            <p className="text-xs text-slate-500 font-semibold max-w-sm mt-1">We couldn't find any users matching your filter search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">User Account Details</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Registration Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-md border-2 border-white ring-2 ring-slate-100 ${getRoleAvatarBg(user.role)}`}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-850">{user.name}</div>
                          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">{getRoleBadge(user.role)}</td>
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${user.isActive ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-xs text-slate-600 font-bold">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(user)}
                          title="View Profile Details"
                          className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/60 rounded-xl transition-all shadow-2xs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ type: "toggle", user })}
                          title={user.isActive ? "Deactivate Account" : "Activate Account"}
                          className={`p-2.5 rounded-xl border transition-all shadow-2xs ${user.isActive ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50 border-slate-200/60" : "text-emerald-700 bg-emerald-50 border-emerald-200"}`}
                        >
                          {user.isActive ? <ToggleRight className="w-4.5 h-4.5" /> : <ToggleLeft className="w-4.5 h-4.5 text-slate-400" />}
                        </button>
                        <button
                          onClick={() => setConfirmModal({ type: "delete", user })}
                          title="Delete User"
                          className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200/60 rounded-xl transition-all shadow-2xs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-slate-50/60 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500">
              Showing page <strong className="font-black text-slate-850">{currentPage}</strong> of <strong className="font-black text-slate-850">{totalPages}</strong> ({totalUsers} total users)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none shadow-2xs"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3D Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-850">
              {confirmModal.type === "delete" ? "Delete Account Permanently?" : `${confirmModal.user.isActive ? "Deactivate" : "Activate"} User Account?`}
            </h3>
            <p className="text-slate-500 mt-2 text-xs font-semibold leading-relaxed">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete ${confirmModal.user.name}'s account? This action is permanent and will clear their profiles.`
                : `Are you sure you want to change the status of ${confirmModal.user.name}'s account? This will restrict or restore their dashboard access.`}
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
                    ? handleDeleteUser(confirmModal.user)
                    : handleToggleActive(confirmModal.user)
                }
                disabled={actionLoading}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${confirmModal.type === "delete" ? "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800" : "bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800"}`}
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Side Panel Drawer */}
      {detailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end backdrop-blur-md bg-slate-900/40 animate-fadeIn">
          <div className="bg-white h-full max-w-md w-full p-6 sm:p-7 shadow-2xl border-l border-slate-100 flex flex-col justify-between overflow-y-auto animate-slideInRight">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-850 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <Shield className="w-5 h-5" />
                  </div>
                  User Profile Telemetry
                </h3>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Basic Profile Card */}
              <div className="text-center pb-5 border-b border-slate-100">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white ring-2 ring-slate-100 mx-auto ${getRoleAvatarBg(selectedUser.role)}`}>
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <h4 className="font-black text-slate-850 mt-3 text-lg">{selectedUser.name}</h4>
                <p className="text-xs font-bold text-slate-400 mt-0.5">{selectedUser.email}</p>
                <div className="mt-3">{getRoleBadge(selectedUser.role)}</div>
              </div>

              {/* Account Details */}
              <div className="space-y-4">
                <h5 className="font-black text-xs uppercase tracking-wider text-slate-400">Account Credentials</h5>

                <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 text-xs font-bold">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Status</span>
                    <strong className={`font-black text-sm ${selectedUser.isActive ? "text-emerald-600" : "text-rose-600"}`}>
                      {selectedUser.isActive ? "Active" : "Disabled"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Auth Provider</span>
                    <strong className="font-black text-sm text-slate-800 uppercase">{selectedUser.authProvider || "Local"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Phone Number</span>
                    <strong className="font-black text-sm text-slate-800">{selectedUser.phone || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Email Verification</span>
                    <strong className={`font-black text-sm ${selectedUser.isEmailVerified ? "text-emerald-600" : "text-slate-500"}`}>
                      {selectedUser.isEmailVerified ? "Verified" : "Pending"}
                    </strong>
                  </div>
                </div>

                {/* Role Specific Details */}
                {selectedUser.profile && (
                  <div className="space-y-3">
                    <h5 className="font-black text-xs uppercase tracking-wider text-slate-400 mt-6">
                      {selectedUser.role === "donor" ? "Donor Attributes" : "Facility Attributes"}
                    </h5>

                    {selectedUser.role === "donor" ? (
                      <div className="space-y-2.5 bg-red-50/30 p-4 border border-red-100/80 rounded-2xl text-xs font-bold">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-500" /> Blood Group</span>
                          <strong className="text-red-600 font-black text-sm px-2.5 py-0.5 bg-red-100 rounded-lg border border-red-200">{selectedUser.profile.bloodGroup}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Age</span>
                          <strong className="text-slate-800">{selectedUser.profile.age} years</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Gender</span>
                          <strong className="text-slate-800">{selectedUser.profile.gender}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Weight</span>
                          <strong className="text-slate-800">{selectedUser.profile.weight} kg</strong>
                        </div>
                        {selectedUser.profile.address && (
                          <div className="border-t border-red-100 pt-2.5 mt-1">
                            <span className="text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</span>
                            <span className="text-slate-700 block mt-1 leading-relaxed text-[11px]">
                              {selectedUser.profile.address.street}, {selectedUser.profile.address.city}, {selectedUser.profile.address.state} - {selectedUser.profile.address.pincode}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5 bg-blue-50/30 p-4 border border-blue-100/80 rounded-2xl text-xs font-bold">
                        <div className="flex justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5"><Building className="w-4 h-4 text-blue-500" /> Facility Type</span>
                          <strong className="text-blue-700 font-black uppercase">{selectedUser.profile.facilityType}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Reg. Number</span>
                          <strong className="text-slate-800">{selectedUser.profile.registrationNumber}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Verification Status</span>
                          <strong className={`font-black ${selectedUser.profile.status === "approved" ? "text-emerald-600" : selectedUser.profile.status === "rejected" ? "text-rose-600" : "text-amber-500"}`}>
                            {selectedUser.profile.status?.toUpperCase()}
                          </strong>
                        </div>
                        {selectedUser.profile.address && (
                          <div className="border-t border-blue-100 pt-2.5 mt-1">
                            <span className="text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</span>
                            <span className="text-slate-700 block mt-1 leading-relaxed text-[11px]">
                              {selectedUser.profile.address.street}, {selectedUser.profile.address.city}, {selectedUser.profile.address.state} - {selectedUser.profile.address.pincode}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-all text-xs uppercase tracking-wider"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
