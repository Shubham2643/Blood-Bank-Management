import axios from "axios";
import { API_BASE_URL } from "../config/env.js";
import {
  getAuthToken,
  removeAuthToken,
  isTokenValid,
} from "../utils/auth";

export { API_BASE_URL };

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && isTokenValid()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  googleAuth: (idToken) => api.post("/auth/google", { idToken }),
  completeGoogleRegistration: (data) =>
    api.post("/auth/google/complete", data),
  getProfile: () => api.get("/auth/profile"),
  verify: () => api.get("/auth/verify"),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (email) => api.post("/forgot-password", { email }),
};

export const donorApi = {
  getProfile: () => api.get("/donor/profile"),
  updateProfile: (data) => api.put("/donor/profile", data),
  getHistory: () => api.get("/donor/history"),
  getStats: () => api.get("/donor/stats"),
  getCamps: () => api.get("/donor/camps"),
  registerForCamp: (id) => api.post(`/donor/camps/${id}/register`),
  simulateCampDonation: (id) => api.post(`/donor/camps/${id}/simulate-donation`),
  getCertificate: (donationId) => api.get(`/donor/certificate/${donationId}`),
  getDonationJourney: (donationId) => api.get(`/donor/donation/${donationId}/journey`),
  getHealthReport: (donationId) => api.get(`/donor/health-report/${donationId}`),
};

export const hospitalApi = {
  getDashboard: () => api.get("/hospital/dashboard"),
  getStock: () => api.get("/hospital/blood/stock"),
  getRequests: (params) => api.get("/hospital/blood/requests", { params }),
  createRequest: (data) => api.post("/hospital/blood/request", data),
  getDonors: (params) => api.get("/hospital/donors", { params }),
  contactDonor: (id) => api.post(`/hospital/donors/${id}/contact`),
  createDonor: (data) => api.post("/hospital/donors", data),
  updateDonor: (id, data) => api.put(`/hospital/donors/${id}`, data),
  deleteDonor: (id) => api.delete(`/hospital/donors/${id}`),
};

export const bloodLabApi = {
  getDashboard: () => api.get("/blood-lab/dashboard"),
  getHistory: () => api.get("/blood-lab/history"),
  getStock: () => api.get("/blood-lab/blood/stock"),
  addStock: (data) => api.post("/blood-lab/blood/add", data),
  removeStock: (data) => api.post("/blood-lab/blood/remove", data),
  getCamps: () => api.get("/blood-lab/camps"),
  createCamp: (data) => api.post("/blood-lab/camps", data),
  updateCamp: (id, data) => api.put(`/blood-lab/camps/${id}`, data),
  updateCampStatus: (id, data) => api.patch(`/blood-lab/camps/${id}/status`, data),
  deleteCamp: (id) => api.delete(`/blood-lab/camps/${id}`),
  getRequests: () => api.get("/blood-lab/blood/requests"),
  updateRequest: (id, data) => api.put(`/blood-lab/blood/requests/${id}`, data),
  searchDonors: (term) => api.get("/blood-lab/donors/search", { params: { term } }),
  markDonation: (id, data) => api.post(`/blood-lab/donors/donate/${id}`, data),
  getRecentDonations: () => api.get("/blood-lab/donations/recent"),
  getLabs: () => api.get("/blood-lab/labs"),
  // e-Raktkosh testing & camp registrations workflow
  getPendingBags: () => api.get("/blood-lab/blood/pending-testing"),
  submitTestResults: (data) => api.post("/blood-lab/blood/submit-test", data),
  splitWholeBlood: (data) => api.post("/blood-lab/blood/split-bag", data),
  getCampRegistrations: (id) => api.get(`/blood-lab/camps/${id}/registrations`),
  recordDonationVitals: (id, data) => api.post(`/blood-lab/camps/${id}/record-donation`, data),
};

export const facilityApi = {
  getProfile: () => api.get("/facility/profile"),
  updateProfile: (data) => api.put("/facility/profile", data),
  getLabs: () => api.get("/facility/labs"),
};

export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),
  getFacilities: () => api.get("/admin/facilities"),
  getDonors: () => api.get("/admin/donors"),
  approveFacility: (id) => api.put(`/admin/facility/approve/${id}`),
  rejectFacility: (id, data) => api.put(`/admin/facility/reject/${id}`, data),
  getContactMessages: () => api.get("/admin/contact-messages"),
  replyToContactMessage: (id, data) =>
    api.post(`/admin/contact-messages/${id}/reply`, data),
};

export const publicApi = {
  getStats: () => api.get("/public/stats"),
  getEmergencyNeeds: () => api.get("/public/emergency-needs"),
  getUpcomingCamps: (params) => api.get("/public/camps/upcoming", { params }),
  getNearbyCamps: (params) => api.get("/public/camps/nearby", { params }),
  subscribeNewsletter: (email) => api.post("/public/newsletter", { email }),
  // Blood requests
  getBloodRequests: (params) => api.get("/public/blood-requests", { params }),
  postBloodRequest: (data) => api.post("/public/blood-requests", data),
  respondToBloodRequest: (id, data) => api.post(`/public/blood-requests/${id}/respond`, data),
  // Central Live Stock Directory
  getCentralStock: (params) => api.get("/public/blood-stock", { params }),
  postContactMessage: (data) => api.post("/public/contact", data),
};

export const newsApi = {
  getAll: (params) => api.get("/news", { params }),
  getById: (id) => api.get(`/news/${id}`),
  getCategories: () => api.get("/news/categories"),
  getBreaking: () => api.get("/news/breaking"),
};

export const blogApi = {
  getAll: (params) => api.get("/blog", { params }),
  getById: (id) => api.get(`/blog/${id}`),
  getCategories: () => api.get("/blog/categories"),
  getPopular: () => api.get("/blog/popular"),
};

export const userApi = {
  exportData: (format) => api.get("/user/export-data", { params: { format } }),
  deleteData: () => api.delete("/user/delete-data"),
};

export const notificationApi = {
  getNotifications: () => api.get("/user/notifications"),
  markAsRead: (id) => api.put(`/user/notifications/${id}/read`),
  markAllAsRead: () => api.put("/user/notifications/read-all"),
};

export default api;
