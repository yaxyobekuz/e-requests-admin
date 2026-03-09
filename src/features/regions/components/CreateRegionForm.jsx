import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { regionsAPI } from "@/shared/api";
import { REGION_TYPES } from "@/shared/data/region-types";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * Create region modal form.
 * @param {Object} props - Modal form props from ModalWrapper.
 * @param {string} props.type - region type.
 * @param {string} [props.parentId] - Parent region id.
 * @param {Function} props.close - Closes current modal.
 * @param {boolean} props.isLoading - Current submit loading state.
 * @param {Function} props.setIsLoading - Updates submit loading state.
 * @returns {JSX.Element} Create region form.
 */
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
      <InputField
        name="name"
        label={`${REGION_TYPES[type]?.label || "Hudud"} nomi`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nomni kiriting"
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Yaratilmoqda..." : "Yaratish"}
      </Button>
    </form>
  );
};

export default CreateRegionForm;
