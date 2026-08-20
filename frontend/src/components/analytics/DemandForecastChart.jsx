import { useState } from "react";
import { TrendingUp, AlertTriangle, Sparkles, Calendar, Droplet, ArrowUpRight } from "lucide-react";

const DemandForecastChart = () => {
  const [forecastMonths] = useState([
    { month: "Sep 2026", predictedDemand: 450, currentStock: 380, deficit: 70, risk: "Moderate" },
    { month: "Oct 2026 (Festive Peak)", predictedDemand: 680, currentStock: 410, deficit: 270, risk: "High Deficit" },
    { month: "Nov 2026", predictedDemand: 520, currentStock: 490, deficit: 30, risk: "Low" },
    { month: "Dec 2026", predictedDemand: 590, currentStock: 430, deficit: 160, risk: "High Deficit" },
  ]);

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-black text-[10px] uppercase tracking-widest">
              AI Predictive Intelligence
            </span>
            <Sparkles size={14} className="text-rose-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-slate-850 uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" /> Seasonal Blood Demand & Shortage Forecast
          </h3>
        </div>
        <span className="text-xs font-black text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-2xl border border-slate-200/60">
          Confidence Score: 94.2%
        </span>
      </div>

      {/* Forecast Data Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {forecastMonths.map((item, idx) => (
          <div key={idx} className="bg-gradient-to-b from-slate-50 to-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Calendar size={13} className="text-red-500" /> {item.month}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${
                item.risk === "High Deficit" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {item.risk}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Predicted Demand</span>
                <span className="font-black text-slate-900">{item.predictedDemand} Units</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Current Reserve</span>
                <span className="font-black text-blue-600">{item.currentStock} Units</span>
              </div>

              {/* Progress Bar for Deficit */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full rounded-full ${item.deficit > 100 ? "bg-rose-600" : "bg-amber-500"}`}
                  style={{ width: `${Math.min(100, (item.predictedDemand / (item.currentStock + 100)) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center pt-2 text-[11px] font-extrabold">
                <span className="text-slate-400">Forecast Shortage</span>
                <span className="text-rose-600 font-black flex items-center gap-0.5">
                  <ArrowUpRight size={13} /> -{item.deficit} Units
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemandForecastChart;
