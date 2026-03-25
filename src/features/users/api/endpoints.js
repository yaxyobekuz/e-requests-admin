import http from "@/shared/api/http";

export const usersAPI = {
  /**
   * Foydalanuvchilar ro'yxati (paginated).
   * @param {object} params - { regionId, districtId, neighborhoodId, houseType, isActive, page, limit }
   */
  getAll: (params) => http.get("/api/admin/users", { params }),

  /**
   * Foydalanuvchilar statistikasi (jami, faol/nofaol, uy turi, viloyat).
   * @param {object} params - { regionId, districtId, neighborhoodId }
   */
  getStats: (params) => http.get("/api/admin/users/stats", { params }),
};
