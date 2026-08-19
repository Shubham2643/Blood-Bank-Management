import { useState, useEffect, useCallback } from "react";
import { bloodLabApi } from "../../services/api.js";
import { toast } from "react-hot-toast";
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  Droplet, 
  Calendar,
  CheckCircle,
  XCircle,
  History,
  Filter,
  Plus,
  Clock,
  Zap,
  Heart
} from "lucide-react";

const BloodLabDonor = () => {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationData, setDonationData] = useState({
    quantity: 1,
    remarks: "",
    bloodGroup: ""
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    total: 0
  });

  // Search donors
  const searchDonors = useCallback(async (searchTerm = term, isInitial = false) => {
    const actualTerm = typeof searchTerm === "string" ? searchTerm : term;

    if (!isInitial && !actualTerm.trim()) {
      toast.error("Please enter search term");
      return;
    }

    setLoading(true);
    try {
      const res = await bloodLabApi.searchDonors(actualTerm);

      setResults(res.data.donors || []);
      if (!isInitial && res.data.donors.length === 0) {
        toast.error("No donors found");
      }
    } catch (err) {
      console.error("Search error:", err);
      if (!isInitial) {
        toast.error("Search failed");
      }
    } finally {
      setLoading(false);
    }
  }, [term]);

  // Load recent donations and stats
  const loadRecentDonations = useCallback(async () => {
    try {
      const res = await bloodLabApi.getRecentDonations();
      setRecentDonations(res.data.donations || []);
      setStats(res.data.stats || { today: 0, thisWeek: 0, total: 0 });
    } catch (err) {
      console.error("Failed to load recent donations:", err);
    }
  }, []);

  useEffect(() => {
    loadRecentDonations();
    searchDonors("", true);
  }, [loadRecentDonations, searchDonors]);

  // Open donation form
  const openDonationForm = (donor) => {
    setSelectedDonor(donor);
    setDonationData({
      quantity: 1,
      remarks: "",
      bloodGroup: donor.bloodGroup
    });
    setShowDonationForm(true);
  };

  // Mark donation
  const markDonation = async () => {
    if (!selectedDonor) return;

    try {
      await bloodLabApi.markDonation(selectedDonor._id, donationData);

      toast.success("Donation recorded successfully!");
      setShowDonationForm(false);
      setSelectedDonor(null);
      searchDonors(); // Refresh search results
      loadRecentDonations(); // Refresh recent donations
    } catch (err) {
      console.error("Donation error:", err);
      toast.error(err.response?.data?.message || "Failed to record donation");
    }
  };

  // Quick donation (1 unit, no remarks)
  const quickDonation = async (donorId) => {
    try {
      await bloodLabApi.markDonation(donorId, {
        quantity: 1,
        remarks: "Quick donation",
      });

      toast.success("Donation recorded!");
      searchDonors();
      loadRecentDonations();
    } catch (err) {
      console.error("Donation error:", err);
      toast.error("Failed to record donation");
    }
  };

  const canDonate = (lastDonationDate) => {
    if (!lastDonationDate) return true;
    const lastDonation = new Date(lastDonationDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastDonation < threeMonthsAgo;
  };

  const getTimeSinceLastDonation = (lastDonationDate) => {
    if (!lastDonationDate) return "Never donated";
    
    const lastDonation = new Date(lastDonationDate);
    const now = new Date();
    const diffTime = Math.abs(now - lastDonation);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Signature Crimson-Rose Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 p-6 sm:p-8 text-white shadow-xl shadow-red-900/20 border border-red-500/30 mb-8">
          {/* Geometric Vector Rings Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-center sm:items-end text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-red-600 font-black flex items-center justify-center shadow-2xl ring-4 ring-white/20 flex-shrink-0">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                Donor Management
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-red-100/90 mt-1">
                Search, verify eligibility, and record walk-in or appointment blood donations in real-time.
              </p>
            </div>
          </div>
        </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100 border border-slate-100 border-l-4 border-l-red-500 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Donations Today</p>
                  <p className="text-3xl font-black text-slate-850">{stats.today}</p>
                </div>
                <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl shadow-sm">
                  <Droplet className="w-6 h-6 fill-red-600 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100 border border-slate-100 border-l-4 border-l-rose-500 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">This Week</p>
                  <p className="text-3xl font-black text-slate-850">{stats.thisWeek}</p>
                </div>
                <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100 border border-slate-100 border-l-4 border-l-emerald-500 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Total Lifetime Donations</p>
                  <p className="text-3xl font-black text-slate-850">{stats.total}</p>
                </div>
                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                  <History className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100/90 p-6 sm:p-8 mb-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                      <Search className="w-5 h-5" />
                    </div>
                    Donor Verification & Search Directory
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Lookup donors by name, contact, or blood group to record new supply units.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search donor by name, email, phone number..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchDonors()}
                  />
                </div>
                <button
                  onClick={searchDonors}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Search size={16} />
                  )}
                  <span>Search</span>
                </button>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                <span className="text-[10px] font-black uppercase text-slate-400 mr-1 flex-shrink-0">Filter Group:</span>
                {["all", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((group) => (
                  <button
                    key={group}
                    onClick={() => {
                      if (group === "all") {
                        searchDonors("", true);
                      } else {
                        searchDonors(group, false);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer ${
                      term === group || (group === "all" && !term)
                        ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {group === "all" ? "All Donors" : group}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {results.map((donor) => {
                  const eligible = canDonate(donor.lastDonationDate);
                  const donorName = donor.name || donor.fullName || donor.user?.name || donor.userId?.name || "Registered Donor";
                  const donorEmail = donor.email || donor.user?.email || "—";
                  const donorPhone = donor.phone || donor.user?.phone || donor.contact || "—";
                  const bloodGroup = donor.bloodGroup || donor.user?.bloodGroup || "O+";

                  return (
                    <div
                      key={donor._id}
                      className="p-5 rounded-2xl border border-slate-100/90 bg-slate-50/40 hover:bg-white hover:shadow-md hover:border-red-150 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white font-black text-sm flex items-center justify-center shadow-md shadow-red-600/20 ring-2 ring-white flex-shrink-0">
                              {bloodGroup}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-extrabold text-slate-850 text-base tracking-tight truncate leading-tight">
                                {donorName}
                              </h3>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Blood Donor
                              </span>
                            </div>

                            {eligible ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-200/80 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Eligible to Donate
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-200/80 shadow-2xs">
                                <Clock size={12} className="text-amber-600" />
                                Recently Donated
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 font-semibold mt-3 p-3 bg-white/80 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail size={14} className="text-red-500 flex-shrink-0" />
                              <span className="truncate text-slate-700">{donorEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-red-500 flex-shrink-0" />
                              <span className="text-slate-700">{donorPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                              <span>
                                Last: <strong className="text-slate-800">{getTimeSinceLastDonation(donor.lastDonationDate)}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <History size={14} className="text-slate-400 flex-shrink-0" />
                              <span>
                                Lifetime: <strong className="text-slate-800">{donor.donationHistory?.length || 0} donations</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-2.5 w-full sm:w-auto flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {eligible ? (
                            <>
                              <button
                                onClick={() => quickDonation(donor._id)}
                                className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 border border-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                                title="Quick Record 1 Supply Unit"
                              >
                                <Zap size={14} className="fill-emerald-300 text-emerald-300 animate-pulse" />
                                <span>Quick (1 Unit)</span>
                              </button>
                              <button
                                onClick={() => openDonationForm(donor)}
                                className="flex-1 sm:flex-initial bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/35 border border-red-500/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                              >
                                <Heart size={14} className="fill-white text-white animate-bounce" />
                                <span>Record Donation</span>
                              </button>
                            </>
                          ) : (
                            <div className="w-full sm:w-auto bg-slate-100 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-2xl border border-slate-200/80 cursor-not-allowed flex items-center justify-center gap-1.5 opacity-85 shadow-2xs">
                              <Clock size={13} className="text-amber-500 flex-shrink-0" />
                              <span>In Cooling Period</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {results.length === 0 && !loading && (
                  <div className="text-center py-12 text-slate-400">
                    <User size={48} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-extrabold text-slate-600">No Donors Found</p>
                    <p className="text-xs text-slate-400 mt-1">Try refining your search terms or register a new donor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Donations Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100/90 p-6 sm:p-7">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                      <History className="w-5 h-5" />
                    </div>
                    Recent Donations Log
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Latest logged blood donations.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {recentDonations.map((donation, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-extrabold text-slate-850 text-sm truncate">
                        {donation.donorName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs">
                        {donation.bloodGroup}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      <div className="flex justify-between items-center text-slate-600 font-bold">
                        <span>
                          {donation.quantity} unit{donation.quantity > 1 ? "s" : ""}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(donation.date).toLocaleDateString()}
                        </span>
                      </div>
                      {donation.remarks && (
                        <p className="text-[11px] text-slate-400 italic mt-1.5 pt-1.5 border-t border-slate-100">
                          "{donation.remarks}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {recentDonations.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <History size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">No recent donations logged</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Donation Modal */}
        {showDonationForm && selectedDonor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Record Donation
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Donor
                  </label>
                  <p className="font-semibold text-gray-800">
                    {selectedDonor.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedDonor.email} | {selectedDonor.phone}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={donationData.bloodGroup}
                    onChange={(e) =>
                      setDonationData({
                        ...donationData,
                        bloodGroup: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="2"
                    value={donationData.quantity}
                    onChange={(e) =>
                      setDonationData({
                        ...donationData,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={donationData.remarks}
                    onChange={(e) =>
                      setDonationData({
                        ...donationData,
                        remarks: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={markDonation}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                >
                  Confirm Donation
                </button>
                <button
                  onClick={() => setShowDonationForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodLabDonor;