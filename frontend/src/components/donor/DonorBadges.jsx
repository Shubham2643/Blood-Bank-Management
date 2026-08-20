import { useState } from "react";
import { Award, Trophy, Star, ShieldCheck, Heart, Sparkles, CheckCircle2 } from "lucide-react";

const DonorBadges = ({ donationCount = 5, bloodGroup = "O+" }) => {
  const badges = [
    { id: 1, name: "Bronze Lifesaver", countReq: 1, desc: "Completed 1st Blood Donation", icon: Award, color: "from-amber-600 to-amber-800", text: "text-amber-700", unlocked: donationCount >= 1 },
    { id: 2, name: "Silver Guardian", countReq: 3, desc: "Completed 3 Blood Donations", icon: Star, color: "from-slate-400 to-slate-600", text: "text-slate-700", unlocked: donationCount >= 3 },
    { id: 3, name: "Gold Champion", countReq: 5, desc: "Completed 5 Blood Donations", icon: Trophy, color: "from-yellow-400 via-amber-500 to-yellow-600", text: "text-yellow-700", unlocked: donationCount >= 5 },
    { id: 4, name: "Rare Hero", countReq: 1, desc: "Universal Donor Hero", icon: ShieldCheck, color: "from-red-600 to-rose-700", text: "text-red-700", unlocked: bloodGroup === "O-" || bloodGroup === "O+" || donationCount >= 3 },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 mb-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 font-black text-[10px] uppercase tracking-widest">
              Donor Milestones
            </span>
            <Sparkles size={14} className="text-amber-500 animate-spin-slow" />
          </div>
          <h3 className="text-xl font-black text-slate-850 uppercase tracking-wide flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Achievement Badges & Hero Status
          </h3>
        </div>
        <span className="text-xs font-black text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-2xl border border-amber-200">
          {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                badge.unlocked
                  ? "bg-gradient-to-b from-white to-amber-50/30 border-amber-200/80 shadow-md hover:shadow-xl hover:-translate-y-1"
                  : "bg-slate-50/60 border-slate-200/60 opacity-60 grayscale"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badge.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                {badge.unlocked ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-black text-[10px] rounded-full border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-slate-400 uppercase">Locked</span>
                )}
              </div>

              <h4 className={`font-black text-sm ${badge.unlocked ? badge.text : "text-slate-500"}`}>{badge.name}</h4>
              <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">{badge.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonorBadges;
