import { useEffect, useState } from "react";
import { facilityApi, hospitalApi } from "../../services/api.js";
import { toast } from "react-hot-toast";
import {
  Droplet,
  MapPin,
  Phone,
  Clock,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Building2,
  ChevronRight,
  Info
} from "lucide-react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const URGENCY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "urgent", label: "Urgent" },
  { value: "emergency", label: "Emergency" },
];

const HospitalRequestBlood = () => {
  const [labs, setLabs] = useState([]);
  const [form, setForm] = useState({
    labId: "",
    bloodType: "",
    units: "",
    urgency: "normal",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [labsLoading, setLabsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadLabs = async () => {
      try {
        setLabsLoading(true);
        const res = await facilityApi.getLabs();
        const labsData = res.data.data?.labs || res.data.labs || [];
        setLabs(labsData);
      } catch (err) {
        console.error("Load labs error:", err);
        toast.error("Failed to load blood labs. Please refresh.");
      } finally {
        setLabsLoading(false);
      }
    };
    loadLabs();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!form.labId || !form.bloodType || !form.units) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await hospitalApi.createRequest({
        labId: form.labId,
        bloodType: form.bloodType,
        units: Number(form.units),
        urgency: form.urgency,
        notes: form.notes,
      });
      const alertInfo = res.data?.geofencedAlerts;
      if (alertInfo && alertInfo.donorCount > 0) {
        toast.success(`✅ Blood request sent! 🚨 Dispatched geofenced SMS and push alerts to ${alertInfo.donorCount} compatible donors within 10km!`);
      } else {
        toast.success("✅ Blood request sent successfully! The lab has been notified.");
      }
      setSubmitted(true);
      setForm({ labId: "", bloodType: "", units: "", urgency: "normal", notes: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Submit request error:", err);
      const msg = err.response?.data?.message || "Failed to send request. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedLab = labs.find((l) => l._id === form.labId);

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-tr from-red-500 to-rose-600 rounded-xl text-white shadow-md shadow-rose-100 animate-pulse">
                <Droplet className="w-5 h-5" />
              </div>
              Request Blood Components
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-semibold">
              Submit blood supply requests directly to verified partnered laboratories
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {submitted && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden animate-in fade-in duration-200">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 animate-bounce" />
            <div>
              <p className="font-extrabold text-emerald-800 text-sm">Blood Request Dispatched</p>
              <p className="text-xs text-emerald-600 mt-0.5 font-semibold">
                Your request has been successfully registered. The laboratory will review stock availability and reply shortly.
              </p>
            </div>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Column (col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
              <div className="w-1.5 h-4 bg-red-500 rounded-full" />
              Request Specification
            </h2>

            <form onSubmit={submitRequest} className="space-y-6">
              
              {/* Select Lab Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Target Blood Lab <span className="text-red-500">*</span>
                </label>
                {labsLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 py-3 font-semibold text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    <span>Loading registered laboratories…</span>
                  </div>
                ) : labs.length === 0 ? (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-800">No Laboratories Found</p>
                      <p className="text-xs text-amber-600 mt-0.5 font-semibold">
                        No blood labs are currently registered or approved in the system directory. Please contact administration.
                      </p>
                    </div>
                  </div>
                ) : (
                  <select
                    value={form.labId}
                    onChange={(e) => handleChange("labId", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-all bg-white text-slate-700 text-sm font-semibold cursor-pointer appearance-none animate-none"
                    required
                  >
                    <option value="">-- Click to choose a laboratory --</option>
                    {labs.map((lab) => (
                      <option key={lab._id} value={lab._id}>
                        {lab.name} {lab.address?.city ? ` (${lab.address.city})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Lab Info Banner when Selected */}
              {selectedLab && (
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs font-semibold space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <p className="font-extrabold text-slate-800 text-sm">{selectedLab.name}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-500">
                    {selectedLab.address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{selectedLab.address.street}, {selectedLab.address.city}</span>
                      </div>
                    )}
                    {selectedLab.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{selectedLab.phone}</span>
                      </div>
                    )}
                    {selectedLab.operatingHours?.open && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{selectedLab.operatingHours.open} – {selectedLab.operatingHours.close}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Blood Type Grid Selector */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Required Blood Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {BLOOD_TYPES.map((type) => {
                    const isSelected = form.bloodType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleChange("bloodType", type)}
                        className={`py-3 rounded-xl border font-bold text-sm transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "border-red-500 bg-red-50 text-red-600 scale-105 shadow-sm shadow-red-50"
                            : "border-slate-200 text-slate-500 bg-white hover:border-red-200 hover:bg-rose-50/10"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
                {!form.bloodType && (
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Info size={11} /> Select a compatible blood type from the options above
                  </p>
                )}
              </div>

              {/* Units and Urgency Segment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Units Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-colors text-sm font-semibold h-11"
                    value={form.units}
                    min="1"
                    max="100"
                    onChange={(e) => handleChange("units", e.target.value)}
                    placeholder="1 – 100"
                    required
                  />
                  <p className="text-[10px] text-slate-400 font-bold">Standard hospital ordering: 1 to 100 units</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Urgency Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {URGENCY_OPTIONS.map((opt) => {
                      const isActive = form.urgency === opt.value;
                      let activeClass = "";
                      if (opt.value === "normal") activeClass = isActive ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold shadow-sm shadow-emerald-50/50" : "hover:border-slate-300 hover:bg-slate-50";
                      if (opt.value === "urgent") activeClass = isActive ? "border-amber-500 bg-amber-50 text-amber-700 font-extrabold shadow-sm shadow-amber-50/50" : "hover:border-slate-300 hover:bg-slate-50";
                      if (opt.value === "emergency") activeClass = isActive ? "border-red-500 bg-red-50 text-red-700 font-extrabold shadow-sm shadow-red-50/50" : "hover:border-slate-300 hover:bg-slate-50";

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange("urgency", opt.value)}
                          className={`rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-slate-200 text-slate-500 bg-white h-11 ${activeClass}`}
                        >
                          <span className="relative flex h-2 w-2">
                            {opt.value === "emergency" && isActive && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            )}
                            {opt.value === "urgent" && isActive && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${
                              opt.value === "normal" ? "bg-emerald-500" : opt.value === "urgent" ? "bg-amber-500" : "bg-red-500"
                            }`}></span>
                          </span>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">Dispatches alerts if emergency selected</p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Additional Notes (optional)
                </label>
                <div className="relative">
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={3}
                    placeholder="Provide specific notes (e.g., scheduled surgery timeline, component splits needed, special donor constraints)..."
                    className="w-full border border-slate-250 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-colors resize-none text-xs font-semibold leading-relaxed"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Emergency Warning Card */}
              {(form.urgency === "urgent" || form.urgency === "emergency") && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 text-xs animate-in fade-in duration-200">
                  <div className="p-1.5 bg-rose-500 text-white rounded-lg animate-pulse shrink-0">
                    <AlertCircle size={15} />
                  </div>
                  <div>
                    <p className="font-extrabold text-red-900 flex items-center gap-1.5">
                      🚨 Geofenced Donor Dispatch Alert Active
                    </p>
                    <p className="mt-1 leading-relaxed text-red-700 font-semibold">
                      This emergency request will trigger immediate geofenced SMS and push notifications to all compatible, active donors located within a 10km radius of your facility. Use only for real clinical emergencies.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="send-blood-request-btn"
                disabled={loading || labs.length === 0}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-slate-200 disabled:to-slate-200 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-100 hover:shadow-lg active:scale-95 cursor-pointer disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Dispatching Blood Request…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Blood Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Labs Directory Column (col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
              <div className="w-1.5 h-4 bg-rose-500 rounded-full" />
              Verified Blood Labs ({labs.length})
            </h2>

            {labsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-slate-400 text-xs font-semibold">Syncing laboratories directory...</p>
              </div>
            ) : labs.length === 0 ? (
              <p className="text-slate-400 text-xs font-semibold text-center py-12">No active blood labs connected.</p>
            ) : (
              <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                {labs.map((lab) => {
                  const isSelected = form.labId === lab._id;
                  return (
                    <div
                      key={lab._id}
                      onClick={() => handleChange("labId", lab._id)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between gap-3 group relative overflow-hidden ${
                        isSelected
                          ? "border-red-400 bg-red-50/20 shadow-sm"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                      }`}
                    >
                      {/* Decorative colored strip for selected card */}
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}

                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border shrink-0 transition-colors ${
                            isSelected ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-50 border-slate-100 text-slate-400 group-hover:text-red-500 group-hover:bg-red-50/30"
                          }`}>
                            <Building2 size={16} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-800">{lab.name}</h4>
                            {lab.address && (
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{lab.address.city}, {lab.address.state}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? "text-red-500 translate-x-0.5" : "text-slate-300 group-hover:translate-x-0.5"
                        }`} />
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-500 font-bold border-t border-slate-100/60 pt-3">
                        {lab.address && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            <span className="truncate max-w-[150px]">{lab.address.street}</span>
                          </div>
                        )}
                        {lab.operatingHours?.open && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            <span>{lab.operatingHours.open} – {lab.operatingHours.close}</span>
                          </div>
                        )}
                        {lab.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={12} className="text-slate-400" />
                            <span>{lab.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default HospitalRequestBlood;