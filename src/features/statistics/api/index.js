import http from "@/shared/api/http";

export const statsAPI = {
  /**
   * Global KPI counts: requests, service reports, MSK orders, active users.
   * @param {{ period?: string, regionId?: string, districtId?: string }} params
   * @returns {Promise}
   */
  getOverview: (params) => http.get("/api/stats/overview", { params }),

  /**
   * Request analytics: byStatus, byCategory, trend, topRegions.
   * @param {{ period?: string, regionId?: string, districtId?: string }} params
   * @returns {Promise}
   */
  getRequests: (params) => http.get("/api/stats/requests", { params }),

  /**
   * Service report analytics: byStatus, byService, trend, topRegions.
   * @param {{ period?: string, regionId?: string, districtId?: string }} params
   * @returns {Promise}
   */
  getServices: (params) => http.get("/api/stats/services", { params }),

  /**
   * MSK order analytics: byStatus, byCategory, trend, topRegions.
   * @param {{ period?: string, regionId?: string, districtId?: string }} params
   * @returns {Promise}
   */
  getMsk: (params) => http.get("/api/stats/msk", { params }),

  /**
   * All top-level regions with counts across all 3 modules.
   * @param {{ period?: string, regionId?: string, districtId?: string }} params
   * @returns {Promise}
   */
  getByRegion: (params) => http.get("/api/stats/by-region", { params }),

  /**
   * Districts of a region with counts across all 3 modules.
   * @param {string} regionId
   * @param {{ period?: string }} params
   * @returns {Promise}
   */
  getByDistrict: (regionId, params) =>
    http.get(`/api/stats/by-district/${regionId}`, { params }),

  /**
   * Hosil statistikasi — mahsulot, nav va hudud bo'yicha o'rtacha kg/sotix.
   * @param {{ productId?: string, varietyId?: string, regionId?: string, year?: number }} params
   * @returns {Promise}
   */
  getHarvestOverview: (params) => http.get("/api/harvest/stats/overview", { params }),

  /**
   * Hosil statistikasi hududlar bo'yicha.
   * @param {{ productId?: string, varietyId?: string, year?: number }} params
   * @returns {Promise}
   */
  getHarvestByRegion: (params) => http.get("/api/harvest/stats/by-region", { params }),
};
