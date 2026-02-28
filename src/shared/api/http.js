// Axios
import axios from "axios";

// API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4040";

// Create an Axios instance
const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default http;

// ============ API Modules ============

export const authAPI = {
  login: (data) => http.post("/api/auth/admin/login", data),
  getMe: () => http.get("/api/auth/me"),
};

export const adminsAPI = {
  getAll: () => http.get("/api/admins"),
  getById: (id) => http.get(`/api/admins/${id}`),
  create: (data) => http.post("/api/admins", data),
  update: (id, data) => http.put(`/api/admins/${id}`, data),
  delete: (id) => http.delete(`/api/admins/${id}`),
  setRegion: (id, data) => http.put(`/api/admins/${id}/region`, data),
  updatePermissions: (id, data) => http.put(`/api/admins/${id}/permissions`, data),
};

export const regionsAPI = {
  getAll: (params) => http.get("/api/regions", { params }),
  getById: (id) => http.get(`/api/regions/${id}`),
  create: (data) => http.post("/api/regions", data),
  update: (id, data) => http.put(`/api/regions/${id}`, data),
  delete: (id) => http.delete(`/api/regions/${id}`),
};

export const requestsAPI = {
  getAll: (params) => http.get("/api/requests", { params }),
  getStats: (params) => http.get("/api/requests/stats", { params }),
  updateStatus: (id, data) => http.put(`/api/requests/${id}/status`, data),
};

export const requestTypesAPI = {
  getAll: () => http.get("/api/request-types"),
  create: (data) => http.post("/api/request-types", data),
  update: (id, data) => http.put(`/api/request-types/${id}`, data),
  delete: (id) => http.delete(`/api/request-types/${id}`),
};

export const servicesAPI = {
  getAll: () => http.get("/api/services"),
  create: (data) => http.post("/api/services", data),
  update: (id, data) => http.put(`/api/services/${id}`, data),
  delete: (id) => http.delete(`/api/services/${id}`),
};

export const serviceReportsAPI = {
  getAll: (params) => http.get("/api/service-reports", { params }),
  updateStatus: (id, data) => http.put(`/api/service-reports/${id}/status`, data),
  getStats: (params) => http.get("/api/service-reports/stats", { params }),
};

export const mskAPI = {
  getCategories: () => http.get("/api/msk/categories"),
  createCategory: (data) => http.post("/api/msk/categories", data),
  updateCategory: (id, data) => http.put(`/api/msk/categories/${id}`, data),
  deleteCategory: (id) => http.delete(`/api/msk/categories/${id}`),
  getAllOrders: (params) => http.get("/api/msk/orders", { params }),
  updateOrderStatus: (id, data) => http.put(`/api/msk/orders/${id}/status`, data),
};

export const statsAPI = {
  getDashboard: () => http.get("/api/stats/dashboard"),
  getByRegion: (params) => http.get("/api/stats/by-region", { params }),
  getTrends: (params) => http.get("/api/stats/trends", { params }),
  getRegionDetailed: (params) => http.get("/api/stats/by-region/detailed", { params }),
  getHeatmap: (params) => http.get("/api/stats/heatmap", { params }),
  getByCategory: (params) => http.get("/api/stats/by-category", { params }),
  getByService: (params) => http.get("/api/stats/by-service", { params }),
  getByMskCategory: (params) => http.get("/api/stats/by-msk-category", { params }),
};
