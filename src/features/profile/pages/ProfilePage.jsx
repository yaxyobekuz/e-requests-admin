import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, UserCircle } from "lucide-react";
import { profileAPI } from "../api";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import InputPwd from "@/shared/components/ui/input/InputPwd";

/**
 * Owner profil sahifasi — asosiy ma'lumotlar va parol o'zgartirish
 */
const ProfilePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/login");
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileAPI.getMe().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-sm text-gray-500 mt-1">Shaxsiy ma'lumotlaringiz</p>
      </div>

      <InfoSection user={user} queryClient={queryClient} />
      <PasswordSection />
      <LogoutSection onLogout={handleLogout} />
    </div>
  );
};

// ============ ASOSIY MA'LUMOTLAR ============

/**
 * Alias, ism, familiyani tahrirlaydigan bo'lim
 * @param {{ user: object, queryClient: object }} props
 */
const InfoSection = ({ user, queryClient }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    alias: user?.alias || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await profileAPI.updateMe(form);
      const stored = JSON.parse(localStorage.getItem("admin_user") || "{}");
      localStorage.setItem("admin_user", JSON.stringify({ ...stored, ...res.data }));
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      toast.success("Ma'lumotlar saqlandi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <UserCircle className="w-7 h-7 text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">
            {user?.alias || user?.firstName || "Owner"}
          </p>
          <p className="text-sm text-gray-500">{user?.phone}</p>
        </div>
        <span className="ml-auto text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium flex-shrink-0">
          Egasi
        </span>
      </div>

      <hr className="border-gray-100" />

      <div>
        <label className="block text-sm font-medium mb-1">Tahallus</label>
        <Input
          type="text"
          value={form.alias}
          onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))}
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ism</label>
          <Input
            type="text"
            value={form.firstName}
            onChange={(e) =>
              setForm((p) => ({ ...p, firstName: e.target.value }))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Familiya</label>
          <Input
            type="text"
            value={form.lastName}
            onChange={(e) =>
              setForm((p) => ({ ...p, lastName: e.target.value }))
            }
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

// ============ PAROL O'ZGARTIRISH ============

/**
 * Joriy + yangi parol bilan parolni o'zgartirish
 */
const PasswordSection = () => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Yangi parollar mos kelmadi");
      return;
    }
    setSaving(true);
    try {
      await profileAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Parol muvaffaqiyatli o'zgartirildi!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <h3 className="font-semibold">Parolni o'zgartirish</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Joriy parol</label>
        <InputPwd
          value={form.currentPassword}
          onChange={(e) =>
            setForm((p) => ({ ...p, currentPassword: e.target.value }))
          }
          placeholder="Joriy parolni kiriting"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Yangi parol</label>
        <InputPwd
          value={form.newPassword}
          onChange={(e) =>
            setForm((p) => ({ ...p, newPassword: e.target.value }))
          }
          placeholder="Yangi parolni kiriting"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Yangi parolni tasdiqlang
        </label>
        <InputPwd
          value={form.confirmPassword}
          onChange={(e) =>
            setForm((p) => ({ ...p, confirmPassword: e.target.value }))
          }
          placeholder="Yangi parolni qayta kiriting"
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={
            saving ||
            !form.currentPassword ||
            !form.newPassword ||
            !form.confirmPassword
          }
        >
          {saving ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}
        </Button>
      </div>
    </div>
  );
};

// ============ HISOBDAN CHIQISH ============

/**
 * Hisobdan chiqish bo'limi
 * @param {{ onLogout: function }} props
 */
const LogoutSection = ({ onLogout }) => (
  <div className="bg-white border border-red-100 rounded-xl p-5 flex items-center justify-between">
    <div>
      <p className="font-semibold text-sm">Hisobdan chiqish</p>
      <p className="text-xs text-gray-500 mt-0.5">Tizimdan xavfsiz chiqib keting</p>
    </div>
    <Button
      variant="outline"
      onClick={onLogout}
      className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
    >
      <LogOut className="w-4 h-4" />
      Chiqish
    </Button>
  </div>
);

export default ProfilePage;
