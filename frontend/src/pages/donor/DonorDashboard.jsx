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
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import DonorBadges from "../../components/donor/DonorBadges";
import DonationCountdownWidget from "../../components/donor/DonationCountdownWidget";

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
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const [profileRes, historyRes, statsRes] = await Promise.all([
        donorApi.getProfile(),
        donorApi.getHistory(),
        donorApi.getStats().catch(() => ({ data: {} })),
      ]);

      const profilePayload = profileRes.data.data || profileRes.data;
      const donorData = profilePayload.profile || profilePayload.donor || profilePayload;
      setDonor(donorData);

      let historyData = [];
      if (historyRes.data.history) {
        historyData = historyRes.data.history;
      } else if (historyRes.data.donations) {
        historyData = historyRes.data.donations;
      } else if (Array.isArray(historyRes.data)) {
        historyData = historyRes.data;
      }

      historyData = historyData.map((item) => ({
        ...item,
        Facility: item.facility?.name || item.Facility || "Blood Donation Center",
        city: item.facility?.address?.city || item.city || "Unknown City",
        state: item.facility?.address?.state || item.state || "",
      }));

      setHistory(historyData);

      const totalDonations = historyData.length;
      const livesImpacted = totalDonations * 3;
      const achievementLevel =
        totalDonations >= 10 ? "Gold" : totalDonations >= 5 ? "Silver" : "Bronze";
      const nextMilestone = totalDonations < 5 ? 5 : totalDonations < 10 ? 10 : 15;
      const completionRate = Math.min(100, (totalDonations / nextMilestone) * 100);

      setDashboard({
        stats: {
          totalDonations,
          livesImpacted,
          achievementLevel,
          nextMilestone,
          completionRate,
          ...statsRes.data,
        },
        recentActivity: historyData.slice(0, 5),
      });
    } catch (error) {
      console.error("🚨 Donor Dashboard Error:", error);
      const message =
        error.response?.data?.message || "Failed to load donor dashboard data";
      toast.error(message);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success("Dashboard data updated!");
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 animate-bounce">
            <Heart className="w-8 h-8 fill-red-500" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-600 animate-ping" />
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-1">
          Loading Donor Dashboard
        </h2>
        <p className="text-slate-400 text-sm font-medium">Fetching your lifesaving stats & history...</p>
      </div>
    );
  }

  const isEligible = donor?.eligibleToDonate || false;
  const nextDonationDate = donor?.nextEligibleDate
    ? new Date(donor.nextEligibleDate)
    : null;
  const daysUntilEligible = nextDonationDate
    ? Math.max(0, Math.ceil((nextDonationDate - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-8 font-sans text-slate-800">
      
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-rose-700 to-red-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-600/40">
        {/* SVG Overlay Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-extrabold text-red-100 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-red-300" />
              <span>Lifesaver Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-red-200 via-rose-200 to-white bg-clip-text text-transparent">
                {donor?.user?.name || donor?.name || "Hero"}
              </span>
            </h1>
            <p className="text-red-100/90 text-sm sm:text-base font-medium max-w-xl">
              Track your blood donation impact, view milestone certificates, and find upcoming donation camps.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/25 rounded-2xl text-white font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Updating..." : "Refresh Data"}</span>
            </button>
            <button
              onClick={() => navigate("/camps")}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4 text-red-600" />
              <span>Find Camps</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Status Callout Banner */}
      {isEligible ? (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                  Eligible Now
                </span>
                <span className="text-xs text-emerald-700 font-extrabold">Ready to Save Lives</span>
              </div>
              <h3 className="text-base font-black text-emerald-950 mt-1">
                You are currently eligible to donate blood!
              </h3>
              <p className="text-xs text-emerald-700/90 font-medium">
                Your last donation period has completed. Register for a camp near you today.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/camps")}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <span>Book Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border border-amber-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white">
                  Recovery Period
                </span>
                <span className="text-xs text-amber-700 font-extrabold">
                  {daysUntilEligible > 0 ? `${daysUntilEligible} Days Remaining` : "Checking Eligibility"}
                </span>
              </div>
              <h3 className="text-base font-black text-amber-950 mt-1">
                Next Donation Available on {nextDonationDate ? nextDonationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Soon"}
              </h3>
              <p className="text-xs text-amber-700/90 font-medium">
                Your body is producing fresh red blood cells. Thank you for your commitment!
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/donor/certificates")}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <span>View Certificates</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Donation Countdown & Health Vitals Tracker */}
      <DonationCountdownWidget 
        lastDonationDate={donor?.lastDonationDate || "2026-06-01"} 
        gender={donor?.gender || "Male"} 
      />

      {/* Donor Achievement Badges */}
      <DonorBadges 
        donationCount={history.length || 3} 
        bloodGroup={donor?.bloodGroup || "O+"} 
      />
      {donor && (
        <div className="bg-white rounded-3xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-6 border-b border-slate-100">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-red-600/20 ring-4 ring-red-50">
                {(donor.user?.name || donor.name || "D").charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-850 tracking-tight">
                    {donor.user?.name || donor.name || "Blood Donor"}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">
                    Registered Lifesaver • ID: LD-{donor._id?.substring(0, 8).toUpperCase() || "DONOR"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                    isEligible
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isEligible ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    {isEligible ? "Eligible" : "In Recovery"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-red-50 text-red-600 border border-red-200">
                    Blood Group: {donor.bloodGroup || "O+"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Details Grid */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</span>
                <span className="block text-xs font-extrabold text-slate-700 truncate" title={donor.email}>
                  {donor.email || donor.user?.email || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone Number</span>
                <span className="block text-xs font-extrabold text-slate-700 truncate">
                  {donor.phone || donor.user?.phone || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                <Droplet className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Blood Type</span>
                <span className="block text-xs font-black text-red-600">
                  {donor.bloodGroup || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Primary Location</span>
                <span className="block text-xs font-extrabold text-slate-700 truncate" title={`${donor.address?.city || 'N/A'}, ${donor.address?.state || ''}`}>
                  {donor.address?.city ? `${donor.address.city}, ${donor.address.state || ""}` : "Ahmedabad, Gujarat"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          icon={<Droplet className="w-6 h-6" />}
          label="Total Donations"
          value={dashboard?.stats?.totalDonations || 0}
          subtitle={`${dashboard?.stats?.nextMilestone || 5 - (dashboard?.stats?.totalDonations || 0)} to next badge`}
          color="red"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          label="Lives Saved & Impacted"
          value={dashboard?.stats?.livesImpacted || 0}
          subtitle="Approx 3 lives per donation"
          color="emerald"
        />
        <MetricCard
          icon={<Award className="w-6 h-6" />}
          label="Donor Badge Rank"
          value={dashboard?.stats?.achievementLevel || "Bronze"}
          subtitle="Active Hero Tier"
          color="purple"
        />
        <MetricCard
          icon={<Calendar className="w-6 h-6" />}
          label="Next Eligible Date"
          value={donor?.nextEligibleDate ? new Date(donor.nextEligibleDate).toLocaleDateString() : "Available Now"}
          subtitle={isEligible ? "Ready to donate" : `${daysUntilEligible} days left`}
          color="blue"
        />
      </div>

      {/* History & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donation History Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-850 tracking-tight">Donation History</h3>
                <p className="text-xs text-slate-400 font-medium">Your verified past blood donations</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/donor/history")}
              className="text-xs font-black text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(0, 4).map((donation, index) => (
                <div
                  key={donation._id || index}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-red-50/40 border border-slate-200/60 hover:border-red-200/80 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black flex-shrink-0">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-850 truncate">
                        {donation.Facility || "Blood Donation Center"}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                        {new Date(donation.donationDate || donation.date).toLocaleDateString()} • {donation.city || "Gujarat"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                      1 Unit (450ml)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <Droplet className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-slate-600">No donation history recorded yet</p>
              <button
                onClick={() => navigate("/camps")}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer hover:scale-105"
              >
                Find Camps Near You
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-850 tracking-tight">Recent Activity</h3>
                <p className="text-xs text-slate-400 font-medium">Updates and profile milestones</p>
              </div>
            </div>
          </div>

          {dashboard?.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recentActivity.map((activity, index) => (
                <div
                  key={activity._id || index}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-850 truncate">
                      {activity.Facility || activity.eventType || "Blood Donation Complete"}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                      {activity.Facility
                        ? `Donated 1 unit of ${activity.bloodType || 'blood'} at ${activity.Facility}`
                        : activity.description || "Donation status updated successfully"}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">
                    {new Date(activity.donationDate || activity.date || activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500">No recent activity updates</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-850 tracking-tight">Quick Actions</h3>
            <p className="text-xs text-slate-400 font-medium">Access your certificates, certificates, or book donation camps</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            icon={<Download className="w-5 h-5 text-blue-600" />}
            title="Download Certificate"
            description="Verified donation certificates"
            onClick={() => navigate("/donor/certificates")}
            bg="bg-blue-50/80 hover:bg-blue-100/70 border-blue-200/80"
          />
          <ActionCard
            icon={<Share2 className="w-5 h-5 text-emerald-600" />}
            title="Share Impact"
            description="Share your lifesaving badge"
            onClick={() => navigate("/donor/certificates")}
            bg="bg-emerald-50/80 hover:bg-emerald-100/70 border-emerald-200/80"
          />
          <ActionCard
            icon={<Calendar className="w-5 h-5 text-red-600" />}
            title="Schedule Donation"
            description="Book nearby donation camps"
            onClick={() => navigate("/camps")}
            bg="bg-red-50/80 hover:bg-red-100/70 border-red-200/80"
          />
          <ActionCard
            icon={<Users className="w-5 h-5 text-purple-600" />}
            title="Invite Friends"
            description="Copy LifeDrop referral link"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin);
              toast.success("LifeDrop registration link copied to clipboard!");
            }}
            bg="bg-purple-50/80 hover:bg-purple-100/70 border-purple-200/80"
          />
        </div>
      </div>

    </div>
  );
};

// Reusable MetricCard Component
const MetricCard = ({ icon, label, value, subtitle, color }) => {
  const colorSchemes = {
    red: {
      bg: "bg-red-50 text-red-600",
      accent: "from-red-600 to-rose-600",
      badge: "bg-red-100 text-red-700",
    },
    emerald: {
      bg: "bg-emerald-50 text-emerald-600",
      accent: "from-emerald-600 to-teal-600",
      badge: "bg-emerald-100 text-emerald-700",
    },
    purple: {
      bg: "bg-purple-50 text-purple-600",
      accent: "from-purple-600 to-indigo-600",
      badge: "bg-purple-100 text-purple-700",
    },
    blue: {
      bg: "bg-blue-50 text-blue-600",
      accent: "from-blue-600 to-sky-600",
      badge: "bg-blue-100 text-blue-700",
    },
  };

  const theme = colorSchemes[color] || colorSchemes.red;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div className={`w-1.5 h-full absolute left-0 top-0 bg-gradient-to-b ${theme.accent}`} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2.5 rounded-2xl ${theme.bg} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-850 tracking-tight">{value}</h3>
        <p className="text-[11px] font-bold text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
};

// Reusable ActionCard Component
const ActionCard = ({ icon, title, description, onClick, bg }) => (
  <button
    onClick={onClick}
    className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer hover:scale-[1.02] ${bg} shadow-2xs space-y-2`}
  >
    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xs">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-black text-slate-850">{title}</h4>
      <p className="text-xs text-slate-500 font-medium mt-0.5">{description}</p>
    </div>
  </button>
);

export default DonorDashboard;