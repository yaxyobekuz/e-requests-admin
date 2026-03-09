import { Lock } from "lucide-react";
import InputPwd from "@/shared/components/ui/input/InputPwd";

/**
 * Parol kiritish maydoni — ko'rish/yashirish tugmasi bilan
 * @param {{value: string, onChange: function, show: boolean, onToggle: function, placeholder: string}} props
 */
const PasswordField = ({ value, onChange, placeholder }) => (
  <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
    <label className="block text-sm font-semibold text-slate-700">Parol</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Lock className="w-5 h-5" />
      </div>
      <InputPwd
        name="password"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10"
      />
    </div>
  </div>
);

export default PasswordField;
