import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { serviceReportsAPI, servicesAPI } from "@/shared/api/http";
import { SERVICE_REPORT_STATUSES } from "@/shared/data/request-statuses";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { formatUzDate } from "@/shared/utils/formatDate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadcn/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/shared/components/shadcn/pagination";

const ServiceReportsPage = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    serviceId: "",
    status: "",
    page: 1,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesAPI.getAll().then((res) => res.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-service-reports", filters],
    queryFn: () => serviceReportsAPI.getAll(filters).then((res) => res.data),
  });

  const reports = data?.data || [];

  const handleOpenDetail = (report) => {
    dispatch(open({ modal: "serviceReportDetail", data: report }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Xizmat arizalari</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <Select
          value={filters.serviceId || "all"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              serviceId: val === "all" ? "" : val,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-48 border rounded-lg text-sm bg-white">
            <SelectValue placeholder="Barcha servislar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha servislar</SelectItem>
            {services.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              status: val === "all" ? "" : val,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-48 border rounded-lg text-sm bg-white">
            <SelectValue placeholder="Barcha statuslar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha statuslar</SelectItem>
            {Object.entries(SERVICE_REPORT_STATUSES).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                {val.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Servis
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Fuqaro
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Hudud
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Sana
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">
                Amal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.map((report) => {
              const status = SERVICE_REPORT_STATUSES[report.status] || {};
              return (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {report.service?.name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {report.user?.firstName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {[
                      report.address?.region?.name,
                      report.address?.district?.name,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatUzDate(report.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleOpenDetail(report)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Batafsil
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {reports.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            Reportlar topilmadi
          </div>
        )}
      </div>

      {data && data.pages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page === 1}
              />
            </PaginationItem>
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => {
              const current = filters.page;
              const total = data.pages;
              const showPage =
                page === 1 ||
                page === total ||
                (page >= current - 2 && page <= current + 2);
              const showStartEllipsis = page === 2 && current > 4;
              const showEndEllipsis = page === total - 1 && current < total - 3;
              if (showStartEllipsis || showEndEllipsis) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              if (!showPage) return null;
              return (
                <PaginationItem key={page}>
                  <PaginationButton
                    isActive={page === current}
                    onClick={() => setFilters((p) => ({ ...p, page }))}
                  >
                    {page}
                  </PaginationButton>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                disabled={filters.page === data.pages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <ModalWrapper
        name="serviceReportDetail"
        title="Servis reporti"
        description="Ba'atafsil ma'lumot va status boshqaruvi"
        className="max-w-lg"
      >
        <ServiceReportDetailForm />
      </ModalWrapper>
    </div>
  );
};

const ServiceReportDetailForm = ({
  _id,
  service,
  user,
  address,
  status,
  cancelReason,
  createdAt,
  close,
  isLoading,
  setIsLoading,
}) => {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState(status || "");
  const [reason, setReason] = useState("");

  useEffect(() => {
    setNewStatus(status || "");
    setReason("");
  }, [status, _id]);

  const statusOptions =
    status === "unavailable"
      ? ["in_progress", "pending_confirmation", "rejected"]
      : status === "in_progress"
        ? ["pending_confirmation", "rejected"]
        : [];

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === status) return;
    if (newStatus === "rejected" && !reason.trim()) {
      return toast.error("Rad etish sababini kiriting");
    }

    setIsLoading(true);
    try {
      await serviceReportsAPI.updateStatus(_id, {
        status: newStatus,
        ...(newStatus === "rejected" ? { rejectionReason: reason.trim() } : {}),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-service-reports"] });
      const messages = {
        in_progress: "Jarayonga olindi!",
        pending_confirmation:
          "Mavjud deb belgilandi, foydalanuvchi tasdiqlashi kutilmoqda!",
        rejected: "Rad etildi!",
      };
      toast.success(messages[newStatus] || "Status yangilandi!");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const addressLabel = [
    address?.region?.name,
    address?.district?.name,
    address?.neighborhood?.name || address?.neighborhoodCustom,
    address?.street?.name || address?.streetCustom,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="border rounded-lg p-3">
          <p className="text-xs text-gray-500">Servis</p>
          <p className="font-medium">{service?.name || "-"}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-gray-500">Fuqaro</p>
          <p className="font-medium">{user?.firstName || "-"}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-gray-500">Telefon</p>
          <p className="font-medium">{user?.phone || "-"}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-gray-500">Hudud</p>
          <p className="font-medium">{addressLabel || "-"}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-gray-500">Sana</p>
          <p className="font-medium">{formatUzDate(createdAt)}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-gray-500">Status</p>
          <p className="font-medium">
            {SERVICE_REPORT_STATUSES[status]?.label || "-"}
          </p>
        </div>
      </div>

      {status === "pending_confirmation" && (
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          Foydalanuvchi tasdiqlashi kutilmoqda
        </div>
      )}

      {status === "cancelled" && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
          Foydalanuvchi tomonidan bekor qilingan
        </div>
      )}

      {cancelReason && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          <span className="font-medium">Bekor qilish sababi: </span>
          {cancelReason}
        </div>
      )}

      {(status === "confirmed" || status === "rejected") && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-400">
          Yakunlangan
        </div>
      )}

      {statusOptions.length > 0 && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Statusni o'zgartirish
            </label>
            <Select
              value={newStatus}
              onValueChange={(val) => {
                setNewStatus(val);
                if (val !== "rejected") setReason("");
              }}
            >
              <SelectTrigger className="w-full border rounded-lg text-sm bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={status}>
                  {SERVICE_REPORT_STATUSES[status]?.label || status}
                </SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {SERVICE_REPORT_STATUSES[option]?.label || option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {newStatus === "rejected" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Rad etish sababi *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                placeholder="Rad etish sababini yozing..."
              />
            </div>
          )}

          <button
            onClick={handleUpdateStatus}
            disabled={isLoading || newStatus === status}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isLoading ? "Saqlanmoqda..." : "Statusni yangilash"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceReportsPage;
