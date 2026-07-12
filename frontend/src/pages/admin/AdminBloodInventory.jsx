import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Droplet,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  AlertTriangle,
  FileText,
  Calendar,
  Building,
  CheckCircle,
} from "lucide-react";
import { adminApi } from "../../services/api";

function AdminBloodInventory() {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [componentFilter, setComponentFilter] = useState("all");

  // Selection
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'delete'|'status', unit, value }
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Inventory and Stats
  const fetchStats = async () => {
    try {
      const res = await adminApi.getBloodInventoryStats();
      const data = res.data?.data || res.data;
      setStats(data);
    } catch (error) {
      console.error("Failed to load inventory stats");
    }
  };

  const fetchInventory = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: currentPage,
        limit: 10,
      };
      if (bloodGroupFilter !== "all") params.bloodGroup = bloodGroupFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (componentFilter !== "all") params.componentType = componentFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await adminApi.getBloodInventory({ params });
      const data = res.data?.data || res.data;
      setBloodUnits(data.bloodUnits || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load blood inventory");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, bloodGroupFilter, statusFilter, componentFilter, debouncedSearch]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    fetchStats();
  }, [bloodUnits]);

  // Handle Delete Blood Unit
  const handleDeleteUnit = async (unit) => {
    try {
      setActionLoading(true);
      await adminApi.deleteBloodUnit(unit._id);
      toast.success("Blood unit record deleted successfully");
      setConfirmModal(null);
      fetchInventory();
    } catch (error) {
      toast.error("Failed to delete blood record");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async (unit, status) => {
    try {
      setActionLoading(true);
      await adminApi.updateBloodStatus(unit._id, { status });
      toast.success("Blood status updated successfully");
      setConfirmModal(null);
      fetchInventory();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const styles = {
      available: "bg-emerald-50 text-emerald-700 border-emerald-100",
      reserved: "bg-amber-50 text-amber-700 border-amber-100",
      expired: "bg-red-50 text-red-700 border-red-100",
      used: "bg-gray-50 text-gray-500 border-gray-100",
    };
    return styles[status] || "bg-gray-50 text-gray-500";
  };

  const getTestColor = (status) => {
    const styles = {
      safe: "bg-emerald-50 text-emerald-700 border-emerald-100",
      "pending-test": "bg-amber-50 text-amber-700 border-amber-100",
      "unsafe-discarded": "bg-rose-50 text-rose-700 border-rose-100",
    };
    return styles[status] || "bg-gray-50 text-gray-500";
  };

  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Droplet className="w-7 h-7 text-red-600 fill-red-600" />
            Global Blood Inventory
          </h1>
          <p className="text-gray-500 mt-1">Track and manage global stock levels, testing queues, and component expiry</p>
        </div>
        <button
          onClick={() => { fetchInventory(true); fetchStats(); }}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 font-medium text-sm transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Summary Panel */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Droplet className="w-6 h-6 fill-red-500" />
            </div>
            <div>
              <span className="text-gray-500 text-xs block font-medium">Total Available Units</span>
              <strong className="text-2xl font-bold text-gray-900">
                {Object.values(stats.bloodGroups || {}).reduce((a, b) => a + b, 0)} Units
              </strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-gray-500 text-xs block font-medium">Expiring within 7 Days</span>
              <strong className="text-2xl font-bold text-amber-600">{stats.expiringSoon || 0} Units</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-gray-500 text-xs block font-medium">Pending Lab Testing</span>
              <strong className="text-2xl font-bold text-purple-700">{stats.statusDistribution["pending-test"] || 0} Bags</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-gray-500 text-xs block font-medium">Critical Low Stock Groups</span>
              <strong className="text-lg font-bold text-rose-600 uppercase">
                {stats.criticalGroups?.length > 0 ? stats.criticalGroups.join(", ") : "None"}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Blood Groups Distribution Cards */}
      {stats && stats.bloodGroups && (
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(stats.bloodGroups).map(([group, count]) => {
            const isLow = count < 5;
            return (
              <div
                key={group}
                className={`bg-white rounded-xl p-3 border shadow-sm text-center flex flex-col justify-center items-center ${isLow ? "border-rose-100 bg-rose-50/10" : "border-gray-100"}`}
              >
                <span className="text-xs font-bold text-gray-400 block uppercase">{group}</span>
                <strong className={`text-xl font-extrabold mt-1 ${isLow ? "text-rose-600" : "text-gray-900"}`}>{count}</strong>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full mt-1.5 font-semibold ${isLow ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {isLow ? "Critical" : "Stable"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Bag ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-all"
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="expired">Expired</option>
            <option value="used">Used</option>
          </select>

          {/* Component Type Filter */}
          <select
            value={componentFilter}
            onChange={(e) => { setComponentFilter(e.target.value); setCurrentPage(1); }}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Components</option>
            <option value="Whole Blood">Whole Blood</option>
            <option value="PRBC">PRBC</option>
            <option value="Platelets">Platelets</option>
            <option value="FFP">FFP</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded w-full"></div>
            ))}
          </div>
        ) : bloodUnits.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <Droplet className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Blood Units Found</h3>
            <p className="text-gray-500 max-w-sm mt-1">We couldn't find any blood bags in the database matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">Bag ID</th>
                  <th className="py-4 px-6">Blood Group</th>
                  <th className="py-4 px-6">Component Type</th>
                  <th className="py-4 px-6">Volume</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Test Results</th>
                  <th className="py-4 px-6">Facility Location</th>
                  <th className="py-4 px-6">Expiry Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bloodUnits.map((unit) => {
                  const expiring = isExpiringSoon(unit.expiryDate) && unit.status === "available";
                  return (
                    <tr key={unit._id} className={`hover:bg-gray-50/50 transition-colors ${expiring ? "bg-rose-50/10" : ""}`}>
                      <td className="py-4 px-6 font-mono font-bold text-gray-700 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {unit.bagId}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 font-bold border border-red-100">
                          {unit.bloodGroup}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-600">{unit.componentType}</td>
                      <td className="py-4 px-6 text-gray-700 font-semibold">{unit.quantity} ml</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(unit.status)}`}>
                          {unit.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getTestColor(unit.testingStatus)}`}>
                          {unit.testingStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {unit.hospital?.name || unit.bloodLab?.name || "N/A"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className={`w-4 h-4 ${expiring ? "text-rose-500" : "text-gray-400"}`} />
                          <span className={expiring ? "text-rose-600 font-bold" : ""}>
                            {new Date(unit.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Update dropdown inline */}
                          <select
                            value={unit.status}
                            onChange={(e) => setConfirmModal({ type: "status", unit, value: e.target.value })}
                            className="bg-transparent text-xs text-gray-500 hover:text-red-600 border-none cursor-pointer focus:outline-none focus:ring-0"
                          >
                            <option value="available">Available</option>
                            <option value="reserved">Reserved</option>
                            <option value="expired">Expired</option>
                            <option value="used">Used</option>
                          </select>
                          <button
                            onClick={() => setConfirmModal({ type: "delete", unit })}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              {confirmModal.type === "delete" ? "Delete Blood Unit Record?" : "Update Blood Unit Status?"}
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete blood bag record ${confirmModal.unit.bagId}? This action cannot be undone.`
                : `Are you sure you want to change the status of blood bag ${confirmModal.unit.bagId} to ${confirmModal.value.toUpperCase()}?`}
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
                    ? handleDeleteUnit(confirmModal.unit)
                    : handleUpdateStatus(confirmModal.unit, confirmModal.value)
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
    </div>
  );
}

export default AdminBloodInventory;
