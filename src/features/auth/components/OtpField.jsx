/**
 * 5 xonali OTP kiritish maydoni
 * @param {{value: string, onChange: function}} props
 */
const OtpField = ({ value, onChange }) => (
  <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
    <label className="block text-sm font-semibold text-slate-700">
      Tasdiqlash kodi
    </label>
    <input
      type="text"
      name="otp"
      value={value}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
        onChange({ target: { name: "otp", value: digits } });
      }}
      placeholder="XXXXX"
      maxLength={5}
      inputMode="numeric"
      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-2xl tracking-[0.5em] text-center"
    />
  </div>
);

export default OtpField;
