import { useState } from "react";
import { Thermometer, ShieldCheck, AlertCircle, RefreshCw, Snowflake } from "lucide-react";

const ColdChainMonitor = () => {
  const [sensors] = useState([
    { id: "REF-01", location: "PRBC Refrigeration Unit A", temp: 3.8, target: "2°C - 6°C", status: "Optimal", humidity: "45%" },
    { id: "REF-02", location: "Plasma Deep Freezer B", temp: -24.5, target: "-18°C - -30°C", status: "Optimal", humidity: "38%" },
    { id: "REF-03", location: "Platelet Agitator Vault C", temp: 21.8, target: "20°C - 24°C", status: "Optimal", humidity: "50%" },
  ]);

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-black text-[10px] uppercase tracking-widest">
              Cold Chain Compliance
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h3 className="text-xl font-black text-slate-850 uppercase tracking-wide flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-blue-600" /> Storage Temperature Monitor
          </h3>
        </div>
        <span className="text-xs font-extrabold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
          Sensor Refresh: Live (Every 30s)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="bg-gradient-to-b from-slate-50/90 to-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{sensor.id}</span>
                <h4 className="font-black text-slate-850 text-xs mt-0.5">{sensor.location}</h4>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-black text-[10px] rounded-full border border-emerald-100 flex items-center gap-1">
                <ShieldCheck size={12} /> {sensor.status}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-3">
              <span className="text-3xl font-black text-blue-700 tracking-tight">{sensor.temp}°C</span>
              <span className="text-[11px] font-bold text-slate-400">Target: {sensor.target}</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span>Humidity: {sensor.humidity}</span>
              <span className="text-emerald-600 font-black">✓ Compliant</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColdChainMonitor;
