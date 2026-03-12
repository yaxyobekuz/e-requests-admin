import NavoiMap from "../NavoiMap";
import AndijanMap from "../AndijanMap";
import BukharaMap from "../BukharaMap";
import FerganaMap from "../FerganaMap";
import JizzakhMap from "../JizzakhMap";
import KhorezmMap from "../KhorezmMap";
import SyrdaryaMap from "../SyrdaryaMap";
import NamanganMap from "../NamanganMap";
import TashkentMap from "../TashkentMap";
import KashkadaryaMap from "../KashkadaryaMap";
import TashkentCityMap from "../TashkentCityMap";
import SurkhandaryaMap from "../SurkhandaryaMap";
import KarakalpakstanMap from "../KarakalpakstanMap";

/** @type {{ label: string }[]} */
const uzbekistanRegions = [
  { component: AndijanMap, label: "Andijon" },
  { component: BukharaMap, label: "Buxoro" },
  { component: FerganaMap, label: "Farg'ona" },
  { component: JizzakhMap, label: "Jizzax" },
  { component: NamanganMap, label: "Namangan" },
  { component: NavoiMap, label: "Navoiy" },
  { component: KashkadaryaMap, label: "Qashqadaryo" },
  { component: KarakalpakstanMap, label: "Qoraqalpog'iston Respublikasi" },
  { component: AndijanMap, label: "Samarqand" },
  { component: SyrdaryaMap, label: "Sirdaryo" },
  { component: SurkhandaryaMap, label: "Surxondaryo" },
  { component: TashkentCityMap, label: "Toshkent Shahri" },
  { component: TashkentMap, label: "Toshkent" },
  { component: KhorezmMap, label: "Xorazm" },
];

export const getRegionByLabel = (label) => {
  const finded = uzbekistanRegions.find(
    (region) =>
      region.label.trim().toLowerCase() === label?.trim().toLowerCase(),
  );
  return finded || uzbekistanRegions[0];
};

export default uzbekistanRegions;
