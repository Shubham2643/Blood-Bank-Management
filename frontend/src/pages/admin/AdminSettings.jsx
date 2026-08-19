import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Settings, 
  Phone, 
  AlertTriangle, 
  Shield, 
  Bell, 
  Mail, 
  Save, 
  Server, 
  Lock, 
  RefreshCw,
  CheckCircle,
  Database,
  Globe
} from "lucide-react";

const AdminSettings = () => {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState({
    platformName: "LifeDrop Blood Network",
    emergencyHotline: "+91 1800-123-4567",
    autoExpiryAlertDays: 7,
    criticalStockThreshold: 10,
    maintenanceMode: false,
    enableSmsAlerts: true,
    enableEmailAlerts: true,
    enableBroadcastEmergency: true,
    maxDonationIntervalMonths: 3,
    maxDonorsPerCamp: 150,
    supportEmail: "support@lifedrop.org"
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("System settings updated successfully! ⚙️");
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Signature Crimson-Rose Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 p-7 sm:p-9 text-white shadow-2xl shadow-red-900/30 border border-red-500/30 mb-8">
          {/* Geometric Vector Rings Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center md:items-end">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-center text-center sm:text-left">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-white text-red-600 font-black flex items-center justify-center shadow-2xl ring-4 ring-white/20 flex-shrink-0">
                <Settings className="w-9 h-9 sm:w-10 sm:h-10 text-red-600 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-white/15 text-white border border-white/20 font-black text-[10px] uppercase tracking-widest backdrop-blur-md">
                    Super-Admin Console
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                  System Settings
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-red-100/90 mt-1 max-w-xl">
                  Configure global platform parameters, emergency protocols, notification gateways, and system thresholds.
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-4 bg-white text-red-600 hover:bg-red-50 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer hover:scale-105 shadow-2xl flex-shrink-0 active:scale-95 border-2 border-white/40 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin text-red-600" /> : <Save size={18} />}
              <span>{saving ? "Saving Changes..." : "Save Configuration"}</span>
            </button>
          </div>
        </div>

        {/* Main Settings Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-100/80 border border-slate-100/90 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b border-slate-100 bg-slate-50/70 p-3 gap-2">
            {[
              { id: "general", label: "General & Emergency", icon: Globe },
              { id: "thresholds", label: "Stock & Alerts", icon: AlertTriangle },
              { id: "notifications", label: "Gateways & Broadcasts", icon: Bell },
              { id: "security", label: "Security & Protocols", icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/25 border-red-500 scale-105"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSave} className="p-6 sm:p-8">
            {/* General & Emergency Tab */}
            {activeTab === "general" && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-black text-slate-850 flex items-center gap-3 pb-3.5 border-b border-slate-100 uppercase tracking-wide">
                  <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white flex items-center justify-center shadow-md shadow-red-500/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span>Platform & Emergency Identity</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                      Platform Brand Title
                    </label>
                    <input
                      type="text"
                      name="platformName"
                      value={settings.platformName}
                      onChange={handleChange}
                      className="w-full px-4.5 py-3.5 bg-white border-2 border-slate-200/80 rounded-2xl font-black text-slate-850 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                      Emergency Hotline Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-red-600 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="emergencyHotline"
                        value={settings.emergencyHotline}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4.5 py-3.5 bg-white border-2 border-slate-200/80 rounded-2xl font-black text-slate-850 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                      Support Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-red-600 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="supportEmail"
                        value={settings.supportEmail}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4.5 py-3.5 bg-white border-2 border-slate-200/80 rounded-2xl font-black text-slate-850 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                      Max Donors Per Blood Camp
                    </label>
                    <input
                      type="number"
                      name="maxDonorsPerCamp"
                      value={settings.maxDonorsPerCamp}
                      onChange={handleChange}
                      className="w-full px-4.5 py-3.5 bg-white border-2 border-slate-200/80 rounded-2xl font-black text-slate-850 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stock & Alerts Tab */}
            {activeTab === "thresholds" && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-black text-slate-850 flex items-center gap-3 pb-3.5 border-b border-slate-100 uppercase tracking-wide">
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span>Stock Thresholds & Expiry Alerts</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                      Critical Low Stock Threshold (Units)
                    </label>
                    <input
                      type="number"
                      name="criticalStockThreshold"
                      value={settings.criticalStockThreshold}
                      onChange={handleChange}
                      className="w-full px-4.5 py-3.5 bg-white border-2 border-slate-200/80 rounded-2xl font-black text-slate-850 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all shadow-sm"
                    />
                    <p className="text-xs text-slate-400 font-semibold mt-2">
                      Triggers automated emergency alert notifications to regional hospitals when inventory drops below this number.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                      Auto-Expiry Warning (Days Before Expiry)
                    </label>
                    <input
                      type="number"
                      name="autoExpiryAlertDays"
                      value={settings.autoExpiryAlertDays}
                      onChange={handleChange}
                      className="w-full px-4.5 py-3.5 bg-white border-2 border-slate-200/80 rounded-2xl font-black text-slate-850 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all shadow-sm"
                    />
                    <p className="text-xs text-slate-400 font-semibold mt-2">
                      Highlights blood units nearing expiration in blood lab inventory boards.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-black text-slate-850 flex items-center gap-3 pb-3.5 border-b border-slate-100 uppercase tracking-wide">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span>Notification Gateways & Broadcast Controls</span>
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                    <div>
                      <h4 className="font-black text-slate-850 text-sm">SMS Gateway Dispatch</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Send instant SMS alerts to registered donors for emergency blood calls.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="enableSmsAlerts"
                        checked={settings.enableSmsAlerts}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                    <div>
                      <h4 className="font-black text-slate-850 text-sm">Automated Email Notifications</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Dispatch email updates for facility approvals, camp registrations, and status changes.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="enableEmailAlerts"
                        checked={settings.enableEmailAlerts}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                    <div>
                      <h4 className="font-black text-slate-850 text-sm">Real-time Socket.io Broadcast Engine</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Broadcast live notifications to all connected hospital and blood lab dashboards.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="enableBroadcastEmergency"
                        checked={settings.enableBroadcastEmergency}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security & Maintenance Tab */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-black text-slate-850 flex items-center gap-3 pb-3.5 border-b border-slate-100 uppercase tracking-wide">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span>Security Compliance & Maintenance Mode</span>
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-rose-50/70 border border-rose-200/80 rounded-2xl">
                    <div>
                      <h4 className="font-black text-rose-900 text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4 text-rose-600" /> Platform Maintenance Mode
                      </h4>
                      <p className="text-xs text-rose-700 font-semibold mt-1">
                        Locks the portal for non-admin users during scheduled system upgrades or data migrations.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Form Action Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Save size={18} />}
                <span>{saving ? "Saving..." : "Save System Settings"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
