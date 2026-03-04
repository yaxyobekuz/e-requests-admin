import { Eye, EyeOff, Lock } from "lucide-react";

/**
 * Parol kiritish maydoni — ko'rish/yashirish tugmasi bilan
 * @param {{value: string, onChange: function, show: boolean, onToggle: function, placeholder: string}} props
 */
const PasswordField = ({ value, onChange, show, onToggle, placeholder }) => (
  <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
    <label className="block text-sm font-semibold text-slate-700">Parol</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Lock className="w-5 h-5" />
      </div>
      <input
        type={show ? "text" : "password"}
        name="password"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>
);

export default PasswordField;
