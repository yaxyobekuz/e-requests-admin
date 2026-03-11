import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminsAPI, regionsAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import { REGION_TYPE_LABELS } from "../../data/admin-management.data";

/**
 * Admin hudud ruxsatini tahrirlash tab komponenti (owner uchun 4-bosqichli picker).
 * @returns {JSX.Element}
 */
const RegionTab = () => {
  const { admin } = useOutletContext();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

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
  }, [admin._id]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminsAPI.setRegion(admin._id, { assignedRegion: getSelectedRegion() });
      queryClient.invalidateQueries({ queryKey: ["admins", admin._id] });
      toast.success("Hudud saqlandi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const selectedRegion = getSelectedRegion();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold">Hudud cheklovi</h3>
        <p className="text-sm text-gray-500">Admin faqat belgilangan hududdagi ma'lumotlarni ko'ra oladi</p>
        {!regionInitialized ? (
          <p className="text-sm text-gray-400">Yuklanmoqda...</p>
        ) : (
          <div className="space-y-2">
            <select
              value={picker.regionId}
              onChange={(e) =>
                setPicker({ regionId: e.target.value, districtId: "", neighborhoodId: "", streetId: "" })
              }
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
                onChange={(e) =>
                  setPicker((p) => ({ ...p, districtId: e.target.value, neighborhoodId: "", streetId: "" }))
                }
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
                onChange={(e) =>
                  setPicker((p) => ({ ...p, neighborhoodId: e.target.value, streetId: "" }))
                }
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
                Tayinlanadi:{" "}
                <span className="font-medium">{REGION_TYPE_LABELS[selectedRegion.regionType]}</span> darajasida
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default RegionTab;
