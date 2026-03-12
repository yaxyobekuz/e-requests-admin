import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { productsAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * Mahsulot yaratish yoki tahrirlash formasi.
 * @param {Object} props - ModalWrapper tomonidan berilgan props.
 * @param {"create"|"edit"} props.mode - Forma rejimi.
 * @param {string} [props._id] - Tahrirlash rejimida mahsulot ID.
 * @param {string} [props.name] - Boshlang'ich mahsulot nomi.
 * @param {Function} props.close - Modalni yopish.
 * @param {boolean} props.isLoading - Submit loading holati.
 * @param {Function} props.setIsLoading - Loading holatini yangilash.
 * @returns {JSX.Element}
 */
const ProductForm = ({ mode, _id, name = "", close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Mahsulot nomini kiriting");

    setIsLoading(true);
    try {
      if (mode === "create") {
        await productsAPI.create({ name: form.name.trim() });
      } else {
        await productsAPI.update(_id, { name: form.name.trim() });
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(mode === "create" ? "Mahsulot yaratildi!" : "Mahsulot yangilandi!");
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
        onChange={(e) => setForm({ name: e.target.value })}
        placeholder="Masalan: Kartoshka, Piyoz"
      />
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saqlanmoqda..." : mode === "create" ? "Yaratish" : "Saqlash"}
      </Button>
    </form>
  );
};

export default ProductForm;
