import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminsAPI, regionsAPI, requestTypesAPI, servicesAPI, mskAPI } from "@/shared/api";
import { ArrowLeft, Trash2, icons } from "lucide-react";
import { Switch } from "@/shared/components/shadcn/switch";
import { isAccessExceedsCaller } from "../utils/permissions.util";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import InputPwd from "@/shared/components/ui/input/InputPwd";

const REGION_TYPE_LABELS = { region: "Viloyat", district: "Tuman", neighborhood: "Mahalla", street: "Ko'cha" };

const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
const isCurrentUserOwner = currentUser.role === "owner";
const isDelegatedManager = !isCurrentUserOwner && currentUser.canManageAdmins === true;

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
        <Button onClick={() => navigate("/admins")} variant="link" className="mt-4 text-sm">
          Adminlarga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={() => navigate("/admins")}
          variant="ghost"
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
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
        <Button
          onClick={() => setActiveTab("info")}
          variant="ghost"
          className={`px-4 py-2.5 text-sm font-medium border-b-2 rounded-none ${
            activeTab === "info"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Ma'lumotlar
        </Button>
        <Button
          onClick={() => setActiveTab("permissions")}
          variant="ghost"
          className={`px-4 py-2.5 text-sm font-medium border-b-2 rounded-none ${
            activeTab === "permissions"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Ruxsatlar
        </Button>
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
  const [delegationSaving, setDelegationSaving] = useState(false);

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

  const handleDelegationToggle = async (checked) => {
    setDelegationSaving(true);
    try {
      await adminsAPI.updateDelegation(admin._id, { canManageAdmins: checked });
      queryClient.invalidateQueries({ queryKey: ["admins", admin._id] });
      toast.success(checked ? "Delegatsiya yoqildi!" : "Delegatsiya o'chirildi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setDelegationSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold">Asosiy ma'lumotlar</h3>
        {admin.adminRole && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Lavozim:</span>
            <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-medium">
              {admin.adminRole.name}
            </span>
            {admin.adminRole.description && (
              <span className="text-xs text-gray-400">{admin.adminRole.description}</span>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Tahallus</label>
          <Input type="text" value={form.alias}
            onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))}
            className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Ism</label>
            <Input type="text" value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Familiya</label>
            <Input type="text" value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              className="w-full" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yangi parol (ixtiyoriy)</label>
          <InputPwd value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="Bo'sh qoldiring agar o'zgartirmasa" />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.isActive}
            onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
          />
          <span className="text-sm">Faol</span>
        </div>
      </div>

      {/* Delegatsiya (faqat owner ko'radi) */}
      {isCurrentUserOwner && (
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Admin yaratish huquqi</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Bu admin o'z ruxsatlari doirasida boshqa adminlar yarata oladi
              </p>
            </div>
            <Switch
              checked={!!admin.canManageAdmins}
              onCheckedChange={handleDelegationToggle}
              disabled={delegationSaving}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>
      )}

      {/* Amallar */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleDelete}
          variant="ghost"
          className="flex items-center gap-2 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
          Adminni o'chirish
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
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
        callerAccess={isDelegatedManager ? currentUser.permissions?.requests?.access : undefined}
        callerAllowedIds={isDelegatedManager ? (currentUser.permissions?.requests?.allowedTypes || []) : undefined}
      />

      {/* Xizmat arizalari */}
      <ModulePermissionCard
        title="Xizmat arizalari"
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
        callerAccess={isDelegatedManager ? currentUser.permissions?.services?.access : undefined}
        callerAllowedIds={isDelegatedManager ? (currentUser.permissions?.services?.allowedTypes || []) : undefined}
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
        callerAccess={isDelegatedManager ? currentUser.permissions?.msk?.access : undefined}
        callerAllowedIds={isDelegatedManager ? (currentUser.permissions?.msk?.allowedCategories || []) : undefined}
      />

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
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
  callerAccess,
  callerAllowedIds,
}) => {
  const isEnabled = access !== "off";
  const isManage = access === "manage";

  // callerAccess berilgan bo'lsa — delegat admin rejimi, ruxsatlarni cheklaymiz
  const isCapped = callerAccess !== undefined;
  const callerCanEnable = !isCapped || (callerAccess && callerAccess !== "off");
  const callerCanManage = !isCapped || callerAccess === "manage";

  const isItemAllowedByCaller = (itemId) => {
    if (!isCapped) return true;
    if (!callerAllowedIds || callerAllowedIds.length === 0) return true;
    return callerAllowedIds.map((id) => id.toString()).includes(itemId.toString());
  };

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
          disabled={isCapped && !callerCanEnable}
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
            disabled={isCapped && !callerCanManage}
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
            {items.map((item) => {
              const allowedByCaller = isItemAllowedByCaller(item._id);
              return (
                <div
                  key={item._id}
                  className={`flex items-center justify-between ${!allowedByCaller ? "opacity-40" : ""}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    {showIcons && item.icon && <LucideIcon name={item.icon} className="w-4 h-4 text-gray-500" />}
                    <span>{item.name}</span>
                  </div>
                  <Switch
                    checked={selectedIds.length === 0 || selectedIds.includes(item._id)}
                    disabled={!allowedByCaller}
                    onCheckedChange={() => {
                      if (!allowedByCaller) return;
                      if (selectedIds.length === 0) {
                        // Barchasidan faqat shu birini olib tashlash — qolgan hammasini tanlash
                        const allExceptThis = items
                          .filter((i) => i._id !== item._id && isItemAllowedByCaller(i._id))
                          .map((i) => i._id);
                        onSelectedChange(allExceptThis);
                      } else {
                        toggleItem(item._id);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
          {selectedIds.length > 0 && (
            <Button
              type="button"
              onClick={() => onSelectedChange([])}
              variant="link"
              className="mt-3 text-xs"
            >
              Barchasini tanlash (cheklovni olib tashlash)
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDetailPage;

