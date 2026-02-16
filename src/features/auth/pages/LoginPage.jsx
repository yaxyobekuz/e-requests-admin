import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authAPI } from "@/shared/api/http";
import PhoneInput from "@/shared/components/ui/PhoneInput";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 12) {
      return toast.error("Telefon raqamni to'liq kiriting");
    }
    if (!form.password) {
      return toast.error("Parolni kiriting");
    }

    setLoading(true);
    try {
      const { data } = await authAPI.login({
        phone: `+${cleanPhone}`,
        password: form.password,
      });
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      toast.success("Muvaffaqiyatli kirdingiz!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Kirishda xatolik yuz berdi",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-bold">E</span>
          </div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Tizimga kiring</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Telefon raqam
            </label>
            <PhoneInput
              value={form.phone}
              onChange={handleChange}
              name="phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Parol</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Parolingizni kiriting"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Kirilyapti..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
