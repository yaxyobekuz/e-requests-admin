import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mskAPI } from "@/shared/api/http";
import { MSK_ORDER_STATUSES } from "@/shared/data/request-statuses";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { formatUzDate } from "@/shared/utils/formatDate";

const MskOrdersPage = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({ status: "", page: 1 });

  const { data: categories = [] } = useQuery({
    queryKey: ["msk", "categories"],
    queryFn: () => mskAPI.getCategories().then((res) => res.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-msk-orders", filters],
    queryFn: () => mskAPI.getAllOrders(filters).then((res) => res.data),
  });

  const orders = data?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">MSK buyurtmalar</h1>
        <p className="text-sm text-gray-500">Barcha maishiy xizmat buyurtmalari</p>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha statuslar</option>
          {Object.entries(MSK_ORDER_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Kategoriya</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Fuqaro</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Hudud</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Sana</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => {
              const status = MSK_ORDER_STATUSES[order.status] || {};
              return (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{order.category?.name}</td>
                  <td className="px-4 py-3 text-sm">{order.contactFirstName} {order.contactLastName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {order.address?.region?.name}, {order.address?.district?.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatUzDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => dispatch(open({ modal: "mskOrderDetail", data: order }))}
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
          <div className="text-center py-12 text-gray-500">Buyurtmalar topilmadi</div>
        )}
      </div>

      <ModalWrapper name="mskOrderDetail" title="Buyurtma tafsiloti" className="max-w-lg">
        <MskOrderDetailForm />
      </ModalWrapper>
    </div>
  );
};

const MskOrderDetailForm = ({ _id, description, category, status, address, user, contactFirstName, contactLastName, contactPhone, rejectionReason, cancelReason, close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState(status || "");
  const [reason, setReason] = useState("");

  const handleUpdate = async () => {
    if (newStatus === "rejected" && !reason.trim()) {
      return toast.error("Rad etish sababi kiritilishi shart");
    }
    setIsLoading(true);
    try {
      await mskAPI.updateOrderStatus(_id, { status: newStatus, rejectionReason: reason });
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
          <span className="font-medium">Sabab: </span>{rejectionReason}
        </div>
      )}

      {cancelReason && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          <span className="font-medium">Bekor qilish sababi: </span>{cancelReason}
        </div>
      )}

      {status !== "confirmed" && status !== "rejected" && status !== "cancelled" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Statusni o'zgartirish</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="pending">Kutilmoqda</option>
              <option value="in_review">Ko'rib chiqilmoqda</option>
              <option value="resolved">Bajarildi</option>
              <option value="rejected">Rad etish</option>
            </select>
          </div>

          {newStatus === "rejected" && (
            <div>
              <label className="block text-sm font-medium mb-1">Sabab *</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
            </div>
          )}

          <button onClick={handleUpdate} disabled={isLoading || newStatus === status}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
            {isLoading ? "Saqlanmoqda..." : "Statusni yangilash"}
          </button>
        </>
      )}
    </div>
  );
};

export default MskOrdersPage;
