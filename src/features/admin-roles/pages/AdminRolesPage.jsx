import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminRolesAPI } from "@/shared/api";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/shared/components/ui/button/Button";
import AdminRoleForm from "../components/AdminRoleForm";
import {
  PAGE_TITLE,
  PAGE_SUBTITLE,
  BTN_NEW,
  MODAL_CREATE_TITLE,
  MODAL_EDIT_TITLE,
  COL_NAME,
  COL_REQUESTS,
  COL_SERVICES,
  COL_MSK,
  BADGE_ALLOWED,
  BADGE_BLOCKED,
  MSG_EMPTY,
  MSG_DELETE_CONFIRM,
  MSG_DELETED,
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
        <Button
          onClick={() => dispatch(open({ modal: "createAdminRole" }))}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {BTN_NEW}
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                {COL_NAME}
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                {COL_REQUESTS}
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                {COL_SERVICES}
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                {COL_MSK}
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {roles.map((role) => (
              <tr key={role._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{role.name}</td>
                {["requests", "services", "msk"].map((mod) => (
                  <td key={mod} className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        role.executionPermissions?.[mod]
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {role.executionPermissions?.[mod]
                        ? BADGE_ALLOWED
                        : BADGE_BLOCKED}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      onClick={() =>
                        dispatch(open({ modal: "editAdminRole", data: role }))
                      }
                      variant="ghost"
                      size="icon"
                      className="p-1.5"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm(MSG_DELETE_CONFIRM))
                          deleteMutation.mutate(role._id);
                      }}
                      variant="ghost"
                      size="icon"
                      className="p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

export default AdminRolesPage;
