import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestTypesAPI } from "@/shared/api/http";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

const RequestTypesPage = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: types = [] } = useQuery({
    queryKey: ["request-types"],
    queryFn: () => requestTypesAPI.getAll().then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => requestTypesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-types"] });
      toast.success("Murojaat turi o'chirildi!");
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Murojaat turlari</h1>
          <p className="text-sm text-gray-500">Murojaat turlarini boshqarish</p>
        </div>
        <button
          onClick={() => dispatch(open({ modal: "createRequestType" }))}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Yangi tur
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {types.map((type) => (
          <div key={type._id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{type.name}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => dispatch(open({ modal: "editRequestType", data: type }))}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("O'chirishni tasdiqlaysizmi?")) deleteMutation.mutate(type._id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ModalWrapper name="createRequestType" title="Yangi murojaat turi">
        <RequestTypeForm mode="create" />
      </ModalWrapper>
      <ModalWrapper name="editRequestType" title="Murojaat turini tahrirlash">
        <RequestTypeForm mode="edit" />
      </ModalWrapper>
    </div>
  );
};

const RequestTypeForm = ({ mode, _id, name = "", close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Murojaat turi nomini kiriting");
    setIsLoading(true);
    try {
      if (mode === "create") {
        await requestTypesAPI.create(form);
      } else {
        await requestTypesAPI.update(_id, form);
      }
      queryClient.invalidateQueries({ queryKey: ["request-types"] });
      toast.success(mode === "create" ? "Murojaat turi yaratildi!" : "Murojaat turi yangilandi!");
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
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Masalan: Shikoyat, Taklif"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {isLoading ? "Saqlanmoqda..." : mode === "create" ? "Yaratish" : "Saqlash"}
      </button>
    </form>
  );
};

export default RequestTypesPage;
