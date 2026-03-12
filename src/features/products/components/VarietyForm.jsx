import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { productsAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * Mahsulot navi yaratish yoki tahrirlash formasi.
 * @param {Object} props - ModalWrapper tomonidan berilgan props.
 * @param {"create"|"edit"} props.mode - Forma rejimi.
 * @param {string} props.productId - Tegishli mahsulot ID.
 * @param {string} [props._id] - Tahrirlash rejimida nav ID.
 * @param {string} [props.name] - Boshlang'ich nav nomi.
 * @param {Function} props.close - Modalni yopish.
 * @param {boolean} props.isLoading - Submit loading holati.
 * @param {Function} props.setIsLoading - Loading holatini yangilash.
 * @returns {JSX.Element}
 */
const VarietyForm = ({ mode, productId, _id, name = "", close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nav nomini kiriting");

    setIsLoading(true);
    try {
      if (mode === "create") {
        await productsAPI.addVariety(productId, { name: form.name.trim() });
      } else {
        await productsAPI.updateVariety(productId, _id, { name: form.name.trim() });
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(mode === "create" ? "Nav qo'shildi!" : "Nav yangilandi!");
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
        label="Nav nomi"
        value={form.name}
        onChange={(e) => setForm({ name: e.target.value })}
        placeholder="Masalan: Nevskiy, Sante, Impala"
      />
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saqlanmoqda..." : mode === "create" ? "Qo'shish" : "Saqlash"}
      </Button>
    </form>
  );
};

export default VarietyForm;
