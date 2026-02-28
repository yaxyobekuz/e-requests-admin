import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestsAPI, requestTypesAPI } from "@/shared/api/http";
import { requestCategories } from "@/shared/data/request-categories";
import { REQUEST_STATUSES } from "@/shared/data/request-statuses";
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

const RequestsListPage = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    type: "",
    page: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-requests", filters],
    queryFn: () => requestsAPI.getAll(filters).then((res) => res.data),
  });

  const { data: requestTypes = [] } = useQuery({
    queryKey: ["request-types"],
    queryFn: () => requestTypesAPI.getAll().then((res) => res.data),
  });

  const requests = data?.data || [];
  const totalPages = data?.pages || 1;

  const getCategoryLabel = (id) =>
    requestCategories.find((c) => c.id === id)?.label || id;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Murojaatlar</h1>
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
            {Object.entries(REQUEST_STATUSES).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                {val.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category || "all"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              category: val === "all" ? "" : val,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-48 border rounded-lg text-sm bg-white">
            <SelectValue placeholder="Barcha bo'limlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha bo'limlar</SelectItem>
            {requestCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type || "all"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              type: val === "all" ? "" : val,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-48 border rounded-lg text-sm bg-white">
            <SelectValue placeholder="Barcha turlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha turlar</SelectItem>
            {requestTypes.map((t) => (
              <SelectItem key={t._id} value={t._id}>
                {t.name}
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
                Bo'lim
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Turi
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
            {requests.map((req) => {
              const status = REQUEST_STATUSES[req.status] || {};
              return (
                <tr key={req._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {getCategoryLabel(req.category)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {req.type?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">{req.user?.firstName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {req.address?.region?.name}, {req.address?.district?.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatUzDate(req.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        dispatch(open({ modal: "requestDetail", data: req }))
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
        {requests.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            Murojaatlar topilmadi
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const current = filters.page;
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= current - 2 && page <= current + 2);
              const showStartEllipsis = page === 2 && current > 4;
              const showEndEllipsis =
                page === totalPages - 1 && current < totalPages - 3;
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
                disabled={filters.page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <ModalWrapper
        name="requestDetail"
        title="Murojaat tafsiloti"
        className="max-w-lg"
      >
        <RequestDetailForm />
      </ModalWrapper>
    </div>
  );
};

const RequestDetailForm = ({
  _id,
  description,
  category,
  contactFirstName,
  contactLastName,
  contactPhone,
  status,
  rejectionReason,
  cancelReason,
  address,
  type,
  close,
  isLoading,
  setIsLoading,
}) => {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState(status || "");
  const [newType, setNewType] = useState(type?._id || "");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const { data: requestTypes = [] } = useQuery({
    queryKey: ["request-types"],
    queryFn: () => requestTypesAPI.getAll().then((res) => res.data),
  });

  const getCategoryLabel = (id) =>
    requestCategories.find((c) => c.id === id)?.label || id;

  const handleUpdateStatus = async () => {
    if (newStatus === "rejected" && !reason.trim()) {
      return toast.error("Rad etish sababi kiritilishi shart");
    }
    setIsLoading(true);
    try {
      await requestsAPI.updateStatus(_id, {
        status: newStatus,
        rejectionReason: reason,
        closingNote: note,
        type: newType || null,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
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
          <p className="text-gray-500">Bo'lim</p>
          <p className="font-medium">{getCategoryLabel(category)}</p>
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
          <span className="font-medium">Rad etish sababi: </span>
          {rejectionReason}
        </div>
      )}

      {cancelReason && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          <span className="font-medium">Bekor qilish sababi: </span>
          {cancelReason}
        </div>
      )}

      {status !== "resolved" &&
        status !== "rejected" &&
        status !== "cancelled" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Murojaat turi
              </label>
              <Select
                value={newType || "none"}
                onValueChange={(val) => setNewType(val === "none" ? "" : val)}
              >
                <SelectTrigger className="w-full border rounded-lg text-sm bg-white">
                  <SelectValue placeholder="Tanlanmagan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanlanmagan</SelectItem>
                  {requestTypes.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Statusni o'zgartirish
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full border rounded-lg text-sm bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="in_review">Ko'rib chiqilmoqda</SelectItem>
                  <SelectItem value="resolved">Yechildi</SelectItem>
                  <SelectItem value="rejected">Rad etish</SelectItem>
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
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                  placeholder="Sababini yozing..."
                />
              </div>
            )}

            {newStatus === "resolved" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Izoh (ixtiyoriy)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                />
              </div>
            )}

            <button
              onClick={handleUpdateStatus}
              disabled={
                isLoading ||
                (newStatus === status && newType === (type?._id || ""))
              }
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isLoading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </>
        )}
    </div>
  );
};

export default RequestsListPage;
