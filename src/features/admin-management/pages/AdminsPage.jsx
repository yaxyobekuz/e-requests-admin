import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminsAPI } from "@/shared/api/http";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus } from "lucide-react";
import PhoneInput from "@/shared/components/ui/PhoneInput";

const REGION_TYPE_LABELS = { region: "Viloyat", district: "Tuman", neighborhood: "Mahalla", street: "Ko'cha" };

const AdminsPage = () => {
  const dispatch = useDispatch();

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: () => adminsAPI.getAll().then((res) => res.data),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Adminlar</h1>
          <p className="text-sm text-gray-500">Adminlarni boshqarish</p>
        </div>
        <button
          onClick={() => dispatch(open({ modal: "createAdmin" }))}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Yangi admin
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tahallus</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ism</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Telefon</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Hududlar</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Holat</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {admins.map((admin) => (
              <tr key={admin._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{admin.alias}</td>
                <td className="px-4 py-3 text-sm">{admin.firstName} {admin.lastName}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{admin.phone}</td>
                <td className="px-4 py-3 text-sm">
                  {admin.assignedRegion ? (
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {admin.assignedRegion.region?.name || "—"}
                      <span className="text-blue-400 ml-0.5">
                        [{REGION_TYPE_LABELS[admin.assignedRegion.regionType] || admin.assignedRegion.regionType}]
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Belgilanmagan</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${admin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {admin.isActive ? "Faol" : "Nofaol"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admins/${admin._id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Batafsil
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {admins.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">Adminlar yo'q</div>
        )}
      </div>

      <ModalWrapper name="createAdmin" title="Yangi admin yaratish">
        <CreateAdminForm />
      </ModalWrapper>
    </div>
  );
};

const CreateAdminForm = ({ close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    phone: "",
    password: "",
    firstName: "",
    lastName: "",
    alias: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 12) return toast.error("Telefon raqamni to'liq kiriting");
    if (!form.password) return toast.error("Parolni kiriting");
    if (!form.alias.trim()) return toast.error("Tahallus kiritilishi shart");

    setIsLoading(true);
    try {
      await adminsAPI.create({ ...form, phone: `+${cleanPhone}` });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin yaratildi!");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Tahallus *</label>
        <input
          type="text" value={form.alias}
          onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="admin_toshkent"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ism</label>
          <input type="text" value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Familiya</label>
          <input type="text" value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Telefon *</label>
        <PhoneInput value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Parol *</label>
        <input type="password" value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg" placeholder="Kamida 6 ta belgi" />
      </div>
      <button type="submit" disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
        {isLoading ? "Yaratilmoqda..." : "Yaratish"}
      </button>
    </form>
  );
};

export default AdminsPage;
