import { toast } from "sonner";
import { Phone } from "lucide-react";
import PhoneInput from "@/shared/components/ui/PhoneInput";
import SubmitButton from "../SubmitButton";

/**
 * Telefon raqam kiritish qadami.
 * Tasdiqlanganda onSuccess() chaqiriladi.
 * @param {{phone: string, onChange: function, onSuccess: function}} props
 */
const PhoneStep = ({ phone, onChange, onSuccess }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 12) return toast.error("Telefon raqamni to'liq kiriting");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
        <label className="block text-sm font-semibold text-slate-700">
          Telefon raqam
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Phone className="w-5 h-5" />
          </div>
          <PhoneInput
            value={phone}
            onChange={onChange}
            name="phone"
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium tracking-wide"
          />
        </div>
      </div>
      <SubmitButton loading={false} label="Davom etish" loadingLabel="" />
    </form>
  );
};

export default PhoneStep;
