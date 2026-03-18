import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminRolesAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import { Switch } from "@/shared/components/shadcn/switch";

import {
  LABEL_NAME,
  MSG_CREATED,
  MSG_UPDATED,
  PLACEHOLDER_NAME,
  EXECUTION_MODULES,
  ERR_NAME_REQUIRED,
  LABEL_EXECUTION_PERMISSIONS,
} from "../pages/AdminRolesPage.data";

const DEFAULT_EXECUTION_PERMISSIONS = {
  msk: false,
  requests: false,
  services: false,
};

const AdminRoleForm = ({
  mode,
  _id,
  name = "",
  executionPermissions,
  close,
  isLoading,
  setIsLoading,
}) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name,
    executionPermissions: executionPermissions
      ? { ...DEFAULT_EXECUTION_PERMISSIONS, ...executionPermissions }
      : { ...DEFAULT_EXECUTION_PERMISSIONS },
  });

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
      <InputField
        name="name"
        label={LABEL_NAME}
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        placeholder={PLACEHOLDER_NAME}
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium">
          {LABEL_EXECUTION_PERMISSIONS}
        </label>
        {EXECUTION_MODULES.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label}</span>
            <Switch
              checked={form.executionPermissions[key]}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  executionPermissions: {
                    ...prev.executionPermissions,
                    [key]: checked,
                  },
                }))
              }
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading
          ? "Saqlanmoqda..."
          : mode === "create"
            ? "Yaratish"
            : "Saqlash"}
      </Button>
    </form>
  );
};

export default AdminRoleForm;
