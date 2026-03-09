import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsAPI } from "@/shared/api";
import {
  DEADLINE_DAYS_RANGE,
  DEFAULT_DEADLINE_DAYS,
} from "../data/settings.data";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [deadlineDays, setDeadlineDays] = useState(DEFAULT_DEADLINE_DAYS);
  const [saved, setSaved] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsAPI.get().then((res) => res.data),
  });

  useEffect(() => {
    if (settings?.deadlineDays) {
      setDeadlineDays(settings.deadlineDays);
    }
  }, [settings]);

  const { mutate, isPending } = useMutation({
    mutationFn: (days) => settingsAPI.update({ deadlineDays: days }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const days = Number(deadlineDays);
    if (days >= DEADLINE_DAYS_RANGE.min && days <= DEADLINE_DAYS_RANGE.max) {
      mutate(days);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sozlamalar</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tizim konfiguratsiyasini boshqarish
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-base mb-1">Ijro muddati</h2>
        <p className="text-xs text-gray-500 mb-5">
          Ariza yaratilganidan boshlab shu kundan oshsa, muddati o'tgan
          hisoblanadi. Bu sozlama barcha modullarga (murojaatlar, xizmat
          arizalari, MSK buyurtmalar) ta'sir qiladi.
        </p>

        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <InputField
            name="deadlineDays"
            label="Standart ijro muddati"
            type="number"
            min={DEADLINE_DAYS_RANGE.min}
            max={DEADLINE_DAYS_RANGE.max}
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(e.target.value)}
            inputClassName="w-24"
            disabled={isLoading}
          />

          <span className="text-sm text-gray-500">kun</span>

          <Button type="submit" disabled={isPending || isLoading}>
            {isPending ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </form>

        {saved && (
          <p className="mt-3 text-sm text-green-600">Sozlamalar saqlandi</p>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
