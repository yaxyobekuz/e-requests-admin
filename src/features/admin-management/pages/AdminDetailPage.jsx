import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminsAPI, regionsAPI, requestTypesAPI, servicesAPI, mskAPI } from "@/shared/api/http";
import { ArrowLeft, Trash2, icons } from "lucide-react";
import { Switch } from "@/shared/components/shadcn/switch";

const REGION_TYPE_LABELS = { region: "Viloyat", district: "Tuman", neighborhood: "Mahalla", street: "Ko'cha" };

// Lucide ikonkasini nom bo'yicha render qilish
const LucideIcon = ({ name, className = "w-4 h-4" }) => {
  const IconComponent = icons[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

const AdminDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  const { data: admin, isLoading } = useQuery({
    queryKey: ["admins", id],
    queryFn: () => adminsAPI.getById(id).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Admin topilmadi</p>
        <button onClick={() => navigate("/admins")} className="mt-4 text-blue-600 hover:underline text-sm">
          Adminlarga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/admins")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{admin.alias || admin.firstName || "Admin"}</h1>
          <p className="text-sm text-gray-500">{admin.phone}</p>
        </div>
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${admin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {admin.isActive ? "Faol" : "Nofaol"}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "info"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Ma'lumotlar
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "permissions"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Ruxsatlar
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "info" && <AdminInfoTab admin={admin} />}
      {activeTab === "permissions" && <PermissionsTab admin={admin} />}
    </div>
  );
};

// ============ MA'LUMOTLAR TAB ============

const AdminInfoTab = ({ admin }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    alias: admin.alias || "",
    firstName: admin.firstName || "",
    lastName: admin.lastName || "",
    isActive: admin.isActive !== false,
    password: "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      await adminsAPI.update(admin._id, data);
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin yangilandi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Adminni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminsAPI.delete(admin._id);
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin o'chirildi!");
      navigate("/admins");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold">Asosiy ma'lumotlar</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Tahallus</label>
          <input type="text" value={form.alias}
            onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Ism</label>
            <input type="text" value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Familiya</label>
            <input type="text" value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yangi parol (ixtiyoriy)</label>
          <input type="password" value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg" placeholder="Bo'sh qoldiring agar o'zgartirmasa" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive}
            onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
          <span className="text-sm">Faol</span>
        </label>
      </div>

      {/* Amallar */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Adminni o'chirish
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700"
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
};

// ============ RUXSATLAR TAB ============

const ACCESS_LABELS = {
  off: "O'chirilgan",
  read: "Faqat ko'rish",
  manage: "To'liq boshqarish",
};

const PermissionsTab = ({ admin }) => {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  // Hudud picker
  const [picker, setPicker] = useState({ regionId: "", districtId: "", neighborhoodId: "", streetId: "" });
  const [regionInitialized, setRegionInitialized] = useState(!admin.assignedRegion);

  useEffect(() => {
    const current = admin.assignedRegion;
    if (!current) return;

    const resolveChain = async () => {
      try {
        const targetId = current.region?._id || current.region;
        if (!targetId) { setRegionInitialized(true); return; }

        if (current.regionType === "region") {
          setPicker({ regionId: targetId, districtId: "", neighborhoodId: "", streetId: "" });
        } else if (current.regionType === "district") {
          const res = await regionsAPI.getById(targetId);
          const district = res.data;
          setPicker({
            regionId: district.parent?._id || district.parent || "",
            districtId: targetId,
            neighborhoodId: "",
            streetId: "",
          });
        } else if (current.regionType === "neighborhood") {
          const nhRes = await regionsAPI.getById(targetId);
          const neighborhood = nhRes.data;
          const districtId = neighborhood.parent?._id || neighborhood.parent || "";
          if (districtId) {
            const dRes = await regionsAPI.getById(districtId);
            const district = dRes.data;
            setPicker({
              regionId: district.parent?._id || district.parent || "",
              districtId,
              neighborhoodId: targetId,
              streetId: "",
            });
          }
        } else if (current.regionType === "street") {
          const stRes = await regionsAPI.getById(targetId);
          const street = stRes.data;
          const neighborhoodId = street.parent?._id || street.parent || "";
          if (neighborhoodId) {
            const nhRes = await regionsAPI.getById(neighborhoodId);
            const neighborhood = nhRes.data;
            const districtId = neighborhood.parent?._id || neighborhood.parent || "";
            if (districtId) {
              const dRes = await regionsAPI.getById(districtId);
              const district = dRes.data;
              setPicker({
                regionId: district.parent?._id || district.parent || "",
                districtId,
                neighborhoodId,
                streetId: targetId,
              });
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setRegionInitialized(true);
      }
    };

    resolveChain();
  }, []);

  const { data: allRegions = [] } = useQuery({
    queryKey: ["regions", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
  });

  const { data: districts = [] } = useQuery({
    queryKey: ["regions", "district", picker.regionId],
    queryFn: () => regionsAPI.getAll({ type: "district", parent: picker.regionId }).then((r) => r.data),
    enabled: !!picker.regionId,
  });

  const { data: neighborhoods = [] } = useQuery({
    queryKey: ["regions", "neighborhood", picker.districtId],
    queryFn: () => regionsAPI.getAll({ type: "neighborhood", parent: picker.districtId }).then((r) => r.data),
    enabled: !!picker.districtId,
  });

  const { data: streets = [] } = useQuery({
    queryKey: ["regions", "street", picker.neighborhoodId],
    queryFn: () => regionsAPI.getAll({ type: "street", parent: picker.neighborhoodId }).then((r) => r.data),
    enabled: !!picker.neighborhoodId,
  });

  const getSelectedRegion = () => {
    if (picker.streetId) return { region: picker.streetId, regionType: "street" };
    if (picker.neighborhoodId) return { region: picker.neighborhoodId, regionType: "neighborhood" };
    if (picker.districtId) return { region: picker.districtId, regionType: "district" };
    if (picker.regionId) return { region: picker.regionId, regionType: "region" };
    return null;
  };

  const selectedRegion = getSelectedRegion();

  const { data: requestTypes = [] } = useQuery({
    queryKey: ["requestTypes"],
    queryFn: () => requestTypesAPI.getAll().then((r) => r.data),
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesAPI.getAll().then((r) => r.data),
  });

  const { data: mskCategories = [] } = useQuery({
    queryKey: ["mskCategories"],
    queryFn: () => mskAPI.getCategories().then((r) => r.data),
  });

  const [permissions, setPermissions] = useState({
    requests: {
      access: admin.permissions?.requests?.access || "manage",
      allowedTypes: (admin.permissions?.requests?.allowedTypes || []).map((t) => t._id || t),
    },
    services: {
      access: admin.permissions?.services?.access || "manage",
      allowedTypes: (admin.permissions?.services?.allowedTypes || []).map((t) => t._id || t),
    },
    msk: {
      access: admin.permissions?.msk?.access || "manage",
      allowedCategories: (admin.permissions?.msk?.allowedCategories || []).map((c) => c._id || c),
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Hudud saqlash
      const assignedRegion = selectedRegion;
      await adminsAPI.setRegion(admin._id, { assignedRegion });

      // Permissionlar saqlash
      await adminsAPI.updatePermissions(admin._id, { permissions });

      queryClient.invalidateQueries({ queryKey: ["admins", admin._id] });
      toast.success("Ruxsatlar saqlandi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Hudud tayinlash */}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold">Hudud cheklovi</h3>
        <p className="text-sm text-gray-500">Admin faqat belgilangan hududdagi ma'lumotlarni ko'ra oladi</p>
        {!regionInitialized ? (
          <p className="text-sm text-gray-400">Yuklanmoqda...</p>
        ) : (
          <div className="space-y-2">
            <select
              value={picker.regionId}
              onChange={(e) => setPicker({ regionId: e.target.value, districtId: "", neighborhoodId: "", streetId: "" })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Viloyat tanlang (barcha hududlar)</option>
              {allRegions.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>

            {picker.regionId && (
              <select
                value={picker.districtId}
                onChange={(e) => setPicker((p) => ({ ...p, districtId: e.target.value, neighborhoodId: "", streetId: "" }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Tuman tanlang (ixtiyoriy)</option>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            )}

            {picker.districtId && (
              <select
                value={picker.neighborhoodId}
                onChange={(e) => setPicker((p) => ({ ...p, neighborhoodId: e.target.value, streetId: "" }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Mahalla tanlang (ixtiyoriy)</option>
                {neighborhoods.map((n) => (
                  <option key={n._id} value={n._id}>{n.name}</option>
                ))}
              </select>
            )}

            {picker.neighborhoodId && (
              <select
                value={picker.streetId}
                onChange={(e) => setPicker((p) => ({ ...p, streetId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Ko'cha tanlang (ixtiyoriy)</option>
                {streets.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            )}

            {selectedRegion && (
              <p className="text-xs text-gray-500">
                Tayinlanadi: <span className="font-medium">{REGION_TYPE_LABELS[selectedRegion.regionType]}</span> darajasida
              </p>
            )}
          </div>
        )}
      </div>

      {/* Murojaatlar */}
      <ModulePermissionCard
        title="Murojaatlar"
        access={permissions.requests.access}
        onAccessChange={(val) =>
          setPermissions((p) => ({ ...p, requests: { ...p.requests, access: val } }))
        }
        items={requestTypes}
        selectedIds={permissions.requests.allowedTypes}
        onSelectedChange={(ids) =>
          setPermissions((p) => ({ ...p, requests: { ...p.requests, allowedTypes: ids } }))
        }
        itemLabel="Murojaat turlari"
      />

      {/* Servis reportlar */}
      <ModulePermissionCard
        title="Servis reportlar"
        access={permissions.services.access}
        onAccessChange={(val) =>
          setPermissions((p) => ({ ...p, services: { ...p.services, access: val } }))
        }
        items={services}
        selectedIds={permissions.services.allowedTypes}
        onSelectedChange={(ids) =>
          setPermissions((p) => ({ ...p, services: { ...p.services, allowedTypes: ids } }))
        }
        itemLabel="Servislar"
        showIcons
      />

      {/* MSK buyurtmalar */}
      <ModulePermissionCard
        title="MSK buyurtmalar"
        access={permissions.msk.access}
        onAccessChange={(val) =>
          setPermissions((p) => ({ ...p, msk: { ...p.msk, access: val } }))
        }
        items={mskCategories}
        selectedIds={permissions.msk.allowedCategories}
        onSelectedChange={(ids) =>
          setPermissions((p) => ({ ...p, msk: { ...p.msk, allowedCategories: ids } }))
        }
        itemLabel="Kategoriyalar"
        showIcons
      />

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700"
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
};

// ============ MODUL PERMISSION KARTA ============

const ModulePermissionCard = ({
  title,
  access,
  onAccessChange,
  items,
  selectedIds,
  onSelectedChange,
  itemLabel,
  showIcons = false,
}) => {
  const isEnabled = access !== "off";
  const isManage = access === "manage";

  const toggleItem = (id) => {
    if (selectedIds.includes(id)) {
      onSelectedChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectedChange([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">
            {ACCESS_LABELS[access]}
          </p>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) => onAccessChange(checked ? "manage" : "off")}
          className="data-[state=checked]:bg-green-500"
        />
      </div>

      {isEnabled && (
        <div className="flex items-center justify-between pt-2 border-t">
          <label htmlFor={`${title}-manage`} className="text-sm text-gray-600">
            Tahrirlash ruxsati
          </label>
          <Switch
            id={`${title}-manage`}
            checked={isManage}
            onCheckedChange={(checked) => onAccessChange(checked ? "manage" : "read")}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      )}

      {isEnabled && items.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-500 mb-3">
            {itemLabel}
          </p>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {showIcons && item.icon && <LucideIcon name={item.icon} className="w-4 h-4 text-gray-500" />}
                  <span>{item.name}</span>
                </div>
                <Switch
                  checked={selectedIds.length === 0 || selectedIds.includes(item._id)}
                  onCheckedChange={() => {
                    if (selectedIds.length === 0) {
                      // Barchasidan faqat shu birini olib tashlash — qolgan hammasini tanlash
                      const allExceptThis = items.filter((i) => i._id !== item._id).map((i) => i._id);
                      onSelectedChange(allExceptThis);
                    } else {
                      toggleItem(item._id);
                    }
                  }}
                />
              </div>
            ))}
          </div>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectedChange([])}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600"
            >
              Barchasini tanlash (cheklovni olib tashlash)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDetailPage;
