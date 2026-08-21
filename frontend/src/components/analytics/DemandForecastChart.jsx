import { useState } from "react";
import { 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  Droplet, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  Activity,
  Zap,
  Info,
  Filter
} from "lucide-react";

const DemandForecastChart = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const forecastMonths = [
    { 
      id: "sep", 
      month: "Sep 2026", 
      tag: "Regular Demand", 
      predictedDemand: 450, 
      currentStock: 380, 
      deficit: 70, 
      risk: "Moderate",
      actionRecommendation: "Schedule 1 weekend blood drive to bridge 70-unit deficit."
    },
    { 
      id: "oct", 
      month: "Oct 2026", 
      tag: "Festive Season Peak", 
      predictedDemand: 680, 
      currentStock: 410, 
      deficit: 270, 
      risk: "High Deficit",
      actionRecommendation: "🚨 CRITICAL: Organize 3 major donor camps before Oct 15!"
    },
    { 
      id: "nov", 
      month: "Nov 2026", 
      tag: "Post-Festive Stabilize", 
      predictedDemand: 520, 
      currentStock: 490, 
      deficit: 30, 
      risk: "Low",
      actionRecommendation: "Routine reserve replenishment is sufficient."
    },
    { 
      id: "dec", 
      month: "Dec 2026", 
      tag: "Year-End Trauma Surge", 
      predictedDemand: 590, 
      currentStock: 430, 
      deficit: 160, 
      risk: "High Deficit",
      actionRecommendation: "⚠️ HIGH: Issue advance callout to O- & AB- rare blood donors."
    },
  ];

  const filteredItems = forecastMonths.filter((item) => {
    if (activeFilter === "high") return item.risk === "High Deficit";
    if (activeFilter === "moderate") return item.risk === "Moderate" || item.risk === "Low";
    return true;
  });

  const getRiskBadge = (risk) => {
    if (risk === "High Deficit") {
      return (
        <span className="px-3.5 py-1 bg-rose-50 text-rose-800 border border-rose-200/90 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          High Deficit
        </span>
      );
    }
    if (risk === "Moderate") {
      return (
        <span className="px-3.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/90 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Moderate Risk
        </span>
      );
    }
    return (
      <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/90 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Optimal Reserve
      </span>
    );
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Sleek Glassmorphic AI Intel Control Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Left Side: Title & Subtitle */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100/60 text-red-600 border border-red-100/90 flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 font-extrabold text-[10px] uppercase tracking-wider">
                AI Predictive Intelligence
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-bold text-slate-400">94.2% Confidence Score</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-850 tracking-tight">
              Seasonal Blood Demand & Shortage Forecast
            </h3>
          </div>
        </div>

        {/* Right Side: Clean Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shrink-0 w-full md:w-auto">
          {[
            { id: "all", label: "All Months" },
            { id: "high", label: "🔥 High Deficit" },
            { id: "moderate", label: "Moderate & Low" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeFilter === f.id
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Ultra 3D Glassmorphic Specimen Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const isHighDeficit = item.risk === "High Deficit";
          const capacityPercent = Math.round((item.predictedDemand / (item.currentStock + 100)) * 100);

          return (
            <div
              key={item.id}
              className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 relative overflow-hidden group hover:shadow-2xl hover:shadow-red-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Background Ambient Glow Orbs */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500 pointer-events-none ${
                  isHighDeficit ? "bg-rose-500/20" : "bg-amber-500/20"
                }`}
              />

              <div>
                {/* Top Row: Month & Risk Badge */}
                <div className="flex items-start justify-between gap-2 mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-red-600/25 border border-red-400/30 shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-850 text-base tracking-tight">{item.month}</h4>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">{item.tag}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 relative z-10">{getRiskBadge(item.risk)}</div>

                {/* Metrics 2-Column Micro Container */}
                <div className="space-y-2.5 my-3 relative z-10">
                  <div className="bg-slate-50/90 border border-slate-200/70 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Predicted Demand</span>
                    <span className="text-base font-black text-slate-900">{item.predictedDemand} <span className="text-[10px] font-bold text-slate-400">Units</span></span>
                  </div>

                  <div className="bg-slate-50/90 border border-slate-200/70 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Current Reserve</span>
                    <span className="text-base font-black text-blue-600">{item.currentStock} <span className="text-[10px] font-bold text-blue-400">Units</span></span>
                  </div>

                  {/* High Contrast Gauge Bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                      <span>Reserve Deficit Index</span>
                      <span className={isHighDeficit ? "text-rose-600" : "text-amber-600"}>{capacityPercent}% Stress</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isHighDeficit
                            ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-md shadow-red-600/30"
                            : "bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/30"
                        }`}
                        style={{ width: `${Math.min(100, capacityPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable AI Recommendation & Deficit Callout */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 relative z-10 space-y-2">
                <div
                  className={`px-3.5 py-2.5 rounded-2xl border flex items-center justify-between shadow-2xs ${
                    isHighDeficit
                      ? "bg-rose-50/90 border-rose-200 text-rose-950"
                      : "bg-amber-50/90 border-amber-200 text-amber-950"
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={14} className={isHighDeficit ? "text-rose-600" : "text-amber-600"} />
                    Projected Shortage
                  </span>
                  <span className={`text-xs font-black flex items-center gap-0.5 ${isHighDeficit ? "text-rose-700" : "text-amber-700"}`}>
                    <ArrowUpRight size={15} /> -{item.deficit} Units
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-[10px] font-bold text-slate-600 flex items-start gap-1.5">
                  <Zap size={12} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>{item.actionRecommendation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DemandForecastChart;
