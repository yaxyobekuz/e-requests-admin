import http from "@/shared/api/http";

export const regionsAPI = {
  getAll: (params) => http.get("/api/regions", { params }),
  getById: (id) => http.get(`/api/regions/${id}`),
  create: (data) => http.post("/api/regions", data),
  update: (id, data) => http.put(`/api/regions/${id}`, data),
  delete: (id) => http.delete(`/api/regions/${id}`),
};


