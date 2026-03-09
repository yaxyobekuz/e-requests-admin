import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mskAPI } from "@/shared/api";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/shared/components/ui/button/Button";
import CategoryForm from "../components/CategoryForm";

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
        <Button
          onClick={() => dispatch(open({ modal: "createMskCategory" }))}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Yangi kategoriya
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{cat.name}</p>
              <div className="flex gap-1">
                <Button onClick={() => dispatch(open({ modal: "editMskCategory", data: cat }))}
                  variant="ghost"
                  size="icon"
                  className="p-1">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button onClick={() => {
                  if (confirm("O'chirishni tasdiqlaysizmi?")) deleteMutation.mutate(cat._id);
                }}
                  variant="ghost"
                  size="icon"
                  className="p-1">
                  <Trash2 className="w-4 h-4" />
                </Button>
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

export default MskCategoriesPage;

