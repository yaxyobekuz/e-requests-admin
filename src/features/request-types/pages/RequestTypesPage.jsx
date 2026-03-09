import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestTypesAPI } from "@/shared/api";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/shared/components/ui/button/Button";
import RequestTypeForm from "../components/RequestTypeForm";

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
        <Button
          onClick={() => dispatch(open({ modal: "createRequestType" }))}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Yangi tur
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {types.map((type) => (
          <div key={type._id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{type.name}</p>
              <div className="flex gap-1">
                <Button
                  onClick={() => dispatch(open({ modal: "editRequestType", data: type }))}
                  variant="ghost"
                  size="icon"
                  className="p-1"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    if (confirm("O'chirishni tasdiqlaysizmi?")) deleteMutation.mutate(type._id);
                  }}
                  variant="ghost"
                  size="icon"
                  className="p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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

export default RequestTypesPage;

