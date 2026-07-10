import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Droplet,
  Building,
  Activity,
  FileText,
} from "lucide-react";
import { adminApi } from "../../services/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminReports() {
  const [activeTab, setActiveTab] = useState("donations");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(now.toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = useState("month");

  // Report States
  const [donationReport, setDonationReport] = useState(null);
  const [usageReport, setUsageReport] = useState(null);
  const [facilityReport, setFacilityReport] = useState(null);

  const fetchReports = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setRefreshing(true);
      else setLoading(true);

      const params = {
        startDate,
        endDate,
        groupBy,
      };

      if (activeTab === "donations") {
        const { data } = await adminApi.getDonationReport({ params });
        setDonationReport(data);
      } else if (activeTab === "usage") {
        const { data } = await adminApi.getBloodUsageReport({ params });
        setUsageReport(data);
      } else if (activeTab === "facilities") {
        const { data } = await adminApi.getFacilityPerformanceReport({ params });
        setFacilityReport(data);
      }
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, startDate, endDate, groupBy]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle Export to CSV
  const handleExport = () => {
    let csvData = [];
    let fileName = `report-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`;

    if (activeTab === "donations" && donationReport) {
      csvData.push(["Period", "Donations Count", "Volume (ml)"]);
      donationReport.trend?.forEach((t) => {
        csvData.push([t._id, t.count, t.quantity || 0]);
      });
    } else if (activeTab === "usage" && usageReport) {
      csvData.push(["Metric", "Value"]);
      Object.entries(usageReport.statusDistribution || {}).forEach(([status, units]) => {
        csvData.push([`Stock status: ${status}`, units]);
      });
      csvData.push(["Fulfillment Rate", `${usageReport.fulfillmentRate}%`]);
      csvData.push(["Total Requests", usageReport.totalRequests]);
      csvData.push(["Completed Requests", usageReport.completedRequests]);
    } else if (activeTab === "facilities" && facilityReport) {
      csvData.push(["Facility Name", "Type", "Available Stock (ml)", "Requests Made", "Requests Fulfilled"]);
      facilityReport.forEach((f) => {
        csvData.push([f.name, f.type, f.availableStock, f.requestsMade, f.requestsFulfilled]);
      });
    }

    if (csvData.length === 0) return;

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV report exported successfully");
  };

  // Line Chart Config for Donations Trend
  const getDonationTrendChart = () => {
    if (!donationReport || !donationReport.trend) return null;
    const labels = donationReport.trend.map((t) => t._id);
    const dataPoints = donationReport.trend.map((t) => t.count);

    return {
      labels,
      datasets: [
        {
          label: "Donations Collected",
          data: dataPoints,
          fill: true,
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderColor: "rgb(239, 68, 68)",
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "rgb(239, 68, 68)",
        },
      ],
    };
  };

  // Doughnut Chart Config for Blood Group Distribution
  const getBloodGroupBreakdownChart = () => {
    if (!donationReport || !donationReport.bloodGroups) return null;
    const labels = donationReport.bloodGroups.map((b) => b._id || "Unknown");
    const dataPoints = donationReport.bloodGroups.map((b) => b.count);

    return {
      labels,
      datasets: [
        {
          data: dataPoints,
          backgroundColor: [
            "#ef4444",
            "#f97316",
            "#f59e0b",
            "#10b981",
            "#3b82f6",
            "#6366f1",
            "#8b5cf6",
            "#ec4899",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Doughnut Chart Config for Usage Status Distribution
  const getUsageStatusChart = () => {
    if (!usageReport || !usageReport.statusDistribution) return null;
    const labels = Object.keys(usageReport.statusDistribution).map((k) => k.toUpperCase());
    const dataPoints = Object.values(usageReport.statusDistribution);

    return {
      labels,
      datasets: [
        {
          data: dataPoints,
          backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#9ca3af"],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-red-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1">Audit blood bank operations, donation trends, and facility performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
          >
            <Download className="w-4.5 h-4.5" />
            Export CSV
          </button>
          <button
            onClick={() => fetchReports(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 font-medium text-sm transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("donations")}
          className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all ${activeTab === "donations" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Donations Analytics
        </button>
        <button
          onClick={() => setActiveTab("usage")}
          className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all ${activeTab === "usage" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Inventory Usage
        </button>
        <button
          onClick={() => setActiveTab("facilities")}
          className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all ${activeTab === "facilities" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Facility Performance
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Date Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-1 text-sm bg-gray-50 focus:outline-none"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-1 text-sm bg-gray-50 focus:outline-none"
          />
        </div>

        {activeTab === "donations" && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
            <span className="text-xs text-gray-500">Group By:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        )}
      </div>

      {/* Reports Display panel */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center flex items-center justify-center animate-pulse">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : activeTab === "donations" && donationReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Donations Collection Trend</h3>
            <div className="h-72">
              {getDonationTrendChart() ? (
                <Line
                  data={getDonationTrendChart()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              ) : (
                <p className="text-center py-20 text-gray-400">No trend data available.</p>
              )}
            </div>
          </div>

          {/* Blood group breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Blood Group Breakdown</h3>
            <div className="h-60 relative flex justify-center items-center">
              {getBloodGroupBreakdownChart() ? (
                <Doughnut
                  data={getBloodGroupBreakdownChart()}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              ) : (
                <p className="text-center py-20 text-gray-400">No breakdown data.</p>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "usage" && usageReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usage stats */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-1.5">
              <span className="text-gray-500 text-xs block font-semibold uppercase tracking-wider">Fulfillment Rate</span>
              <strong className="text-3xl font-extrabold text-emerald-600 block">{usageReport.fulfillmentRate}%</strong>
              <p className="text-gray-400 text-xs mt-1">Percentage of hospital blood requests successfully fulfilled</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-1.5">
              <span className="text-gray-500 text-xs block font-semibold uppercase tracking-wider">Total Requests Audited</span>
              <strong className="text-3xl font-extrabold text-gray-900 block">{usageReport.totalRequests} Requests</strong>
              <div className="text-xs text-gray-400 mt-2 flex justify-between">
                <span>Completed: {usageReport.completedRequests}</span>
                <span>Fulfillment Gap: {usageReport.totalRequests - usageReport.completedRequests}</span>
              </div>
            </div>
          </div>

          {/* Stock state status distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Inventory Distribution by Status</h3>
            <div className="h-72 relative flex justify-center items-center">
              {getUsageStatusChart() ? (
                <Doughnut
                  data={getUsageStatusChart()}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              ) : (
                <p className="text-center py-20 text-gray-400">No inventory status distribution data.</p>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "facilities" && facilityReport ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">Facility Name</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Available Stock</th>
                  <th className="py-4 px-6">Requests Issued</th>
                  <th className="py-4 px-6">Requests Fulfilled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {facilityReport.map((f, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 font-bold text-gray-900">
                        <Building className="w-4 h-4 text-gray-400" />
                        {f.name}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${f.type === "hospital" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-purple-50 text-purple-700 border-purple-100"}`}>
                        {f.type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-700">{f.availableStock} ml</td>
                    <td className="py-4 px-6 text-gray-600">{f.requestsMade} Requests</td>
                    <td className="py-4 px-6 text-emerald-600 font-semibold">{f.requestsFulfilled} Orders</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-20 border border-gray-100 text-center text-gray-400">
          No report data matches the filters.
        </div>
      )}
    </div>
  );
}

export default AdminReports;
