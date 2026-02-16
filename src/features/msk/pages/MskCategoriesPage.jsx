import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mskAPI } from "@/shared/api/http";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus, Pencil, Trash2 } from "lucide-react";

const MskCategoriesPage = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: categories = [] } = useQuery({
    queryKey: ["msk", "categories"],
    queryFn: () => mskAPI.getCategories().then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => mskAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["msk", "categories"] });
      toast.success("Kategoriya o'chirildi!");
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">MSK kategoriyalari</h1>
          <p className="text-sm text-gray-500">Maishiy xizmat turlari</p>
        </div>
        <button
          onClick={() => dispatch(open({ modal: "createMskCategory" }))}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Yangi kategoriya
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{cat.name}</p>
              <div className="flex gap-1">
                <button onClick={() => dispatch(open({ modal: "editMskCategory", data: cat }))}
                  className="p-1 text-gray-400 hover:text-blue-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => {
                  if (confirm("O'chirishni tasdiqlaysizmi?")) deleteMutation.mutate(cat._id);
                }} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">Icon: {cat.icon || "—"}</p>
          </div>
        ))}
      </div>

      <ModalWrapper name="createMskCategory" title="Yangi kategoriya">
        <CategoryForm mode="create" />
      </ModalWrapper>
      <ModalWrapper name="editMskCategory" title="Kategoriyani tahrirlash">
        <CategoryForm mode="edit" />
      </ModalWrapper>
    </div>
  );
};

const CategoryForm = ({ mode, _id, name = "", icon = "", close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name, icon });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Kategoriya nomini kiriting");
    setIsLoading(true);
    try {
      if (mode === "create") {
        await mskAPI.createCategory(form);
      } else {
        await mskAPI.updateCategory(_id, form);
      }
      queryClient.invalidateQueries({ queryKey: ["msk", "categories"] });
      toast.success(mode === "create" ? "Kategoriya yaratildi!" : "Kategoriya yangilandi!");
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
          className="w-full px-3 py-2 border rounded-lg" placeholder="Masalan: Plug, Wrench" />
      </div>
      <button type="submit" disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
        {isLoading ? "Saqlanmoqda..." : mode === "create" ? "Yaratish" : "Saqlash"}
      </button>
    </form>
  );
};

export default MskCategoriesPage;
