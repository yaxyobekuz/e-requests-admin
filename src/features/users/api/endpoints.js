import http from "@/shared/api/http";

export const usersAPI = {
  getAll: (params) => http.get("/api/users", { params }),
  getById: (id) => http.get(`/api/users/${id}`),
  create: (data) => http.post("/api/users", data),
  update: (id, data) => http.put(`/api/users/${id}`, data),
  delete: (id) => http.delete(`/api/users/${id}`),
  resetPassword: (id, data) => http.put(`/api/users/${id}/reset-password`, data),
};
