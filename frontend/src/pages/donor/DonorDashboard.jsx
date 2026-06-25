import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { donorApi } from "../../services/api.js";
import {
  Droplet,
  Calendar,
  Users,
  Activity,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Shield,
  Award,
  Heart,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Download,
  Share2,
  Filter,
  Search,
  Bell
} from "lucide-react";
import { toast } from "react-hot-toast";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [donor, setDonor] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔄 Starting donor dashboard data fetch...");

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      console.log("📡 Making API requests...");

      const [profileRes, historyRes, statsRes] = await Promise.all([
        donorApi.getProfile(),
        donorApi.getHistory(),
        donorApi.getStats().catch(() => ({ data: {} })),
      ]);

      const profilePayload = profileRes.data.data || profileRes.data;
      const donorData = profilePayload.profile || profilePayload.donor || profilePayload;
      setDonor(donorData);

      // Handle different response structures for history
      let historyData = [];
      if (historyRes.data.history) {
        historyData = historyRes.data.history;
      } else if (historyRes.data.donations) {
        historyData = historyRes.data.donations;
      } else if (Array.isArray(historyRes.data)) {
        historyData = historyRes.data;
      }

      // Map facility populated object fields to the flat Facility and city properties
      historyData = historyData.map((item) => ({
        ...item,
        Facility: item.facility?.name || item.Facility || "Blood Donation Center",
        city: item.facility?.address?.city || item.city || "Unknown City",
        state: item.facility?.address?.state || item.state || "",
      }));

      setHistory(historyData);

      // Calculate dashboard stats
      const totalDonations = historyData.length;
      const livesImpacted = totalDonations * 3; // Each donation can save up to 3 lives
      const achievementLevel = totalDonations >= 10 ? "Gold" : totalDonations >= 5 ? "Silver" : "Bronze";
      const nextMilestone = totalDonations < 5 ? 5 : totalDonations < 10 ? 10 : 15;
      const completionRate = Math.min(100, (totalDonations / nextMilestone) * 100);

      setDashboard({
        stats: {
          totalDonations,
          livesImpacted,
          achievementLevel,
          nextMilestone,
          completionRate,
          ...statsRes.data
        },
        recentActivity: historyData.slice(0, 5)
      });

    } catch (error) {
      console.error("🚨 Donor Dashboard Error:", error);
      const message = error.response?.data?.message || "Failed to load donor dashboard data";
      toast.error(message);
    }
  };

  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success("Dashboard updated");
  };

  useEffect(() => {
    console.log("🎯 Donor Dashboard component mounted");
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
      console.log("🏁 Donor dashboard data loading completed");
    };
    loadData();
  }, []);

  // Debug current state
  console.log("📊 Current Donor State:", {
    dashboard: dashboard,
    donor: donor,
    history: history,
    loading: loading,
    historyLength: history?.length,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Heart className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Donor Dashboard
          </h2>
          <p className="text-gray-500">Preparing your donation journey...</p>
        </div>
      </div>
    );
  }

  const isEligible = donor?.eligibleToDonate || false;
  const nextDonationDate = donor?.nextEligibleDate ? new Date(donor.nextEligibleDate) : null;
  const daysUntilEligible = nextDonationDate ? Math.ceil((nextDonationDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            Donor Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Track your donation journey and impact
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-4 lg:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Eligibility Banner */}
      {!isEligible && nextDonationDate && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">Next Donation Available</p>
            <p className="text-yellow-600 text-sm">
              You can donate again in {daysUntilEligible} day{daysUntilEligible !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {isEligible && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800">Ready to Donate!</p>
            <p className="text-green-600 text-sm">
              You are eligible to donate blood now
            </p>
          </div>
        </div>
      )}

      {/* Donor Profile Card */}
      {donor && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 mb-8 transition-all duration-300 hover:shadow-2xl relative overflow-hidden">
          {/* Decorative Background Accent Glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-50/40 rounded-full blur-3xl -z-10" />

          {/* Top Profile Header Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-6 border-b border-slate-100">
            {/* Avatar - Circular with elegant double borders */}
            <div className="relative flex-shrink-0 group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-rose-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-rose-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-md border-4 border-white">
                {(donor.user?.name || donor.name || "D").charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Name, Badges & Profile description */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {donor.user?.name || donor.name || "Blood Donor"}
              </h2>
              <div className="flex flex-wrap gap-2.5 mt-2.5 justify-center sm:justify-start">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold ${
                  isEligible 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isEligible ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {isEligible ? "Eligible to Donate" : "Not Eligible"}
                </span>
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200/60">
                  Donor
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Grid Details Section */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Email Detail Card */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80 hover:border-red-100 hover:bg-red-50/10 hover:shadow-sm transition-all duration-300">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                <span className="block text-sm font-semibold text-slate-700 mt-0.5 break-all leading-snug">
                  {donor.email || "—"}
                </span>
              </div>
            </div>

            {/* Phone Detail Card */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80 hover:border-red-100 hover:bg-red-50/10 hover:shadow-sm transition-all duration-300">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                <span className="block text-sm font-semibold text-slate-700 mt-0.5 break-all leading-snug">
                  {donor.phone || donor.user?.phone || "—"}
                </span>
              </div>
            </div>

            {/* Blood Type Detail Card */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80 hover:border-red-100 hover:bg-red-50/10 hover:shadow-sm transition-all duration-300">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 flex-shrink-0">
                <Droplet className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Type</span>
                <span className="block text-base font-black text-red-600 mt-0.5 leading-snug">
                  {donor.bloodGroup || "—"}
                </span>
              </div>
            </div>

            {/* Location Detail Card */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80 hover:border-red-100 hover:bg-red-50/10 hover:shadow-sm transition-all duration-300">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Location</span>
                <span className="block text-sm font-semibold text-slate-700 mt-0.5 truncate leading-snug" title={`${donor.address?.city || 'N/A'}, ${donor.address?.state || 'N/A'}`}>
                  {donor.address?.city && donor.address?.state 
                    ? `${donor.address.city}, ${donor.address.state}` 
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Droplet className="w-6 h-6" />}
          label="Total Donations"
          value={dashboard?.stats?.totalDonations || 0}
          subtitle={`${dashboard?.stats?.nextMilestone || 0} to next milestone`}
          color="red"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          label="Lives Impacted"
          value={dashboard?.stats?.livesImpacted || 0}
          subtitle="3 lives per donation"
          color="green"
        />
        <MetricCard
          icon={<Award className="w-6 h-6" />}
          label="Achievement Level"
          value={dashboard?.stats?.achievementLevel || "Bronze"}
          subtitle="Keep donating to level up"
          color="purple"
        />
        <MetricCard
          icon={<Calendar className="w-6 h-6" />}
          label="Next Eligible"
          value={donor?.nextEligibleDate ? new Date(donor.nextEligibleDate).toLocaleDateString() : "Now"}
          subtitle={isEligible ? "Ready to donate" : `${daysUntilEligible} days left`}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donation History Section */}
        <Section
          title="Donation History"
          icon={<Activity className="w-5 h-5" />}
          subtitle="Your blood donation journey"
        >
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(0, 5).map((donation, index) => (
                <DonationHistoryItem key={donation._id || index} donation={donation} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Droplet className="w-8 h-8" />}
              message="No donation history yet"
              actionText="Make your first donation"
              onAction={() => navigate("/donor/camps")}
            />
          )}
        </Section>

        {/* Recent Activity Section */}
        <Section
          title="Recent Activity"
          icon={<Clock className="w-5 h-5" />}
          subtitle="Latest updates and achievements"
        >
          {dashboard?.recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recentActivity.map((activity, index) => (
                <ActivityCard key={activity._id || index} activity={activity} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Activity className="w-8 h-8" />}
              message="No recent activity"
            />
          )}
        </Section>
      </div>

      {/* Quick Actions Section */}
      <Section
        title="Quick Actions"
        icon={<Shield className="w-5 h-5" />}
        subtitle="Manage your donor profile"
        className="mt-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            icon={<Download className="w-5 h-5" />}
            title="Download Certificate"
            description="Get your donation certificate"
            onClick={() => navigate("/donor/certificates")}
            color="blue"
          />
          <ActionCard
            icon={<Share2 className="w-5 h-5" />}
            title="Share Achievement"
            description="Share your impact with others"
            onClick={() => navigate("/donor/certificates")}
            color="green"
          />
          <ActionCard
            icon={<Calendar className="w-5 h-5" />}
            title="Schedule Donation"
            description="Book your next donation"
            onClick={() => navigate("/donor/camps")}
            color="red"
          />
          <ActionCard
            icon={<Users className="w-5 h-5" />}
            title="Invite Friends"
            description="Grow the donor community"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin);
              toast.success("LifeDrop registration link copied! Share it with your friends.");
            }}
            color="purple"
          />
        </div>
      </Section>

      {/* Health Stats Section */}
      {donor && (
        <Section
          title="Health Overview"
          icon={<Heart className="w-5 h-5" />}
          subtitle="Your health metrics"
          className="mt-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HealthStat
              label="Age"
              value={donor.age || "N/A"}
              icon={<User className="w-4 h-4" />}
            />
            <HealthStat
              label="Weight"
              value={donor.weight ? `${donor.weight} kg` : "N/A"}
              icon={<Activity className="w-4 h-4" />}
            />
            <HealthStat
              label="Last Donation"
              value={donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "Never"}
              icon={<Calendar className="w-4 h-4" />}
            />
            <HealthStat
              label="Donor Since"
              value={donor.createdAt ? new Date(donor.createdAt).getFullYear() : new Date().getFullYear()}
              icon={<Award className="w-4 h-4" />}
            />
          </div>
        </Section>
      )}
    </div>
  );
};

// Reusable Components (same as your blood lab dashboard)
const MetricCard = ({ icon, label, value, subtitle, color, alert = false }) => {
  const colorClasses = {
    blue: { border: "border-l-blue-400", bg: "bg-blue-100", text: "text-blue-600" },
    green: { border: "border-l-green-400", bg: "bg-green-100", text: "text-green-600" },
    red: { border: "border-l-red-400", bg: "bg-red-100", text: "text-red-600" },
    purple: { border: "border-l-purple-400", bg: "bg-purple-100", text: "text-purple-600" },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-white rounded-xl shadow-lg border-l-4 ${alert ? "border-l-red-400" : colors.border} p-5 relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className={`text-xs ${alert ? "text-red-600" : "text-gray-500"} mt-1`}>{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${alert ? "bg-red-100 text-red-600" : `${colors.bg} ${colors.text}`}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, subtitle, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-red-50 p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {icon} {title}
        </h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const LabInfo = ({ icon, label, value, truncate = false }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-red-100 rounded-lg text-red-600 mt-1">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`font-medium text-gray-800 ${truncate ? "truncate" : ""}`}>
        {value || "—"}
      </p>
    </div>
  </div>
);

const DonationHistoryItem = ({ donation }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-red-100 rounded-lg text-red-600">
        <Droplet className="w-4 h-4" />
      </div>
      <div>
        <p className="font-medium text-gray-800">{donation.Facility || "Blood Donation Camp"}</p>
        <p className="text-xs text-gray-500">
          {new Date(donation.donationDate || donation.date).toLocaleDateString()} • {donation.bloodType || donation.bloodGroup}
        </p>
      </div>
    </div>
    <div className="text-right">
      <span className="font-bold text-gray-800">{donation.quantity || 1} unit</span>
      <p className="text-xs text-green-600 mt-1">Completed</p>
    </div>
  </div>
);

const ActivityCard = ({ activity }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex-1">
      <h4 className="font-medium text-gray-800 mb-1">
        {activity.Facility || activity.eventType || "Blood Donation"}
      </h4>
      <p className="text-sm text-gray-600">
        {activity.Facility 
          ? `Donated ${activity.quantity || 1} unit(s) at ${activity.Facility}`
          : (activity.description || "Blood donation completed")}
      </p>
    </div>
    <div className="text-right">
      <span className="text-xs text-gray-500">
        {new Date(activity.donationDate || activity.date || activity.createdAt).toLocaleDateString()}
      </span>
    </div>
  </div>
);

const ActionCard = ({ icon, title, description, onClick, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
    green: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200",
    red: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200",
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-colors ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-white rounded-lg">{icon}</div>
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm opacity-75">{description}</p>
    </button>
  );
};

const HealthStat = ({ label, value, icon }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
    <div className="p-2 bg-red-100 rounded-lg text-red-600">
      {icon}
    </div>
  </div>
);

const EmptyState = ({ icon, message, actionText, onAction }) => (
  <div className="text-center py-8 text-gray-500">
    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
      {icon}
    </div>
    <p className="text-sm mb-3">{message}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export default DonorDashboard;