import { useState } from "react";
import { Clock, Activity, Heart, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

const DonationCountdownWidget = ({ lastDonationDate = "2026-06-01", gender = "Male" }) => {
  // 90 days for males, 120 days for females
  const intervalDays = gender === "Female" ? 120 : 90;
  const lastDate = new Date(lastDonationDate);
  const nextEligibleDate = new Date(lastDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const diffTime = nextEligibleDate - today;
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isEligible = daysRemaining === 0;

  const vitalsLog = [
    { date: "2026-06-01", hb: "14.2 g/dL", bp: "120/80 mmHg", pulse: "72 bpm", weight: "70 kg", status: "Passed" },
    { date: "2026-03-01", hb: "13.8 g/dL", bp: "118/78 mmHg", pulse: "70 bpm", weight: "69 kg", status: "Passed" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Countdown Widget Card */}
      <div className="bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white rounded-3xl p-6 shadow-xl shadow-red-900/20 border border-red-500/30 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        
        <div>
          <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
            Eligibility Status
          </span>
          
          <div className="mt-4">
            {isEligible ? (
              <div>
                <span className="text-3xl font-black text-emerald-300 block">Eligible to Donate Today! 🎉</span>
                <p className="text-xs text-red-100 font-semibold mt-1">You are fully eligible to donate blood or book a camp slot.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-black tracking-tight text-white">{daysRemaining}</span>
                  <span className="text-sm font-extrabold uppercase text-red-200">Days Remaining</span>
                </div>
                <p className="text-xs text-red-100 font-semibold mt-1">
                  Next eligible date: <strong className="text-white">{nextEligibleDate.toLocaleDateString()}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center text-xs font-bold text-red-100">
          <span>Interval Policy: {intervalDays} Days</span>
          <span className="flex items-center gap-1"><Calendar size={14} /> Last: {lastDate.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Vitals History Log Card */}
      <div className="lg:col-span-2 bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-850 uppercase tracking-wide flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" /> Historical Vitals & Screening Log
          </h3>
          <span className="text-xs font-bold text-slate-400">Medical Record Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-semibold text-slate-700">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Hemoglobin (Hb)</th>
                <th className="p-3 text-left">Blood Pressure</th>
                <th className="p-3 text-left">Pulse Rate</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vitalsLog.map((log, index) => (
                <tr key={index} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-900">{log.date}</td>
                  <td className="p-3 font-black text-red-600">{log.hb}</td>
                  <td className="p-3">{log.bp}</td>
                  <td className="p-3">{log.pulse}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-black text-[10px] rounded-full border border-emerald-100 inline-flex items-center gap-1">
                      <CheckCircle2 size={11} /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonationCountdownWidget;
