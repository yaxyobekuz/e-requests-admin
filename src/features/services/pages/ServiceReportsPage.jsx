import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { serviceReportsAPI, servicesAPI } from "@/shared/api/http";
import { SERVICE_REPORT_STATUSES } from "@/shared/data/request-statuses";
import { CheckCircle, Clock, XCircle } from "lucide-react";

const ServiceReportsPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ serviceId: "", status: "", page: 1 });
  const [rejectModal, setRejectModal] = useState({ open: false, reportId: null });
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesAPI.getAll().then((res) => res.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-service-reports", filters],
    queryFn: () => serviceReportsAPI.getAll(filters).then((res) => res.data),
  });

  const reports = data?.data || [];

  const statusMutation = useMutation({
    mutationFn: ({ id, data }) => serviceReportsAPI.updateStatus(id, data),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-reports"] });
      const messages = {
        in_progress: "Jarayonga olindi!",
        pending_confirmation: "Mavjud deb belgilandi, foydalanuvchi tasdiqlashi kutilmoqda!",
        rejected: "Rad etildi!",
      };
      toast.success(messages[data.status] || "Status yangilandi!");
      setRejectModal({ open: false, reportId: null });
      setRejectionReason("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const handleUpdateStatus = (reportId, status) => {
    if (status === "rejected") {
      setRejectModal({ open: true, reportId });
      return;
    }
    statusMutation.mutate({ id: reportId, data: { status } });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Rad etish sababini kiriting");
      return;
    }
    statusMutation.mutate({
      id: rejectModal.reportId,
      data: { status: "rejected", rejectionReason: rejectionReason.trim() },
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Servis reportlar</h1>
        <p className="text-sm text-gray-500">Foydalanuvchilardan kelgan xizmat holatlari</p>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filters.serviceId}
          onChange={(e) => setFilters((p) => ({ ...p, serviceId: e.target.value, page: 1 }))}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha servislar</option>
          {services.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <select value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha statuslar</option>
          {Object.entries(SERVICE_REPORT_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Servis</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Fuqaro</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Hudud</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Sana</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.map((report) => {
              const status = SERVICE_REPORT_STATUSES[report.status] || {};
              return (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{report.service?.name}</td>
                  <td className="px-4 py-3 text-sm">{report.user?.firstName} — {report.user?.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {[
                      report.address?.region?.name,
                      report.address?.district?.name,
                      report.address?.neighborhood?.name,
                    ].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    {report.status === "rejected" && report.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={report.rejectionReason}>
                        {report.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString("uz-UZ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Unavailable → 3 ta tugma */}
                      {report.status === "unavailable" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(report._id, "in_progress")}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                          >
                            <Clock className="w-3 h-3" />
                            Jarayonda
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report._id, "pending_confirmation")}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Mavjud
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report._id, "rejected")}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <XCircle className="w-3 h-3" />
                            Rad etish
                          </button>
                        </>
                      )}

                      {/* In progress → 2 ta tugma */}
                      {report.status === "in_progress" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(report._id, "pending_confirmation")}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Mavjud
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report._id, "rejected")}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <XCircle className="w-3 h-3" />
                            Rad etish
                          </button>
                        </>
                      )}

                      {/* Pending confirmation — kutish */}
                      {report.status === "pending_confirmation" && (
                        <span className="text-xs text-blue-600">Foydalanuvchi tasdiqlashi kutilmoqda</span>
                      )}

                      {/* Confirmed / Rejected — hech narsa */}
                      {(report.status === "confirmed" || report.status === "rejected") && (
                        <span className="text-xs text-gray-400">Yakunlangan</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {reports.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">Reportlar topilmadi</div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setFilters((p) => ({ ...p, page }))}
              className={`px-3 py-1 text-sm rounded-lg border ${
                filters.page === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Rad etish modali */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-bold">Rad etish sababi</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Rad etish sababini yozing..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setRejectModal({ open: false, reportId: null });
                  setRejectionReason("");
                }}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleReject}
                disabled={statusMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {statusMutation.isPending ? "Yuborilmoqda..." : "Rad etish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceReportsPage;
