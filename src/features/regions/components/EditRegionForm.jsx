import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { regionsAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * Edit region modal form.
 * @param {Object} props - Modal form props from ModalWrapper.
 * @param {string} props._id - Region id.
 * @param {string} [props.name] - Initial region name.
 * @param {Function} props.close - Closes current modal.
 * @param {boolean} props.isLoading - Current submit loading state.
 * @param {Function} props.setIsLoading - Updates submit loading state.
 * @returns {JSX.Element} Edit region form.
 */
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
      <InputField
        name="name"
        label="Nomi"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saqlanmoqda..." : "Saqlash"}
      </Button>
    </form>
  );
};

export default EditRegionForm;
