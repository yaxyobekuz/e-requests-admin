import http from "@/shared/api/http";

export const adminRolesAPI = {
  getAll: () => http.get("/api/admin-roles"),
  create: (data) => http.post("/api/admin-roles", data),
  update: (id, data) => http.put(`/api/admin-roles/${id}`, data),
  delete: (id) => http.delete(`/api/admin-roles/${id}`),
};


