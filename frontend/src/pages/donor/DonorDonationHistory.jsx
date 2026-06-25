import { useNavigate } from "react-router-dom";
import { donorApi } from "../../services/api.js";
import {
  Droplet,
  Calendar,
  Search,
  Filter,
  Download,
  MapPin,
  AlertCircle,
  Award,
  TrendingUp,
  Heart,
  Shield,
  Star,
  Share2,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Activity,
  User,
  Mail,
  Phone,
  Loader,
  Camera,
  CalendarCheck,
  MessageSquare,
  Send,
  ThumbsUp,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "react-hot-toast";

import React, { useEffect, useState, useCallback, useMemo } from "react";

const DonorDonationHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [donorInfo, setDonorInfo] = useState(null);

  // Journey Tracker States
  const [activeJourneyId, setActiveJourneyId] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [loadingJourney, setLoadingJourney] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Advanced Action Panel States
  const [activePanel, setActivePanel] = useState({ id: null, type: null }); 
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [reportSymptoms, setReportSymptoms] = useState({
    dizziness: false,
    bruising: false,
    nausea: false,
    fainting: false,
    other: false
  });
  const [reportNotes, setReportNotes] = useState("");

  const togglePanel = (id, type) => {
    if (activePanel.id === id && activePanel.type === type) {
      setActivePanel({ id: null, type: null });
    } else {
      setActivePanel({ id, type });
    }
  };

  const handleRateSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you for your feedback!");
    setActivePanel({ id: null, type: null });
    setRating(0);
    setFeedbackText("");
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    toast.success("Issue reported successfully. A medical professional will contact you soon.");
    setActivePanel({ id: null, type: null });
    setReportSymptoms({ dizziness: false, bruising: false, nausea: false, fainting: false, other: false });
    setReportNotes("");
  };

  // Statistics state
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalUnits: 0,
    lifeImpact: 0,
    lastDonation: null,
    favoriteLocation: "",
    bloodGroups: {},
    yearlyBreakdown: {},
    averageUnits: 0,
    donationStreak: 0,
  });

  // Blood groups for filter
  const bloodGroups = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Fetch History and Donor Info
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to view your donation history");
        setLoading(false);
        return;
      }

      // Fetch both history and donor profile in parallel
      const [historyRes, profileRes] = await Promise.all([
        donorApi.getHistory(),
        donorApi.getProfile(),
      ]);

      let data =
        historyRes.data.history ||
        historyRes.data.donations ||
        (Array.isArray(historyRes.data) ? historyRes.data : []);

      console.log("Fetched donation history:", data);

      // Map facility populated object fields to the flat Facility and city properties
      data = data.map((item) => ({
        ...item,
        Facility: item.facility?.name || item.Facility || "Blood Donation Center",
        city: item.facility?.address?.city || item.city || "Unknown City",
        state: item.facility?.address?.state || item.state || "",
      }));

      // Sort by date descending initially
      data.sort(
        (a, b) =>
          new Date(b.donationDate || b.date) -
          new Date(a.donationDate || a.date),
      );

      setHistory(data);
      setDonorInfo(profileRes.data.donor || profileRes.data);
      calculateStats(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Failed to load donation history");
      }
    } finally {
      setLoading(false);
    }
  }, []);

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
                .action-bar {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  display: flex;
                  gap: 12px;
                  z-index: 1000;
                }
                .btn {
                  padding: 10px 20px;
                  font-family: 'Outfit', sans-serif;
                  font-weight: 600;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 14px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  transition: transform 0.2s, box-shadow 0.2s;
                }
                .btn:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                }
                .btn-print {
                  background: white;
                  color: #334155;
                  border: 1px solid #e2e8f0;
                }
                .btn-download {
                  background: #dc2626;
                  color: white;
                }
                @media print {
                  .action-bar {
                    display: none !important;
                  }
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
              <div class="action-bar">
                <button onclick="window.print()" class="btn btn-print">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Print
                </button>
                <button onclick="downloadPDF()" class="btn btn-download">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download PDF
                </button>
              </div>
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
              <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
              <script>
                function downloadPDF() {
                  const element = document.querySelector('.certificate-container');
                  const opt = {
                    margin:       0.5,
                    filename:     'LifeDrop_Certificate_${cert.certificateNumber}.pdf',
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2 },
                    jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
                  };
                  html2pdf().set(opt).from(element).save();
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

  const handleDownloadHealthReport = async (donationId) => {
    if (!donationId) {
      toast.error("Donation record ID is missing");
      return;
    }
    const toastId = toast.loading("Generating health report card...");
    try {
      const res = await donorApi.getHealthReport(donationId);
      toast.dismiss(toastId);
      if (res.data && res.data.success) {
        const report = res.data.data;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>Donor Health Report Card - ${report.reportNumber}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap');
                body {
                  font-family: 'Outfit', sans-serif;
                  background-color: #fcfcfc;
                  color: #1e293b;
                  margin: 0;
                  padding: 40px;
                  box-sizing: border-box;
                }
                .report-container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: white;
                  border: 1px solid #e2e8f0;
                  border-radius: 24px;
                  padding: 45px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                  position: relative;
                }
                .header-line {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-bottom: 3px solid #ef4444;
                  padding-bottom: 25px;
                  margin-bottom: 35px;
                }
                .logo-section {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                }
                .logo-icon {
                  width: 42px;
                  height: 42px;
                  background: #ef4444;
                  border-radius: 12px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 24px;
                  font-weight: bold;
                }
                .logo-text h1 {
                  font-size: 22px;
                  font-weight: 900;
                  color: #ef4444;
                  margin: 0;
                  letter-spacing: 1px;
                }
                .logo-text p {
                  font-size: 10px;
                  color: #64748b;
                  margin: 2px 0 0 0;
                  text-transform: uppercase;
                  font-weight: bold;
                  letter-spacing: 0.5px;
                }
                .report-badge {
                  background: #fef2f2;
                  border: 1px solid #fee2e2;
                  color: #ef4444;
                  padding: 8px 16px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 700;
                  text-transform: uppercase;
                }
                .meta-section {
                  display: grid;
                  grid-cols: 2;
                  grid-template-columns: 1fr 1fr;
                  gap: 30px;
                  margin-bottom: 40px;
                  background: #fafafa;
                  padding: 20px 25px;
                  border-radius: 16px;
                }
                .meta-column h3 {
                  font-size: 12px;
                  font-weight: 700;
                  color: #94a3b8;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin: 0 0 12px 0;
                }
                .meta-field {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 8px;
                  font-size: 13px;
                }
                .meta-field span:first-child {
                  color: #64748b;
                }
                .meta-field span:last-child {
                  font-weight: 600;
                  color: #334155;
                }
                .section-title {
                  font-size: 14px;
                  font-weight: 900;
                  color: #1e293b;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin: 35px 0 15px 0;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                .section-title::after {
                  content: '';
                  flex: 1;
                  height: 1px;
                  background: #e2e8f0;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 25px;
                }
                th {
                  background: #f8fafc;
                  text-align: left;
                  padding: 12px 16px;
                  font-size: 11px;
                  font-weight: 700;
                  color: #64748b;
                  text-transform: uppercase;
                  border-bottom: 2px solid #e2e8f0;
                }
                td {
                  padding: 14px 16px;
                  font-size: 13px;
                  border-bottom: 1px solid #f1f5f9;
                }
                .badge-normal {
                  background: #f0fdf4;
                  color: #16a34a;
                  padding: 4px 10px;
                  border-radius: 9999px;
                  font-size: 11px;
                  font-weight: bold;
                  display: inline-block;
                }
                .badge-warning {
                  background: #fffbeb;
                  color: #d97706;
                  padding: 4px 10px;
                  border-radius: 9999px;
                  font-size: 11px;
                  font-weight: bold;
                  display: inline-block;
                }
                .badge-danger {
                  background: #fef2f2;
                  color: #dc2626;
                  padding: 4px 10px;
                  border-radius: 9999px;
                  font-size: 11px;
                  font-weight: bold;
                  display: inline-block;
                }
                .clinical-summary {
                  margin-top: 40px;
                  border-top: 1px solid #e2e8f0;
                  padding-top: 25px;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                }
                .summary-note {
                  max-width: 60%;
                  font-size: 12px;
                  color: #64748b;
                  line-height: 1.6;
                }
                .summary-note strong {
                  color: #334155;
                }
                .signature-block {
                  text-align: right;
                }
                .signature-line {
                  width: 180px;
                  border-bottom: 1px solid #94a3b8;
                  margin-bottom: 8px;
                }
                .signature-title {
                  font-size: 11px;
                  font-weight: 700;
                  color: #334155;
                }
                .signature-subtitle {
                  font-size: 9px;
                  color: #94a3b8;
                  text-transform: uppercase;
                }
                .action-bar {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  display: flex;
                  gap: 12px;
                  z-index: 1000;
                }
                .btn {
                  padding: 10px 20px;
                  font-family: 'Outfit', sans-serif;
                  font-weight: 600;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 14px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  transition: transform 0.2s, box-shadow 0.2s;
                }
                .btn:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                }
                .btn-print {
                  background: white;
                  color: #334155;
                  border: 1px solid #e2e8f0;
                }
                .btn-download {
                  background: #dc2626;
                  color: white;
                }
                @media print {
                  .action-bar {
                    display: none !important;
                  }
                  body {
                    padding: 0;
                    background-color: white;
                  }
                  .report-container {
                    border: none;
                    box-shadow: none;
                    padding: 0;
                  }
                }
              </style>
            </head>
            <body>
              <div class="action-bar">
                <button onclick="window.print()" class="btn btn-print">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Print
                </button>
                <button onclick="downloadPDF()" class="btn btn-download">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download PDF
                </button>
              </div>
              <div class="report-container">
                <div class="header-line">
                  <div class="logo-section">
                    <div class="logo-icon">🩸</div>
                    <div class="logo-text">
                      <h1>LIFEDROP DIAGNOSTICS</h1>
                      <p>Certified Wellness Laboratories</p>
                    </div>
                  </div>
                  <div class="report-badge">Health Card</div>
                </div>

                <div class="meta-section">
                  <div class="meta-column">
                    <h3>Donor Identification</h3>
                    <div class="meta-field">
                      <span>Donor Name:</span>
                      <span>${report.donor.name}</span>
                    </div>
                    <div class="meta-field">
                      <span>Blood Group:</span>
                      <span>${report.donor.bloodGroup}</span>
                    </div>
                    <div class="meta-field">
                      <span>Age / Gender:</span>
                      <span>${report.donor.age} Y / ${report.donor.gender}</span>
                    </div>
                    <div class="meta-field">
                      <span>Weight:</span>
                      <span>${report.donor.weight} kg</span>
                    </div>
                  </div>
                  <div class="meta-column">
                    <h3>Diagnostics Session</h3>
                    <div class="meta-field">
                      <span>Report Ref No:</span>
                      <span>${report.reportNumber}</span>
                    </div>
                    <div class="meta-field">
                      <span>Donation Date:</span>
                      <span>${new Date(report.donation.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div class="meta-field">
                      <span>Testing Center:</span>
                      <span>${report.donation.facilityName}</span>
                    </div>
                    <div class="meta-field">
                      <span>Center Reg No:</span>
                      <span>${report.donation.facilityRegNo}</span>
                    </div>
                  </div>
                </div>

                <div class="section-title">1. Clinical Vital Assessment</div>
                <table>
                  <thead>
                    <tr>
                      <th style="width: 35%;">Parameter Checked</th>
                      <th style="width: 20%;">Observed Value</th>
                      <th style="width: 25%;">Biological Reference</th>
                      <th style="width: 20%;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-weight: 600; color: #334155;">Hemoglobin (Hb)</td>
                      <td style="font-weight: 600;">${report.healthMetrics.hemoglobin} g/dL</td>
                      <td>12.5 - 17.5 g/dL</td>
                      <td>
                        <span class="${report.healthMetrics.hemoglobin >= 12.5 ? 'badge-normal' : 'badge-danger'}">
                          ${report.healthMetrics.hemoglobin >= 12.5 ? 'NORMAL' : 'LOW (DEFICIENCY)'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: #334155;">Blood Pressure (BP)</td>
                      <td style="font-weight: 600;">${report.healthMetrics.bloodPressure} mmHg</td>
                      <td>90/60 - 120/80 mmHg</td>
                      <td>
                        <span class="badge-normal">NORMAL</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: #334155;">Pulse Rate</td>
                      <td style="font-weight: 600;">${report.healthMetrics.pulse} bpm</td>
                      <td>60 - 100 bpm</td>
                      <td>
                        <span class="badge-normal">NORMAL</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: #334155;">Body Temperature</td>
                      <td style="font-weight: 600;">${report.healthMetrics.temperature} °F</td>
                      <td>97.8 - 99.1 °F</td>
                      <td>
                        <span class="badge-normal">NORMAL</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div class="section-title">2. Mandatory Infectious Screening</div>
                <table>
                  <thead>
                    <tr>
                      <th style="width: 50%;">Infectious Disease Tested</th>
                      <th style="width: 30%;">Methodology</th>
                      <th style="width: 20%;">Result Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-weight: 600; color: #334155;">Human Immunodeficiency Virus (HIV I & II)</td>
                      <td>Rapid ELISA Immunoassay</td>
                      <td><span class="${report.screeningResults.hiv ? 'badge-danger' : 'badge-normal'}">${report.screeningResults.hiv ? 'REACTIVE (POSITIVE)' : 'NON-REACTIVE'}</span></td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: #334155;">Hepatitis B Virus (HBsAg)</td>
                      <td>Rapid ELISA Immunoassay</td>
                      <td><span class="${report.screeningResults.hbv ? 'badge-danger' : 'badge-normal'}">${report.screeningResults.hbv ? 'REACTIVE (POSITIVE)' : 'NON-REACTIVE'}</span></td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: #334155;">Hepatitis C Virus (HCV Antibody)</td>
                      <td>Rapid ELISA Immunoassay</td>
                      <td><span class="${report.screeningResults.hcv ? 'badge-danger' : 'badge-normal'}">${report.screeningResults.hcv ? 'REACTIVE (POSITIVE)' : 'NON-REACTIVE'}</span></td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: #334155;">Malaria Parasite (MP Antigen)</td>
                      <td>Microscopy / Blood Smear</td>
                      <td><span class="${report.screeningResults.malaria ? 'badge-danger' : 'badge-normal'}">${report.screeningResults.malaria ? 'REACTIVE (POSITIVE)' : 'NON-REACTIVE'}</span></td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: #334155;">Syphilis (VDRL Test)</td>
                      <td>Rapid Plasma Reagin</td>
                      <td><span class="${report.screeningResults.syphilis ? 'badge-danger' : 'badge-normal'}">${report.screeningResults.syphilis ? 'REACTIVE (POSITIVE)' : 'NON-REACTIVE'}</span></td>
                    </tr>
                  </tbody>
                </table>

                <div class="clinical-summary">
                  <div class="summary-note">
                    <p><strong>Clinical Interpretation & Summary:</strong></p>
                    <p>
                      Based on the laboratory investigations above, the blood bag collected from this donor has been screened and certified <strong>${report.screeningResults.isSafe ? 'SAFE' : 'UNSAFE'}</strong> for clinical and therapeutic transfusion. Vital parameters indicate a normal metabolic status at the time of donation.
                    </p>
                  </div>
                  <div class="signature-block">
                    <div style="height: 45px; display: flex; align-items: flex-end; justify-content: flex-end; margin-bottom: 5px;">
                      <span style="font-family: 'Courier New', monospace; font-style: italic; color: #ef4444; font-weight: bold; border: 2px dashed #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 11px;">DIGITALLY VERIFIED</span>
                    </div>
                    <div class="signature-line"></div>
                    <div class="signature-title">Dr. Anand Verma, MD</div>
                    <div class="signature-subtitle">Chief Medical Pathologist</div>
                  </div>
                </div>
              </div>
              <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
              <script>
                function downloadPDF() {
                  const element = document.querySelector('.report-container');
                  const opt = {
                    margin:       0.5,
                    filename:     'LifeDrop_HealthReport_${report.reportNumber}.pdf',
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2 },
                    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
                  };
                  html2pdf().set(opt).from(element).save();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        toast.error("Failed to generate health report card");
      }
    } catch (err) {
      toast.dismiss(toastId);
      console.error("Health report error:", err);
      toast.error("Failed to fetch health report: " + (err.response?.data?.message || err.message));
    }
  };

  const handleShareAchievement = async (item) => {
    const units = item.quantity || 1;
    const text = `I just donated ${units} unit${units > 1 ? 's' : ''} of blood to save lives via LifeDrop! Join me in making a difference. ❤️🩸 #LifeDrop #DonateBlood`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Blood Donation Achievement',
          text: text,
          url: window.location.origin
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Achievement copied to clipboard! Ready to share.");
      } catch (err) {
        toast.error("Failed to copy to clipboard.", err);
      }
    }
  };

  // Calculate comprehensive statistics
  const calculateStats = (data) => {
    const totalDonations = data.length;
    const totalUnits = data.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
    const lifeImpact = totalUnits * 3;
    const lastDonation =
      data.length > 0 ? data[0].donationDate || data[0].date : null;

    // Blood group distribution
    const bloodGroups = data.reduce((acc, item) => {
      const bg = item.bloodGroup || "Unknown";
      acc[bg] = (acc[bg] || 0) + 1;
      return acc;
    }, {});

    // Yearly breakdown
    const yearlyBreakdown = data.reduce((acc, item) => {
      const year = new Date(item.donationDate || item.date).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    // Find most frequent location (facility or city)
    const locationCount = data.reduce((acc, item) => {
      const location = item.Facility || item.city || "Unknown";
      if (location !== "Unknown") {
        acc[location] = (acc[location] || 0) + 1;
      }
      return acc;
    }, {});

    const favoriteLocation = Object.keys(locationCount).length > 0
      ? Object.keys(locationCount).reduce(
          (a, b) => (locationCount[a] > locationCount[b] ? a : b)
        )
      : "None yet";

    // Calculate average units
    const averageUnits =
      totalDonations > 0 ? (totalUnits / totalDonations).toFixed(1) : 0;

    // Calculate donation streak (consecutive months)
    let streak = 0;
    if (data.length > 0) {
      const sortedDates = [...data]
        .map((item) => new Date(item.donationDate || item.date))
        .sort((a, b) => b - a);

      const today = new Date();
      const lastDonationDate = sortedDates[0];
      
      const monthsSinceLast = (today.getFullYear() - lastDonationDate.getFullYear()) * 12 + 
                              (today.getMonth() - lastDonationDate.getMonth());

      // Active streak if last donation was in current or previous month
      if (monthsSinceLast <= 1) {
        streak = 1;
        // Check consecutive months
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = sortedDates[i - 1];
          const currDate = sortedDates[i];
          const monthDiff =
            (prevDate.getFullYear() - currDate.getFullYear()) * 12 +
            (prevDate.getMonth() - currDate.getMonth());

          if (monthDiff === 1) {
            streak++;
          } else if (monthDiff > 1) {
            break;
          }
        }
      }
    }

    setStats({
      totalDonations,
      totalUnits,
      lifeImpact,
      lastDonation,
      favoriteLocation,
      bloodGroups,
      yearlyBreakdown,
      averageUnits,
      donationStreak: streak,
    });
  };

  // Get donor level based on donations
  const donorLevel = useMemo(() => {
    const count = stats.totalDonations;
    if (count >= 20) {
      return {
        level: "Legend",
        color: "from-yellow-500 to-red-500",
        icon: <Award className="w-5 h-5" />,
        nextMilestone: null,
        progress: 100,
      };
    }
    if (count >= 10) {
      return {
        level: "Hero",
        color: "from-purple-500 to-pink-500",
        icon: <Award className="w-5 h-5" />,
        nextMilestone: 20,
        progress: (count / 20) * 100,
      };
    }
    if (count >= 5) {
      return {
        level: "Champion",
        color: "from-red-500 to-orange-500",
        icon: <Star className="w-5 h-5" />,
        nextMilestone: 10,
        progress: (count / 10) * 100,
      };
    }
    if (count >= 3) {
      return {
        level: "Supporter",
        color: "from-green-500 to-teal-500",
        icon: <TrendingUp className="w-5 h-5" />,
        nextMilestone: 5,
        progress: (count / 5) * 100,
      };
    }
    return {
      level: "Starter",
      color: "from-blue-500 to-cyan-500",
      icon: <Heart className="w-5 h-5" />,
      nextMilestone: 3,
      progress: count > 0 ? (count / 3) * 100 : 0,
    };
  }, [stats.totalDonations]);

  // Filter and sort data
  const applyFilter = useCallback(() => {
    let filteredData = [...history];

    // Time filter
    if (filterType !== "all") {
      const months = {
        last3: 3,
        last6: 6,
        last12: 12,
        last24: 24,
      }[filterType];

      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - months);

      filteredData = filteredData.filter((item) => {
        const donationDate = new Date(item.donationDate || item.date);
        return donationDate >= cutoff;
      });
    }

    // Blood group filter
    if (bloodGroupFilter !== "all") {
      filteredData = filteredData.filter(
        (item) => item.bloodGroup === bloodGroupFilter,
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.Facility?.toLowerCase().includes(term) ||
          item.bloodGroup?.toLowerCase().includes(term) ||
          item.city?.toLowerCase().includes(term) ||
          item.state?.toLowerCase().includes(term) ||
          new Date(item.donationDate || item.date)
            .toLocaleDateString()
            .includes(term),
      );
    }

    // Sort data
    filteredData.sort((a, b) => {
      const dateA = new Date(a.donationDate || a.date);
      const dateB = new Date(b.donationDate || b.date);

      switch (sortBy) {
        case "date-asc":
          return dateA - dateB;
        case "date-desc":
          return dateB - dateA;
        case "units-desc":
          return (b.quantity || 1) - (a.quantity || 1);
        case "units-asc":
          return (a.quantity || 1) - (b.quantity || 1);
        default:
          return dateB - dateA;
      }
    });

    setFiltered(filteredData);
  }, [history, searchTerm, filterType, sortBy, bloodGroupFilter]);

  // Export to CSV with more details
  const exportToCSV = useCallback(() => {
    const headers = [
      "Date",
      "Day",
      "Time",
      "Location",
      "City",
      "State",
      "Blood Group",
      "Units",
      "Status",
      "Donation Type",
      "Certificate ID",
    ];

    const csvData = filtered.map((item) => {
      const date = new Date(item.donationDate || item.date);
      return [
        date.toLocaleDateString(),
        date.toLocaleDateString("en-US", { weekday: "long" }),
        date.toLocaleTimeString(),
        item.Facility || "Blood Donation Camp",
        item.city || "N/A",
        item.state || "N/A",
        item.bloodGroup || "N/A",
        item.quantity || 1,
        "Completed",
        item.donationType || "Regular",
        item.certificateId || `DON-${date.getTime()}`,
      ].join(",");
    });

    const csv = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `donation-history-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${filtered.length} records exported successfully!`);
  }, [filtered]);

  // Share donation stats
  const shareStats = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: "My Blood Donation Journey",
          text: `I've donated ${stats.totalUnits} units of blood, impacting ${stats.lifeImpact}+ lives! 🩸`,
          url: window.location.href,
        })
        .catch(() => {
          // Fallback if user cancels
        });
    } else {
      // Fallback for browsers that don't support share
      navigator.clipboard.writeText(
        `I've donated ${stats.totalUnits} units of blood, impacting ${stats.lifeImpact}+ lives! 🩸`,
      );
      toast.success("Stats copied to clipboard!");
    }
  }, [stats]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  // Toggle card expansion
  const toggleExpand = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
    // Reset journey if parent card is collapsed
    if (expandedCard === index) {
      setActiveJourneyId(null);
      setJourneyData(null);
    }
  };

  const handleTrackJourney = async (donationId) => {
    if (activeJourneyId === donationId) {
      setActiveJourneyId(null);
      setJourneyData(null);
      return;
    }
    
    setActiveJourneyId(donationId);
    setLoadingJourney(true);
    setJourneyData(null);
    
    try {
      const res = await donorApi.getDonationJourney(donationId);
      if (res.data && res.data.success) {
        setJourneyData(res.data.stages);
      } else {
        toast.error("Failed to load journey tracking data");
      }
    } catch (err) {
      console.error("Journey fetch error:", err);
      toast.error("Failed to fetch donation journey details");
    } finally {
      setLoadingJourney(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-16 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Donor Info */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-600 rounded-2xl shadow-lg">
                <Droplet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Donation History
                </h1>
                {donorInfo && (
                  <p className="text-gray-600 mt-1">
                    Welcome back,{" "}
                    <span className="font-semibold text-red-600">
                      {donorInfo.name}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={shareStats}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Share2 className="w-5 h-5 text-red-600" />
              <span>Share Impact</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-red-400 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Donations
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalDonations}
                </p>
                {stats.yearlyBreakdown[new Date().getFullYear()] > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    +{stats.yearlyBreakdown[new Date().getFullYear()]} this year
                  </p>
                )}
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <Droplet className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-green-400 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Units Donated
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalUnits}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg {stats.averageUnits} per donation
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-blue-400 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Lives Impacted
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.lifeImpact}+
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Each unit saves 3 lives
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-purple-400 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Level</p>
                <p className="text-2xl font-bold text-gray-900">
                  {donorLevel.level}
                </p>
                {donorLevel.nextMilestone && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.totalDonations}/{donorLevel.nextMilestone} to next
                  </p>
                )}
              </div>
              <div
                className={`p-3 bg-gradient-to-r ${donorLevel.color} rounded-xl text-white`}
              >
                {donorLevel.icon}
              </div>
            </div>
            {/* Progress bar for next level */}
            {donorLevel.nextMilestone && (
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${donorLevel.color}`}
                    style={{ width: `${donorLevel.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Donation Streak</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.donationStreak}{" "}
                {stats.donationStreak === 1 ? "month" : "months"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Favorite Location</p>
              <p className="text-xl font-bold text-gray-900 truncate max-w-[150px]">
                {stats.favoriteLocation}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Donation</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.lastDonation
                  ? new Date(stats.lastDonation).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "None"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5 mb-6">
          <div className="flex flex-col gap-4">
            {/* Main Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by date, location, blood group..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="units-desc">Most Units ↓</option>
                  <option value="units-asc">Least Units ↑</option>
                </select>

                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Period
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full border border-gray-300 bg-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="all">All Time</option>
                      <option value="last3">Last 3 Months</option>
                      <option value="last6">Last 6 Months</option>
                      <option value="last12">Last 12 Months</option>
                      <option value="last24">Last 24 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroupFilter}
                      onChange={(e) => setBloodGroupFilter(e.target.value)}
                      className="w-full border border-gray-300 bg-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg === "all" ? "All Blood Groups" : bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {history.length === 0
                  ? "No Donations Yet"
                  : "No Matching Records"}
              </h3>
              <p className="text-gray-600 mb-6">
                {history.length === 0
                  ? "Start your life-saving journey by making your first blood donation."
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              {history.length === 0 && (
                <button
                  onClick={() => navigate("/donor/camps")}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  Schedule Your First Donation
                </button>
              )}
            </div>
          </div>
        )}

        {/* Donation History Cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/60 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-slate-100/50 mb-2">
              <p className="text-sm font-medium text-slate-600">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {filtered.length}
                </span>{" "}
                donation{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                  <Droplet className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Total Units:{" "}
                  <span className="text-red-600 font-bold ml-1">
                    {filtered.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {filtered.map((item, index) => {
                const date = new Date(item.donationDate || item.date);
                const isRecent = new Date() - date < 30 * 24 * 60 * 60 * 1000;
                const isExpanded = expandedCard === index;

                return (
                  <div
                    key={item._id || index}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-red-200 hover:shadow-md transition-all duration-300 overflow-hidden relative group"
                  >
                    {/* Decorative subtle top border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Main Card Content */}
                    <div
                      className="p-5 sm:p-6 cursor-pointer"
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Icon Box */}
                          <div
                            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl ${
                              isRecent
                                ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-emerald-200 shadow-sm"
                                : "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-blue-200 shadow-sm"
                            }`}
                          >
                            <Droplet className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Title & Badges */}
                            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                              <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                                {item.bloodGroup || "Blood"} Donation
                              </h3>
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold tracking-wide uppercase">
                                Completed
                              </span>
                              {isRecent && (
                                <span className="px-2.5 py-0.5 bg-sky-50 text-sky-600 border border-sky-100 rounded-lg text-xs font-bold tracking-wide uppercase">
                                  Recent
                                </span>
                              )}
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-600">
                                  {date.toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-600 truncate max-w-[200px] sm:max-w-xs">
                                  {item.Facility ? item.Facility : (item.city || "Unknown Location")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Units & Chevron */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4 sm:border-l border-slate-100 mt-2 sm:mt-0">
                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest sm:hidden">Units</span>
                            <div className="text-2xl font-black text-slate-800">
                              {item.quantity || 1}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Units</div>
                          </div>
                          <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-slate-100 text-slate-600' : 'bg-transparent text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-600'}`}>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="bg-slate-50/50 border-t border-slate-100 p-5 sm:p-6 animate-in slide-in-from-top-2 duration-200">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Detailed Overview
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {item.Facility && (
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                <User className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Facility</span>
                              </div>
                              <div className="text-sm font-semibold text-slate-800 truncate" title={item.Facility}>
                                {item.Facility}
                              </div>
                            </div>
                          )}

                          {item.city && (
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">City</span>
                              </div>
                              <div className="text-sm font-semibold text-slate-800 truncate" title={`${item.city}${item.state ? `, ${item.state}` : ''}`}>
                                {item.city}{item.state && `, ${item.state}`}
                              </div>
                            </div>
                          )}

                          {item.bloodGroup && (
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                <Droplet className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Group</span>
                              </div>
                              <div className="text-sm font-semibold text-slate-800">
                                {item.bloodGroup}
                              </div>
                            </div>
                          )}

                          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-1.5 text-emerald-600/70 mb-1">
                              <Heart className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Lives Impacted</span>
                            </div>
                            <div className="text-sm font-bold text-emerald-700">
                              {(item.quantity || 1) * 3} People
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions Panel */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            Quick Actions
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button
                              onClick={() => handleDownloadCertificate(item._id || item.id)}
                              className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all text-slate-600 shadow-sm hover:shadow group"
                            >
                              <Download className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                              <span className="text-xs font-bold">Certificate</span>
                            </button>
                            
                            <button
                              onClick={() => handleTrackJourney(item._id || item.id)}
                              className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border transition-all shadow-sm hover:shadow group ${activeJourneyId === (item._id || item.id) ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-600'}`}
                            >
                              <Activity className={`w-5 h-5 transition-colors ${activeJourneyId === (item._id || item.id) ? 'text-white' : 'text-slate-400 group-hover:text-red-500'}`} /> 
                              <span className="text-xs font-bold">{activeJourneyId === (item._id || item.id) ? "Hide Journey" : "Track Journey"}</span>
                            </button>

                            <button
                              onClick={() => handleDownloadHealthReport(item._id || item.id)}
                              className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all text-slate-600 shadow-sm hover:shadow group"
                            >
                              <FileText className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                              <span className="text-xs font-bold">Health Report</span>
                            </button>

                            <button 
                              onClick={() => handleShareAchievement(item)}
                              className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all text-slate-600 shadow-sm hover:shadow group"
                            >
                              <Share2 className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                              <span className="text-xs font-bold">Share</span>
                            </button>
                            
                            <button 
                              onClick={() => togglePanel(item._id || item.id, 'rate')}
                              className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border transition-all shadow-sm hover:shadow group ${activePanel.id === (item._id || item.id) && activePanel.type === 'rate' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 text-slate-600'}`}
                            >
                              <Star className={`w-5 h-5 transition-colors ${activePanel.id === (item._id || item.id) && activePanel.type === 'rate' ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'}`} />
                              <span className="text-xs font-bold">Rate Camp</span>
                            </button>

                            <button 
                              onClick={() => togglePanel(item._id || item.id, 'photos')}
                              className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border transition-all shadow-sm hover:shadow group ${activePanel.id === (item._id || item.id) && activePanel.type === 'photos' ? 'bg-sky-50 border-sky-300 text-sky-700' : 'border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 text-slate-600'}`}
                            >
                              <ImageIcon className={`w-5 h-5 transition-colors ${activePanel.id === (item._id || item.id) && activePanel.type === 'photos' ? 'text-sky-500' : 'text-slate-400 group-hover:text-sky-500'}`} />
                              <span className="text-xs font-bold">Photos</span>
                            </button>

                            <button 
                              onClick={() => togglePanel(item._id || item.id, 'eligibility')}
                              className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border transition-all shadow-sm hover:shadow group ${activePanel.id === (item._id || item.id) && activePanel.type === 'eligibility' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-slate-600'}`}
                            >
                              <CalendarCheck className={`w-5 h-5 transition-colors ${activePanel.id === (item._id || item.id) && activePanel.type === 'eligibility' ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                              <span className="text-xs font-bold">Eligibility</span>
                            </button>

                            <button 
                              onClick={() => togglePanel(item._id || item.id, 'report')}
                              className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border transition-all shadow-sm hover:shadow group ${activePanel.id === (item._id || item.id) && activePanel.type === 'report' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600'}`}
                            >
                              <AlertCircle className={`w-5 h-5 transition-colors ${activePanel.id === (item._id || item.id) && activePanel.type === 'report' ? 'text-rose-500' : 'text-slate-400 group-hover:text-rose-500'}`} />
                              <span className="text-xs font-bold">Report Issue</span>
                            </button>
                          </div>
                        </div>

                        {/* Journey Tracking Panel */}
                        {activeJourneyId === (item._id || item.id) && (
                          <>
                            {loadingJourney ? (
                              <div className="mt-6 p-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 bg-red-50/5 rounded-2xl">
                                <Loader className="w-5 h-5 animate-spin text-red-600" />
                                <span className="text-xs font-semibold">Connecting to live blood track network...</span>
                              </div>
                            ) : journeyData ? (
                              <div className="mt-6 p-6 border-t border-slate-100 bg-red-50/5 rounded-2xl animate-in fade-in duration-200">
                                <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-1.5">
                                  <Activity className="w-4 h-4 text-red-600" />
                                  Live Donation Journey
                                </h4>
                                <div className="relative pl-1 border-l-2 border-slate-200 ml-4 space-y-8">
                                  {journeyData.map((stage) => {
                                    const isCompleted = stage.status === "completed";
                                    const isFailed = stage.status === "failed";
                                    const isCancelled = stage.status === "cancelled";
                                    const isInProgress = stage.status === "in-progress";

                                    // Circle colors
                                    const circleColor = isCompleted 
                                      ? "bg-green-500 text-white shadow-green-100"
                                      : isFailed
                                      ? "bg-rose-500 text-white shadow-rose-100"
                                      : isCancelled
                                      ? "bg-slate-300 text-white"
                                      : isInProgress
                                      ? "bg-blue-600 text-white animate-pulse shadow-blue-100"
                                      : "bg-slate-100 text-slate-400";

                                    // Get Lucide Icon dynamically
                                    const getStageIcon = (id) => {
                                      switch (id) {
                                        case "donated": return <Droplet className="w-4 h-4 animate-in fade-in" />;
                                        case "screened": return <Shield className="w-4 h-4" />;
                                        case "component": return <Activity className="w-4 h-4" />;
                                        case "dispatched": return <MapPin className="w-4 h-4" />;
                                        case "transfused": return <Heart className="w-4 h-4" />;
                                        default: return <Droplet className="w-4 h-4" />;
                                      }
                                    };

                                    return (
                                      <div key={stage.id} className="relative pl-8">
                                        {/* Timeline marker node */}
                                        <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-4 border-white ${circleColor}`}>
                                          {getStageIcon(stage.id)}
                                        </div>

                                        {/* Stage content */}
                                        <div>
                                          <div className="flex flex-wrap items-baseline gap-2">
                                            <h5 className="font-bold text-slate-800 text-sm">
                                              {stage.title}
                                            </h5>
                                            {stage.date && (
                                              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                                {stage.date} {stage.time && `• ${stage.time}`}
                                              </span>
                                            )}
                                            {isInProgress && (
                                              <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider">
                                                In Progress
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            {stage.description}
                                          </p>
                                          {stage.location && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-1">
                                              <MapPin className="w-3 h-3 text-red-500" />
                                              {stage.location}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </>
                        )}

                        {/* Advanced Action Panels */}
                        {activePanel.id === (item._id || item.id) && (
                          <div className="mt-6 p-6 border border-slate-100 bg-white rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                            
                            {/* Rate Experience Panel */}
                            {activePanel.type === 'rate' && (
                              <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                  Rate Your Experience at {item.Facility || "the camp"}
                                </h4>
                                <form onSubmit={handleRateSubmit} className="space-y-4 max-w-md">
                                  <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => setRating(star)}
                                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                                      >
                                        <Star 
                                          className={`w-8 h-8 ${star <= (hoveredStar || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                                        />
                                      </button>
                                    ))}
                                  </div>
                                  <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Tell us about your donation experience... (Optional)"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none resize-none"
                                    rows="3"
                                  ></textarea>
                                  <button
                                    type="submit"
                                    disabled={rating === 0}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
                                  >
                                    Submit Feedback
                                  </button>
                                </form>
                              </div>
                            )}

                            {/* View Photos Panel */}
                            {activePanel.type === 'photos' && (
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-sky-500" />
                                    Donation Day Memories
                                  </h4>
                                  <button className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 flex items-center gap-1.5">
                                    <Camera className="w-3.5 h-3.5" /> Add Photo
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  <div className="aspect-square bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <Camera className="w-8 h-8 group-hover:text-sky-500 transition-colors" />
                                    <span className="text-[10px] font-semibold uppercase tracking-wider">No photos yet</span>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5" /> Photos are private and only visible to you.
                                </p>
                              </div>
                            )}

                            {/* Next Eligibility Panel */}
                            {activePanel.type === 'eligibility' && (() => {
                              const donDate = new Date(item.donationDate || item.date);
                              const nextDate = new Date(donDate.getTime() + 90 * 24 * 60 * 60 * 1000);
                              const today = new Date();
                              const diffTime = nextDate - today;
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              const isEligible = diffDays <= 0;

                              return (
                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                  <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 ${isEligible ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-amber-400 bg-amber-50 text-amber-600'}`}>
                                    <span className="text-2xl font-black">{isEligible ? 'NOW' : diffDays}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{isEligible ? 'Eligible' : 'Days Left'}</span>
                                  </div>
                                  <div className="flex-1 text-center sm:text-left">
                                    <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center justify-center sm:justify-start gap-2">
                                      <CalendarCheck className={`w-4 h-4 ${isEligible ? 'text-emerald-500' : 'text-amber-500'}`} />
                                      {isEligible ? "You are eligible to donate again!" : "Next Donation Eligibility"}
                                    </h4>
                                    <p className="text-sm text-slate-600 mb-3">
                                      Based on your donation on <span className="font-semibold text-slate-800">{donDate.toLocaleDateString()}</span>, you {isEligible ? 'can now safely' : 'must wait 90 days to safely'} donate whole blood again.
                                    </p>
                                    <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
                                      <Calendar className="w-4 h-4 text-slate-400" />
                                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Eligible Date:</span>
                                      <span className="text-sm font-bold text-slate-800">{nextDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Report Issue Panel */}
                            {activePanel.type === 'report' && (
                              <div>
                                <h4 className="text-sm font-bold text-rose-600 mb-2 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Report Post-Donation Issue
                                </h4>
                                <p className="text-xs text-slate-500 mb-4 max-w-xl">
                                  If you experienced any health issues after this donation, please let us know so we can improve our care and follow up with you if necessary. In case of emergency, please seek medical help immediately.
                                </p>
                                <form onSubmit={handleReportSubmit} className="space-y-4 max-w-xl">
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {['dizziness', 'bruising', 'nausea', 'fainting', 'other'].map((symptom) => (
                                      <label key={symptom} className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer transition-colors ${reportSymptoms[symptom] ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                        <input 
                                          type="checkbox" 
                                          className="w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-500"
                                          checked={reportSymptoms[symptom]}
                                          onChange={(e) => setReportSymptoms({...reportSymptoms, [symptom]: e.target.checked})}
                                        />
                                        <span className="text-sm font-semibold capitalize">{symptom}</span>
                                      </label>
                                    ))}
                                  </div>
                                  <textarea
                                    value={reportNotes}
                                    onChange={(e) => setReportNotes(e.target.value)}
                                    placeholder="Please provide any additional details..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none resize-none"
                                    rows="2"
                                  ></textarea>
                                  <button
                                    type="submit"
                                    disabled={!Object.values(reportSymptoms).some(Boolean) && !reportNotes}
                                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                                  >
                                    <Send className="w-3.5 h-3.5" /> Submit Report
                                  </button>
                                </form>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDonationHistory;
