import http from "@/shared/api/http";

export const settingsAPI = {
  get: () => http.get("/api/settings"),
  update: (data) => http.put("/api/settings", data),
};


