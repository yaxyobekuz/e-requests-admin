import { MessageCircle, Send } from "lucide-react";
import { BOT_LINK, OTP_HINT } from "../auth.data";

/**
 * Telegram botga yo'naltiruvchi hint blok — OTP qadamlarida ko'rsatiladi
 */
const OtpHintBlock = () => (
  <div className="space-y-3">
    <a
      href={BOT_LINK}
      target="_blank"
      rel="noreferrer"
      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl border-2 border-sky-400 text-sky-600 hover:bg-sky-50 transition-all font-semibold"
    >
      <Send className="w-4 h-4" />
      Telegram
    </a>
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <MessageCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <p className="text-xs text-slate-500 leading-relaxed">{OTP_HINT}</p>
    </div>
  </div>
);

export default OtpHintBlock;
