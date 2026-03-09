import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { servicesAPI } from "@/shared/api";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/shared/components/ui/button/Button";
import ServiceForm from "../components/ServiceForm";

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
        <Button
          onClick={() => dispatch(open({ modal: "createService" }))}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Yangi servis
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service._id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{service.name}</p>
              <div className="flex gap-1">
                <Button onClick={() => dispatch(open({ modal: "editService", data: service }))}
                  variant="ghost"
                  size="icon"
                  className="p-1">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button onClick={() => {
                  if (confirm("O'chirishni tasdiqlaysizmi?")) deleteMutation.mutate(service._id);
                }}
                  variant="ghost"
                  size="icon"
                  className="p-1">
                  <Trash2 className="w-4 h-4" />
                </Button>
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

export default ServicesPage;

