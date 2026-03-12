import http from "@/shared/api/http";

/**
 * Mahsulotlar va ularning navlari uchun API metodlar.
 * Faqat owner tomonidan boshqariladi.
 */
export const productsAPI = {
  /** Barcha faol mahsulotlarni navlari bilan qaytaradi. */
  getAll: () => http.get("/api/products"),

  /**
   * Yangi mahsulot yaratadi.
   * @param {{ name: string }} data
   */
  create: (data) => http.post("/api/products", data),

  /**
   * Mahsulotni yangilaydi.
   * @param {string} id - Mahsulot ID
   * @param {{ name?: string, isActive?: boolean }} data
   */
  update: (id, data) => http.put(`/api/products/${id}`, data),

  /**
   * Mahsulotni o'chiradi.
   * @param {string} id - Mahsulot ID
   */
  remove: (id) => http.delete(`/api/products/${id}`),

  /**
   * Mahsulotga yangi nav qo'shadi.
   * @param {string} id - Mahsulot ID
   * @param {{ name: string }} data
   */
  addVariety: (id, data) => http.post(`/api/products/${id}/varieties`, data),

  /**
   * Navni yangilaydi.
   * @param {string} id - Mahsulot ID
   * @param {string} varId - Nav ID
   * @param {{ name: string }} data
   */
  updateVariety: (id, varId, data) =>
    http.put(`/api/products/${id}/varieties/${varId}`, data),

  /**
   * Navni o'chiradi.
   * @param {string} id - Mahsulot ID
   * @param {string} varId - Nav ID
   */
  removeVariety: (id, varId) =>
    http.delete(`/api/products/${id}/varieties/${varId}`),
};
