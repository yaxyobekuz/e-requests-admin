import InputOtp from "@/shared/components/ui/input/InputOtp";

/**
 * 5 xonali OTP kiritish maydoni
 * @param {{value: string, onChange: function}} props
 */
const OtpField = ({ value, onChange }) => (
  <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
    <label className="block text-sm font-semibold text-slate-700">
      Tasdiqlash kodi
    </label>
    <InputOtp
      value={value}
      onComplete={(val) => onChange({ target: { name: "otp", value: val } })}
    />
  </div>
);

export default OtpField;
