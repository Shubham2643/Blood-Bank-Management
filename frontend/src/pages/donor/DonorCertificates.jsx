import { useState, useEffect, useCallback } from "react";
import { donorApi } from "../../services/api.js";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Download,
  Printer,
  Share2,
  Calendar,
  Building,
  Droplet,
  Heart,
  Search,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const DonorCertificates = () => {
  const [history, setHistory] = useState([]);
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to view your certificates");
        setLoading(false);
        return;
      }

      const [historyRes, profileRes] = await Promise.all([
        donorApi.getHistory(),
        donorApi.getProfile(),
      ]);

      const profilePayload = profileRes.data.data || profileRes.data;
      const donorData = profilePayload.profile || profilePayload.donor || profilePayload;
      setDonor(donorData);

      let historyData = [];
      if (Array.isArray(historyRes.data?.data)) {
        historyData = historyRes.data.data;
      } else if (historyRes.data?.history) {
        historyData = historyRes.data.history;
      } else if (historyRes.data?.donations) {
        historyData = historyRes.data.donations;
      } else if (Array.isArray(historyRes.data)) {
        historyData = historyRes.data;
      }

      // Sort by date descending
      historyData.sort(
        (a, b) =>
          new Date(b.donationDate || b.date) -
          new Date(a.donationDate || a.date),
      );

      setHistory(historyData);
    } catch (err) {
      console.error("Failed to fetch certificates data:", err);
      toast.error("Failed to load certificates");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success("Certificates directory refreshed");
  };

  const handleDownloadCertificate = async (donationId, autoPrint = false) => {
    if (!donationId) {
      toast.error("Donation record ID is missing");
      return;
    }
    const toastId = toast.loading(autoPrint ? "Opening printer preview..." : "Preparing PDF download...");
    try {
      const res = await donorApi.getCertificate(donationId);
      toast.dismiss(toastId);
      if (res.data && res.data.success) {
        const cert = res.data.data;
        const screenW = window.screen?.width || 1400;
        const screenH = window.screen?.height || 900;
        const printWindow = window.open("", "_blank", `width=${screenW},height=${screenH},left=0,top=0,resizable=yes,scrollbars=yes`);
        if (printWindow) {
          try {
            printWindow.moveTo(0, 0);
            printWindow.resizeTo(screenW, screenH);
          } catch (e) {
            console.error("Failed to set window size:", e);
          }
        }
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Official Blood Donation Certificate - ${cert.certificateNumber}</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Outfit:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,600&display=swap" rel="stylesheet">
              <style>
                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }
                body {
                  font-family: 'Outfit', sans-serif;
                  background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
                  color: #1e293b;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: flex-start;
                  min-height: 100vh;
                  padding: 24px 16px;
                  overflow-x: hidden;
                }
                .control-bar {
                  width: 100%;
                  max-width: 1000px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  background: rgba(15, 23, 42, 0.85);
                  backdrop-filter: blur(16px);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  padding: 12px 20px;
                  border-radius: 14px;
                  margin-bottom: 20px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .control-title {
                  color: #e2e8f0;
                  font-weight: 700;
                  font-size: 13px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                .cert-badge-pill {
                  background: rgba(255,255,255,0.08);
                  border: 1px solid rgba(255,255,255,0.12);
                  color: #94a3b8;
                  font-family: monospace;
                  font-size: 11px;
                  padding: 3px 8px;
                  border-radius: 6px;
                  font-weight: 700;
                }
                .btn-group {
                  display: flex;
                  gap: 10px;
                  align-items: center;
                }
                .btn {
                  padding: 8px 16px;
                  border-radius: 10px;
                  font-weight: 700;
                  font-size: 12px;
                  letter-spacing: 0.3px;
                  cursor: pointer;
                  border: none;
                  transition: all 0.2s ease;
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                }
                .btn-primary {
                  background: #dc2626;
                  color: white;
                  box-shadow: 0 2px 8px rgba(220,38,38,0.3);
                }
                .btn-primary:hover {
                  background: #b91c1c;
                  transform: translateY(-1px);
                }
                .btn-outline {
                  background: rgba(255, 255, 255, 0.08);
                  color: #f1f5f9;
                  border: 1px solid rgba(255, 255, 255, 0.15);
                }
                .btn-outline:hover {
                  background: rgba(255, 255, 255, 0.16);
                  color: white;
                }
                .btn-ghost {
                  background: transparent;
                  color: #94a3b8;
                  padding: 8px 12px;
                }
                .btn-ghost:hover {
                  color: white;
                }
                .certificate-plaque {
                  width: 100%;
                  max-width: 1000px;
                  min-height: 620px;
                  background: linear-gradient(135deg, #fffdfa 0%, #fefcf8 50%, #fffbf5 100%);
                  border: 14px solid #b45309;
                  outline: 4px solid #991b1b;
                  outline-offset: -12px;
                  padding: 35px 50px;
                  position: relative;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.6);
                  border-radius: 16px;
                  overflow: hidden;
                  margin-bottom: 24px;
                }
                .corner-accent {
                  position: absolute;
                  width: 50px;
                  height: 50px;
                  border: 2px solid #d97706;
                  pointer-events: none;
                }
                .top-left { top: 20px; left: 20px; border-right: none; border-bottom: none; }
                .top-right { top: 20px; right: 20px; border-left: none; border-bottom: none; }
                .bottom-left { bottom: 20px; left: 20px; border-right: none; border-top: none; }
                .bottom-right { bottom: 20px; right: 20px; border-left: none; border-top: none; }

                .watermark {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  font-size: 260px;
                  color: rgba(180, 83, 9, 0.03);
                  pointer-events: none;
                  user-select: none;
                }
                .cert-header {
                  text-align: center;
                  position: relative;
                  z-index: 2;
                }
                .brand-badge {
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 14px;
                  font-weight: 900;
                  color: #991b1b;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  margin-bottom: 8px;
                }
                .main-title {
                  font-family: 'Cinzel', serif;
                  font-size: 38px;
                  font-weight: 900;
                  color: #1e293b;
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  margin-bottom: 6px;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .sub-title {
                  font-size: 12px;
                  font-weight: 900;
                  color: #b45309;
                  text-transform: uppercase;
                  letter-spacing: 3px;
                }
                .cert-body {
                  text-align: center;
                  position: relative;
                  z-index: 2;
                  margin: 15px 0;
                }
                .presented-text {
                  font-family: 'Playfair Display', serif;
                  font-size: 16px;
                  color: #64748b;
                  font-style: italic;
                  margin-bottom: 12px;
                }
                .recipient-name {
                  font-family: 'Playfair Display', serif;
                  font-size: 40px;
                  font-weight: 900;
                  color: #991b1b;
                  border-bottom: 3px double #d97706;
                  display: inline-block;
                  padding-bottom: 6px;
                  min-width: 380px;
                  margin-bottom: 16px;
                  letter-spacing: 0.5px;
                }
                .appreciation-text {
                  font-size: 14px;
                  color: #334155;
                  line-height: 1.7;
                  max-width: 680px;
                  margin: 0 auto;
                  font-weight: 500;
                }
                .cert-footer {
                  position: relative;
                  z-index: 2;
                }
                .meta-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 16px;
                  background: #fdfbf7;
                  border: 1px solid #f3ebd8;
                  border-radius: 14px;
                  padding: 14px 20px;
                  margin-bottom: 18px;
                  text-align: center;
                }
                .meta-item .label {
                  font-size: 10px;
                  font-weight: 900;
                  color: #b45309;
                  text-transform: uppercase;
                  letter-spacing: 1.5px;
                  margin-bottom: 4px;
                }
                .meta-item .value {
                  font-size: 13.5px;
                  font-weight: 800;
                  color: #1e293b;
                }
                .signatures {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 11px;
                  color: #64748b;
                  padding: 0 10px;
                }
                .gold-seal-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
                .gold-foil-stamp {
                  width: 64px;
                  height: 64px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #fffbeb 0%, #fef08a 25%, #f59e0b 65%, #b45309 100%);
                  border: 2px solid #fef08a;
                  outline: 1.5px solid #d97706;
                  outline-offset: -5px;
                  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.8);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  position: relative;
                }
                .stamp-inner {
                  width: 48px;
                  height: 48px;
                  border-radius: 50%;
                  background: #ffffff;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
                  border: 1px solid #fde68a;
                }
                .seal-text {
                  font-family: 'Outfit', sans-serif;
                  font-size: 8.5px;
                  font-weight: 800;
                  color: #b45309;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  margin-top: 5px;
                }

                @media print {
                  body {
                    background: white;
                    padding: 0;
                  }
                  .control-bar {
                    display: none !important;
                  }
                  .certificate-plaque {
                    width: 100%;
                    height: 100vh;
                    box-shadow: none;
                    border-radius: 0;
                    border: 14px solid #b45309;
                    outline: 4px solid #991b1b;
                    outline-offset: -12px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="control-bar">
                <div class="control-title">
                  <span>Document Viewer</span>
                  <span class="cert-badge-pill">ID: ${cert.certificateNumber}</span>
                </div>
                <div class="btn-group">
                  <button class="btn btn-primary" onclick="window.print()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Save as PDF
                  </button>
                  <button class="btn btn-outline" onclick="window.print()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Print Certificate
                  </button>
                  <button class="btn btn-ghost" onclick="window.close()">
                    Close
                  </button>
                </div>
              </div>

              <div class="certificate-plaque">
                <div class="corner-accent top-left"></div>
                <div class="corner-accent top-right"></div>
                <div class="corner-accent bottom-left"></div>
                <div class="corner-accent bottom-right"></div>

                <div class="watermark">🩸</div>
                
                <div class="cert-header">
                  <div class="brand-badge">🩸 LifeDrop Healthcare Network</div>
                  <div class="main-title">Certificate of Appreciation</div>
                  <div class="sub-title">Honoring Extraordinary Life-Saving Contribution</div>
                </div>

                <div class="cert-body">
                  <div class="presented-text">This official certificate of highest recognition is proudly presented to</div>
                  <div class="recipient-name">${cert.donorName}</div>
                  <div class="appreciation-text">
                    In profound gratitude for your noble voluntary contribution of <strong>${cert.quantity} Unit(s)</strong> of 
                    <strong>${cert.donorBloodGroup}</strong> blood. Your selfless generosity has directly given patients another 
                    chance at life and strengthened emergency medical care in our nation.
                  </div>
                </div>

                <div class="cert-footer">
                  <div class="meta-grid">
                    <div class="meta-item">
                      <div class="label">Donation Date</div>
                      <div class="value">${new Date(cert.donationDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                    </div>
                    <div class="meta-item">
                      <div class="label">Healthcare Facility</div>
                      <div class="value">${cert.facilityName}</div>
                    </div>
                    <div class="meta-item">
                      <div class="label">Certificate ID</div>
                      <div class="value">${cert.certificateNumber}</div>
                    </div>
                  </div>

                  <div class="signatures">
                    <div>
                      <strong style="color: #1e293b;">Authority:</strong> LifeDrop Certified Health Partner<br/>
                      <small style="color: #94a3b8">Issued On: ${new Date(cert.issuedAt).toLocaleDateString("en-IN")}</small>
                    </div>

                    <div class="gold-seal-container">
                      <div class="gold-foil-stamp">
                        <div class="stamp-inner">
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#991b1b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <path d="M14 14h3v3h-3z" fill="#991b1b" />
                            <path d="M18 18h3v3h-3z" fill="#991b1b" />
                            <path d="M14 18h2v3h-2z" fill="#991b1b" />
                          </svg>
                        </div>
                      </div>
                      <div class="seal-text">Verified Digital Seal</div>
                    </div>

                    <div style="text-align: right">
                      <strong style="color: #1e293b;">Verification:</strong> Authenticated Record<br/>
                      <small style="color: #10b981; font-weight: 700;">✓ Verified Life-Saving Donor</small>
                    </div>
                  </div>
                </div>
              </div>
              ${autoPrint ? `<script>window.onload = function() { window.print(); }</script>` : ''}
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        toast.error("Failed to generate certificate");
      }
    } catch (err) {
      toast.dismiss(toastId);
      console.error("Certificate error:", err);
      toast.error("Failed to fetch certificate: " + (err.response?.data?.message || err.message));
    }
  };

  const handleShare = (item) => {
    if (!item) {
      toast.error("No certificate data to share");
      return;
    }
    const certNo = item.certificateId || `LD-${(item._id || item.id)?.toString().slice(-8).toUpperCase()}`;
    const dateStr = new Date(item.donationDate || item.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const facilityName = item.facility?.name || "LifeDrop Partner";
    const bloodGroup = donor?.bloodGroup || "N/A";
    const quantity = item.quantity || 1;
    const livesSaved = quantity * 3;

    const shareText = `🏆 Life-Saving Certificate No: ${certNo}\n` +
      `📅 Date: ${dateStr}\n` +
      `🏥 Facility: ${facilityName}\n` +
      `🩸 Contribution: ${quantity} Unit(s) (${bloodGroup})\n` +
      `💚 Lives Impacted: ${livesSaved}\n\n` +
      `Proud to be a blood donor on LifeDrop! Join me in saving lives.`;

    if (navigator.share) {
      navigator.share({
        title: "My Blood Donation Certificate",
        text: shareText,
        url: window.location.origin
      }).catch((err) => {
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(shareText);
          toast.success("Certificate details copied to clipboard!");
        }
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Certificate details copied to clipboard! Share it with others.");
    }
  };

  const filteredHistory = history.filter((item) => {
    const facilityName = item.facility?.name || "";
    const certNo = item.certificateId || `LD-${(item._id || item.id)?.toString().slice(-8).toUpperCase()}`;
    return (
      facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-rose-700 to-red-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-red-600/40">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center md:items-end">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-end text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-red-600 font-black flex items-center justify-center shadow-2xl ring-4 ring-white/20 flex-shrink-0">
              <Award className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 animate-bounce" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                Life-Saving Certificates
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-red-100/90 mt-1">
                View, print, download PDF, and share your official recognition certificates for saving lives.
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-2xl font-black text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 shadow-md flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 text-white ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh Directory</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-6 animate-pulse shadow-sm">
              <div className="h-6 w-1/3 bg-slate-200 rounded-2xl"></div>
              <div className="h-10 w-2/3 bg-slate-200 rounded-2xl"></div>
              <div className="h-4 w-1/2 bg-slate-200 rounded-2xl"></div>
              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <div className="h-12 w-full bg-slate-200 rounded-2xl"></div>
                <div className="h-12 w-12 bg-slate-200 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-2xl mx-auto shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)]">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xs">
            <Award className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-850">No Certificates Available Yet</h2>
          <p className="text-slate-500 mt-2 text-xs sm:text-sm font-medium max-w-md mx-auto leading-relaxed">
            You will receive an official certificate of appreciation for each certified blood donation. Schedule your next donation camp to earn certificates!
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/donor/camps")}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20 cursor-pointer hover:scale-105"
            >
              <span>Find Blood Camps</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Certificates Container */
        <div className="space-y-6">
          {/* Search Bar & Total Certificates Count */}
          <div className="bg-white rounded-3xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 p-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by facility or certificate number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white text-slate-850 text-sm font-extrabold outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="px-4 py-2 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-xs font-black">
                Total Certificates: {history.length}
              </span>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)]">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No matching certificates found.</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Try searching with a different certificate ID or healthcare facility name.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredHistory.map((item) => {
                const date = new Date(item.donationDate || item.date);
                const certNo = item.certificateId || `LD-${(item._id || item.id)?.toString().slice(-8).toUpperCase()}`;
                
                return (
                  <div
                    key={item._id || item.id}
                    className="bg-white rounded-3xl border-2 border-amber-300/40 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] hover:shadow-[0_25px_60px_-10px_rgba(220,38,38,0.2)] transition-all duration-500 relative overflow-hidden group flex flex-col justify-between"
                  >
                    {/* Top Crimson & Gold Royal Header Ribbon */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-red-800 via-rose-700 to-red-900 text-white p-6 sm:p-7 border-b-2 border-amber-400/50">
                      {/* Concentric vector rings overlay */}
                      <div className="absolute inset-0 opacity-15 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <circle cx="95" cy="5" r="35" stroke="#fef08a" strokeWidth="2" fill="none" />
                          <circle cx="5" cy="95" r="25" stroke="#fef08a" strokeWidth="2" fill="none" />
                        </svg>
                      </div>

                      <div className="relative z-10 flex items-start gap-4">
                        {/* 3D Glowing Gold Medal Seal */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/30 flex items-center justify-center border-4 border-amber-200/90 ring-4 ring-amber-400/20 flex-shrink-0">
                          <Award className="w-9 h-9 text-slate-950 fill-amber-300 animate-pulse" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-300/40 backdrop-blur-md">
                            👑 Official Certificate of Recognition
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-xs">
                            Awarded for Life-Saving Donation
                          </h3>
                          <div className="inline-block font-mono text-xs font-bold text-amber-200 bg-black/30 border border-amber-300/30 px-3 py-1 rounded-xl">
                            Certificate ID: {certNo}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Body Container */}
                    <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between relative bg-gradient-to-b from-amber-50/20 via-white to-white">
                      {/* Watermark Seal Background Icon */}
                      <div className="absolute bottom-2 right-2 text-amber-500/5 group-hover:text-amber-500/10 transition-colors pointer-events-none">
                        <Award className="w-48 h-48 stroke-[1]" />
                      </div>

                      <div className="space-y-4 relative z-10">
                        {/* Recipient Statement */}
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed italic border-b border-slate-100 pb-3">
                          "Presented to <span className="font-extrabold text-slate-900 not-italic">{donor?.fullName || donor?.name || "Life-Saving Hero"}</span> in recognition of their noble contribution towards saving human lives."
                        </p>

                        {/* Details Cards Grid */}
                        <div className="space-y-2.5 text-xs font-semibold text-slate-700">
                          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shadow-2xs flex-shrink-0 border border-red-100">
                              <Calendar className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Donation Date</span>
                              <span className="block text-xs sm:text-sm font-extrabold text-slate-850">
                                {date.toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shadow-2xs flex-shrink-0 border border-red-100">
                              <Building className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Healthcare Facility</span>
                              <span className="block text-xs sm:text-sm font-extrabold text-slate-850 truncate">
                                {item.facility?.name || "LifeDrop Partner Network"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shadow-2xs flex-shrink-0 border border-red-100">
                              <Droplet className="w-4.5 h-4.5 fill-red-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Contribution Units</span>
                              <span className="block text-xs sm:text-sm font-extrabold text-slate-850">
                                {item.quantity || 1} Unit(s) ({donor?.bloodGroup || "O+"})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Lives Impacted Emerald Badge */}
                        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 text-xs text-emerald-800 font-extrabold shadow-2xs w-full sm:w-auto">
                          <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600 animate-pulse" />
                          <span>Lives Impacted: <strong className="text-emerald-950 font-black">{(item.quantity || 1) * 3}+ Lives Saved</strong></span>
                        </div>
                      </div>

                      {/* Action Buttons Bar with Separate Download & Print Controls */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center gap-2.5 relative z-10">
                        <button
                          onClick={() => handleDownloadCertificate(item._id || item.id, false)}
                          className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black py-3 px-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 border border-red-500/30"
                        >
                          <Download className="w-4 h-4 text-white" />
                          <span>Download PDF</span>
                        </button>

                        <button
                          onClick={() => handleDownloadCertificate(item._id || item.id, true)}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-3 px-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-md border border-slate-700/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105"
                        >
                          <Printer className="w-4 h-4 text-white" />
                          <span>Print Certificate</span>
                        </button>

                        <button
                          onClick={() => handleShare(item)}
                          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-all cursor-pointer hover:scale-105 shadow-2xs"
                          title="Share Achievement"
                        >
                          <Share2 className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonorCertificates;
