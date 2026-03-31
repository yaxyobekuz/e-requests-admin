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

  /**
   * Foydalanuvchilar va xonadonlar demografik statistikasi hududlar bo'yicha.
   * @param {{ regionId?: string, districtId?: string, neighborhoodId?: string }} params
   * @returns {Promise<{ summary: object, byLevel: Array }>}
   */
  getUserDemographics: (params) =>
    http.get("/api/stats/users/demographics", { params }),
};
