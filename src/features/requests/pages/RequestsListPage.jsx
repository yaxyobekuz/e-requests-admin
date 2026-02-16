import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestsAPI } from "@/shared/api/http";
import { requestCategories } from "@/shared/data/request-categories";
import { REQUEST_STATUSES } from "@/shared/data/request-statuses";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Eye } from "lucide-react";

const RequestsListPage = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    page: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-requests", filters],
    queryFn: () => requestsAPI.getAll(filters).then((res) => res.data),
  });

  const requests = data?.data || [];
  const totalPages = data?.pages || 1;

  const getCategoryLabel = (id) =>
    requestCategories.find((c) => c.id === id)?.label || id;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Murojaatlar</h1>
        <p className="text-sm text-gray-500">Barcha murojaatlar ro'yxati</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">Barcha statuslar</option>
          {Object.entries(REQUEST_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value, page: 1 }))}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">Barcha bo'limlar</option>
          {requestCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Murojaat</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Bo'lim</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Fuqaro</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Hudud</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Sana</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.map((req) => {
              const status = REQUEST_STATUSES[req.status] || {};
              return (
                <tr key={req._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{req.description}</td>
                  <td className="px-4 py-3 text-sm">{getCategoryLabel(req.category)}</td>
                  <td className="px-4 py-3 text-sm">{req.user?.firstName} — {req.contactPhone}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {req.address?.region?.name}, {req.address?.district?.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString("uz-UZ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => dispatch(open({ modal: "requestDetail", data: req }))}
                      className="p-1.5 text-gray-400 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {requests.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">Murojaatlar topilmadi</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setFilters((p) => ({ ...p, page: i + 1 }))}
              className={`px-3 py-1 rounded text-sm ${filters.page === i + 1 ? "bg-blue-600 text-white" : "bg-white border"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <ModalWrapper name="requestDetail" title="Murojaat tafsiloti" className="max-w-lg">
        <RequestDetailForm />
      </ModalWrapper>
    </div>
  );
};

const RequestDetailForm = ({ _id, description, category, contactFirstName, contactLastName, contactPhone, status, rejectionReason, address, user, close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState(status || "");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

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
          <p className="font-medium">{contactFirstName} {contactLastName}</p>
        </div>
        <div>
          <p className="text-gray-500">Telefon</p>
          <p className="font-medium">{contactPhone}</p>
        </div>
        <div>
          <p className="text-gray-500">Hudud</p>
          <p className="font-medium">{address?.region?.name}, {address?.district?.name}</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500 mb-1">Tavsif</p>
        <p className="text-sm bg-gray-50 p-3 rounded-lg">{description}</p>
      </div>

      {rejectionReason && (
        <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
          <span className="font-medium">Rad etish sababi: </span>{rejectionReason}
        </div>
      )}

      {status !== "resolved" && status !== "rejected" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Statusni o'zgartirish</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="pending">Kutilmoqda</option>
              <option value="in_review">Ko'rib chiqilmoqda</option>
              <option value="resolved">Yechildi</option>
              <option value="rejected">Rad etish</option>
            </select>
          </div>

          {newStatus === "rejected" && (
            <div>
              <label className="block text-sm font-medium mb-1">Rad etish sababi *</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                placeholder="Sababini yozing..." />
            </div>
          )}

          {newStatus === "resolved" && (
            <div>
              <label className="block text-sm font-medium mb-1">Izoh (ixtiyoriy)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
            </div>
          )}

          <button onClick={handleUpdateStatus} disabled={isLoading || newStatus === status}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
            {isLoading ? "Saqlanmoqda..." : "Statusni yangilash"}
          </button>
        </>
      )}
    </div>
  );
};

export default RequestsListPage;
