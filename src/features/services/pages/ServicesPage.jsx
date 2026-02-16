import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { servicesAPI } from "@/shared/api/http";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus, Pencil, Trash2 } from "lucide-react";

const ServicesPage = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesAPI.getAll().then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => servicesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Servis o'chirildi!");
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Servislar</h1>
          <p className="text-sm text-gray-500">Kundalik xizmatlar boshqaruvi</p>
        </div>
        <button
          onClick={() => dispatch(open({ modal: "createService" }))}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Yangi servis
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service._id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{service.name}</p>
              <div className="flex gap-1">
                <button onClick={() => dispatch(open({ modal: "editService", data: service }))}
                  className="p-1 text-gray-400 hover:text-blue-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => {
                  if (confirm("O'chirishni tasdiqlaysizmi?")) deleteMutation.mutate(service._id);
                }} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">Icon: {service.icon || "—"}</p>
          </div>
        ))}
      </div>

      <ModalWrapper name="createService" title="Yangi servis">
        <ServiceForm mode="create" />
      </ModalWrapper>
      <ModalWrapper name="editService" title="Servisni tahrirlash">
        <ServiceForm mode="edit" />
      </ModalWrapper>
    </div>
  );
};

const ServiceForm = ({ mode, _id, name = "", icon = "", close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name, icon });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Servis nomini kiriting");
    setIsLoading(true);
    try {
      if (mode === "create") {
        await servicesAPI.create(form);
      } else {
        await servicesAPI.update(_id, form);
      }
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success(mode === "create" ? "Servis yaratildi!" : "Servis yangilandi!");
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
        <label className="block text-sm font-medium mb-1">Nomi</label>
        <input type="text" value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Icon nomi (Lucide)</label>
        <input type="text" value={form.icon}
          onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg" placeholder="Masalan: Flame, Zap" />
      </div>
      <button type="submit" disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
        {isLoading ? "Saqlanmoqda..." : mode === "create" ? "Yaratish" : "Saqlash"}
      </button>
    </form>
  );
};

export default ServicesPage;
