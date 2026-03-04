import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { authAPI } from "@/shared/api/http";
import { BOT_LINK } from "../../auth.data";
import PasswordField from "../PasswordField";
import SubmitButton from "../SubmitButton";

/**
 * Parol bilan kirish qadami.
 * Telegram tugmasi botni yangi oynada ochib, onTelegramClick orqali keyingi stepga o'tadi.
 * Muvaffaqiyatli kirishda onSuccess({ token, user }) chaqiriladi.
 * @param {{phone: string, password: string, onChange: function, show: boolean, onToggle: function, onSuccess: function, onTelegramClick: function}} props
 */
const LoginStep = ({
  phone,
  password,
  onChange,
  show,
  onToggle,
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

  const handleTelegramClick = () => {
    window.open(BOT_LINK, "_blank", "noreferrer");
    onTelegramClick();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PasswordField
        value={password}
        onChange={onChange}
        show={show}
        onToggle={onToggle}
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

      <button
        type="button"
        onClick={handleTelegramClick}
        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 border-sky-400 text-sky-600 hover:bg-sky-50 transition-all font-semibold text-sm"
      >
        <Send className="w-4 h-4" />
        Telegram orqali kirish
      </button>
    </form>
  );
};

export default LoginStep;
