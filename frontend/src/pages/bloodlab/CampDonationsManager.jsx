import { useState, useEffect } from "react";
import { bloodLabApi } from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Heart,
  Calendar,
  User,
  Activity,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  MapPin,
  FileText,
} from "lucide-react";

const CampDonationsManager = () => {
  const [camps, setCamps] = useState([]);
  const [selectedCampId, setSelectedCampId] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  // Vitals form for active checked-in donor
  const [vitals, setVitals] = useState({
    weight: "",
    bloodPressure: "120/80",
    hemoglobin: "13.5",
    pulse: "72",
    quantity: 1,
  });

  const [activeDonor, setActiveDonor] = useState(null);

  const fetchCamps = async () => {
    setLoading(true);
    try {
      const res = await bloodLabApi.getCamps();
      const activeCamps = (res.data.data?.camps || res.data.camps || []).filter(
        (c) => String(c.status).toLowerCase() !== "completed"
      );
      setCamps(activeCamps);
      if (activeCamps.length > 0) {
        setSelectedCampId(activeCamps[0]._id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blood camps.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (campId) => {
    if (!campId) return;
    setLoadingRegs(true);
    try {
      const res = await bloodLabApi.getCampRegistrations(campId);
      // Filter out donors who already donated during this camp (we check if they are verified)
      setRegistrations(res.data.data || []);
      setActiveDonor(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load camp registrations.");
    } finally {
      setLoadingRegs(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  useEffect(() => {
    if (selectedCampId) {
      fetchRegistrations(selectedCampId);
    }
  }, [selectedCampId]);

  const startVitalsCheck = (donorReg) => {
    setActiveDonor(donorReg);
    setVitals({
      weight: donorReg.donor.weight || "65",
      bloodPressure: "120/80",
      hemoglobin: "13.5",
      pulse: "72",
      quantity: 1,
    });
  };

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    if (!activeDonor) return;

    const donorId = activeDonor.donor._id;
    const w = Number(vitals.weight);
    const hb = Number(vitals.hemoglobin);

    if (w < 45) {
      toast.error("Eligibility Error: Minimum weight required is 45kg.");
      return;
    }
    if (hb < 12.5) {
      toast.error("Eligibility Error: Minimum hemoglobin required is 12.5 g/dL.");
      return;
    }

    setSubmittingId(donorId);
    try {
      await bloodLabApi.recordDonationVitals(selectedCampId, {
        donorId,
        weight: w,
        bloodPressure: vitals.bloodPressure,
        hemoglobin: hb,
        pulse: Number(vitals.pulse),
        quantity: Number(vitals.quantity),
      });

      toast.success(`✅ Donation recorded successfully for ${activeDonor.donor.fullName || activeDonor.donor.user?.name || "Donor"}. Bag added to screening queue.`);
      setActiveDonor(null);
      fetchRegistrations(selectedCampId);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit vitals/record donation.");
    } finally {
      setSubmittingId(null);
    }
  };

  const selectedCamp = camps.find((c) => c._id === selectedCampId);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-red-600" />
          Camp Donations & Donor Vitals Check-in
        </h1>
        <p className="text-sm text-slate-500">
          Check-in registered donors, record clinical vital signs, and log bags for mandatory screening.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading camps...</p>
        </div>
      ) : camps.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Active Camps Found</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            You do not have any active or upcoming camps scheduled. Visit the Camps section to organize a new collection drive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camp Select & Registrations list */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <label className="block text-sm font-bold text-slate-700">Select Blood Camp</label>
              <select
                value={selectedCampId}
                onChange={(e) => setSelectedCampId(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-slate-700 bg-slate-50/50"
              >
                {camps.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} — {new Date(c.date).toLocaleDateString()}
                  </option>
                ))}
              </select>

              {selectedCamp && (
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 text-xs space-y-2 text-slate-600">
                  <div className="font-bold text-red-800 text-sm flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-600" />
                    Camp Info
                  </div>
                  <p className="flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <span>{selectedCamp.location.venue}, {selectedCamp.location.city}</span>
                  </p>
                  <p>Date: {new Date(selectedCamp.date).toLocaleDateString()}</p>
                  <p>
                    Vitals Checked:{" "}
                    <span className="font-bold text-slate-800">
                      {selectedCamp.actualDonors} / {selectedCamp.expectedDonors || selectedCamp.registeredDonors?.length || 0}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Registrations ({registrations.length})</h3>
                <button
                  onClick={() => fetchRegistrations(selectedCampId)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"
                  title="Reload registrations"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {loadingRegs ? (
                <div className="py-10 text-center text-slate-400 text-sm">Loading registrations...</div>
              ) : registrations.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">No donors registered for this camp yet.</div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {registrations.map((reg) => {
                    const donor = reg.donor;
                    const isCheckedIn = activeDonor?.donor?._id === donor._id;
                    const name = donor?.fullName || donor?.user?.name || "Donor";

                    return (
                      <div
                        key={reg._id}
                        onClick={() => startVitalsCheck(reg)}
                        className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all ${
                          isCheckedIn
                            ? "border-red-400 bg-red-50/70 shadow-sm"
                            : "border-slate-100 hover:border-red-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{name}</p>
                            <p className="text-[10px] text-slate-400">
                              Blood Group: <span className="font-bold text-red-600">{donor.bloodGroup}</span>
                            </p>
                          </div>
                        </div>
                        <PlusCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Vitals Form */}
          <div className="lg:col-span-2">
            {!activeDonor ? (
              <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl py-24 px-4 text-center h-full flex flex-col justify-center items-center">
                <User className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-base font-bold text-slate-600">Select a Donor to Check-in</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Click on any donor in the registrations list to record vital measurements, check eligibility, and collect blood.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Medical Vitals Record: {activeDonor.donor.fullName || activeDonor.donor.user?.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verify donor medical eligibility parameters below. Minimum parameters: Weight ≥ 45kg, Hemoglobin ≥ 12.5g/dL.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveDonor(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleVitalsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weight */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Donor Weight (kg) *</label>
                      <input
                        type="number"
                        required
                        min="30"
                        max="200"
                        value={vitals.weight}
                        onChange={(e) => setVitals((p) => ({ ...p, weight: e.target.value }))}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-slate-700 bg-slate-50/50"
                      />
                      {vitals.weight && Number(vitals.weight) < 45 && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Underweight (Ineligible)
                        </p>
                      )}
                    </div>

                    {/* Hemoglobin */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Hemoglobin Level (g/dL) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        min="5"
                        max="25"
                        value={vitals.hemoglobin}
                        onChange={(e) => setVitals((p) => ({ ...p, hemoglobin: e.target.value }))}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-slate-700 bg-slate-50/50"
                      />
                      {vitals.hemoglobin && Number(vitals.hemoglobin) < 12.5 && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Low Hemoglobin (Ineligible)
                        </p>
                      )}
                    </div>

                    {/* Blood Pressure */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Blood Pressure (mmHg)</label>
                      <input
                        type="text"
                        placeholder="e.g. 120/80"
                        value={vitals.bloodPressure}
                        onChange={(e) => setVitals((p) => ({ ...p, bloodPressure: e.target.value }))}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-slate-700 bg-slate-50/50"
                      />
                    </div>

                    {/* Pulse */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Pulse (bpm)</label>
                      <input
                        type="number"
                        value={vitals.pulse}
                        onChange={(e) => setVitals((p) => ({ ...p, pulse: e.target.value }))}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-slate-700 bg-slate-50/50"
                      />
                    </div>

                    {/* Units Quantity */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Collected Quantity (Units)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="3"
                        value={vitals.quantity}
                        onChange={(e) => setVitals((p) => ({ ...p, quantity: e.target.value }))}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-slate-700 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveDonor(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-2xl transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingId === activeDonor.donor._id}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-2xl transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2 text-sm"
                    >
                      {submittingId === activeDonor.donor._id ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      Record Vitals & Complete Donation
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampDonationsManager;
