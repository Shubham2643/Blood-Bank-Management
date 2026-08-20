import { useState, useEffect } from "react";
import { AlertCircle, ChevronRight, PhoneCall, ShieldAlert, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";

const PublicEmergencyTicker = () => {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const emergencyCalls = [
    { id: 1, hospital: "Civil Hospital, Ahmedabad", bloodType: "O- Negative", units: 3, urgency: "CRITICAL", distance: "2.4 km", time: "5 mins ago" },
    { id: 2, hospital: "Apollo Health Center, Surat", bloodType: "AB- Negative", units: 2, urgency: "HIGH", distance: "4.1 km", time: "12 mins ago" },
    { id: 3, hospital: "Kiran Medical Campus, Vadodara", bloodType: "B- Negative", units: 4, urgency: "CRITICAL", distance: "1.8 km", time: "18 mins ago" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % emergencyCalls.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [emergencyCalls.length]);

  if (!visible) return null;

  const currentCall = emergencyCalls[currentIndex];

  return (
    <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-900 text-white shadow-xl border-b border-red-500/40 relative z-30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 text-white shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <ShieldAlert size={13} className="text-amber-300" />
            Live Emergency Callout
          </span>
        </div>

        {/* Center Animated Ticker Text */}
        <div className="min-w-0 flex-1 flex items-center justify-center sm:justify-start text-xs sm:text-sm font-extrabold truncate gap-3">
          <span className="px-2.5 py-0.5 bg-red-950/60 border border-red-400/40 rounded-lg text-red-200 font-black text-[11px] shrink-0">
            {currentCall.bloodType} NEEDED
          </span>
          <span className="truncate text-red-100">
            <strong className="text-white">{currentCall.hospital}</strong> needs{" "}
            <span className="text-amber-300 font-black">{currentCall.units} Units</span> ({currentCall.urgency})
          </span>
          <span className="hidden md:inline-block text-[10px] font-bold text-red-200/80 bg-white/10 px-2 py-0.5 rounded-full">
            📍 {currentCall.distance} • {currentCall.time}
          </span>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/stock-search"
            className="px-3.5 py-1.5 bg-white text-red-700 hover:bg-red-50 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <span>Respond Now</span>
            <ChevronRight size={14} />
          </Link>
          <button
            onClick={() => setVisible(false)}
            className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss Ticker"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicEmergencyTicker;
