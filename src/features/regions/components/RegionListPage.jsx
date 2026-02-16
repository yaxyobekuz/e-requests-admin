import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { regionsAPI } from "@/shared/api/http";
import { REGION_TYPES } from "@/shared/data/region-types";
import Breadcrumb from "@/shared/components/ui/Breadcrumb";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/**
 * @param {Object} props
 * @param {string} props.type - region | district | neighborhood | street
 * @param {string} [props.parentId] - parent region ID from route params
 * @param {function} [props.getChildRoute] - (item) => child route path
 * @param {{label: string, href?: string}[]} [props.breadcrumbs] - breadcrumb items
 */
const RegionListPage = ({ type, parentId, getChildRoute, breadcrumbs = [] }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: items = [] } = useQuery({
    queryKey: ["regions", type, parentId],
    queryFn: () =>
      regionsAPI
        .getAll({ type, ...(parentId ? { parent: parentId } : {}) })
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => regionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Hudud o'chirildi!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const allBreadcrumbs = [
    ...breadcrumbs,
    { label: REGION_TYPES[type]?.plural },
  ];

  // Only show breadcrumbs if we're deeper than regions level
  const showBreadcrumbs = type !== "region";

  return (
    <div className="p-6">


      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {REGION_TYPES[type]?.plural || "Hududlar"}
        </h1>
        <button
          onClick={() =>
            dispatch(
              open({
                modal: "createRegion",
                data: { type, parentId },
              })
            )
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Yangi{" "}
          {REGION_TYPES[type]?.label?.toLowerCase()}
        </button>
      </div>

            {showBreadcrumbs && (
        <div className="mb-4">
          <Breadcrumb items={allBreadcrumbs} />
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Nomi
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {getChildRoute ? (
                    <button
                      onClick={() => navigate(getChildRoute(item))}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <span className="font-medium">{item.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() =>
                        dispatch(open({ modal: "editRegion", data: item }))
                      }
                      className="p-1.5 text-gray-400 hover:text-blue-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("O'chirishni tasdiqlaysizmi?"))
                          deleteMutation.mutate(item._id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Hududlar topilmadi
          </div>
        )}
      </div>

      <ModalWrapper name="createRegion" title="Yangi hudud qo'shish">
        <CreateRegionForm />
      </ModalWrapper>
      <ModalWrapper name="editRegion" title="Hududni tahrirlash">
        <EditRegionForm />
      </ModalWrapper>
    </div>
  );
};

const CreateRegionForm = ({ type, parentId, close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nomni kiriting");
    setIsLoading(true);
    try {
      await regionsAPI.create({ name: name.trim(), type, parent: parentId });
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Hudud yaratildi!");
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
        <label className="block text-sm font-medium mb-1">
          {REGION_TYPES[type]?.label || "Hudud"} nomi
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Nomni kiriting"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {isLoading ? "Yaratilmoqda..." : "Yaratish"}
      </button>
    </form>
  );
};

const EditRegionForm = ({ _id, name = "", close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState(name);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return toast.error("Nomni kiriting");
    setIsLoading(true);
    try {
      await regionsAPI.update(_id, { name: newName.trim() });
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Hudud yangilandi!");
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
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {isLoading ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
};

export default RegionListPage;
