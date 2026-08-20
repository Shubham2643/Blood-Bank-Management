import { useState } from "react";
import { MapPin, Navigation, Droplet, Building, ShieldAlert, Radio, Search, Filter } from "lucide-react";

const GeofencedBloodMap = ({ initialRadius = 10 }) => {
  const [radius, setRadius] = useState(initialRadius);
  const [selectedPin, setSelectedPin] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const mapPins = [
    { id: 1, name: "Civil Hospital Blood Center", type: "hospital", lat: 40, lng: 35, bloodTypes: ["A+", "O-", "B+"], phone: "+91 9876543214", status: "Active", urgency: "Critical Demand" },
    { id: 2, name: "Metro Blood Bank & Lab", type: "lab", lat: 60, lng: 55, bloodTypes: ["O+", "A-", "AB+"], phone: "+91 9876543210", status: "Open 24/7", urgency: "Normal" },
    { id: 3, name: "Apollo Blood Lab Services", type: "lab", lat: 25, lng: 65, bloodTypes: ["B-", "AB-", "O-"], phone: "+91 9876543211", status: "Verified", urgency: "Moderate" },
    { id: 4, name: "Kiran Hospital Blood Hub", type: "hospital", lat: 75, lng: 25, bloodTypes: ["A+", "B+", "O+"], phone: "+91 9876543212", status: "Active", urgency: "High Demand" },
  ];

  const filteredPins = mapPins.filter(pin => filterType === "all" || pin.type === filterType);

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 shadow-xl shadow-slate-100/80 overflow-hidden relative">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 font-black text-[10px] uppercase tracking-widest">
              Live Regional Geofence
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h3 className="text-xl font-black text-slate-850 uppercase tracking-wide flex items-center gap-2">
            <Navigation className="w-5 h-5 text-red-600" /> Regional Blood Coverage Map
          </h3>
        </div>

        {/* Radius Slider Control */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/70 px-4 py-2.5 rounded-2xl w-full sm:w-auto">
          <Radio className="w-4 h-4 text-red-600 shrink-0" />
          <div className="flex-1 min-w-[120px]">
            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              <span>Geofence Radius</span>
              <span className="text-red-600">{radius} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>
        </div>
      </div>

      {/* Map Filter Pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", label: "All Locations" },
          { id: "hospital", label: "Hospitals Only" },
          { id: "lab", label: "Blood Labs Only" }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filterType === f.id
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Interactive Vector Map Canvas Box */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Radar Pulse Background Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        
        {/* Dynamic Radius Geofence Circle */}
        <div 
          className="absolute rounded-full border-2 border-red-500/40 bg-red-500/10 transition-all duration-500 pointer-events-none flex items-center justify-center"
          style={{ width: `${radius * 6}px`, height: `${radius * 6}px` }}
        >
          <span className="text-[10px] font-black text-red-300 uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 rounded-full border border-red-500/30">
            {radius}km Radius Zone
          </span>
        </div>

        {/* Map Location Pins */}
        {filteredPins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => setSelectedPin(pin)}
            style={{ top: `${pin.lat}%`, left: `${pin.lng}%` }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-300 ${
              selectedPin?.id === pin.id ? "scale-125 z-30" : "hover:scale-110 z-20"
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl border-2 ring-4 transition-all ${
              pin.type === "hospital"
                ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-red-400 ring-red-500/30"
                : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-400 ring-blue-500/30"
            }`}>
              {pin.type === "hospital" ? <Building size={18} /> : <Droplet size={18} />}
            </div>
            {/* Pin Tooltip */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-xl border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
              {pin.name}
            </div>
          </button>
        ))}

        {/* Selected Location Card Popover */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white/95 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/90 shadow-2xl z-40 animate-fadeIn">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedPin.type === "hospital" ? "bg-red-600" : "bg-blue-600"}`} />
                <h4 className="font-black text-slate-850 text-sm truncate">{selectedPin.name}</h4>
              </div>
              <button onClick={() => setSelectedPin(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-3">{selectedPin.phone} • {selectedPin.status}</p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-400">Available Types:</span>
              <div className="flex gap-1">
                {selectedPin.bloodTypes.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-red-50 text-red-700 font-black text-[10px] rounded-lg border border-red-100">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeofencedBloodMap;
