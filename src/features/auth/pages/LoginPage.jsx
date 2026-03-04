import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useObjectState from "@/shared/hooks/useObjectState";
import bgImage from "../assets/backgrounds/meeting.avif";
import { ADMIN_AUTH_STEPS } from "../auth.data";
import PhoneStep from "../components/steps/PhoneStep";
import LoginStep from "../components/steps/LoginStep";
import OtpStep from "../components/steps/OtpStep";

const STEP_META = {
  [ADMIN_AUTH_STEPS.PHONE]: {
    title: "Xush kelibsiz! 👋",
    subtitle: "Davom etish uchun tizimga kiring",
  },
  [ADMIN_AUTH_STEPS.LOGIN]: {
    title: "Tizimga kirish",
    subtitle: "Parolni kiriting yoki Telegram orqali kiring",
  },
  [ADMIN_AUTH_STEPS.OTP]: {
    title: "Telegram kodi bilan kirish",
    subtitle: "Telegram botidan olgan 5 xonali kodni kiriting",
  },
};

const BACK_MAP = {
  [ADMIN_AUTH_STEPS.LOGIN]: ADMIN_AUTH_STEPS.PHONE,
  [ADMIN_AUTH_STEPS.OTP]: ADMIN_AUTH_STEPS.LOGIN,
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const { phone, password, otp, setField, setFields } = useObjectState({
    phone: "",
    password: "",
    otp: "",
  });

  const step = searchParams.get("step") || ADMIN_AUTH_STEPS.PHONE;

  const goToStep = (s, replace = false) => setSearchParams({ step: s }, { replace });

  useEffect(() => {
    if (!STEP_META[step]) goToStep(ADMIN_AUTH_STEPS.PHONE, true);
  }, [step]);

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleBack = () => {
    const backStep = BACK_MAP[step];
    if (backStep) {
      setFields({ otp: "", password: "" });
      goToStep(backStep);
    }
  };

  const handleAuthSuccess = ({ token, user }) => {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(user));
    navigate("/dashboard");
  };

  const meta = STEP_META[step] || STEP_META[ADMIN_AUTH_STEPS.PHONE];
  const hasBack = !!BACK_MAP[step];

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      {/* Left side: branding */}
      <img src={bgImage} className="hidden w-1/2 object-cover lg:block" />

      {/* Right side: form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-none sm:bg-transparent border border-slate-100 sm:border-none p-8 sm:p-0">
          {hasBack && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Orqaga
            </button>
          )}

          <div className="text-center sm:text-left mb-8">
            <div className="lg:hidden w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-4 shadow-sm">
              <span className="text-white text-xl font-bold tracking-wider">E</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {meta.title}
            </h2>
            <p className="text-slate-500">{meta.subtitle}</p>
          </div>

          {step === ADMIN_AUTH_STEPS.PHONE && (
            <PhoneStep
              phone={phone}
              onChange={handleChange}
              onSuccess={() => goToStep(ADMIN_AUTH_STEPS.LOGIN)}
            />
          )}
          {step === ADMIN_AUTH_STEPS.LOGIN && (
            <LoginStep
              phone={phone}
              password={password}
              onChange={handleChange}
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              onSuccess={handleAuthSuccess}
              onTelegramClick={() => goToStep(ADMIN_AUTH_STEPS.OTP)}
            />
          )}
          {step === ADMIN_AUTH_STEPS.OTP && (
            <OtpStep
              phone={phone}
              otp={otp}
              onChange={handleChange}
              onSuccess={handleAuthSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
