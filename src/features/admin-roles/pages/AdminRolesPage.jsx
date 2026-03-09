import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminRolesAPI } from "@/shared/api/http";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  PAGE_TITLE,
  PAGE_SUBTITLE,
  BTN_NEW,
  MODAL_CREATE_TITLE,
  MODAL_EDIT_TITLE,
  COL_NAME,
  COL_DESCRIPTION,
  MSG_EMPTY,
  MSG_DELETE_CONFIRM,
  MSG_DELETED,
  ERR_NAME_REQUIRED,
  LABEL_NAME,
  LABEL_DESCRIPTION,
  PLACEHOLDER_NAME,
  PLACEHOLDER_DESCRIPTION,
  MSG_CREATED,
  MSG_UPDATED,
} from "./AdminRolesPage.data";

const AdminRolesPage = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => adminRolesAPI.getAll().then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminRolesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success(MSG_DELETED);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{PAGE_TITLE}</h1>
          <p className="text-sm text-gray-500">{PAGE_SUBTITLE}</p>
        </div>
        <button
          onClick={() => dispatch(open({ modal: "createAdminRole" }))}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {BTN_NEW}
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{COL_NAME}</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{COL_DESCRIPTION}</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {roles.map((role) => (
              <tr key={role._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{role.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{role.description || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => dispatch(open({ modal: "editAdminRole", data: role }))}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(MSG_DELETE_CONFIRM)) deleteMutation.mutate(role._id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roles.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">{MSG_EMPTY}</div>
        )}
      </div>

      <ModalWrapper name="createAdminRole" title={MODAL_CREATE_TITLE}>
        <AdminRoleForm mode="create" />
      </ModalWrapper>
      <ModalWrapper name="editAdminRole" title={MODAL_EDIT_TITLE}>
        <AdminRoleForm mode="edit" />
      </ModalWrapper>
    </div>
  );
};

const AdminRoleForm = ({ mode, _id, name = "", description = "", close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name, description });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error(ERR_NAME_REQUIRED);
    setIsLoading(true);
    try {
      if (mode === "create") {
        await adminRolesAPI.create(form);
        toast.success(MSG_CREATED);
      } else {
        await adminRolesAPI.update(_id, form);
        toast.success(MSG_UPDATED);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
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
        <label className="block text-sm font-medium mb-1">{LABEL_NAME}</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder={PLACEHOLDER_NAME}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{LABEL_DESCRIPTION}</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg resize-none"
          rows={3}
          placeholder={PLACEHOLDER_DESCRIPTION}
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

export default AdminRolesPage;
