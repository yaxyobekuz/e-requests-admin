import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { authAPI } from "@/shared/api";
import PasswordField from "../PasswordField";
import SubmitButton from "../SubmitButton";
import Button from "@/shared/components/ui/button/Button";

/**
 * Parol bilan kirish qadami.
 * Telegram tugmasi botni yangi oynada ochib, onTelegramClick orqali keyingi stepga o'tadi.
 * Muvaffaqiyatli kirishda onSuccess({ token, user }) chaqiriladi.
 * @param {{phone: string, password: string, onChange: function, onSuccess: function, onTelegramClick: function}} props
 */
const LoginStep = ({
  phone,
  password,
  onChange,
  onSuccess,
  onTelegramClick,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return toast.error("Parolni kiriting");
    setLoading(true);
    try {
      const { data } = await authAPI.login({
        phone: `+${phone.replace(/\D/g, "")}`,
        password,
      });
      onSuccess(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramClick = () => onTelegramClick();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PasswordField
        value={password}
        onChange={onChange}
        placeholder="Parolingizni kiriting"
      />

      <SubmitButton
        loading={loading}
        label="Tizimga kirish"
        loadingLabel="Kirish jarayoni..."
      />

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">yoki</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <Button
        type="button"
        onClick={handleTelegramClick}
        variant="outline"
        className="w-full flex items-center justify-center gap-2.5"
      >
        <Send className="w-4 h-4" />
        Telegram orqali kirish
      </Button>
    </form>
  );
};

export default LoginStep;

