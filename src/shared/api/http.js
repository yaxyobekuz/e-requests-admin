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
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  },
);

export default http;

// Feature API modules
export const usersAPI = {
  getAll: (params) => http.get("/users", { params }),
  getById: (id) => http.get(`/users/${id}`),
  create: (data) => http.post("/users", data),
  update: (id, data) => http.put(`/users/${id}`, data),
  delete: (id) => http.delete(`/users/${id}`),
  resetPassword: (id, data) => http.patch(`/users/${id}/reset-password`, data),
  exportUsers: (params) =>
    http.get("/users/export", { params, responseType: "blob" }),
};

export const classesAPI = {
  getAll: (params) => http.get("/classes", { params }),
  getById: (id) => http.get(`/classes/${id}`),
  create: (data) => http.post("/classes", data),
  update: (id, data) => http.put(`/classes/${id}`, data),
  delete: (id) => http.delete(`/classes/${id}`),
};

export const subjectsAPI = {
  getAll: (params) => http.get("/subjects", { params }),
  getById: (id) => http.get(`/subjects/${id}`),
  create: (data) => http.post("/subjects", data),
  update: (id, data) => http.put(`/subjects/${id}`, data),
  delete: (id) => http.delete(`/subjects/${id}`),
};

export const gradesAPI = {
  getAll: (params) => http.get("/grades", { params }),
  create: (data) => http.post("/grades", data),
  getMissing: (params) => http.get("/grades/missing", { params }),
  getMyGrades: (params) => http.get("/grades/my", { params }),
};

export const schedulesAPI = {
  getAll: (params) => http.get("/schedules", { params }),
  create: (data) => http.post("/schedules", data),
  update: (id, data) => http.put(`/schedules/${id}`, data),
  delete: (id) => http.delete(`/schedules/${id}`),
};

export const messagesAPI = {
  getAll: (params) => http.get("/messages", { params }),
  getById: (id) => http.get(`/messages/${id}`),
  send: (data) => http.post("/messages", data),
  getMyMessages: (params) => http.get("/messages/my", { params }),
};

export const holidaysAPI = {
  getAll: (params) => http.get("/holidays", { params }),
  create: (data) => http.post("/holidays", data),
  delete: (id) => http.delete(`/holidays/${id}`),
  checkToday: () => http.get("/holidays/check-today"),
};

export const topicsAPI = {
  getAll: (params) => http.get("/topics", { params }),
  upload: (data) => http.post("/topics/upload", data),
  getBySubject: (subjectId, params) =>
    http.get(`/subjects/${subjectId}/topics`, { params }),
};

export const statisticsAPI = {
  getDashboard: () => http.get("/statistics/dashboard"),
  getStudentStats: (id) => http.get(`/statistics/students/${id}`),
};
