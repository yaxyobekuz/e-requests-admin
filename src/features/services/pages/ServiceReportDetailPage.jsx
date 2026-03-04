import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Printer } from "lucide-react";

import { serviceReportsAPI } from "@/shared/api/http";
import { SERVICE_REPORT_STATUSES } from "@/shared/data/request-statuses";
import { formatUzDate } from "@/shared/utils/formatDate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadcn/select";
import { uzEmblem } from "@/shared/assets/images";
import { cn } from "@/shared/utils/cn";

const ServiceReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const { data: report, isLoading } = useQuery({
    queryKey: ["service-report-detail", id],
    queryFn: () => serviceReportsAPI.getById(id).then((res) => res.data),
    onSuccess: (data) => {
      setNewStatus(data.status);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => serviceReportsAPI.updateStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["service-report-detail", id]);
      const messages = {
        in_progress: "Jarayonga olindi!",
        pending_confirmation:
          "Mavjud deb belgilandi, foydalanuvchi tasdiqlashi kutilmoqda!",
        rejected: "Rad etildi!",
        confirmed: "Tasdiqlandi!",
      };
      toast.success(messages[variables.status] || "Status yangilandi!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  if (isLoading) {
    return <div className="p-6">Yuklanmoqda...</div>;
  }

  if (!report) {
    return <div className="p-6">Ariza topilmadi</div>;
  }

  const handleUpdateStatus = () => {
    if (!newStatus || newStatus === report.status) return;
    if (newStatus === "rejected" && !reason.trim()) {
      return toast.error("Rad etish sababini kiriting");
    }

    updateMutation.mutate({
      status: newStatus,
      ...(newStatus === "rejected" ? { rejectionReason: reason.trim() } : {}),
    });
  };

  const statusOptions =
    report.status === "unavailable"
      ? ["in_progress", "pending_confirmation", "rejected"]
      : report.status === "in_progress"
        ? ["pending_confirmation", "rejected"]
        : [];

  const addressLabel = [
    report.address?.region?.name,
    report.address?.district?.name,
    report.address?.neighborhood?.name || report.address?.neighborhoodCustom,
    report.address?.street?.name || report.address?.streetCustom,
  ]
    .filter(Boolean)
    .join(", ");

  const isFormDisabled =
    updateMutation.isPending ||
    ["confirmed", "rejected", "cancelled"].includes(report.status) ||
    report.status === "pending_confirmation";

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Chap taraf: Asosiy hujjat (Print qilinadigan qism) */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border no-print">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            <Printer className="w-4 h-4" />
            Chop etish (PDF)
          </button>
        </div>

        <div
          id="doc"
          className="bg-white p-10 rounded-xl border shadow-sm print:shadow-none print:border-none print:m-0 printable-content"
        >
          {/* Emblem of Uzbekistan */}
          <img
            width={80}
            height={80}
            src={uzEmblem}
            alt="O'zbekiston gerbi"
            className="size-20 mx-auto mb-6"
          />

          <div className="mb-6 font-bold text-center text-xl">
            Andijon viloyati, Baliqchi tuman hokimligi
          </div>

          <div className="flex justify-between items-center mb-8 text-sm">
            <div>
              <span className="font-semibold text-gray-600">Sana: </span>
              {formatUzDate(report.createdAt)}
            </div>
            <div>
              <span className="font-semibold text-gray-600">ID: </span>
              {report._id}
            </div>
          </div>

          <div className="space-y-6 text-[15px] text-gray-800">
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 pb-6 border-b">
              <div>
                <p className="text-sm text-gray-500 mb-1 font-medium">
                  Fuqaro (F.I.SH):
                </p>
                <p className="font-semibold">
                  {report.user?.firstName} {report.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 font-medium">
                  Telefon raqam:
                </p>
                <p className="font-semibold">{report.user?.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1 font-medium">
                  Yashash manzili:
                </p>
                <p className="font-semibold">{addressLabel}</p>
              </div>
            </div>

            <div
              className={cn(
                "grid grid-cols-2 gap-y-4 gap-x-8 pb-6",

                (report.status === "rejected" && report.rejectionReason) ||
                  (report.status === "cancelled" && report.cancelReason)
                  ? "border-b"
                  : "",
              )}
            >
              <div>
                <p className="text-sm text-gray-500 mb-1 font-medium">
                  Servis turi:
                </p>
                <p className="font-semibold">{report.service?.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1 font-medium">
                  Joriy holat:
                </p>
                <p
                  className={`font-semibold ${SERVICE_REPORT_STATUSES[report.status]?.color?.replace("bg-", "text-")?.replace("-100", "-700") || "text-black"}`}
                >
                  {SERVICE_REPORT_STATUSES[report.status]?.label ||
                    report.status}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {report.status === "rejected" && report.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-red-500 mb-1 font-medium">
                    Rad etish sababi:
                  </p>
                  <p className="font-semibold text-red-700">
                    {report.rejectionReason}
                  </p>
                </div>
              )}

              {report.status === "cancelled" && report.cancelReason && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1 font-medium">
                    Bekor qilish sababi:
                  </p>
                  <p className="font-semibold">{report.cancelReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* O'ng taraf: Holatni o'zgartirish (Faqat admin interfeysi) */}
      <div className="w-full md:w-80 space-y-4 shrink-0 print:hidden">
        <div className="bg-white p-5 rounded-xl border sticky top-6">
          <h2 className="font-semibold mb-4">Arizani boshqarish</h2>

          {!isFormDisabled && statusOptions.length > 0 ? (
            <div className="space-y-4">
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
                    <SelectItem value={report.status}>
                      {SERVICE_REPORT_STATUSES[report.status]?.label ||
                        report.status}
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
                    placeholder="Sababini yozing..."
                  />
                </div>
              )}

              <button
                onClick={handleUpdateStatus}
                disabled={
                  updateMutation.isPending || newStatus === report.status
                }
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition"
              >
                {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              {report.status === "pending_confirmation"
                ? "Foydalanuvchi tasdiqlashi kutilmoqda. Hozircha o'zgartirish mumkin emas."
                : `Bu ariza holati allaqachon yakunlangan (${SERVICE_REPORT_STATUSES[report.status]?.label}).`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceReportDetailPage;
