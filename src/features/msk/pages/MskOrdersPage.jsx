import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mskAPI } from "@/shared/api/http";
import { MSK_ORDER_STATUSES } from "@/shared/data/request-statuses";
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

const MskOrdersPage = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({ status: "", page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-msk-orders", filters],
    queryFn: () => mskAPI.getAllOrders(filters).then((res) => res.data),
  });

  const orders = data?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">MSK buyurtmalar</h1>
      </div>

      <div className="flex gap-3 mb-4">
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
            {Object.entries(MSK_ORDER_STATUSES).map(([key, val]) => (
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
                Kategoriya
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
            {orders.map((order) => {
              const status = MSK_ORDER_STATUSES[order.status] || {};
              return (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {order.category?.name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.contactFirstName} {order.contactLastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {order.address?.region?.name},{" "}
                    {order.address?.district?.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatUzDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        dispatch(open({ modal: "mskOrderDetail", data: order }))
                      }
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
        {orders.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            Buyurtmalar topilmadi
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
        name="mskOrderDetail"
        title="Buyurtma tafsiloti"
        className="max-w-lg"
      >
        <MskOrderDetailForm />
      </ModalWrapper>
    </div>
  );
};

const STATUS_TRANSITIONS = {
  pending: ["in_review", "pending_confirmation", "rejected"],
  in_review: ["pending", "pending_confirmation", "rejected"],
  pending_confirmation: ["pending", "in_review", "rejected"],
};

const STATUS_LABELS = {
  pending: "Kutilmoqda",
  in_review: "Ko'rib chiqilmoqda",
  pending_confirmation: "Tasdiq kutilmoqda",
  rejected: "Rad etildi",
};

const MskOrderDetailForm = ({
  _id,
  description,
  category,
  status,
  address,
  contactFirstName,
  contactLastName,
  contactPhone,
  rejectionReason,
  cancelReason,
  close,
  isLoading,
  setIsLoading,
}) => {
  const queryClient = useQueryClient();
  const statusOptions = STATUS_TRANSITIONS[status] || [];
  const [newStatus, setNewStatus] = useState(statusOptions[0] || "");
  const [reason, setReason] = useState("");

  const handleUpdate = async () => {
    if (newStatus === "rejected" && !reason.trim()) {
      return toast.error("Rad etish sababi kiritilishi shart");
    }
    setIsLoading(true);
    try {
      await mskAPI.updateOrderStatus(_id, {
        status: newStatus,
        rejectionReason: reason,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-msk-orders"] });
      toast.success("Status yangilandi!");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">Kategoriya</p>
          <p className="font-medium">{category?.name}</p>
        </div>
        <div>
          <p className="text-gray-500">Fuqaro</p>
          <p className="font-medium">
            {contactFirstName} {contactLastName}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Telefon</p>
          <p className="font-medium">{contactPhone}</p>
        </div>
        <div>
          <p className="text-gray-500">Hudud</p>
          <p className="font-medium">
            {address?.region?.name}, {address?.district?.name}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500 mb-1">Tavsif</p>
        <p className="text-sm bg-gray-50 p-3 rounded-lg">{description}</p>
      </div>

      {rejectionReason && (
        <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
          <span className="font-medium">Sabab: </span>
          {rejectionReason}
        </div>
      )}

      {cancelReason && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          <span className="font-medium">Bekor qilish sababi: </span>
          {cancelReason}
        </div>
      )}

      {status === "pending_confirmation" && (
        <div className="p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700">
          Tasdiq kutilmoqda — fuqaro muammoni tasdiqlashi yoki rad etishi
          kutilmoqda
        </div>
      )}

      {statusOptions.length > 0 && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Statusni o'zgartirish
            </label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-full border rounded-lg text-sm bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {newStatus === "rejected" && (
            <div>
              <label className="block text-sm font-medium mb-1">Sabab *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
              />
            </div>
          )}

          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isLoading ? "Saqlanmoqda..." : "Statusni yangilash"}
          </button>
        </>
      )}
    </div>
  );
};

export default MskOrdersPage;
