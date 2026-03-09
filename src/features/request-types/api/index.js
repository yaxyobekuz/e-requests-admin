import http from "@/shared/api/http";

export const requestTypesAPI = {
  getAll: () => http.get("/api/request-types"),
  create: (data) => http.post("/api/request-types", data),
  update: (id, data) => http.put(`/api/request-types/${id}`, data),
  delete: (id) => http.delete(`/api/request-types/${id}`),
};


