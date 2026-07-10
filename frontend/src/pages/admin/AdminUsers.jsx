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

      const { data } = await adminApi.getUsers({ params });
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
      const { data } = await adminApi.getUserById(user._id);
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
      const { data } = await adminApi.toggleUserActive(user._id);
      toast.success(data.message || "User status updated");
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
    const styles = {
      donor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      hospital: "bg-blue-50 text-blue-700 border-blue-100",
      "blood-lab": "bg-purple-50 text-purple-700 border-purple-100",
      admin: "bg-red-50 text-red-700 border-red-100",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[role] || "bg-gray-50 text-gray-700 border-gray-100"}`}>
        {role === "blood-lab" ? "Blood Lab" : role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-red-600" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage, activate, and moderate registered users across all roles</p>
        </div>
        <button
          onClick={() => fetchUsers(true)}
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="donor">Donors</option>
              <option value="hospital">Hospitals</option>
              <option value="blood-lab">Blood Labs</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Users Found</h3>
            <p className="text-gray-500 max-w-sm mt-1">We couldn't find any users matching your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">User details</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-700 text-base shadow-inner border border-gray-100">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">{getRoleBadge(user.role)}</td>
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${user.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`}></span>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewDetails(user)}
                          title="View Profile details"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ type: "toggle", user })}
                          title={user.isActive ? "Deactivate User" : "Activate User"}
                          className={`p-2 rounded-xl transition-all ${user.isActive ? "text-gray-500 hover:text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                        >
                          {user.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                        </button>
                        <button
                          onClick={() => setConfirmModal({ type: "delete", user })}
                          title="Delete User"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
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
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing page <strong className="font-semibold text-gray-900">{currentPage}</strong> of <strong className="font-semibold text-gray-900">{totalPages}</strong> ({totalUsers} total users)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scaleIn">
            <h3 className="text-lg font-bold text-gray-900">
              {confirmModal.type === "delete" ? "Delete User Account?" : `${confirmModal.user.isActive ? "Deactivate" : "Activate"} User Account?`}
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete ${confirmModal.user.name}'s account? This action is permanent and will delete their associated profiles.`
                : `Are you sure you want to change the status of ${confirmModal.user.name}'s account? This will restrict or restore their dashboard access.`}
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
                    ? handleDeleteUser(confirmModal.user)
                    : handleToggleActive(confirmModal.user)
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

      {/* Details Side Panel / Modal */}
      {detailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="bg-white h-full max-w-md w-full p-6 shadow-2xl border-l border-gray-100 flex flex-col justify-between overflow-y-auto animate-slideInRight">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5.5 h-5.5 text-red-600" />
                  User Profile Details
                </h3>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  &times;
                </button>
              </div>

              {/* Basic Info */}
              <div className="text-center pb-5 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-700 text-2xl shadow-inner border border-gray-100 mx-auto">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <h4 className="font-bold text-gray-900 mt-3 text-lg">{selectedUser.name}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{selectedUser.email}</p>
                <div className="mt-3.5">{getRoleBadge(selectedUser.role)}</div>
              </div>

              {/* Details List */}
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-900 text-sm uppercase tracking-wider text-gray-400">Account details</h5>

                <div className="grid grid-cols-2 gap-4.5 bg-gray-50 p-4.5 rounded-xl border border-gray-100 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Account Status</span>
                    <strong className={`font-semibold ${selectedUser.isActive ? "text-emerald-600" : "text-red-500"}`}>
                      {selectedUser.isActive ? "Active" : "Disabled"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Auth Provider</span>
                    <strong className="font-semibold text-gray-800 uppercase">{selectedUser.authProvider || "Local"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Phone Number</span>
                    <strong className="font-semibold text-gray-800">{selectedUser.phone || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Email Verified</span>
                    <strong className={`font-semibold ${selectedUser.isEmailVerified ? "text-emerald-600" : "text-gray-500"}`}>
                      {selectedUser.isEmailVerified ? "Verified" : "Pending"}
                    </strong>
                  </div>
                </div>

                {/* Role Specific details */}
                {selectedUser.profile && (
                  <div className="space-y-3.5">
                    <h5 className="font-semibold text-gray-900 text-sm uppercase tracking-wider text-gray-400 mt-6">
                      {selectedUser.role === "donor" ? "Donor details" : "Facility details"}
                    </h5>

                    {selectedUser.role === "donor" ? (
                      <div className="space-y-2.5 bg-red-50/20 p-4 border border-red-50/50 rounded-xl text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-500" /> Blood Group</span>
                          <strong className="text-red-600 font-bold">{selectedUser.profile.bloodGroup}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Age</span>
                          <strong className="text-gray-800">{selectedUser.profile.age} years</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Gender</span>
                          <strong className="text-gray-800">{selectedUser.profile.gender}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Weight</span>
                          <strong className="text-gray-800">{selectedUser.profile.weight} kg</strong>
                        </div>
                        {selectedUser.profile.address && (
                          <div className="border-t border-gray-100 pt-2.5 mt-1">
                            <span className="text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> Location</span>
                            <span className="text-gray-700 block mt-1 leading-relaxed text-xs">
                              {selectedUser.profile.address.street}, {selectedUser.profile.address.city}, {selectedUser.profile.address.state} - {selectedUser.profile.address.pincode}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5 bg-blue-50/20 p-4 border border-blue-50/50 rounded-xl text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 flex items-center gap-1.5"><Building className="w-4 h-4 text-blue-500" /> Facility Type</span>
                          <strong className="text-blue-700 font-bold uppercase">{selectedUser.profile.facilityType}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Reg. Number</span>
                          <strong className="text-gray-800">{selectedUser.profile.registrationNumber}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Verification Status</span>
                          <strong className={`font-bold ${selectedUser.profile.status === "approved" ? "text-emerald-600" : selectedUser.profile.status === "rejected" ? "text-red-500" : "text-amber-500"}`}>
                            {selectedUser.profile.status?.toUpperCase()}
                          </strong>
                        </div>
                        {selectedUser.profile.address && (
                          <div className="border-t border-gray-100 pt-2.5 mt-1">
                            <span className="text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> Address</span>
                            <span className="text-gray-700 block mt-1 leading-relaxed text-xs">
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

            <div className="pt-4 border-t border-gray-100 mt-6">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-sm"
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
