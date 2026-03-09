import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminRolesAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";

import {
  ERR_NAME_REQUIRED,
  LABEL_DESCRIPTION,
  LABEL_NAME,
  MSG_CREATED,
  MSG_UPDATED,
  PLACEHOLDER_DESCRIPTION,
  PLACEHOLDER_NAME,
} from "../pages/AdminRolesPage.data";

/**
 * Create or edit admin role modal form.
 * @param {Object} props - Modal form props from ModalWrapper.
 * @param {"create"|"edit"} props.mode - Form mode.
 * @param {string} [props._id] - Role id for edit mode.
 * @param {string} [props.name] - Initial role name.
 * @param {string} [props.description] - Initial role description.
 * @param {Function} props.close - Closes current modal.
 * @param {boolean} props.isLoading - Current submit loading state.
 * @param {Function} props.setIsLoading - Updates submit loading state.
 * @returns {JSX.Element} Admin role form.
 */
const AdminRoleForm = ({
  mode,
  _id,
  name = "",
  description = "",
  close,
  isLoading,
  setIsLoading,
}) => {
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
      <InputGroup className="gap-3">
        <InputField
          name="name"
          label={LABEL_NAME}
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder={PLACEHOLDER_NAME}
        />

        <div>
          <label className="block text-sm font-medium mb-1">{LABEL_DESCRIPTION}</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg resize-none"
            rows={3}
            placeholder={PLACEHOLDER_DESCRIPTION}
          />
        </div>
      </InputGroup>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saqlanmoqda..." : mode === "create" ? "Yaratish" : "Saqlash"}
      </Button>
    </form>
  );
};

export default AdminRoleForm;
