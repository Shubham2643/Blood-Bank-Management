import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/auth/Login";
import LandingPage from "./pages/Landing";
import DonorRegister from "./pages/auth/DonorRegister";
import DonorDashboard from "./pages/donor/DonorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";
import DonorProfile from "./pages/donor/DonorProfile";
import FacilityRegister from "./pages/auth/FacilityRegister";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFacilities from "./pages/admin/AdminFacilities";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import BloodCamps from "./pages/bloodlab/BloodCamps";
import BloodlabDashboard from "./pages/bloodlab/BloodlabDashboard";
import BloodStock from "./pages/bloodlab/BloodStock";
import LabProfile from "./pages/bloodlab/LabProfile";
import GetAllFacilities from "./pages/admin/GetAllFacilities";
import GetAllDonors from "./pages/admin/GetAllDonors";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBloodInventory from "./pages/admin/AdminBloodInventory";
import AdminBloodRequests from "./pages/admin/AdminBloodRequests";
import AdminCamps from "./pages/admin/AdminCamps";
import AdminReports from "./pages/admin/AdminReports";
import AdminContactMessages from "./pages/admin/AdminContactMessages";
import DonorCampsList from "./pages/donor/DonorCampsList";
import LabManageRequests from "./pages/bloodlab/LabManageRequests";
import HospitalRequestBlood from "./pages/hospital/HospitalRequestBlood";
import HospitalRequestHistory from "./pages/hospital/HospitalRequestHistory";
import HospitalBloodStock from "./pages/hospital/HospitalBloodStock";
import BloodLabDonor from "./pages/bloodlab/BloodLabDonor";
import DonorDirectory from "./pages/hospital/DonorDirectory";
import About from "./components/about/About";
import Contact from "./components/contact/Contact";
import DonorDonationHistory from "./pages/donor/DonorDonationHistory";
import Register from "./pages/auth/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import { NotificationProvider } from "./context/NotificationContext";
import News from "./pages/footer/News";
import Blog from "./pages/footer/Blog";
import Privacy from "./pages/footer/Privacy";
import Terms from "./pages/footer/Terms";
import Cookies from "./pages/footer/Cookies";
import Sitemap from "./pages/footer/Sitemap";
import SuccessStories from "./pages/footer/SuccessStories";
import EligibilityCriteria from "./pages/footer/EligibilityCriteria";
import DonationProcess from "./pages/footer/DonationProcess";
import DonorBenefits from "./pages/footer/DonorBenefits";
import FindCamps from "./pages/footer/FindCamps";
import BloodRequest from "./pages/footer/BloodRequest";
import InventoryManagement from "./pages/footer/InventoryManagement";
import EmergencyProtocol from "./pages/footer/EmergencyProtocol";
import FAQs from "./pages/footer/FAQs";
import PartnerWithUs from "./pages/footer/PartnerWithUs";
import GoogleCompleteProfile from "./pages/auth/GoogleCompleteProfile";
import CentralStockDirectory from "./pages/public/CentralStockDirectory";
import BloodTestingAndComponents from "./pages/bloodlab/BloodTestingAndComponents";
import CampDonationsManager from "./pages/bloodlab/CampDonationsManager";
import DonorCertificates from "./pages/donor/DonorCertificates";

function App() {
  return (
    <NotificationProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register/donor" element={<DonorRegister />} />
        <Route path="/register/facility" element={<FacilityRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/auth/google/complete"
          element={<GoogleCompleteProfile />}
        />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<News />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/success" element={<SuccessStories />} />
        <Route path="/eligibility" element={<EligibilityCriteria />} />
        <Route path="/donation-process" element={<DonationProcess />} />
        <Route path="/donor-benefits" element={<DonorBenefits />} />
        <Route path="/camps" element={<FindCamps />} />
        <Route path="/partner-with-us" element={<PartnerWithUs />} />
        <Route path="/blood-request" element={<BloodRequest />} />
        <Route path="/inventory-management" element={<InventoryManagement />} />
        <Route path="/emergency-protocol" element={<EmergencyProtocol />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/stock-search" element={<CentralStockDirectory />} />

        {/* Donor Routes */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute requiredRole="donor">
              <DashboardLayout userRole="donor" />
            </ProtectedRoute>
          }
        >
          <Route index element={<DonorDashboard />} />
          <Route path="profile" element={<DonorProfile />} />
          <Route path="camps" element={<DonorCampsList />} />
          <Route path="history" element={<DonorDonationHistory />} />
          <Route path="certificates" element={<DonorCertificates />} />
        </Route>

        {/* Hospital Routes */}
        <Route
          path="/hospital"
          element={
            <ProtectedRoute requiredRole="hospital">
              <DashboardLayout userRole="hospital" />
            </ProtectedRoute>
          }
        >
          <Route index element={<HospitalDashboard />} />
          <Route
            path="blood-request-create"
            element={<HospitalRequestBlood />}
          />
          <Route
            path="blood-request-history"
            element={<HospitalRequestHistory />}
          />
          <Route path="inventory" element={<HospitalBloodStock />} />
          <Route path="donors" element={<DonorDirectory />} />
          <Route path="profile" element={<LabProfile />} />
        </Route>

        {/* Blood Lab Routes */}
        <Route
          path="/lab"
          element={
            <ProtectedRoute requiredRole="blood-lab">
              <DashboardLayout userRole="blood-lab" />
            </ProtectedRoute>
          }
        >
          <Route index element={<BloodlabDashboard />} />
          <Route path="inventory" element={<BloodStock />} />
          <Route path="camps" element={<BloodCamps />} />
          <Route path="profile" element={<LabProfile />} />
          <Route path="requests" element={<LabManageRequests />} />
          <Route path="donor" element={<BloodLabDonor />} />
          <Route path="testing" element={<BloodTestingAndComponents />} />
          <Route path="camp-donations" element={<CampDonationsManager />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout userRole="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="verification" element={<AdminFacilities />} />
          <Route path="donors" element={<GetAllDonors />} />
          <Route path="facilities" element={<GetAllFacilities />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="blood-inventory" element={<AdminBloodInventory />} />
          <Route path="blood-requests" element={<AdminBloodRequests />} />
          <Route path="camps" element={<AdminCamps />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="messages" element={<AdminContactMessages />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NotificationProvider>
  );
}

export default App;
