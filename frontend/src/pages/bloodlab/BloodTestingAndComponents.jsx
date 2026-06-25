import { useState, useEffect } from "react";
import { bloodLabApi } from "../../services/api";
import { toast } from "react-hot-toast";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Droplet,
  Split,
  ChevronRight,
  User,
  FlaskConical,
  AlertCircle,
  Activity,
  CheckCircle,
} from "lucide-react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config/env.js";
import { getAuthToken } from "../../utils/auth.js";

const BloodTestingAndComponents = () => {
  const [pendingBags, setPendingBags] = useState([]);
  const [safeBags, setSafeBags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("testing"); // 'testing' or 'components'
  const [submittingId, setSubmittingId] = useState(null);

  // Test form values for the selected bag
  const [testForms, setTestForms] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch pending bags
      const pendingRes = await bloodLabApi.getPendingBags();
      setPendingBags(pendingRes.data.data || []);

      // Initialize test forms for all pending bags
      const initialForms = {};
      (pendingRes.data.data || []).forEach((bag) => {
        initialForms[bag.bagId] = {
          hiv: false,
          hbv: false,
          hcv: false,
          malaria: false,
          syphilis: false,
          hemoglobin: 14.2,
          bloodPressure: "120/80",
          pulse: 72,
          temperature: 98.4,
        };
      });
      setTestForms(initialForms);

      // Fetch active/safe whole blood bags from lab stock for component splitting
      const stockRes = await bloodLabApi.getStock();
      const wholeBloodSafe = (stockRes.data.data || []).filter(
        (item) =>
          item.componentType === "Whole Blood" &&
          item.testingStatus === "safe" &&
          item.status === "available"
      );
      setSafeBags(wholeBloodSafe);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blood testing records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Connect to Socket.io for real-time testing queue and inventory updates
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    console.log("🔌 Connecting to Socket.io on Lab Testing & Components page...");
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected on Lab Testing page:", socket.id);
    });

    socket.on("testing-queue-updated", (data) => {
      console.log("🔔 Real-time event: testing-queue-updated", data);
      if (data?.message) {
        toast(data.message, {
          icon: "🔬",
          style: {
            background: "#065f46",
            color: "#fff",
          },
        });
      }
      loadData();
    });

    socket.on("stock-updated", (data) => {
      console.log("🔔 Real-time event: stock-updated", data);
      loadData();
    });

    socket.on("new-request", (data) => {
      console.log("🔔 Real-time event: new-request", data);
      toast(`New incoming request: ${data.units} units of ${data.bloodType} from ${data.hospitalName}!`, {
        icon: "🚨",
        duration: 6000,
        style: {
          background: "#991b1b",
          color: "#fff",
        },
      });
      loadData();
    });

    return () => {
      console.log("🔌 Disconnecting Socket from Lab Testing page...");
      socket.disconnect();
    };
  }, []);

  const handleTestChange = (bagId, testName) => {
    setTestForms((prev) => ({
      ...prev,
      [bagId]: {
        ...prev[bagId],
        [testName]: !prev[bagId][testName],
      },
    }));
  };

  const handleMetricChange = (bagId, metricName, value) => {
    setTestForms((prev) => ({
      ...prev,
      [bagId]: {
        ...prev[bagId],
        [metricName]: value,
      },
    }));
  };

  const handleTestSubmit = async (bagId) => {
    setSubmittingId(bagId);
    try {
      const results = testForms[bagId];
      const isPositive = ["hiv", "hbv", "hcv", "malaria", "syphilis"].some(
        (key) => results[key] === true
      );

      await bloodLabApi.submitTestResults({
        bagId,
        ...results,
      });

      if (isPositive) {
        toast.error("⚠️ Infectious diseases detected. Bag has been segregated and discarded.");
      } else {
        toast.success("✅ Bag marked safe and added to active inventory!");
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit screening test results.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleSplitWholeBlood = async (bagId) => {
    setSubmittingId(bagId);
    try {
      await bloodLabApi.splitWholeBlood({ bagId });
      toast.success("✅ Successfully separated Whole Blood into PRBC, FFP, and Platelets!");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to split Whole Blood bag.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <FlaskConical className="w-7 h-7 text-emerald-600" />
            Testing, Screening & Component Processing
          </h1>
          <p className="text-sm text-slate-500">
            Mandatory infectious screening (HIV/HBV/HCV/Malaria/Syphilis) and Whole Blood splitting.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-slate-200/50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Sync Queue
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-6">
        <button
          onClick={() => setActiveTab("testing")}
          className={`pb-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "testing"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <ShieldAlert className="w-4.5 h-4.5" />
          Mandatory Screening Queue ({pendingBags.length})
        </button>
        <button
          onClick={() => setActiveTab("components")}
          className={`pb-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "components"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Split className="w-4.5 h-4.5" />
          Component Separation Unit ({safeBags.length})
        </button>
      </div>

      {loading && pendingBags.length === 0 && safeBags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Refreshing lab center queue...</p>
        </div>
      ) : activeTab === "testing" ? (
        /* SCREENING QUEUE */
        pendingBags.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
            <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800">Screening Queue Clear</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              All collected blood bags have completed mandatory testing. Fresh collections will automatically route here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingBags.map((bag) => {
              const form = testForms[bag.bagId] || {};
              const isPositive = Object.values(form).some((v) => v === true);
              const isPendingSubmit = submittingId === bag.bagId;

              return (
                <div
                  key={bag._id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-600 font-bold text-lg">
                          {bag.bloodGroup}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-800">{bag.componentType}</h4>
                          <p className="text-xs text-slate-400">Bag ID: {bag.bagId}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Screening
                      </span>
                    </div>

                    <hr className="border-slate-100 my-3" />

                    {/* Donor context */}
                    <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-600 space-y-1 mb-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Donor details:
                      </div>
                      <p>Name: {bag.donor ? (bag.donor.fullName || bag.donor.user?.name || "Unknown") : "N/A (Manually Added / Seeded)"}</p>
                      <p>Age: {bag.donor?.age ? `${bag.donor.age} years` : "N/A"} | Gender: {bag.donor?.gender || "N/A"}</p>
                      <p>Weight: {bag.donor?.weight ? `${bag.donor.weight} kg` : "N/A"}</p>
                    </div>

                    {/* Disease screening parameters */}
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Infectious Disease Toggles:
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                      {["hiv", "hbv", "hcv", "malaria", "syphilis"].map((test) => (
                        <button
                          key={test}
                          type="button"
                          onClick={() => handleTestChange(bag.bagId, test)}
                          className={`p-2 rounded-xl border font-bold text-[10px] transition-all flex flex-col items-center justify-center gap-1 ${
                            form[test]
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-slate-100 bg-slate-50/50 hover:border-slate-200 text-slate-500"
                          }`}
                        >
                          <span className="uppercase">{test}</span>
                          <span className={`w-2 h-2 rounded-full ${form[test] ? "bg-red-500 animate-ping" : "bg-slate-300"}`}></span>
                        </button>
                      ))}
                    </div>

                    {/* Health Metrics inputs */}
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Donor Health Metrics (Checkup Card):
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">HEMOGLOBIN (g/dL)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={form.hemoglobin ?? ""}
                          onChange={(e) => handleMetricChange(bag.bagId, "hemoglobin", e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="e.g. 14.2"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">BLOOD PRESSURE</label>
                        <input
                          type="text"
                          value={form.bloodPressure ?? ""}
                          onChange={(e) => handleMetricChange(bag.bagId, "bloodPressure", e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="e.g. 120/80"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">PULSE (bpm)</label>
                        <input
                          type="number"
                          value={form.pulse ?? ""}
                          onChange={(e) => handleMetricChange(bag.bagId, "pulse", e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="e.g. 72"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">TEMP (°F)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={form.temperature ?? ""}
                          onChange={(e) => handleMetricChange(bag.bagId, "temperature", e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="e.g. 98.4"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      {isPositive ? (
                        <span className="text-red-500 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Positive Reaction
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> All Non-reactive
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleTestSubmit(bag.bagId)}
                      disabled={isPendingSubmit}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm ${
                        isPositive
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {isPendingSubmit ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FlaskConical className="w-3.5 h-3.5" />
                      )}
                      Complete Screening
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* COMPONENT SEPARATION UNIT */
        safeBags.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
            <Activity className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800">No Splittable Bags</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              No screened Whole Blood bags are available in inventory for fractionation. Add safe stocks to process components.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeBags.map((bag) => {
              const isPendingSplit = submittingId === bag.bagId;

              return (
                <div
                  key={bag._id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 bottom-0 left-0 w-2 bg-emerald-500"></div>

                  <div className="pl-3">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-600 font-bold text-lg">
                          {bag.bloodGroup}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-800">{bag.componentType}</h4>
                          <p className="text-xs text-slate-400">ID: {bag.bagId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 rounded-xl p-2.5 text-xs text-emerald-700 flex items-center gap-1.5 border border-emerald-200/50 mb-3.5">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" /> Certified Infectious Safe
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Click split to divide this bag into Packed Red Blood Cells (PRBC), Platelets, and Fresh Frozen Plasma (FFP).
                    </p>
                  </div>

                  <button
                    onClick={() => handleSplitWholeBlood(bag.bagId)}
                    disabled={isPendingSplit}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    {isPendingSplit ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Split className="w-4 h-4" />
                    )}
                    Split Bag into Components
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default BloodTestingAndComponents;
