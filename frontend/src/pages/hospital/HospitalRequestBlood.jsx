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
  Info,
  ClipboardList
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
        
        {/* Signature Crimson-Rose Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 p-6 sm:p-8 text-white shadow-xl shadow-red-900/20 border border-red-500/30">
          {/* Geometric Vector Rings Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-center sm:items-end text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-red-600 font-black flex items-center justify-center shadow-2xl ring-4 ring-white/20 flex-shrink-0">
              <Droplet className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 fill-red-600 animate-bounce" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                Request Blood Components
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-red-100/90 mt-1">
                Submit emergency or routine blood supply requests directly to verified partnered laboratories.
              </p>
            </div>
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
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/20 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  Request Specification
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Specify target laboratory, required blood components, and urgency level.
                </p>
              </div>
            </div>

            <form onSubmit={submitRequest} className="space-y-6">
              
              {/* Select Lab Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Select Target Blood Lab <span className="text-red-500">*</span>
                </label>
                {labsLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 py-3.5 font-semibold text-xs bg-slate-50 rounded-2xl px-4 border border-slate-200/80">
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    <span>Loading registered laboratories…</span>
                  </div>
                ) : labs.length === 0 ? (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200/80 rounded-2xl p-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-extrabold text-amber-900">No Laboratories Found</p>
                      <p className="text-xs text-amber-700 mt-0.5 font-semibold leading-relaxed">
                        No blood labs are currently registered or approved in the system directory. Please contact administration.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={form.labId}
                      onChange={(e) => handleChange("labId", e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-slate-850 text-sm font-extrabold cursor-pointer appearance-none pr-10"
                      required
                    >
                      <option value="">-- Click to choose a laboratory --</option>
                      {labs.map((lab) => (
                        <option key={lab._id} value={lab._id}>
                          {lab.name} {lab.address?.city ? ` (${lab.address.city})` : ""}
                        </option>
                      ))}
                    </select>
                    <Building2 className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Lab Info Banner when Selected */}
              {selectedLab && (
                <div className="bg-gradient-to-br from-red-50/50 to-rose-50/30 border border-red-200/80 rounded-2xl p-4 text-xs font-semibold space-y-2.5 animate-in slide-in-from-top-2 duration-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-slate-850 text-sm">{selectedLab.name}</p>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Selected Lab</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-600 font-bold pt-1 border-t border-red-100">
                    {selectedLab.address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{selectedLab.address.street}, {selectedLab.address.city}</span>
                      </div>
                    )}
                    {selectedLab.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{selectedLab.phone}</span>
                      </div>
                    )}
                    {selectedLab.operatingHours?.open && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{selectedLab.operatingHours.open} – {selectedLab.operatingHours.close}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Blood Type Grid Selector */}
              <div className="space-y-2.5">
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Required Blood Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {BLOOD_TYPES.map((type) => {
                    const isSelected = form.bloodType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleChange("bloodType", type)}
                        className={`py-3.5 rounded-2xl border font-black text-sm transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "border-red-500 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/25 scale-[1.03]"
                            : "border-slate-200/80 text-slate-700 bg-slate-50/70 hover:border-red-300 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
                {!form.bloodType && (
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                    <Info size={11} className="text-slate-400" /> Select a compatible blood type from the options above
                  </p>
                )}
              </div>

              {/* Units and Urgency Segment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Units Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-sm font-bold text-slate-850 h-12"
                    value={form.units}
                    min="1"
                    max="100"
                    onChange={(e) => handleChange("units", e.target.value)}
                    placeholder="1 – 100"
                    required
                  />
                  <p className="text-[10px] text-slate-400 font-extrabold">Standard hospital ordering: 1 to 100 units</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Urgency Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {URGENCY_OPTIONS.map((opt) => {
                      const isActive = form.urgency === opt.value;
                      let activeClass = "";
                      if (opt.value === "normal") activeClass = isActive ? "border-emerald-500 bg-emerald-100 text-emerald-900 font-black shadow-md shadow-emerald-600/10" : "hover:border-slate-300 hover:bg-white";
                      if (opt.value === "urgent") activeClass = isActive ? "border-amber-500 bg-amber-100 text-amber-900 font-black shadow-md shadow-amber-600/10" : "hover:border-slate-300 hover:bg-white";
                      if (opt.value === "emergency") activeClass = isActive ? "border-red-500 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-lg shadow-red-600/25 animate-pulse" : "hover:border-slate-300 hover:bg-white";

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange("urgency", opt.value)}
                          className={`rounded-2xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-slate-200/80 text-slate-700 bg-slate-50/70 h-12 ${activeClass}`}
                        >
                          <span className="relative flex h-2 w-2">
                            {opt.value === "emergency" && isActive && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                            )}
                            {opt.value === "urgent" && isActive && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${
                              opt.value === "normal" ? (isActive ? "bg-emerald-600" : "bg-emerald-500") : opt.value === "urgent" ? (isActive ? "bg-amber-600" : "bg-amber-500") : (isActive ? "bg-white" : "bg-red-500")
                            }`}></span>
                          </span>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 font-extrabold">Dispatches alerts if emergency selected</p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Additional Notes (optional)
                </label>
                <div className="relative">
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={3}
                    placeholder="Provide specific notes (e.g., scheduled surgery timeline, component splits needed, special donor constraints)..."
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all resize-none text-xs font-semibold leading-relaxed text-slate-850"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Emergency Warning Card */}
              {(form.urgency === "urgent" || form.urgency === "emergency") && (
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3.5 text-xs animate-in fade-in duration-200 shadow-2xs">
                  <div className="p-2 bg-rose-600 text-white rounded-xl animate-pulse shrink-0 shadow-sm">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <p className="font-black text-red-950 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                      🚨 Geofenced Donor Dispatch Alert Active
                    </p>
                    <p className="mt-1 leading-relaxed text-red-800 font-semibold">
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
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/35 border border-red-500/30 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Dispatching Blood Request…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Blood Request</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Labs Directory Column (col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-8 shadow-xl shadow-slate-100 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-100/20 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <Building2 className="w-5 h-5" />
                  </div>
                  Verified Blood Labs ({labs.length})
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Click a lab to preselect for your order.
                </p>
              </div>
            </div>

            {labsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">Syncing laboratories directory...</p>
              </div>
            ) : labs.length === 0 ? (
              <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider text-center py-12">No active blood labs connected.</p>
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
                          ? "border-red-400 bg-gradient-to-br from-red-50/50 to-rose-50/30 shadow-md shadow-red-500/10"
                          : "border-slate-150 bg-slate-50/40 hover:bg-white hover:border-red-200 hover:shadow-md"
                      }`}
                    >
                      {/* Decorative colored strip for selected card */}
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 to-rose-600" />}

                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-2xl border shrink-0 transition-all ${
                            isSelected 
                              ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/20" 
                              : "bg-white border-slate-200 text-slate-500 group-hover:text-red-600 group-hover:border-red-200"
                          }`}>
                            <Building2 size={16} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-850 tracking-tight">{lab.name}</h4>
                            {lab.address && (
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">{lab.address.city}, {lab.address.state}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? "text-red-600 translate-x-0.5" : "text-slate-300 group-hover:text-red-500 group-hover:translate-x-0.5"
                        }`} />
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-3">
                        {lab.address && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-red-500" />
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