import { useState } from "react";
import { toast } from "sonner";
import { authAPI } from "@/shared/api/http";
import OtpHintBlock from "../OtpHintBlock";
import OtpField from "../OtpField";
import SubmitButton from "../SubmitButton";

/**
 * Telegram OTP kodi orqali kirish qadami.
 * Muvaffaqiyatli kirishda onSuccess({ token, user }) chaqiriladi.
 * @param {{phone: string, otp: string, onChange: function, onSuccess: function}} props
 */
const OtpStep = ({ phone, otp, onChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 5) return toast.error("5 xonali kodni to'liq kiriting");
    setLoading(true);
    try {
      const { data } = await authAPI.loginWithOtp({
        phone: `+${phone.replace(/\D/g, "")}`,
        code: otp,
      });
      onSuccess(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OtpHintBlock />
      <OtpField value={otp} onChange={onChange} />
      <SubmitButton
        loading={loading}
        label="Tizimga kirish"
        loadingLabel="Tekshirilmoqda..."
      />
    </form>
  );
};

export default OtpStep;
