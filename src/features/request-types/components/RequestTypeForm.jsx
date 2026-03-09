import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { requestTypesAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * Create or edit request type modal form.
 * @param {Object} props - Modal form props from ModalWrapper.
 * @param {"create"|"edit"} props.mode - Form mode.
 * @param {string} [props._id] - Request type id for edit mode.
 * @param {string} [props.name] - Initial request type name.
 * @param {Function} props.close - Closes current modal.
 * @param {boolean} props.isLoading - Current submit loading state.
 * @param {Function} props.setIsLoading - Updates submit loading state.
 * @returns {JSX.Element} Request type form.
 */
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
      <InputField
        name="name"
        label="Nomi"
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="Masalan: Shikoyat, Taklif"
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saqlanmoqda..." : mode === "create" ? "Yaratish" : "Saqlash"}
      </Button>
    </form>
  );
};

export default RequestTypeForm;
