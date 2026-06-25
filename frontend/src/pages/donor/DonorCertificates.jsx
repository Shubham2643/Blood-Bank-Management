import { useState, useEffect, useCallback } from "react";
import { donorApi } from "../../services/api.js";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Download,
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
      if (historyRes.data.history) {
        historyData = historyRes.data.history;
      } else if (historyRes.data.donations) {
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

  const handleDownloadCertificate = async (donationId) => {
    if (!donationId) {
      toast.error("Donation record ID is missing");
      return;
    }
    const toastId = toast.loading("Generating certificate...");
    try {
      const res = await donorApi.getCertificate(donationId);
      toast.dismiss(toastId);
      if (res.data && res.data.success) {
        const cert = res.data.data;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>Blood Donation Certificate - ${cert.certificateNumber}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
                body {
                  font-family: 'Outfit', sans-serif;
                  background-color: #f8fafc;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  padding: 20px;
                  box-sizing: border-box;
                }
                .certificate-container {
                  width: 800px;
                  height: 560px;
                  background: white;
                  border: 12px solid #dc2626;
                  outline: 2px solid #b91c1c;
                  outline-offset: -8px;
                  padding: 35px 45px;
                  box-sizing: border-box;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  text-align: center;
                  position: relative;
                  border-radius: 8px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                }
                .logo {
                  font-size: 28px;
                  font-weight: 700;
                  color: #dc2626;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 10px;
                  margin-bottom: 12px;
                }
                .title {
                  font-size: 34px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  color: #1e293b;
                  margin-bottom: 8px;
                }
                .subtitle {
                  font-size: 14px;
                  color: #64748b;
                  margin-bottom: 25px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                .presented-to {
                  font-size: 14px;
                  color: #64748b;
                  font-style: italic;
                  margin-bottom: 8px;
                }
                .donor-name {
                  font-size: 30px;
                  font-weight: 600;
                  color: #dc2626;
                  border-bottom: 2px solid #e2e8f0;
                  display: inline-block;
                  padding-bottom: 5px;
                  min-width: 300px;
                  margin-bottom: 18px;
                }
                .description {
                  font-size: 15px;
                  color: #334155;
                  line-height: 1.6;
                  max-width: 620px;
                  margin: 0 auto 25px auto;
                }
                .details-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-top: 25px;
                  border-top: 1px solid #e2e8f0;
                  padding-top: 20px;
                }
                .detail-item {
                  flex: 1;
                  text-align: center;
                }
                .detail-label {
                  font-size: 12px;
                  color: #94a3b8;
                  text-transform: uppercase;
                  margin-bottom: 5px;
                }
                .detail-value {
                  font-size: 14px;
                  font-weight: 600;
                  color: #334155;
                }
                .cert-footer {
                  display: flex;
                  justify-content: space-between;
                  font-size: 11px;
                  color: #94a3b8;
                  margin-top: 25px;
                }
                @media print {
                  body {
                    background-color: white;
                    padding: 0;
                  }
                  .certificate-container {
                    box-shadow: none;
                    border-radius: 0;
                    width: 100%;
                    height: 95%;
                    border: 12px solid #dc2626;
                    outline: 2px solid #b91c1c;
                    outline-offset: -8px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="certificate-container">
                <div class="cert-header">
                  <div class="logo">🩸 LifeDrop</div>
                  <div class="title">Certificate of Appreciation</div>
                  <div class="subtitle">Awarded for Life-Saving Blood Donation</div>
                </div>
                
                <div class="cert-body">
                  <div class="presented-to">This certificate is proudly presented to</div>
                  <div class="donor-name">${cert.donorName}</div>
                  <div class="description">
                    In recognition of their noble contribution of <strong>${cert.quantity} unit(s)</strong> of 
                    <strong>${cert.donorBloodGroup}</strong> blood. By donating blood, you have given 
                    someone another chance at life and made our community stronger.
                  </div>
                </div>
                
                <div class="cert-footer-section">
                  <div class="details-row">
                    <div class="detail-item">
                      <div class="detail-label">Donation Date</div>
                      <div class="detail-value">${new Date(cert.donationDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Facility</div>
                      <div class="detail-value">${cert.facilityName}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Certificate No.</div>
                      <div class="detail-value">${cert.certificateNumber}</div>
                    </div>
                  </div>
                  
                  <div class="cert-footer">
                    <span>Issued automatically by LifeDrop Network</span>
                    <span>Issued on: ${new Date(cert.issuedAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                }
              </script>
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
    const certNo = item.certificateId || `BC-${(item._id || item.id)?.toString().slice(-8).toUpperCase()}`;
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
    const certNo = item.certificateId || `BC-${(item._id || item.id)?.toString().slice(-8).toUpperCase()}`;
    return (
      facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="w-8 h-8 text-red-600" />
            Life-Saving Certificates
          </h1>
          <p className="text-gray-500 mt-1">
            View, download, and share your recognition certificates for saving lives.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6 animate-pulse">
              <div className="h-6 w-1/3 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-2/3 bg-gray-200 rounded-lg"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded-lg"></div>
              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
                <div className="h-10 w-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">No Certificates Available Yet</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            You will receive a certificate of appreciation for each completed and certified blood donation. Schedule a donation to get started!
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate("/donor/camps")}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-2xl transition-colors shadow-lg shadow-red-200"
            >
              Find Blood Camps
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Certificates Grid */
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by facility or certificate number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-700"
            />
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-gray-500">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              No matching certificates found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredHistory.map((item) => {
                const date = new Date(item.donationDate || item.date);
                const certNo = item.certificateId || `BC-${(item._id || item.id)?.toString().slice(-8).toUpperCase()}`;
                
                return (
                  <div
                    key={item._id || item.id}
                    className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 hover:shadow-xl transition-all relative overflow-hidden group flex flex-col justify-between"
                  >
                    {/* Diploma Styling Accents */}
                    <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
                    <div className="absolute top-4 right-4 text-red-50/40 group-hover:text-red-50 transition-colors pointer-events-none">
                      <Award className="w-24 h-24" />
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                          Certificate of Appreciation
                        </span>
                        <h3 className="text-xl font-bold text-gray-800 mt-2.5">
                          Awarded for Life-Saving Donation
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                          Certificate No: {certNo}
                        </p>
                      </div>

                      <div className="border-y border-gray-50 py-3 my-4 space-y-2.5 text-sm text-gray-600">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            Date: {date.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span>Facility: {item.facility?.name || "LifeDrop Partner"}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Droplet className="w-4 h-4 text-red-500" />
                          <span>
                            Contribution: <strong className="text-gray-900">{item.quantity || 1} Unit(s)</strong> ({donor?.bloodGroup || "N/A"})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-green-50/60 border border-green-100 rounded-xl px-3 py-2 text-xs text-green-700 w-fit">
                        <Heart className="w-3.5 h-3.5 text-green-500 fill-green-500" />
                        <span>Lives Saved / Impacted: <strong>{(item.quantity || 1) * 3}</strong></span>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-50 flex gap-3 relative z-10">
                      <button
                        onClick={() => handleDownloadCertificate(item._id || item.id)}
                        className="flex-grow bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Print / Download
                      </button>
                      <button
                        onClick={() => handleShare(item)}
                        className="p-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
                        title="Share Achievement"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
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
