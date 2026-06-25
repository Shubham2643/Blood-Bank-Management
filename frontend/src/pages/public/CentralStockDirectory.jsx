import { useState, useEffect } from "react";
import { publicApi } from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Droplet,
  Activity,
  Heart,
  AlertCircle,
  Building,
  RefreshCw,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const COMPONENTS = [
  { value: "all", label: "All Components" },
  { value: "Whole Blood", label: "Whole Blood" },
  { value: "Packed Red Blood Cells", label: "Packed Red Cells (PRBC)" },
  { value: "Platelets", label: "Platelets" },
  { value: "Fresh Frozen Plasma", label: "Plasma (FFP)" },
];

const CentralStockDirectory = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    bloodGroup: "all",
    componentType: "all",
    city: "",
    state: "",
    pincode: "",
  });

  const fetchStock = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.bloodGroup !== "all") params.bloodGroup = filters.bloodGroup;
      if (filters.componentType !== "all") params.componentType = filters.componentType;
      if (filters.city) params.city = filters.city;
      if (filters.state) params.state = filters.state;
      if (filters.pincode) params.pincode = filters.pincode;

      const res = await publicApi.getCentralStock(params);
      setStock(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch central stock directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialStock = async () => {
      setLoading(true);
      try {
        const res = await publicApi.getCentralStock({});
        setStock(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch central stock directory.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialStock();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStock();
  };

  const clearFilters = () => {
    setFilters({
      bloodGroup: "all",
      componentType: "all",
      city: "",
      state: "",
      pincode: "",
    });
    // Need to trigger fetch after state updates, easiest is directly calling fetch with empty params
    setTimeout(() => {
      fetchStock();
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow mt-16 sm:mt-20">
        {/* Banner Section */}
        <div className="relative bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white overflow-hidden py-16 mb-10">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-128 h-128 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-red-100 text-sm font-semibold mb-3 backdrop-blur-sm">
              <Activity className="w-4 h-4 animate-pulse text-white" /> Live Central Registry
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl drop-shadow-sm">
              LifeDrop Live Stock Directory
            </h1>
            <p className="mt-3 text-lg text-red-100 max-w-2xl mx-auto font-medium leading-relaxed">
              Search live blood component availability across all approved blood labs, centers, and hospitals in real-time.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          {/* Filter Section Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Location inputs */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">State</label>
                <input
                  type="text"
                  placeholder="e.g. Gujarat"
                  value={filters.state}
                  onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-slate-700 bg-slate-50/50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">City</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad"
                  value={filters.city}
                  onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-slate-700 bg-slate-50/50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 382418"
                  value={filters.pincode}
                  onChange={(e) => setFilters((p) => ({ ...p, pincode: e.target.value }))}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-slate-700 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Blood Type Grid selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Blood Group</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, bloodGroup: "all" }))}
                  className={`px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                    filters.bloodGroup === "all"
                      ? "border-red-500 bg-red-50 text-red-700 scale-105"
                      : "border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50/50"
                  }`}
                >
                  All Types
                </button>
                {BLOOD_GROUPS.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, bloodGroup: group }))}
                    className={`px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                      filters.bloodGroup === group
                        ? "border-red-500 bg-red-50 text-red-700 scale-105"
                        : "border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50/50"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Component select */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Component Type</label>
                <select
                  value={filters.componentType}
                  onChange={(e) => setFilters((p) => ({ ...p, componentType: e.target.value }))}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-slate-700 bg-white"
                >
                  {COMPONENTS.map((comp) => (
                    <option key={comp.value} value={comp.value}>
                      {comp.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-2xl transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  Search Stock Availability
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-2xl transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Directory */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-slate-800">
              Matches Found ({stock.length})
            </h2>
            <button
              onClick={fetchStock}
              className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-all flex items-center gap-1.5 text-sm"
              title="Refresh results"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Sync
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Fetching real-time inventory directory...</p>
            </div>
          ) : stock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
              <AlertCircle className="w-14 h-14 text-amber-500 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-slate-800">No Blood Stock Available</h3>
              <p className="text-slate-500 max-w-md mt-2">
                No matching safe stock units were found in this area. Try modifying your search filter or request urgent blood from nearby donors.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stock.map((item) => {
                const facility = item.bloodLab || item.hospital;
                const isLab = facility?.facilityType === "blood-lab";

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Visual side band */}
                    <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-red-600"></div>

                    <div className="pl-4">
                      {/* Top Row: Group and Component */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-100 text-red-600 text-2xl font-black">
                              {item.bloodGroup}
                            </span>
                            <div>
                              <h3 className="text-lg font-bold text-slate-800">
                                {item.componentType}
                              </h3>
                              <p className="text-xs text-slate-400">Bag ID: {item.bagId}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-red-600">{item.quantity}</span>
                          <span className="text-xs text-slate-400 block">Units Available</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <hr className="border-slate-100 my-4" />

                      {/* Facility details */}
                      <div className="space-y-2.5 text-sm text-slate-600">
                        <p className="font-semibold text-slate-800 flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          {facility?.name}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isLab ? "bg-green-50 text-green-700 border border-green-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {isLab ? "Blood Lab" : "Hospital"}
                          </span>
                        </p>
                        {facility?.address && (
                          <p className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>
                              {facility.address.street}, {facility.address.city}, {facility.address.state} – {facility.address.pincode}
                            </span>
                          </p>
                        )}
                        {facility?.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{facility.phone}</span>
                          </p>
                        )}
                        {facility?.operatingHours?.open && (
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Hours: {facility.operatingHours.open} – {facility.operatingHours.close}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pl-4 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                        Certified Safe Stock
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>

      <Footer />
    </div>
  );
};

export default CentralStockDirectory;
